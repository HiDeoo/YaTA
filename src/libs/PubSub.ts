import _ from 'lodash'
import shortid from 'shortid'

import Twitch from 'libs/Twitch'

/**
 * Supported events.
 */
export enum PubSubEvent {
  Ban,
}

/**
 * Message type that can be received.
 */
enum MessageType {
  Message = 'MESSAGE',
  Pong = 'PONG',
  Reconnect = 'RECONNECT',
  Response = 'RESPONSE',
}

/**
 * Topics to listen to.
 *
 * Available replacements:
 *  - channelId: The current channel ID.
 *  - userId - The user ID of the connected user.
 */
const Topics = ['chat_moderator_actions.{userId}.{channelId}']

/**
 * Maximum number of attempts when trying to reconnect to the Twitch PubSub.
 */
const RECONNECT_MAX_RETRIES = 10

/**
 * Time in milliseconds between PING commands.
 */
const PING_INTERVAL = 240000

/**
 * Number of milliseconds to wait after issuing a PING command before trying to reconnect to the Twitch PubSub.
 */
const PING_TIMEOUT = 10000

/**
 * Twitch PubSub class.
 */
class PubSub {
  private channelId: Optional<string>
  private ws: Optional<WebSocket>
  private retries = 1
  private connectionNonce: Optional<string>
  private handlers: { [key in PubSubEvent]?: () => void } = {}
  private retryTimeout?: number
  private pingInterval?: number
  private reconnectTimeout?: number

  /**
   * Returns if the PubSub is connected or in the process of connecting.
   * @return `true` when connected.
   */
  public isConnected(): boolean {
    return !_.isNil(this.ws) && (this.ws.readyState === 0 || this.ws.readyState === 1)
  }

  /**
   * Adds an handler for a specific event.
   * @param type - The event type.
   * @param handler - The associated handler.
   */
  public addHandler(type: PubSubEvent.Ban, handler: BanHandler): void
  public addHandler(type: PubSubEvent, handler: (...args: any) => void) {
    this.handlers[type] = handler
  }

  /**
   * Connects to the Twitch PubSub.
   * @param channelId - The current channel ID.
   */
  public connect(channelId: string) {
    this.channelId = channelId

    this.ws = new WebSocket('wss://pubsub-edge.twitch.tv')

    this.ws.addEventListener('open', this.onWSOpen)
    this.ws.addEventListener('close', this.onWSClose)
    this.ws.addEventListener('message', this.onWSMessage)
  }

  /**
   * Disconnects from the Twitch PubSub.
   */
  public disconnect() {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout)
    }

    if (this.pingInterval) {
      window.clearInterval(this.pingInterval)
    }

    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
    }

    if (this.ws) {
      this.ws.removeEventListener('open', this.onWSOpen)
      this.ws.removeEventListener('close', this.onWSClose)
      this.ws.removeEventListener('message', this.onWSMessage)

      this.ws.close()
      this.ws = undefined
    }

    this.retries = 1
    this.connectionNonce = undefined
  }

  /**
   * Triggered when the websocket connection is opened.
   * @param event - The associated event.
   */
  private onWSOpen = (event: Event) => {
    if (this.channelId) {
      this.listen(this.getTopics(this.channelId, Twitch.getAuthenticatedUserId()))
    }

    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === 1) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnect()
        }, PING_TIMEOUT)

        this.ws.send(
          JSON.stringify({
            type: 'PING',
          })
        )
      }
    }, PING_INTERVAL)
  }

  /**
   * Triggered when the websocket connection is close.
   * @param event - The associated event.
   */
  private onWSClose = (event: CloseEvent) => {
    if (this.retries >= RECONNECT_MAX_RETRIES) {
      return
    }

    this.retryTimeout = window.setTimeout(() => {
      if (this.channelId) {
        this.connect(this.channelId)
      }
    }, (1000 + this.getTimerJitter()) * this.retries)

    this.retries += 1
  }

  /**
   * Triggered when the websocket connection receives a message.
   * @param event - The associated event.
   */
  private onWSMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as Message

      if (message.type === MessageType.Response) {
        this.handleReponse(message)
      } else if (message.type === MessageType.Message) {
        this.handleMessage(message)
      } else if (message.type === MessageType.Pong) {
        this.handlePong()
      } else if (message.type === MessageType.Reconnect) {
        this.reconnect()
      }
    } catch (error) {
      //
    }
  }

  /**
   * Reconnects to the Twitch PubSub.
   */
  private reconnect() {
    if (this.channelId) {
      this.disconnect()
      this.connect(this.channelId)
    }
  }

  /**
   * Returns small random jitter to add to timers to avoid having all clients issuing commands simultaneously.
   * @return The time jitter.
   */
  private getTimerJitter(): number {
    return _.random(10, 100)
  }

  /**
   * Returns the list of topics to listen to.
   * @param  channelId - The current channel ID.
   * @param  userId - The authenticated user ID.
   * @return The list of topics.
   */
  private getTopics(channelId: string, userId: string): string[] {
    return _.map(Topics, (topic) => {
      let templatedTopic = topic

      templatedTopic = _.replace(templatedTopic, '{channelId}', channelId)
      templatedTopic = _.replace(templatedTopic, '{userId}', userId)

      return templatedTopic
    })
  }

  /**
   * Listens to a list of topics.
   * @param topics - The list of topics.
   */
  private listen(topics: string[]) {
    if (this.ws) {
      this.connectionNonce = shortid.generate()

      this.ws.send(
        JSON.stringify({
          type: 'LISTEN',
          nonce: this.connectionNonce,
          data: {
            topics,
            auth_token: Twitch.getAuthenticatedUserToken(),
          },
        })
      )
    }
  }

  /**
   * Handles a PONG response received from the Twitch PubSub.
   */
  private handlePong() {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout)
    }
  }

  /**
   * Handles a response received from the Twitch PubSub.
   * @param response - The received response.
   */
  private handleReponse(response: Message) {
    if (response.nonce === this.connectionNonce && !_.isEmpty(response.error)) {
      this.reconnect()
    }
  }

  /**
   * Handles a message received from the Twitch PubSub.
   * @param message - The received message.
   */
  private handleMessage(message: Message) {
    if (message.data) {
      const dataTopic = message.data.topic
      const dataMessage = JSON.parse(message.data.message)

      if (dataTopic.startsWith('chat_moderator_actions.')) {
        this.handleModeratorActions(dataMessage.data as ModerationMessage)
      }
    }
  }

  /**
   * Calls the handler associated to a specific event.
   * @param type - The event type.
   * @param args - The handler arguments.
   */
  private callHandler<EventHandler extends Function>(type: PubSubEvent, ...args: ArgumentTypes<EventHandler>): void {
    const handler = this.handlers[type] as Optional<EventHandler>

    if (handler) {
      handler(...args)
    }
  }

  /**
   * Handles moderator actions.
   * @param message - The message describing a moderator action.
   */
  private handleModeratorActions(message: ModerationMessage) {
    if (message.moderation_action === 'ban') {
      this.callHandler<BanHandler>(PubSubEvent.Ban, message.created_by, message.args[0], message.args[1])
    }
  }
}

export default new PubSub()

/**
 * A message received from the Twitch PubSub.
 */
interface Message {
  data?: {
    message: string
    topic: string
  }
  error: string
  nonce: string
  type: MessageType
}

/**
 * A message describing a moderator action.
 */
interface ModerationMessage {
  type: 'chat_login_moderation'
  moderation_action: string
  args: string[]
  created_by: string
  created_by_user_id: string
  msg_id: string
  target_user_id: string
  target_user_login: string
  from_automod: boolean
}

/**
 * Event handlers definitions.
 */
type BanHandler = (author: string, username: string, reason: string) => void
