import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import tmi, { Client, ReadyState, RoomState as RawRoomState, UserState } from 'twitch-js'

import Event from 'Constants/event'
import LogType from 'Constants/logType'
import Status from 'Constants/status'
import Message from 'Libs/Message'
import Notice from 'Libs/Notice'
import RoomState from 'Libs/RoomState'
import Twitch from 'Libs/Twitch'
import { AppState, updateRoomState, updateStatus } from 'Store/ducks/app'
import { addChatterWithMessage, ChattersState } from 'Store/ducks/chatters'
import { addLog, purgeLogs } from 'Store/ducks/logs'
import { setModerator } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'
import { getChatters, getChattersMap } from 'Store/selectors/chatters'
import { getChatLoginDetails, getIsMod } from 'Store/selectors/user'

/**
 * React State.
 */
const initialState = { clientDidFail: false }
type State = Readonly<typeof initialState>

/**
 * ChatClient Component.
 */
class ChatClient extends React.Component<Props, State> {
  public state: State = initialState
  private client: Client

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    if (_.isNil(props.loginDetails)) {
      this.state = {
        clientDidFail: true,
      }
    }

    this.client = tmi.client({
      channels: [],
      connection: { reconnect: true },
      identity: props.loginDetails || undefined,
      options: { clientId: process.env.REACT_APP_TWITCH_CLIENT_ID, debug: true },
    })
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    if (this.state.clientDidFail) {
      return
    }

    const { channel } = this.props

    if (_.isNil(channel)) {
      this.setState(() => ({ clientDidFail: true }))
    }

    this.client.on(Event.Connecting, this.onConnecting)
    this.client.on(Event.Connected, this.onConnected)
    this.client.on(Event.Logon, this.onLogon)
    this.client.on(Event.Disconnected, this.onDisconnected)
    this.client.on(Event.Reconnect, this.onReconnect)
    this.client.on(Event.Roomstate, this.onRoomStateUpdate)
    this.client.on(Event.Clearchat, this.onClearChat)
    this.client.on(Event.FollowersOnly, this.onFollowersOnly)
    this.client.on(Event.Emoteonly, this.onEmoteOnly)
    this.client.on(Event.Hosted, this.onHosted)
    this.client.on(Event.Hosting, this.onHosting)
    this.client.on(Event.Message, this.onMessage)
    this.client.on(Event.R9k, this.onR9k)
    this.client.on(Event.Slowmode, this.onSlowMode)
    this.client.on(Event.Subscribers, this.onSubscribers)
    this.client.on(Event.Unhost, this.onUnhost)
    this.client.on(Event.Mods, this.onMods)
    this.client.on(Event.Mod, this.onMod)
    this.client.on(Event.Unmod, this.onUnmod)
    this.client.on(Event.Ban, this.onBan)
    this.client.on(Event.Timeout, this.onTimeout)
    this.client.on(Event.Notice, this.onNotice)

    try {
      // await this.client.connect()
      // await this.client.join(channel)
    } catch (error) {
      this.setState(() => ({ clientDidFail: true }))
    }
  }

  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @param  nextState - The next state.
   * @return The client should never update except if failing.
   */
  public shouldComponentUpdate(_nextProps: Props, nextState: State) {
    return this.state.clientDidFail !== nextState.clientDidFail
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public async componentWillUnmount() {
    this.props.setModerator(false)

    try {
      if (this.client.readyState() === ReadyState.Open) {
        await this.client.disconnect()
      }

      this.client.removeAllListeners()
    } catch (error) {
      //
    }
  }

  /**
   * Renders the component.
   * @return The client should not render anything.
   */
  public render() {
    if (this.state.clientDidFail) {
      return <Redirect to="/" />
    }

    return null
  }

  /**
   * Triggered when connecting.
   */
  private onConnecting = () => {
    this.props.updateStatus(Status.Connecting)
  }

  /**
   * Triggered when connected.
   */
  private onConnected = () => {
    this.props.updateStatus(Status.Connected)
  }

  /**
   * Triggered during logon.
   */
  private onLogon = () => {
    this.props.updateStatus(Status.Logon)
  }

  /**
   * Triggered when disconnected.
   */
  private onDisconnected = () => {
    this.props.updateStatus(Status.Disconnected)
  }

  /**
   * Triggered when reconnecting.
   */
  private onReconnect = () => {
    this.props.updateStatus(Status.Reconnecting)
  }

  /**
   * Triggered on room state updates.
   * @param channel - The channel.
   * @param rawState - The raw room state.
   */
  private onRoomStateUpdate = (_channel: string, rawState: RawRoomState) => {
    const state = new RoomState(rawState)

    this.props.updateRoomState(state.serialize())
  }

  /**
   * Triggered when the chat is cleared.
   */
  private onClearChat = () => {
    const notice = new Notice('Chat was cleared by a moderator.', Event.Clearchat)

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when the followers only mode is toggled.
   * @param channel - The channel.
   * @param enabled - `true` when the followers only mode is enabled.
   */
  private onFollowersOnly = (_channel: string, enabled: boolean) => {
    const notice = new Notice(
      enabled ? 'This room is in followers-only mode.' : 'This room is no longer in followers-only mode.',
      Event.FollowersOnly
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when the emote only mode is toggled.
   * @param channel - The channel.
   * @param enabled - `true` when the emote only mode is enabled.
   */
  private onEmoteOnly = (_channel: string, enabled: boolean) => {
    const notice = new Notice(
      enabled ? 'This room is now in emote-only mode.' : 'This room is no longer in emote-only mode.',
      Event.Emoteonly
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when a channel is hosted.
   * @param channel - The channel.
   * @param username - The hoster username.
   * @param viewers - The number of viewers.
   * @param autohost - `true` if the host is an auto host.
   */
  private onHosted = (channel: string, username: string, viewers: number, autohost: boolean) => {
    if (Twitch.sanitizeChannel(channel) === this.props.channel) {
      return
    }

    const notice = new Notice(
      `${username} is now ${autohost ? 'auto' : ''} hosting you for up to ${viewers} viewers.`,
      Event.Hosted
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when hosting a channel.
   * @param channel - The channel.
   * @param target - The hosted channel.
   * @param viewers - The number of viewers.
   */
  private onHosting = (_channel: string, target: string, viewers: number) => {
    const notice = new Notice(`Now hosting ${target} for up to ${viewers} viewers.`, Event.Hosting)

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when a new message is received.
   * Note: A message can be a chat message, an action or a whisper.
   * @param channel - The channel.
   * @param userstate - The associated userstate.
   * @param message - The received message.
   * @param self - `true` if the sender is the receiver.
   */
  private onMessage = (_channel: string, userstate: UserState, message: string, self: boolean) => {
    const parsedMessage = this.parseRawMessage(message, userstate, self)

    if (!_.isNil(parsedMessage)) {
      if (
        !_.isNil(this.props.loginDetails) &&
        parsedMessage.user.name === this.props.loginDetails.username &&
        parsedMessage.isMod
      ) {
        this.props.setModerator(true)
      }

      const serializedMessage = parsedMessage.serialize()

      this.props.addLog(serializedMessage)

      if (serializedMessage.type === LogType.Chat || serializedMessage.type === LogType.Action) {
        this.props.addChatterWithMessage(serializedMessage.user, serializedMessage.id)
      }
    }
  }

  /**
   * Triggered when the R9K only mode is toggled.
   * @param channel - The channel.
   * @param enabled - `true` when the R9K only mode is enabled.
   */
  private onR9k = (_channel: string, enabled: boolean) => {
    const notice = new Notice(
      enabled ? 'This room is now in R9K mode.' : 'This room is no longer in R9K mode.',
      Event.R9k
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when the slow only mode is toggled.
   * @param channel - The channel.
   * @param enabled - `true` when the slow only mode is enabled.
   * @param length - The slow mode duration in seconds.
   */
  private onSlowMode = (_channel: string, enabled: boolean, length: number) => {
    const notice = new Notice(
      enabled
        ? `This room is now in slow mode. You may send messages every ${length} seconds.`
        : 'This room is no longer in slow mode.',
      Event.Slowmode
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when the subscribers only mode is toggled.
   * @param channel - The channel.
   * @param enabled - `true` when the subscribers only mode is enabled.
   */
  private onSubscribers = (_channel: string, enabled: boolean) => {
    const notice = new Notice(
      enabled ? 'This room is now in subscriber-only mode.' : 'This room is no longer in subscriber-only mode.',
      Event.Subscribers
    )

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when stoppping to host.
   */
  private onUnhost = () => {
    const notice = new Notice('No longer hosting.', Event.Unhost)

    this.props.addLog(notice.serialize())
  }

  /**
   * Triggered when a new list of moderators is received.
   * @param channel - The channel.
   * @param mods - The list of moderators.
   */
  private onMods = (_channel: string, mods: string[]) => {
    _.forEach(mods, (mod) => {
      if (!_.isNil(this.props.loginDetails) && mod === this.props.loginDetails.username) {
        this.props.setModerator(true)
      }
    })
  }

  /**
   * Triggered when a user is modded.
   * @param channel - The channel.
   * @param username - The username.
   */
  private onMod = (_channel: string, username: string) => {
    if (!_.isNil(this.props.loginDetails) && username === this.props.loginDetails.username) {
      this.props.setModerator(true)
    }
  }

  /**
   * Triggered when a user is unmodded.
   * @param channel - The channel.
   * @param username - The username.
   */
  private onUnmod = (_channel: string, username: string) => {
    if (!_.isNil(this.props.loginDetails) && username === this.props.loginDetails.username) {
      this.props.setModerator(false)
    }
  }

  /**
   * Triggered when a user is banned.
   * @param channel - The channel.
   * @param username - The banned username.
   * @param reason - The ban reason if specified.
   */
  private onBan = (_channel: string, username: string, reason: string | null) => {
    if (this.props.isMod) {
      let noticeMsg = `${username} is now banned.`
      noticeMsg += !_.isNil(reason) ? ` Reason: ${reason}.` : ''

      const notice = new Notice(noticeMsg, Event.Ban)

      this.props.addLog(notice.serialize())
    }

    const userId = _.get(this.props.chattersMap, username)

    if (!_.isNil(userId)) {
      const user = _.get(this.props.chatters, userId)

      if (user.messages.length > 0) {
        this.props.purgeLogs(user.messages)
      }
    }
  }

  /**
   * Triggered when a user is timed out.
   * @param channel - The channel.
   * @param username - The username.
   * @param reason - The timeout reason if specified.
   * @param duration - The timeout duration in seconds.
   */
  private onTimeout = (_channel: string, username: string, reason: string | null, duration: number) => {
    if (this.props.isMod) {
      let noticeMsg = `${username} is now timed out for ${duration} seconds.`
      noticeMsg += !_.isNil(reason) ? ` Reason: ${reason}.` : ''

      const notice = new Notice(noticeMsg, Event.Timeout)

      this.props.addLog(notice.serialize())
    }

    const userId = _.get(this.props.chattersMap, username)

    if (!_.isNil(userId)) {
      const user = _.get(this.props.chatters, userId)

      if (user.messages.length > 0) {
        this.props.purgeLogs(user.messages)
      }
    }
  }

  /**
   * Triggered when a notice is received.
   * @param channel - The channel.
   * @param msgid - The notice id.
   * @param message - The notice associated message.
   */
  private onNotice = (_channel: string, msgid: string, message: string) => {
    console.log('notice ', msgid, message)
    // TODO
    // TODO check when banning someone if we don't at the same time get a notice & manually add one.
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
    chattersMap: getChattersMap(state),
    isMod: getIsMod(state),
    loginDetails: getChatLoginDetails(state),
  }),
  { addLog, addChatterWithMessage, purgeLogs, updateRoomState, updateStatus, setModerator }
)(ChatClient)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  chatters: ChattersState['byId']
  chattersMap: ChattersState['byName']
  isMod: ReturnType<typeof getIsMod>
  loginDetails: ReturnType<typeof getChatLoginDetails>
}

/**
 * React Props.
 */
type DispatchProps = {
  addLog: typeof addLog
  addChatterWithMessage: typeof addChatterWithMessage
  purgeLogs: typeof purgeLogs
  setModerator: typeof setModerator
  updateRoomState: typeof updateRoomState
  updateStatus: typeof updateStatus
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
