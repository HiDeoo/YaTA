import _ from 'lodash'
import { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { nanoid } from 'nanoid'
import tmi, { Client as TwitchClient, Payment, Raid, Ritual, RoomState as RawRoomState, UserState } from 'twitch-js'

import Emoticons from 'constants/emoticons'
import Event from 'constants/event'
import LogType from 'constants/logType'
import Notices from 'constants/notices'
import Page from 'constants/page'
import ReadyState from 'constants/readyState'
import RitualType from 'constants/ritualType'
import Status from 'constants/status'
import Bttv from 'libs/Bttv'
import Chatter from 'libs/Chatter'
import EmotesProvider, { Emote, EmoteProviderPrefix, TwitchEmote } from 'libs/EmotesProvider'
import Message, { SerializedMessage } from 'libs/Message'
import Notice from 'libs/Notice'
import Notification, { NotificationEvent } from 'libs/Notification'
import RejectedMessage from 'libs/RejectedMessage'
import Resources from 'libs/Resources'
import Robotty from 'libs/Robotty'
import RoomState from 'libs/RoomState'
import Sound, { SoundId } from 'libs/Sound'
import Twitch from 'libs/Twitch'
import Ffz from 'libs/Ffz'
import PubSub, { PubSubEvent } from 'libs/PubSub'
import { resetAppState, setLastWhisperSender, updateEmotes, updateRoomState, updateStatus } from 'store/ducks/app'
import {
  addChatter,
  addPotentialChatter,
  clearChatters,
  markChatterAsBanned,
  markChatterAsUnbanned,
} from 'store/ducks/chatters'
import { addLog, clearLogs, markRejectedMessageAsHandled, purgeLog, purgeLogs, unshiftLog } from 'store/ducks/logs'
import { setModerator } from 'store/ducks/user'
import { ApplicationState } from 'store/reducers'
import { getChannel } from 'store/selectors/app'
import { getChatters, getChattersMap } from 'store/selectors/chatters'
import {
  getAutoHostThreshold,
  getDelayBetweenThrottledSounds,
  getHideVIPBadges,
  getHideWhispers,
  getHighlightAllMentions,
  getHighlights,
  getHighlightsIgnoredUsers,
  getHighlightsPermanentUsers,
  getHostThreshold,
  getPlayMessageSoundOnlyInOwnChannel,
  getSoundSettings,
  getTheme,
} from 'store/selectors/settings'
import { getChatLoginDetails, getIsMod } from 'store/selectors/user'

/**
 * React State.
 */
const initialState = { error: undefined as Optional<Error> }
type State = Readonly<typeof initialState>

/**
 * Chat Component.
 */
export class ChatClient extends Component<Props, State> {
  public state: State = initialState
  public client: TwitchClient
  public nextWhisperRecipient: string | null = null
  private didFetchExternalResources = false
  private isFetchingHistoricalMessage = false

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

    const { channel, loginDetails } = this.props

    if (_.isNil(channel)) {
      this.setState(() => ({ error: new Error('No channel provided.') }))

      return
    }

    this.updateHighlights()
    this.updateSoundVolumes()
    this.updateDelayBetweenThrottledSounds()

    this.client.on(Event.Notices, this.onNotices)
    this.client.on(Event.UserNotices, this.onUserNotices)
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
    this.client.on(Event.Ban, this.onIrcBan)
    this.client.on(Event.Timeout, this.onIrcTimeout)
    this.client.on(Event.Notice, this.onNotice)
    this.client.on(Event.Subscription, this.onSubscription)
    this.client.on(Event.ReSub, this.onResub)
    this.client.on(Event.SubGift, this.onSubGift)
    this.client.on(Event.Ritual, this.onRitual)
    this.client.on(Event.Raid, this.onRaid)
    this.client.on(Event.Cheer, this.onCheer)
    this.client.on(Event.EmoteSets, this.onEmoteSets)
    this.client.on(Event.MessageDeleted, this.onMessageDeleted)

    PubSub.addHandler(PubSubEvent.Ban, this.onPubSubBan)
    PubSub.addHandler(PubSubEvent.Unban, this.onPubSubUnban)
    PubSub.addHandler(PubSubEvent.Timeout, this.onPubSubTimeout)
    PubSub.addHandler(PubSubEvent.Untimeout, this.onPubSubUntimeout)
    PubSub.addHandler(PubSubEvent.AutomodRejected, this.onAutomodRejected)
    PubSub.addHandler(PubSubEvent.AutomodMessageRejected, this.onAutomodMessageRejected)
    PubSub.addHandler(PubSubEvent.AutomodMessageApproved, this.onAutomodMessageApproved)
    PubSub.addHandler(PubSubEvent.AutomodMessageDenied, this.onAutomodMessageDenied)
    PubSub.addHandler(PubSubEvent.ApprovedAutomodMessage, this.onApprovedAutomodMessage)
    PubSub.addHandler(PubSubEvent.DeniedAutomodMessage, this.onDeniedAutomodMessage)
    PubSub.addHandler(PubSubEvent.ExpiredAutomodMessage, this.onExpiredAutomodMessage)

    try {
      await this.client.connect()
      await this.client.join(channel)

      if (!_.isNil(loginDetails) && loginDetails.username === channel) {
        this.props.setModerator(true)
      }

      this.props.addPotentialChatter(Chatter.createPotentialChatter(channel).serialize())
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
      this.props.highlightAllMentions !== nextProps.highlightAllMentions ||
      this.props.delayBetweenThrottledSounds !== nextProps.delayBetweenThrottledSounds ||
      !_.isEqual(this.props.soundSettings, nextProps.soundSettings)
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

    if (!_.isEqual(prevProps.soundSettings, this.props.soundSettings)) {
      this.updateSoundVolumes()
    }

    if (prevProps.delayBetweenThrottledSounds !== this.props.delayBetweenThrottledSounds) {
      this.updateDelayBetweenThrottledSounds()
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

      PubSub.disconnect()
    } catch {
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
        if (this.props.banned) {
          return null
        } else {
          return <Redirect to={Page.Home} />
        }
      }

      throw error
    }

    return null
  }

  /**
   * Triggered when any notice is received even unhandled ones.
   * @param channel - The channel.
   * @param id - The notice id.
   * @param message - The notice associated message.
   */
  private onNotices = (_channel: string, id: string, message: string) => {
    if (_.includes(Notices.Extra, id)) {
      const notice = new Notice(message, Event.Notice)

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when any user notice is received even unhandled ones.
   * @param channel - The channel.
   * @param id - The notice id.
   * @param message - The notice associated message.
   * @param tags - The notice tags.
   */
  private onUserNotices = (_channel: string, id: string, _message: string, tags: Record<string, string>) => {
    if (id === Notices.ExtraUser.Charity) {
      const notice = Notice.fromCharity(tags)

      this.props.addLog(notice.serialize())
    } else if (id === Notices.ExtraUser.SubMysteryGift) {
      const notification = Notification.fromSubMysteryGift(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.AnonSubGift) {
      const notification = Notification.fromAnonSubGift(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.AnonSubMysteryGift) {
      const notification = Notification.fromAnonSubMysteryGift(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.GiftPaidUpgrade) {
      const notification = Notification.fromGiftPaidUpgrade(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.AnonGiftPaidUpgrade) {
      const notification = Notification.fromAnonGiftPaidUpgrade(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.PrimePaidUpgrade) {
      const notification = Notification.fromPrimePaidUpgrade(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.RewardGift) {
      const notification = Notification.fromRewardGift(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.BitsBadgeTier) {
      const notification = Notification.fromBitsBadgeTier(tags)

      this.props.addLog(notification.serialize())
    } else if (id === Notices.ExtraUser.ExtendedSub) {
      const notification = Notification.fromExtendedSub(tags)

      this.props.addLog(notification.serialize())
    }
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

    if (!PubSub.isConnected()) {
      PubSub.connect(state.roomId)
    }
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
   * @param msgId - The message id associated to the message if any.
   */
  private onMessage = async (
    _channel: string,
    userstate: UserState,
    message: string,
    self: boolean,
    msgId: string | null
  ) => {
    if (self && !_.isNil(this.props.replyReference)) {
      this.setSelfReplyReference(userstate)

      // Add the reference user mention to match Twitch reply style.
      message = `@${this.props.replyReference.user.displayName} ${message}`

      this.props.clearReply()
    }

    const parsedMessage = this.parseRawMessage(message, { ...userstate, 'msg-id': msgId }, self)

    if (!_.isNil(parsedMessage)) {
      if (
        !_.isNil(this.props.loginDetails) &&
        parsedMessage.user.userName === this.props.loginDetails.username &&
        parsedMessage.user.isMod
      ) {
        this.props.setModerator(true)
      }

      const serializedMessage = parsedMessage.serialize()

      if (this.isFetchingHistoricalMessage && !serializedMessage.historical) {
        return
      }

      if (
        !serializedMessage.historical &&
        !Resources.manager().isBot(serializedMessage.user.userName) &&
        _.size(serializedMessage.previews) > 0
      ) {
        const providers = Resources.manager().getPreviewProviders()

        for (const previewId in serializedMessage.previews) {
          if (serializedMessage.previews.hasOwnProperty(previewId)) {
            const preview = serializedMessage.previews[previewId]

            if (!preview.resolved) {
              const provider = providers[preview.provider]

              try {
                serializedMessage.previews[previewId] = await provider.resolve(preview)
              } catch {
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

      if (
        !serializedMessage.historical &&
        (serializedMessage.type === LogType.Chat || serializedMessage.type === LogType.Action)
      ) {
        this.props.addChatter(serializedMessage.user, serializedMessage.id)

        const shouldPlayMentionSound = this.props.soundSettings[SoundId.Mention].enabled && serializedMessage.mentioned

        if (shouldPlayMentionSound) {
          Sound.manager().play(SoundId.Mention)
        }

        if (
          this.props.soundSettings[SoundId.Message].enabled &&
          !shouldPlayMentionSound &&
          !self &&
          !Resources.manager().isBot(userstate.username)
        ) {
          if (
            !this.props.playMessageSoundOnlyInOwnChannel ||
            (this.props.playMessageSoundOnlyInOwnChannel &&
              !_.isNil(this.props.loginDetails) &&
              this.props.loginDetails.username === this.props.channel)
          ) {
            Sound.manager().play(SoundId.Message, true)
          }
        }
      }

      if (serializedMessage.type === LogType.Whisper && !self) {
        this.props.setLastWhisperSender(serializedMessage.user.userName)

        if (this.props.soundSettings[SoundId.Whisper].enabled) {
          Sound.manager().play(SoundId.Whisper)
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
      enabled ? 'This room is now in unique-chat mode.' : 'This room is no longer in unique-chat mode.',
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
  private onUnmod = (channel: string, username: string) => {
    const { loginDetails } = this.props

    if (!_.isNil(loginDetails) && loginDetails.username !== channel && username === loginDetails.username) {
      this.props.setModerator(false)
    }
  }

  /**
   * Triggered when a single message is deleted.
   * @param channel - The channel.
   * @param id - The id.
   * @param username - The username.
   * @param message - The message.
   */
  private onMessageDeleted = (_channel: string, id: string, username: string, message: string) => {
    this.props.purgeLog(id)

    if (this.props.isMod) {
      const notice = new Notice(
        `A message from ${username} has been deleted. Message: ${message}`,
        Event.MessageDeleted
      )

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when a user is banned (detected through IRC).
   * @param channel - The channel.
   * @param username - The banned username.
   * @param reason - The ban reason if specified.
   */
  private onIrcBan = (channel: string, username: string, reason: string | null) => {
    if (!PubSub.isConnected() || !this.props.isMod) {
      this.onBan(channel, username, reason)
    }
  }

  /**
   * Triggered when a user is banned (detected through PubSub).
   * @param author - The action author.
   * @param username - The banned username.
   * @param reason - The ban reason if specified.
   */
  private onPubSubBan = (author: string, username: string, reason: Optional<string>) => {
    const { channel } = this.props

    if (channel) {
      this.onBan(channel, username, reason ? reason : null, author)
    }
  }

  /**
   * Triggered when a user is banned.
   * @param channel - The channel.
   * @param username - The banned username.
   * @param reason - The ban reason if specified.
   * @param [author] - The ban author.
   */
  private onBan = (_channel: string, username: string, reason: string | null, author?: string) => {
    if (this.props.isMod) {
      let noticeMsg = `${username} was banned`
      noticeMsg += !_.isEmpty(author) ? ` by ${author}.` : '.'
      noticeMsg += !_.isEmpty(reason) ? ` Reason: ${reason}.` : ''

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
   * Triggered when a user is unbanned (detected through PubSub).
   * @param author - The action author.
   * @param username - The unbanned username.
   */
  private onPubSubUnban = (author: string, username: string) => {
    if (this.props.isMod) {
      const notice = new Notice(`${author} removed the ban on ${username}.`, Event.Unban)

      this.props.addLog(notice.serialize())
    }

    this.props.markChatterAsUnbanned(username)
  }

  /**
   * Triggered when a user is timed out (detected through IRC).
   * @param channel - The channel.
   * @param username - The username.
   * @param reason - The timeout reason if specified.
   * @param duration - The timeout duration in seconds.
   */
  private onIrcTimeout = (channel: string, username: string, reason: string | null, duration: number) => {
    if (!PubSub.isConnected() || !this.props.isMod) {
      this.onTimeout(channel, username, reason, duration)
    }
  }

  /**
   * Triggered when a user is timed out (detected through PubSub).
   * @param author - The action author.
   * @param username - The username.
   * @param duration - The timeout duration.
   * @param reason - The timeout reason if specified.
   */
  private onPubSubTimeout = (author: string, username: string, duration: number, reason: Optional<string>) => {
    const { channel } = this.props

    if (channel) {
      this.onTimeout(channel, username, reason ? reason : null, duration, author)
    }
  }

  /**
   * Triggered when a user is timed out.
   * @param channel - The channel.
   * @param username - The username.
   * @param reason - The timeout reason if specified.
   * @param duration - The timeout duration in seconds.
   * @param [author] - The ban author.
   */
  private onTimeout = (
    _channel: string,
    username: string,
    reason: string | null,
    duration: number,
    author?: string
  ) => {
    if (this.props.isMod) {
      let noticeMsg = `${username} was timed out`
      noticeMsg += !_.isEmpty(author) ? ` by ${author}` : ''
      noticeMsg += ` for ${duration} seconds.`
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
   * Triggered when a user is untimeout (detected through PubSub).
   * @param author - The action author.
   * @param username - The username.
   */
  private onPubSubUntimeout = (author: string, username: string) => {
    if (this.props.isMod) {
      const notice = new Notice(`${author} removed the time out on ${username}.`, Event.Untimeout)

      this.props.addLog(notice.serialize())
    }

    this.props.markChatterAsUnbanned(username)
  }

  /**
   * Triggered when AutoMod rejects a message.
   * @param username - The message author.
   * @param messageId - The message ID.
   * @param message - The rejected message.
   * @param reason - The rejection reason.
   */
  private onAutomodRejected = (username: string, messageId: string, message: string, reason: string) => {
    const rejectedMessage = new RejectedMessage(username, messageId, message, reason)

    this.props.addLog(rejectedMessage.serialize())
  }

  /**
   * Triggered when a message send by the user is rejected by AutoMod.
   * @param username - The message author.
   */
  private onAutomodMessageRejected = (username: string) => {
    const { loginDetails } = this.props

    if (loginDetails && loginDetails.username.toLowerCase() === username.toLowerCase()) {
      const notice = new Notice(
        'Your message is being checked by moderators before being sent.',
        Event.AutomodMessageRejected
      )

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when a message send by the user and rejected by AutoMod is approved.
   * @param username - The message author.
   */
  private onAutomodMessageApproved = (username: string) => {
    const { loginDetails } = this.props

    if (loginDetails && loginDetails.username.toLowerCase() === username.toLowerCase()) {
      const notice = new Notice('Your message has been approved by moderators.', Event.AutomodMessageApproved)

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when a message send by the user and rejected by AutoMod is denied.
   * @param username - The message author.
   */
  private onAutomodMessageDenied = (username: string) => {
    const { loginDetails } = this.props

    if (loginDetails && loginDetails.username.toLowerCase() === username.toLowerCase()) {
      const notice = new Notice('Your message has been removed by moderators.', Event.AutomodMessageDenied)

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when a message rejected by AutoMod is approved.
   * @param messageId - The message ID.
   * @param username - The message author.
   * @param moderator - The moderator who allowed the message.
   */
  private onApprovedAutomodMessage = (messageId: string, username: string, moderator: string) => {
    if (this.props.isMod) {
      const notice = new Notice(
        `The message from ${username} was allowed by ${moderator}.`,
        Event.ApprovedAutomodMessage
      )

      this.props.addLog(notice.serialize())
    }

    this.props.markRejectedMessageAsHandled(RejectedMessage.getRejectedMessageInternalId(messageId))
  }

  /**
   * Triggered when a message rejected by AutoMod is denied.
   * @param messageId - The message ID.
   * @param username - The message author.
   * @param moderator - The moderator who allowed the message.
   */
  private onDeniedAutomodMessage = (messageId: string, username: string, moderator: string) => {
    if (this.props.isMod) {
      const notice = new Notice(`The message from ${username} was denied by ${moderator}.`, Event.DeniedAutomodMessage)

      this.props.addLog(notice.serialize())
    }

    this.props.markRejectedMessageAsHandled(RejectedMessage.getRejectedMessageInternalId(messageId))
  }

  /**
   * Triggered when a message rejected by AutoMod is expired.
   * @param messageId - The message ID.
   */
  private onExpiredAutomodMessage = (messageId: string) => {
    this.props.markRejectedMessageAsHandled(RejectedMessage.getRejectedMessageInternalId(messageId))
  }

  /**
   * Triggered when a user subscribe to a channel.
   * @param channel - The channel.
   * @param username - The username.
   * @param method - The method used to sub.
   * @param message - Sub message.
   */
  private onSubscription = (
    _channel: string,
    username: string,
    method: Payment,
    message: string | null,
    userstate: UserState
  ) => {
    const notification = new Notification(
      `${username} just subscribed${this.getPaymentString(method)}!`,
      NotificationEvent.Subscription,
      this.parseSubMessage(message, userstate)
    )

    const serializedNotification = notification.serialize()

    this.props.addLog(serializedNotification)
    this.props.addPotentialChatter(Chatter.createPotentialChatter(username).serialize(), serializedNotification.id)
  }

  /**
   * Parses a sub or resub message.
   * @param message - The received message.
   * @param userstate - The associated user state.
   * @return The parsed message if any.
   */
  private parseSubMessage(message: string | null, userstate: UserState) {
    let notificationMessage: Optional<string>

    if (!_.isNil(message)) {
      const { hideVIPBadges, loginDetails, theme } = this.props

      userstate.username = userstate['display-name']

      const parsedMessage = new Message(message, userstate, false, loginDetails!.username, {
        hideVIPBadge: hideVIPBadges,
        theme,
      })

      if (!_.isNil(parsedMessage)) {
        const serializedMessage = parsedMessage.serialize()

        notificationMessage = serializedMessage.message
      }
    }

    return notificationMessage
  }

  /**
   * Triggered when a user re-subscribe to a channel.
   * @param channel - The channel.
   * @param username - The username.
   * @param months - The duration of the subscription.
   * @param message - Sub message.
   * @param userstate - The associated userstate.
   * @param method - The method used to sub.
   * @param monthsStreak - Duration of the current streak if shared.
   */
  private onResub = (
    _channel: string,
    username: string,
    months: number,
    message: string | null,
    userstate: UserState,
    method: Payment,
    monthsStreak: number | null
  ) => {
    const streakMessage = !_.isNil(monthsStreak) && monthsStreak > 0 ? ` (${monthsStreak} months streak)` : ''
    const notification = new Notification(
      `${username} just re-subscribed for ${months} months${streakMessage}${this.getPaymentString(method)}!`,
      NotificationEvent.ReSub,
      this.parseSubMessage(message, userstate)
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
  private onSubGift = (_channel: string, username: string, recipient: string, method: Omit<Payment, 'prime'>) => {
    let tierInfo = ''

    if (method.plan === '2000') {
      tierInfo = ' tier 2'
    } else if (method.plan === '3000') {
      tierInfo = ' tier 3'
    }

    const notification = new Notification(
      `${username} just gifted a${tierInfo} sub to ${recipient}!`,
      NotificationEvent.SubGift
    )

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

    const notice = new Notice(message, Event.Notice)

    if (!PubSub.isConnected() || !_.includes(Notices.PubSubNotices, id)) {
      this.props.addLog(notice.serialize())
    }

    if (_.includes(Notices.UnbanNotices, id)) {
      const username = _.first(message.split(' '))

      if (!_.isNil(username)) {
        this.props.markChatterAsUnbanned(username)
      }
    } else if (id === Notices.BanNotice) {
      this.props.markUserAsBanned()

      const { channel } = this.props
      const notice = new Notice(
        `You are unable to read or participate in ${channel}'s channel until a moderator unbans you. You may be able to submit an appeal through <a href="https://www.twitch.tv/popout/${channel}/chat?popout=" target="_blank">the official Twitch chat</a>.`,
        null,
        true
      )

      this.props.addLog(notice.serialize())
    }
  }

  /**
   * Triggered when the user emote sets are received.
   * @param setsList - The list of emote sets.
   */
  private onEmoteSets = async (setsList: string) => {
    const sets = setsList.split(',')

    let emoticonsSetId = 0
    let twitchEmotes: TwitchEmote[] = []

    try {
      twitchEmotes = await Twitch.fetchEmoteSets(sets)
    } catch (error) {
      //
    }

    _.forEach(Emoticons, (_emoticons, idStr) => {
      if (_.includes(sets, idStr)) {
        emoticonsSetId = parseInt(idStr, 10)
      }
    })

    Resources.manager().setEmoticonsSetId(emoticonsSetId)

    const emotes = EmotesProvider.sanitizeTwitchEmotes(twitchEmotes)

    const provider = new EmotesProvider(
      EmoteProviderPrefix.Twitch,
      emotes,
      'https://static-cdn.jtvnw.net/emoticons/v2/{{id}}/default/dark/{{image}}',
      '.0'
    )

    this.addEmotesProvider(provider)
  }

  /**
   * Returns the string representation of a payment.
   * @param  payment - The payment method.
   * @return The string representation.
   */
  private getPaymentString(payment: Payment) {
    if (payment.prime) {
      return ' with Prime Gaming'
    } else if (payment.plan === '2000') {
      return ' with a tier 2 sub'
    } else if (payment.plan === '3000') {
      return ' with a tier 3 sub'
    }

    return ''
  }

  /**
   * Adds (or updates) an emotes provider.
   * @param provider - The emotes provider to add.
   */
  private addEmotesProvider(provider: EmotesProvider<Emote>) {
    const providers = Resources.manager().getEmotesProviders()

    if (providers.size > 1) {
      const allEmoteCodes: string[] = []

      providers.forEach((aProvider) => {
        if (aProvider.prefix !== provider.prefix) {
          allEmoteCodes.push(..._.map(aProvider.emotes, 'code'))
        }
      })

      provider.emotes = _.filter(provider.emotes, (emote) => {
        return !_.includes(allEmoteCodes, emote.name)
      })
    }

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
      if (!_.isNil(this.props.channel)) {
        try {
          this.isFetchingHistoricalMessage = true

          const recentMessages = await Robotty.fetchRecentMessages(this.props.channel)
          _.forEach(recentMessages, (message) => {
            this.client._onMessage({ data: message })
          })
        } catch (error) {
          //
        } finally {
          this.isFetchingHistoricalMessage = false
        }
      }

      const channelInfos = await Twitch.fetchChannelInformations(channelId)

      if (!_.isNil(channelInfos.title) && !_.isEmpty(channelInfos.title)) {
        const notice = new Notice(`Current title: ${channelInfos.title}`, null, true)

        this.props.unshiftLog(notice.serialize())
      }

      Resources.manager().setBadges(await Twitch.fetchBadges(channelId))
      Resources.manager().setCheermotes((await Twitch.fetchCheermotes(channelId)).data)

      if (!_.isNil(this.props.channel)) {
        try {
          const emotesAndBots = await Bttv.fetchEmotesAndBots(channelId)

          this.addEmotesProvider(emotesAndBots.emotes)

          if (!_.isNil(emotesAndBots.bots)) {
            Resources.manager().addBots(emotesAndBots.bots)
          }
        } catch (error) {
          //
        }

        try {
          const emotes = await Ffz.fetchEmotes(this.props.channel)

          this.addEmotesProvider(emotes)
        } catch (error) {
          //
        }

        this.didFetchExternalResources = true
      }
    } catch {
      //
    }
  }

  /**
   * Updates sound volumes.
   */
  private updateSoundVolumes() {
    Sound.manager().udpateVolumes(this.props.soundSettings)
  }

  /**
   * Updates the delay between throttled sounds.
   */
  private updateDelayBetweenThrottledSounds() {
    Sound.manager().updateDelayBetweenThrottledSounds(this.props.delayBetweenThrottledSounds)
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
          userstate.id = nanoid()
          userstate['user-id'] = 'self'
          userstate['tmi-sent-ts'] = Date.now().toString()
        } else if (userstate['message-type'] === LogType.Whisper) {
          userstate.id = self ? nanoid() : `${userstate['thread-id']}-${userstate['message-id']}`
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

        const { channel, hideVIPBadges, loginDetails, theme } = this.props

        const hideVIPBadge = hideVIPBadges && !_.isNil(loginDetails) && loginDetails.username !== channel

        parsedMessage = new Message(message, userstate, self, this.props.loginDetails!.username, {
          hideVIPBadge,
          theme,
        })

        if (_.isNil(parsedMessage.user.color)) {
          const user = _.get(this.props.chatters, parsedMessage.user.id)

          parsedMessage.updateColor(
            _.isNil(user) || _.isNil(user.color) ? parsedMessage.user.generateColor() : user.color
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

  /**
   * Sets the reply reference for a message sent by the current user.
   * @param userstate - The associated userstate.
   */
  private setSelfReplyReference(userstate: UserState) {
    const { replyReference } = this.props

    if (_.isNil(replyReference)) {
      return
    }

    userstate['reply-parent-display-name'] = replyReference.user.displayName
    userstate['reply-parent-msg-body'] = replyReference.text
    userstate['reply-parent-msg-id'] = replyReference.id
    userstate['reply-parent-user-id'] = replyReference.user.id
    userstate['reply-parent-user-login'] = replyReference.user.userName
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    autoHostThreshold: getAutoHostThreshold(state),
    channel: getChannel(state),
    chatters: getChatters(state),
    chattersMap: getChattersMap(state),
    delayBetweenThrottledSounds: getDelayBetweenThrottledSounds(state),
    hideVIPBadges: getHideVIPBadges(state),
    hideWhispers: getHideWhispers(state),
    highlightAllMentions: getHighlightAllMentions(state),
    highlights: getHighlights(state),
    highlightsIgnoredUsers: getHighlightsIgnoredUsers(state),
    highlightsPermanentUsers: getHighlightsPermanentUsers(state),
    hostThreshold: getHostThreshold(state),
    isMod: getIsMod(state),
    loginDetails: getChatLoginDetails(state),
    playMessageSoundOnlyInOwnChannel: getPlayMessageSoundOnlyInOwnChannel(state),
    soundSettings: getSoundSettings(state),
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
    markRejectedMessageAsHandled,
    purgeLog,
    purgeLogs,
    resetAppState,
    setLastWhisperSender,
    setModerator,
    unshiftLog,
    updateEmotes,
    updateRoomState,
    updateStatus,
  },
  null,
  { forwardRef: true }
)(ChatClient)

/**
 * React Props.
 */
interface StateProps {
  autoHostThreshold: ReturnType<typeof getAutoHostThreshold>
  channel: ReturnType<typeof getChannel>
  chatters: ReturnType<typeof getChatters>
  chattersMap: ReturnType<typeof getChattersMap>
  delayBetweenThrottledSounds: ReturnType<typeof getDelayBetweenThrottledSounds>
  hideVIPBadges: ReturnType<typeof getHideVIPBadges>
  hideWhispers: ReturnType<typeof getHideWhispers>
  highlightAllMentions: ReturnType<typeof getHighlightAllMentions>
  highlights: ReturnType<typeof getHighlights>
  highlightsIgnoredUsers: ReturnType<typeof getHighlightsIgnoredUsers>
  highlightsPermanentUsers: ReturnType<typeof getHighlightsPermanentUsers>
  hostThreshold: ReturnType<typeof getHostThreshold>
  isMod: ReturnType<typeof getIsMod>
  loginDetails: ReturnType<typeof getChatLoginDetails>
  playMessageSoundOnlyInOwnChannel: ReturnType<typeof getPlayMessageSoundOnlyInOwnChannel>
  soundSettings: ReturnType<typeof getSoundSettings>
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
  markRejectedMessageAsHandled: typeof markRejectedMessageAsHandled
  purgeLog: typeof purgeLog
  purgeLogs: typeof purgeLogs
  resetAppState: typeof resetAppState
  setLastWhisperSender: typeof setLastWhisperSender
  setModerator: typeof setModerator
  unshiftLog: typeof unshiftLog
  updateRoomState: typeof updateRoomState
  updateEmotes: typeof updateEmotes
  updateStatus: typeof updateStatus
}

/**
 * React Props.
 */
interface OwnProps {
  banned: boolean
  clearReply: () => void
  markUserAsBanned: () => void
  replyReference?: SerializedMessage
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
