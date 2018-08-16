import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import * as shortid from 'shortid'
import tmi, {
  Client as TwitchClient,
  EmoteSets,
  Payment,
  Raid,
  Ritual,
  RoomState as RawRoomState,
  UserState,
} from 'twitch-js'

import Emoticons from 'Constants/emoticons'
import Event from 'Constants/event'
import LogType from 'Constants/logType'
import Notices from 'Constants/notices'
import Page from 'Constants/page'
import ReadyState from 'Constants/readyState'
import RitualType from 'Constants/ritualType'
import Status from 'Constants/status'
import Bttv from 'Libs/Bttv'
import Chatter from 'Libs/Chatter'
import EmotesProvider, { Emote, EmoteProviderPrefix } from 'Libs/EmotesProvider'
import Message from 'Libs/Message'
import Notice from 'Libs/Notice'
import Notification, { NotificationEvent } from 'Libs/Notification'
import Resources from 'Libs/Resources'
import RoomState from 'Libs/RoomState'
import Sound, { Sounds } from 'Libs/Sound'
import Twitch from 'Libs/Twitch'
import { resetAppState, setLastWhisperSender, updateEmotes, updateRoomState, updateStatus } from 'Store/ducks/app'
import {
  addChatter,
  addPotentialChatter,
  clearChatters,
  markChatterAsBanned,
  markChatterAsUnbanned,
} from 'Store/ducks/chatters'
import { addLog, clearLogs, purgeLogs } from 'Store/ducks/logs'
import { setModerator } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'
import { getChatters, getChattersMap } from 'Store/selectors/chatters'
import {
  getAutoHostThreshold,
  getHideWhispers,
  getHighlightAllMentions,
  getHighlights,
  getHighlightsIgnoredUsers,
  getHighlightsPermanentUsers,
  getHostThreshold,
  getPlaySoundOnMentions,
  getPlaySoundOnWhispers,
  getTheme,
} from 'Store/selectors/settings'
import { getChatLoginDetails, getIsMod } from 'Store/selectors/user'

/**
 * React State.
 */
const initialState = { error: undefined as Optional<Error> }
type State = Readonly<typeof initialState>

/**
 * Chat Component.
 */
export class ChatClient extends React.Component<Props, State> {
  public state: State = initialState
  public client: TwitchClient
  public nextWhisperRecipient: string | null = null
  private didFetchExternalResources = false

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    if (_.isNil(props.loginDetails)) {
      this.state = {
        error: new Error('No login details provided.'),
      }
    }

    this.client = tmi.client({
      channels: [],
      connection: { reconnect: true, secure: true },
      identity: props.loginDetails || undefined,
      options: { clientId: process.env.REACT_APP_TWITCH_CLIENT_ID, debug: false },
    })
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    if (!_.isNil(this.state.error)) {
      return
    }

    const { channel } = this.props

    if (_.isNil(channel)) {
      this.setState(() => ({ error: new Error('No channel provided.') }))

      return
    }

    this.updateHighlights()

    this.client.on(Event.Connecting, this.onConnecting)
    this.client.on(Event.Connected, this.onConnected)
    this.client.on(Event.Logon, this.onLogon)
    this.client.on(Event.Disconnected, this.onDisconnected)
    this.client.on(Event.Reconnect, this.onReconnect)
    this.client.on(Event.Roomstate, this.onRoomStateUpdate)
    this.client.on(Event.Clearchat, this.onClearChat)
    this.client.on(Event.FollowersOnly, this.onFollowersOnly)
    this.client.on(Event.EmoteOnly, this.onEmoteOnly)
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
    this.client.on(Event.Subscription, this.onSubscription)
    this.client.on(Event.ReSub, this.onResub)
    this.client.on(Event.SubGift, this.onSubGift)
    this.client.on(Event.Ritual, this.onRitual)
    this.client.on(Event.Raid, this.onRaid)
    this.client.on(Event.Cheer, this.onCheer)
    this.client.on(Event.EmoteSets, this.onEmoteSets)

    try {
      await this.client.connect()
      await this.client.join(channel)
    } catch (error) {
      let theError: Error

      if (_.isString(error)) {
        theError = new Error(error)
      } else if (_.isError(error)) {
        theError = error
      } else {
        theError = new Error('Something went wrong.')
      }

      this.setState(() => ({ error: theError }))
    }
  }

  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @param  nextState - The next state.
   * @return The client should never update except if failing.
   */
  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state.error !== nextState.error ||
      this.props.highlights !== nextProps.highlights ||
      this.props.highlightsIgnoredUsers.length !== nextProps.highlightsIgnoredUsers.length ||
      this.props.highlightsPermanentUsers.length !== nextProps.highlightsPermanentUsers.length ||
      this.props.highlightAllMentions !== nextProps.highlightAllMentions
    )
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.highlights !== this.props.highlights ||
      prevProps.highlightsIgnoredUsers.length !== this.props.highlightsIgnoredUsers.length ||
      prevProps.highlightsPermanentUsers.length !== this.props.highlightsPermanentUsers.length ||
      prevProps.highlightAllMentions !== this.props.highlightAllMentions
    ) {
      this.updateHighlights()
    }
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public async componentWillUnmount() {
    this.didFetchExternalResources = false

    this.props.setModerator(false)
    this.props.resetAppState()
    this.props.clearLogs()
    this.props.clearChatters()

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
    const { error } = this.state

    if (!_.isNil(error)) {
      if (error.message.includes('No response from Twitch')) {
        return <Redirect to={Page.Home} />
      }

      throw error
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
  private onRoomStateUpdate = async (_channel: string, rawState: RawRoomState) => {
    const state = new RoomState(rawState)

    this.props.updateRoomState(state.serialize())

    this.fetchExternalResources(state.roomId)
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
      Event.EmoteOnly
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
    if (
      Twitch.sanitizeChannel(channel) !== this.props.channel ||
      (!autohost && viewers < this.props.hostThreshold) ||
      (autohost && viewers < this.props.autoHostThreshold)
    ) {
      return
    }

    const notification = new Notification(
      `${username} is now ${autohost ? 'auto-' : ''}hosting you for up to ${viewers} viewers.`,
      NotificationEvent.Host
    )

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
  }

  /**
   * Triggered when hosting a channel.
   * @param channel - The channel.
   * @param target - The hosted channel.
   * @param viewers - The number of viewers.
   */
  private onHosting = (_channel: string, target: string, viewers: number) => {
    const notice = new Notice(
      `Now hosting <a href="/${target}">${target}</a> for up to ${viewers} viewers.`,
      Event.Hosting,
      true
    )

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
  private onMessage = async (_channel: string, userstate: UserState, message: string, self: boolean) => {
    const parsedMessage = this.parseRawMessage(message, userstate, self)

    if (!_.isNil(parsedMessage)) {
      if (
        !_.isNil(this.props.loginDetails) &&
        parsedMessage.user.userName === this.props.loginDetails.username &&
        parsedMessage.user.isMod
      ) {
        this.props.setModerator(true)
      }

      const serializedMessage = parsedMessage.serialize()

      if (!Resources.manager().isBot(serializedMessage.user.userName) && _.size(serializedMessage.previews) > 0) {
        const providers = Resources.manager().getPreviewProviders()

        for (const previewId in serializedMessage.previews) {
          if (serializedMessage.previews.hasOwnProperty(previewId)) {
            const preview = serializedMessage.previews[previewId]

            if (!preview.resolved) {
              const provider = providers[preview.provider]

              try {
                serializedMessage.previews[previewId] = await provider.resolve(preview)
              } catch (error) {
                //
              }
            }
          }
        }
      }

      if (serializedMessage.type === LogType.Whisper && this.props.hideWhispers) {
        return
      }

      this.props.addLog(serializedMessage)

      if (serializedMessage.type === LogType.Chat || serializedMessage.type === LogType.Action) {
        this.props.addChatter(serializedMessage.user, serializedMessage.id)

        if (this.props.playSoundOnMentions && serializedMessage.mentionned) {
          Sound.manager().playSound(Sounds.Notification)
        }
      }

      if (serializedMessage.type === LogType.Whisper && !self) {
        this.props.setLastWhisperSender(serializedMessage.user.userName)

        if (this.props.playSoundOnWhispers) {
          Sound.manager().playSound(Sounds.Notification)
        }
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

    if (mods.length > 0) {
      const notice = new Notice(`The moderators of this channel are: ${mods.join(', ')}.`, Event.Mods)

      this.props.addLog(notice.serialize())
    }
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
      this.props.markChatterAsBanned(userId)

      const user = _.get(this.props.chatters, userId)

      if (user.logs.length > 0) {
        this.props.purgeLogs(user.logs)
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
      if (duration > 1) {
        this.props.markChatterAsBanned(userId)
      }

      const user = _.get(this.props.chatters, userId)

      if (user.logs.length > 0) {
        this.props.purgeLogs(user.logs)
      }
    }
  }

  /**
   * Triggered when a user subscribe to a channel.
   * @param channel - The channel.
   * @param username - The username.
   * @param method - The method used to sub.
   * @param message - Sub message.
   */
  private onSubscription = (_channel: string, username: string, method: Payment, message: string | null) => {
    const notification = new Notification(
      `${username} just subscribed${method.prime ? ' with Twitch Prime' : ''}!`,
      NotificationEvent.Subscription,
      !_.isNil(message) ? message : undefined
    )

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
  }

  /**
   * Triggered when a user re-subscribe to a channel.
   * @param channel - The channel.
   * @param username - The username.
   * @param months - The duration of the subscription.
   * @param message - Sub message.
   * @param userstate - The associated userstate.
   * @param method - The method used to sub.
   */
  private onResub = (
    _channel: string,
    username: string,
    months: number,
    message: string | null,
    _userstate: UserState,
    method: Payment
  ) => {
    const notification = new Notification(
      `${username} just re-subscribed for ${months} months in a row${method.prime ? ' with Twitch Prime' : ''}!`,
      NotificationEvent.ReSub,
      !_.isNil(message) ? message : undefined
    )

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
  }

  /**
   * Triggered when a user gift a subscription.
   * @param channel - The channel.
   * @param username - The username.
   * @param recipient - The gift recipient.
   */
  private onSubGift = (_channel: string, username: string, recipient: string) => {
    const notification = new Notification(`${username} just gifted a sub to ${recipient}!`, NotificationEvent.SubGift)

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(recipient).serialize(), serializedNotification.id)
  }

  /**
   * Triggered when a ritual occurs in a channel.
   * @param ritual - The ritual.
   */
  private onRitual = ({ username, type }: Ritual) => {
    if (type === RitualType.NewChatter) {
      const notification = new Notification(
        `${username} is new here! Say hi to ${username}!`,
        NotificationEvent.RitualNewChatter
      )

      const serializedNotification = notification.serialize()

      this.props.addLog(serializedNotification)
      this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
    }
  }

  /**
   * Triggered when a raid occurs in a channel.
   * @param raid - The raid.
   */
  private onRaid = ({ raider, viewers }: Raid) => {
    const notification = new Notification(`${raider} is raiding with a party of ${viewers}!`, NotificationEvent.Raid)

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(raider).serialize(), serializedNotification.id)
  }

  /**
   * Triggered when a new message with cheers is received.
   * @param channel - The channel.
   * @param userstate - The associated userstate.
   * @param message - The received message.
   */
  private onCheer = (_channel: string, userstate: UserState, message: string) => {
    const parsedMessage = this.parseRawMessage(message, { ...userstate, 'message-type': LogType.Cheer }, false)

    if (!_.isNil(parsedMessage)) {
      const serializedMessage = parsedMessage.serialize()

      this.props.addLog(serializedMessage)
      this.props.addChatter(serializedMessage.user, serializedMessage.id)
    }
  }

  /**
   * Triggered when a notice is received.
   * @param channel - The channel.
   * @param id - The notice id.
   * @param message - The notice associated message.
   */
  private onNotice = (_channel: string, id: string, message: string) => {
    if (_.includes(Notices.IgnoredNotices, id)) {
      return
    }

    const notice = new Notice(id === Notices.Help.Id ? message.concat(Notices.Help.Additions) : message, Event.Notice)

    this.props.addLog(notice.serialize())

    if (_.includes(Notices.UnbanNotices, id)) {
      const username = _.first(message.split(' '))

      if (!_.isNil(username)) {
        this.props.markChatterAsUnbanned(username)
      }
    }
  }

  /**
   * Triggered when the user emote sets are received.
   * @param setsList - The list of emote sets.
   * @param sets - The emote sets.
   */
  private onEmoteSets = (_setsList: string, sets: EmoteSets) => {
    let emoticonsSetId = 0

    _.forEach(Emoticons.setIds, (id) => {
      if (_.has(sets, id)) {
        emoticonsSetId = id
      }
    })

    Resources.manager().setEmoticonsSetId(emoticonsSetId)

    const emotes = EmotesProvider.sanitizeTwitchEmotes(
      _.flatten(_.map(sets, (set) => _.filter(set, (emote) => !Resources.manager().isEmoticon(emote.id))))
    )

    const provider = new EmotesProvider(
      EmoteProviderPrefix.Twitch,
      emotes,
      'https://static-cdn.jtvnw.net/emoticons/v1/{{id}}/{{image}}',
      '.0'
    )

    this.addEmotesProvider(provider)
  }

  /**
   * Adds (or updates) an emotes provider.
   * @param provider - The emotes provider to add.
   */
  private addEmotesProvider(provider: EmotesProvider<Emote>) {
    Resources.manager().addEmotesProvider(provider)

    this.props.updateEmotes(provider.prefix, provider.emotes)
  }

  /**
   * Fetches external resources (if not yet fetched) for a specific channel.
   * @param channelId - The channel id.
   */
  private async fetchExternalResources(channelId: string) {
    if (this.didFetchExternalResources) {
      return
    }

    try {
      const channel = await Twitch.fetchChannel(channelId)

      if (!_.isNil(channel.status) && channel.status.length > 0) {
        const notice = new Notice(`Current title: ${channel.status}`, null, true)

        this.props.addLog(notice.serialize())
      }

      Resources.manager().setBadges(await Twitch.fetchBadges(channelId))
      Resources.manager().setCheermotes((await Twitch.fetchCheermotes()).actions)

      if (!_.isNil(this.props.channel)) {
        const emotesAndBots = await Bttv.fetchEmotesAndBots(this.props.channel)

        this.addEmotesProvider(emotesAndBots.emotes)

        if (!_.isNil(emotesAndBots.bots)) {
          Resources.manager().addBots(emotesAndBots.bots)
        }

        this.didFetchExternalResources = true
      }
    } catch (error) {
      //
    }
  }

  /**
   * Updates highlights, highlights ignored users and highlights permanent users used when parsing messages.
   */
  private updateHighlights() {
    const { highlightAllMentions, highlights, highlightsIgnoredUsers, highlightsPermanentUsers } = this.props

    Resources.manager().setHighlights(highlights, highlightsIgnoredUsers, highlightsPermanentUsers)
    Resources.manager().setHighlightAllMentions(highlightAllMentions)
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

    // Do not show a whisper we just sent if we don't know the recipient ahead of time.
    if (userstate['message-type'] === LogType.Whisper && self && _.isNil(this.nextWhisperRecipient)) {
      return null
    }

    switch (userstate['message-type']) {
      case LogType.Action:
      case LogType.Cheer:
      case LogType.Whisper:
      case LogType.Chat: {
        if (userstate['message-type'] !== LogType.Whisper && self) {
          userstate.id = shortid.generate()
          userstate['user-id'] = 'self'
          userstate['tmi-sent-ts'] = Date.now().toString()
        } else if (userstate['message-type'] === LogType.Whisper) {
          userstate.id = self ? shortid.generate() : `${userstate['thread-id']}-${userstate['message-id']}`
          userstate['tmi-sent-ts'] = Date.now().toString()

          if (self) {
            userstate['user-id'] = 'self'

            if (!_.isNil(this.nextWhisperRecipient)) {
              userstate['display-name'] = this.nextWhisperRecipient
              userstate.username = this.nextWhisperRecipient

              this.nextWhisperRecipient = null
            }
          }
        }

        const { theme } = this.props

        parsedMessage = new Message(message, userstate, self, this.props.loginDetails!.username, { theme })

        if (_.isNil(parsedMessage.user.color)) {
          const user = _.get(this.props.chatters, parsedMessage.user.id)

          parsedMessage.updateColor(
            _.isNil(user) || _.isNil(user.color) ? parsedMessage.user.generateRandomColor() : user.color
          )
        }

        break
      }
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
    autoHostThreshold: getAutoHostThreshold(state),
    channel: getChannel(state),
    chatters: getChatters(state),
    chattersMap: getChattersMap(state),
    hideWhispers: getHideWhispers(state),
    highlightAllMentions: getHighlightAllMentions(state),
    highlights: getHighlights(state),
    highlightsIgnoredUsers: getHighlightsIgnoredUsers(state),
    highlightsPermanentUsers: getHighlightsPermanentUsers(state),
    hostThreshold: getHostThreshold(state),
    isMod: getIsMod(state),
    loginDetails: getChatLoginDetails(state),
    playSoundOnMentions: getPlaySoundOnMentions(state),
    playSoundOnWhispers: getPlaySoundOnWhispers(state),
    theme: getTheme(state),
  }),
  {
    addChatter,
    addLog,
    addPotentialChatter,
    clearChatters,
    clearLogs,
    markChatterAsBanned,
    markChatterAsUnbanned,
    purgeLogs,
    resetAppState,
    setLastWhisperSender,
    setModerator,
    updateEmotes,
    updateRoomState,
    updateStatus,
  },
  null,
  { withRef: true }
)(ChatClient)

/**
 * React Props.
 */
interface StateProps {
  autoHostThreshold: ReturnType<typeof getAutoHostThreshold>
  channel: ReturnType<typeof getChannel>
  chatters: ReturnType<typeof getChatters>
  chattersMap: ReturnType<typeof getChattersMap>
  hideWhispers: ReturnType<typeof getHideWhispers>
  highlightAllMentions: ReturnType<typeof getHighlightAllMentions>
  highlights: ReturnType<typeof getHighlights>
  highlightsIgnoredUsers: ReturnType<typeof getHighlightsIgnoredUsers>
  highlightsPermanentUsers: ReturnType<typeof getHighlightsPermanentUsers>
  hostThreshold: ReturnType<typeof getHostThreshold>
  isMod: ReturnType<typeof getIsMod>
  loginDetails: ReturnType<typeof getChatLoginDetails>
  playSoundOnMentions: ReturnType<typeof getPlaySoundOnMentions>
  playSoundOnWhispers: ReturnType<typeof getPlaySoundOnWhispers>
  theme: ReturnType<typeof getTheme>
}

/**
 * React Props.
 */
interface DispatchProps {
  addLog: typeof addLog
  addChatter: typeof addChatter
  addPotentialChatter: typeof addPotentialChatter
  clearChatters: typeof clearChatters
  clearLogs: typeof clearLogs
  markChatterAsBanned: typeof markChatterAsBanned
  markChatterAsUnbanned: typeof markChatterAsUnbanned
  purgeLogs: typeof purgeLogs
  resetAppState: typeof resetAppState
  setLastWhisperSender: typeof setLastWhisperSender
  setModerator: typeof setModerator
  updateRoomState: typeof updateRoomState
  updateEmotes: typeof updateEmotes
  updateStatus: typeof updateStatus
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
