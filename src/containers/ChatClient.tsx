import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import tmi, { Client, UserState } from 'twitch-js'

import Event from 'Constants/event'
import LogType from 'Constants/logType'
import Status from 'Constants/status'
import Message from 'Libs/Message'
import Notice from 'Libs/Notice'
import RoomState from 'Libs/RoomState'
import Twitch from 'Libs/Twitch'
import { AppState, updateRoomState, updateStatus } from 'Store/ducks/app'
import { addChatterWithMessage, ChattersState } from 'Store/ducks/chatters'
import { addLog } from 'Store/ducks/logs'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'
import { getChatters } from 'Store/selectors/chatters'
import { getChatLoginDetails } from 'Store/selectors/user'

/**
 * ChatClient Component.
 */
class ChatClient extends React.Component<Props> {
  private client: Client

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    if (_.isNil(props.loginDetails)) {
      throw new Error('Missing login details.')
    }

    this.client = tmi.client({
      channels: [],
      connection: { reconnect: true },
      identity: props.loginDetails,
      options: { clientId: process.env.REACT_APP_TWITCH_CLIENT_ID, debug: true },
    })
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    console.error('> componentDidMount')

    const { channel } = this.props

    if (_.isNil(channel)) {
      throw new Error('Missing channel.')
    }

    this.subscribe()

    // await this.client.connect()
    // await this.client.join(channel)
  }

  /**
   * Lifecycle: shouldComponentUpdate.
   * @return The client should never update.
   */
  public shouldComponentUpdate() {
    return false
  }

  /**
   * Lifecycle: componentDidUpdate.
   */
  public componentDidUpdate() {
    console.error('> componentDidUpdate')
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public async componentWillUnmount() {
    await this.client.disconnect()

    this.client.removeAllListeners()
  }

  /**
   * Renders the component.
   * @return The client should not render anything.
   */
  public render() {
    return null
  }

  /**
   * Sets up subscriptions.
   */
  private subscribe() {
    this.client.on(Event.Connecting, () => {
      this.props.updateStatus(Status.Connecting)
    })

    this.client.on(Event.Connected, () => {
      this.props.updateStatus(Status.Connected)
    })

    this.client.on(Event.Logon, () => {
      this.props.updateStatus(Status.Logon)
    })

    this.client.on(Event.Disconnected, () => {
      this.props.updateStatus(Status.Disconnected)
    })

    this.client.on(Event.Reconnect, () => {
      this.props.updateStatus(Status.Reconnecting)
    })

    this.client.on(Event.Roomstate, (_channel, rawState) => {
      const state = new RoomState(rawState)

      this.props.updateRoomState(state.serialize())
    })

    this.client.on(Event.Clearchat, () => {
      const notice = new Notice('Chat was cleared by a moderator.', Event.Clearchat)

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.FollowersOnly, (_channel, enabled) => {
      const notice = new Notice(
        enabled ? 'This room is in followers-only mode.' : 'This room is no longer in followers-only mode.',
        Event.FollowersOnly
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Emoteonly, (_channel, enabled) => {
      const notice = new Notice(
        enabled ? 'This room is now in emote-only mode.' : 'This room is no longer in emote-only mode.',
        Event.Emoteonly
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Hosted, (channel, username, viewers, autohost) => {
      if (Twitch.sanitizeChannel(channel) === this.props.channel) {
        return
      }

      const notice = new Notice(
        `${username} is now ${autohost ? 'auto' : ''} hosting you for up to ${viewers} viewers.`,
        Event.Hosted
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Hosting, (_channel, target, viewers) => {
      const notice = new Notice(`Now hosting ${target} for up to ${viewers} viewers.`, Event.Hosting)

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Message, (_channel, userstate, message, self) => {
      const parsedMessage = this.parseRawMessage(message, userstate, self)

      if (!_.isNil(parsedMessage)) {
        const serializedMessage = parsedMessage.serialize()

        this.props.addLog(serializedMessage)

        if (serializedMessage.type === LogType.Chat || serializedMessage.type === LogType.Action) {
          this.props.addChatterWithMessage(serializedMessage.user, serializedMessage.id)
        }
      }
    })

    this.client.on(Event.R9k, (_channel, enabled) => {
      const notice = new Notice(
        enabled ? 'This room is now in R9K mode.' : 'This room is no longer in R9K mode.',
        Event.R9k
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Slowmode, (_channel, enabled, length) => {
      const notice = new Notice(
        enabled
          ? `This room is now in slow mode. You may send messages every ${length} seconds.`
          : 'This room is no longer in slow mode.',
        Event.Slowmode
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Subscribers, (_channel, enabled) => {
      const notice = new Notice(
        enabled ? 'This room is now in subscriber-only mode.' : 'This room is no longer in subscriber-only mode.',
        Event.Subscribers
      )

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Unhost, () => {
      const notice = new Notice('No longer hosting.', Event.Unhost)

      this.props.addLog(notice.serialize())
    })

    this.client.on(Event.Notice, (_channel, msgid, message) => {
      console.log('notice ', msgid, message)
      // TODO
    })
  }

  /**
   * Parses a message.
   * @param message - The received message.
   * @param userstate - The associated user state.
   * @param self - Defines if the message was sent by ourself.
   * @return The parsed message.
   */
  private parseRawMessage(message: string, userstate: UserState, self: boolean) {
    let parsedMessage: Message | null

    switch (userstate['message-type']) {
      case LogType.Action:
      case LogType.Chat: {
        parsedMessage = new Message(message, userstate, self)

        if (_.isNil(parsedMessage.user.color)) {
          const user = _.get(this.props.chatters, parsedMessage.user.id)

          parsedMessage.updateColor(_.isNil(user) ? parsedMessage.user.generateRandomColor() : user.color)
        }

        break
      }
      // TODO whispers
      default: {
        parsedMessage = null
        break
      }
    }

    return parsedMessage
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
    chatters: getChatters(state),
    loginDetails: getChatLoginDetails(state),
  }),
  { addLog, addChatterWithMessage, updateRoomState, updateStatus }
)(ChatClient)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  chatters: ChattersState['byId']
  loginDetails: ReturnType<typeof getChatLoginDetails>
}

/**
 * React Props.
 */
type DispatchProps = {
  addLog: typeof addLog
  addChatterWithMessage: typeof addChatterWithMessage
  updateRoomState: typeof updateRoomState
  updateStatus: typeof updateStatus
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
