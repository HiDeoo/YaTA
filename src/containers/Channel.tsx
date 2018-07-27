import { Button, Intent, NavbarDivider, Popover } from '@blueprintjs/core'
import * as copy from 'copy-to-clipboard'
import * as _ from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { match } from 'react-router'
import * as ReactTooltip from 'react-tooltip'
import { compose } from 'recompose'
import styled from 'styled-components'

import ChannelDetails from 'Components/ChannelDetails'
import Chatters from 'Components/Chatters'
import FlexLayout from 'Components/FlexLayout'
import { withHeader, WithHeaderProps } from 'Components/Header'
import HeaderChannelState from 'Components/HeaderChannelState'
import HeaderModerationTools from 'Components/HeaderModerationTools'
import HeaderTooltip from 'Components/HeaderTooltip'
import Input from 'Components/Input'
import Logs from 'Components/Logs'
import Spinner from 'Components/Spinner'
import ReadyState from 'Constants/readyState'
import Status from 'Constants/status'
import Chat, { ChatClient } from 'Containers/Chat'
import ChatterDetails from 'Containers/ChatterDetails'
import Action, { ActionPlaceholder, ActionType, SerializedAction } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import Toaster from 'Libs/Toaster'
import Twitch from 'Libs/Twitch'
import { addToHistory, setChannel, updateHistoryIndex } from 'Store/ducks/app'
import { ignoreUser } from 'Store/ducks/chatters'
import { pauseAutoScroll } from 'Store/ducks/logs'
import { ApplicationState } from 'Store/reducers'
import {
  getChannel,
  getEmotes,
  getHistory,
  getHistoryIndex,
  getLastWhisperSender,
  getRoomState,
  getStatus,
} from 'Store/selectors/app'
import { getChatters } from 'Store/selectors/chatters'
import { getIsAutoScrollPaused, getLogs } from 'Store/selectors/logs'
import {
  getAutoFocusInput,
  getCopyMessageOnDoubleClick,
  getDisableDialogAnimations,
  getShowContextMenu,
  getShowViewerCount,
} from 'Store/selectors/settings'
import { getIsMod, getLoginDetails } from 'Store/selectors/user'
import { replaceImgTagByAlt, sanitizeUrlForPreview } from 'Utils/html'

/**
 * ChannelLink component.
 */
const ChannelLink = styled.a.attrs({
  target: '_blank',
})`
  color: inherit !important;
`

/**
 * RegExp used to identify links to preview.
 */
const PreviewRegExp = /https?:\/\/.[\w\-\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv)/

/**
 * RegExp used to identify whisper reply command (/r).
 */
const WhisperReplyRegExp = /^\/r /

/**
 * React State.
 */
const initialState = {
  focusedChatter: null as SerializedChatter | null,
  inputValue: '',
  showChatters: false,
  viewerCount: null as number | null,
}
type State = Readonly<typeof initialState>

/**
 * Channel Component.
 */
class Channel extends React.Component<Props, State> {
  public state: State = initialState
  public chatClient = React.createRef<any>()
  private logsWrapper = React.createRef<HTMLElement>()
  private logsComponent = React.createRef<Logs>()
  private input = React.createRef<Input>()
  private viewerCountMonitorId?: number

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    const channel = this.props.match.params.channel.toLowerCase()

    if (this.props.match.params.channel !== this.props.channel) {
      this.props.setChannel(channel)
    }

    this.setHeaderComponents()

    window.addEventListener('focus', this.onFocusWindow)
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   * @param prevState - The previous state.
   */
  public componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      isAutoScrollPaused: prevIsAutoScrollPaused,
      isMod: prevIsMod,
      roomState: prevRoomState,
      showViewerCount: prevShowViewerCount,
    } = prevProps
    const { isAutoScrollPaused, isMod, roomState, showViewerCount } = this.props

    if (prevShowViewerCount !== showViewerCount || (_.isNil(prevRoomState) && !_.isNil(roomState))) {
      if (showViewerCount) {
        this.startMonitoringViewerCount()
      } else {
        this.stopMonitoringViewerCount()
      }
    }

    const { viewerCount: prevViewerCount } = prevState
    const { viewerCount } = this.state

    if (
      prevIsAutoScrollPaused !== isAutoScrollPaused ||
      prevRoomState !== roomState ||
      prevIsMod !== isMod ||
      prevViewerCount !== viewerCount
    ) {
      this.setHeaderComponents()
    }
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public componentWillUnmount() {
    this.props.setHeaderTitleComponent(null)
    this.props.setHeaderRightComponent(null)

    window.removeEventListener('focus', this.onFocusWindow)

    if (this.props.showViewerCount) {
      this.stopMonitoringViewerCount()
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { focusedChatter, showChatters } = this.state
    const {
      channel,
      copyMessageOnDoubleClick,
      disableDialogAnimations,
      loginDetails,
      logs,
      showContextMenu,
    } = this.props

    if (_.isNil(channel)) {
      return <Spinner large />
    }

    return (
      <FlexLayout vertical innerRef={this.logsWrapper}>
        <Helmet>
          <title>{channel} - YaTA</title>
        </Helmet>
        <ReactTooltip html effect="solid" getContent={this.getTooltipContent} className="channelTooltip" />
        <Chatters
          visible={showChatters}
          toggle={this.toggleChatters}
          channel={channel}
          disableDialogAnimations={disableDialogAnimations}
        />
        <Chat ref={this.chatClient} />
        <Logs
          logs={logs}
          copyMessageToClipboard={this.copyMessageToClipboard}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          pauseAutoScroll={this.props.pauseAutoScroll}
          scrollToNewestLog={this.scrollToNewestLog}
          showContextMenu={showContextMenu}
          focusChatter={this.focusChatter}
          copyToClipboard={this.copyToClipboard}
          actionHandler={this.handleAction}
          canModerate={this.canModerate}
          whisper={this.prepareWhisper}
          timeout={this.timeout}
          ban={this.ban}
          ref={this.logsComponent}
        />
        <Input
          ref={this.input}
          disabled={this.props.status !== Status.Connected}
          value={this.state.inputValue}
          onChange={this.onChangeInputValue}
          onSubmit={this.sendMessage}
          getCompletions={this.getCompletions}
          getHistory={this.getHistory}
          username={_.get(loginDetails, 'username')}
        />
        <ChatterDetails
          copyMessageToClipboard={this.copyMessageToClipboard}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          actionHandler={this.handleAction}
          canModerate={this.canModerate}
          unfocus={this.unfocusChatter}
          whisper={this.prepareWhisper}
          chatter={focusedChatter}
          timeout={this.timeout}
          block={this.block}
          ban={this.ban}
        />
      </FlexLayout>
    )
  }

  /**
   * Sets the header components.
   * @return Element to render.
   */
  private setHeaderComponents() {
    const { channel, isAutoScrollPaused, isMod, roomState } = this.props

    const channelId = _.get(roomState, 'roomId')

    const headerRightComponent = (
      <>
        <HeaderChannelState
          isAutoScrollPaused={isAutoScrollPaused}
          roomState={roomState}
          scrollToNewestLog={this.scrollToNewestLog}
          viewerCount={this.state.viewerCount}
        />
        {isMod &&
          !_.isNil(roomState) && (
            <HeaderModerationTools
              clearChat={this.clearChat}
              roomState={roomState}
              toggleR9k={this.toggleR9k}
              toggleSlowMode={this.toggleSlowMode}
              toggleFollowersOnly={this.toggleFollowersOnly}
              toggleSubsOnly={this.toggleSubsOnly}
              toggleEmoteOnly={this.toggleEmoteOnly}
            />
          )}
        {!_.isNil(roomState) && (
          <HeaderTooltip content="Create Clip">
            <Button onClick={this.clip} icon="film" minimal />
          </HeaderTooltip>
        )}
        <Popover>
          <HeaderTooltip content="Channel Details">
            <Button icon="eye-open" minimal />
          </HeaderTooltip>
          <ChannelDetails channelId={channelId} />
        </Popover>
        <HeaderTooltip content="Chatters List">
          <Button onClick={this.toggleChatters} icon="people" minimal />
        </HeaderTooltip>
        <NavbarDivider />
      </>
    )

    if (!_.isNil(channel)) {
      this.props.setHeaderTitleComponent(<ChannelLink href={`https://twitch.tv/${channel}`}>{channel}</ChannelLink>)
    }

    this.props.setHeaderRightComponent(headerRightComponent)
  }

  /**
   * Returns the content of a tooltip when hovering a link.
   * @return The tooltip content.
   */
  private getTooltipContent = () => {
    if (!_.isNil(this.state.focusedChatter)) {
      return null
    }

    if (!_.isNil(this.logsWrapper.current)) {
      const wrapper = this.logsWrapper.current

      const nodes = wrapper.querySelectorAll(':hover')
      const node = nodes.item(nodes.length - 1)

      if (node instanceof HTMLAnchorElement) {
        const href = node.getAttribute('href')

        if (!_.isNil(href)) {
          if (PreviewRegExp.test(href)) {
            return `<div class="preview"><img src=${sanitizeUrlForPreview(href)} /></div>`
          } else {
            return null
          }
        }
      } else if (node instanceof HTMLImageElement) {
        return node.getAttribute('data-tip')
      }
    }

    return ' '
  }

  /**
   * Triggered when the application is focused.
   */
  private onFocusWindow = () => {
    if (this.props.autoFocusInput && !_.isNil(this.input.current)) {
      this.input.current.focus()
    }
  }

  /**
   * Triggered when input value is modified.
   */
  private onChangeInputValue = (value: string) => {
    if (WhisperReplyRegExp.test(value)) {
      const { lastWhisperSender } = this.props
      const inputValue = `/w ${this.props.lastWhisperSender}${lastWhisperSender.length > 0 ? ' ' : ''}`

      this.setState(() => ({ inputValue }))
    } else {
      this.setState(() => ({ inputValue: value }))
    }
  }

  /**
   * Starts monitoring the viewer count.
   */
  private startMonitoringViewerCount() {
    this.monitorViewerCount()

    if (_.isNil(this.viewerCountMonitorId)) {
      // Update every 2mins.
      this.viewerCountMonitorId = window.setInterval(this.monitorViewerCount, 120000)
    }
  }

  /**
   * Stops monitoring the viewer count.
   */
  private stopMonitoringViewerCount() {
    if (!_.isNil(this.viewerCountMonitorId)) {
      window.clearInterval(this.viewerCountMonitorId)
      this.viewerCountMonitorId = undefined

      this.setState(() => ({ viewerCount: null }))
    }
  }

  /**
   * Monitors the viewer count.
   */
  private monitorViewerCount = async () => {
    const { roomState } = this.props
    let viewers: number | null = null

    if (!_.isNil(roomState)) {
      const channelId = _.get(roomState, 'roomId')

      if (!_.isNil(channelId)) {
        const { stream } = await Twitch.fetchStream(channelId)

        if (!_.isNil(stream)) {
          viewers = stream.viewers
        }
      }
    }

    this.setState(() => ({ viewerCount: viewers }))
  }

  /**
   * Scrolls to the newest log available.
   */
  private scrollToNewestLog = () => {
    if (!_.isNil(this.logsComponent.current) && !_.isNil(this.logsComponent.current.list.current)) {
      const element = document.querySelector('.ReactVirtualized__Grid')

      if (!_.isNil(element)) {
        const maxScrollTop = element.scrollHeight - element.clientHeight

        if (maxScrollTop > element.scrollTop) {
          this.logsComponent.current.list.current.scrollToPosition(maxScrollTop)
          requestAnimationFrame(this.scrollToNewestLog)
        }
      }
    }
  }

  /**
   * Toggles the chatters list.
   */
  private toggleChatters = () => {
    this.setState(({ showChatters }) => ({ showChatters: !showChatters }))
  }

  /**
   * Handle a user defined action.
   * @param action - The action to execute.
   * @param [chatter=this.state.focusedChatter] - The chatter on who the action is triggered.
   */
  private handleAction = async (
    action: SerializedAction,
    chatter: SerializedChatter | null = this.state.focusedChatter
  ) => {
    const { channel } = this.props

    if (_.isNil(channel) || _.isNil(chatter)) {
      return
    }

    const placeholders = {
      [ActionPlaceholder.Channel]: channel,
      [ActionPlaceholder.Username]: chatter.userName,
    }

    try {
      const text = Action.parse(action, placeholders)

      if (action.type === ActionType.Say) {
        await this.say(text)
      } else if (action.type === ActionType.Whisper && !_.isNil(action.recipient)) {
        await this.whisper(action.recipient, text)
      } else if (action.type === ActionType.Prepare) {
        this.setState(() => ({ inputValue: text }))

        if (!_.isNil(this.input.current)) {
          this.input.current.focus()
        }
      } else if (action.type === ActionType.Open) {
        window.open(text)
      }
    } catch (error) {
      Toaster.show({
        icon: 'error',
        intent: Intent.DANGER,
        message: 'Something went wrong! Check your action configuration.',
      })
    }
  }

  /**
   * Focuses a specific chatter.
   * @param chatter - The chatter to focus.
   */
  private focusChatter = (chatter: SerializedChatter) => {
    this.setState(() => ({ focusedChatter: this.props.chatters[chatter.id] }))
  }

  /**
   * Unfocuses any focused chatter.
   */
  private unfocusChatter = () => {
    this.setState(() => ({ focusedChatter: null }))
  }

  /**
   * Copy a message to the clipboard.
   * @param message - The message to copy.
   */
  private copyMessageToClipboard = (message: SerializedMessage) => {
    const tmpDiv = document.createElement('div')
    tmpDiv.innerHTML = replaceImgTagByAlt(message.message)

    const sanitizedMessage = tmpDiv.textContent || tmpDiv.innerText || ''

    this.copyToClipboard(`[${message.time}] ${message.user.displayName}: ${sanitizedMessage}`)

    const selection = window.getSelection()

    if (selection.toString().trim().length === 0) {
      selection.empty()
    }
  }

  /**
   * Copies content to the clipboard.
   * @param content - The content to copy.
   */
  private copyToClipboard = (content: string) => {
    copy(content)

    Toaster.show({ message: 'Copied!', intent: Intent.SUCCESS, icon: 'clipboard', timeout: 1000 })
  }

  /**
   * Determines if the current user can moderate a specific user.
   * @param  chatter - The user to moderate.
   * @retern `true` when the user can be moderated.
   */
  private canModerate = (chatter: SerializedChatter) => {
    const { channel, isMod, loginDetails } = this.props

    const userIsBroadcaster = !_.isNil(loginDetails) && !_.isNil(channel) && loginDetails.username === channel
    const chatterIsBroadcaster = chatter.isBroadcaster
    const chatterIsSelf = chatter.isSelf
    const chatterIsMod = chatter.isMod

    return (
      (isMod && userIsBroadcaster && !chatterIsSelf) ||
      (isMod && !chatterIsSelf && !chatterIsBroadcaster && !chatterIsMod)
    )
  }

  /**
   * Returns a list of completions for a specific word.
   * @param  word - The word to auto-complete.
   * @param  excludeEmotes - `true` to ignore emotes.
   * @return The list of completions.
   */
  private getCompletions = (word: string, excludeEmotes: boolean = false) => {
    const sanitizedWord = word.toLowerCase()

    const { chatters, emotes } = this.props

    const usernameCompletions = _.filter(chatters, (chatter) => {
      return chatter.displayName.toLowerCase().startsWith(sanitizedWord)
    }).map((chatter) => chatter.displayName)

    let emoteCompletions: string[] = []

    if (!excludeEmotes) {
      emoteCompletions = _.filter(emotes, (emote) => {
        return emote.code.toLowerCase().startsWith(sanitizedWord)
      }).map((emote) => emote.code)
    }

    return [...emoteCompletions, ...usernameCompletions]
  }

  /**
   * Returns the next or previous history entry if available.
   * @param [next=true] - `true` to fetch the previous entry or `false` for the next one.
   */
  private getHistory = (previous: boolean = true) => {
    const { history, historyIndex } = this.props

    const index = historyIndex + (previous ? 1 : -1)

    if (previous && index >= history.length) {
      return null
    } else if (!previous && index < 0) {
      this.props.updateHistoryIndex(-1)

      return ''
    }

    this.props.updateHistoryIndex(index)

    return history[index]
  }

  /**
   * Returns the Twitch client instance if defined and connected.
   * @return The Twitch client or null.
   */
  private getTwitchClient() {
    if (!_.isNil(this.chatClient.current)) {
      const chatClient = this.chatClient.current.getWrappedInstance() as ChatClient
      const twitchClient = chatClient.client

      if (twitchClient.readyState() !== ReadyState.Open) {
        return null
      }

      return twitchClient
    }

    return null
  }

  /**
   * Sends a message or a whisper from the chat input.
   */
  private sendMessage = async () => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      try {
        const message = this.state.inputValue.trim()
        const whisper = Twitch.parseWhisperCommand(message)

        if (!_.isNil(whisper)) {
          await this.whisper(whisper.username, whisper.message)
        } else {
          await this.say(message)
        }

        this.setState(() => ({ inputValue: '' }))
      } catch (error) {
        //
      }
    }
  }

  /**
   * Sends a message.
   * @param message - The message to send.
   */
  private async say(message: string) {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      await client.say(channel, message)

      this.props.addToHistory(message)
    }
  }

  /**
   * Sends a whisper.
   * @param username - The recipient.
   * @param whisper - The whisper to send.
   */
  private async whisper(username: string, whisper: string) {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      const chatClient = this.chatClient.current.getWrappedInstance() as ChatClient
      chatClient.nextWhisperRecipient = username

      await client.whisper(username, whisper)
    }
  }

  /**
   * Timeouts a user.
   * @param username - The name of the user to timeout.
   * @param duration - The duration of the timeout in seconds.
   */
  private timeout = async (username: string, duration: number) => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      try {
        await client.timeout(channel, username, duration)
      } catch (error) {
        //
      }
    }
  }

  /**
   * Bans a user.
   * @param username - The name of the user to timeout.
   */
  private ban = async (username: string) => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      try {
        await client.ban(channel, username)
      } catch (error) {
        //
      }
    }
  }

  /**
   * Blocks a user.
   * @param targetId - The user id of the user to block.
   */
  private block = async (targetId: string) => {
    try {
      const ignoredUser = await Twitch.blockUser(targetId)

      this.props.ignoreUser(ignoredUser.user._id)
    } catch (error) {
      //
    }
  }

  /**
   * Prepare a whisper by setting the input to the whisper command.
   * @param username - The username to whisper.
   */
  private prepareWhisper = (username: string) => {
    this.setState(() => ({ inputValue: `/w ${username} ` }))

    if (!_.isNil(this.input.current)) {
      this.input.current.focus()
    }
  }

  /**
   * Clears the chat.
   */
  private clearChat = async () => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      try {
        await client.clear(channel)
      } catch (error) {
        //
      }
    }
  }

  /**
   * Toggles the R9K mode.
   */
  private toggleR9k = async () => {
    const { channel, roomState } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel) && !_.isNil(roomState)) {
      try {
        if (roomState.r9k) {
          await client.r9kbetaoff(channel)
        } else {
          await client.r9kbeta(channel)
        }
      } catch (error) {
        //
      }
    }
  }

  /**
   * Toggles the slow mode.
   */
  private toggleSlowMode = async () => {
    const { channel, roomState } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel) && !_.isNil(roomState)) {
      try {
        if (roomState.slow) {
          await client.slowoff(channel)
        } else {
          // Don't use the default twitch-js value, use the default from Twitch.
          await client.slow(channel, 120)
        }
      } catch (error) {
        //
      }
    }
  }

  /**
   * Toggles the followers-only mode.
   */
  private toggleFollowersOnly = async () => {
    const { channel, roomState } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel) && !_.isNil(roomState)) {
      try {
        if (roomState.followersOnly) {
          await client.followersonlyoff(channel)
        } else {
          await client.followersonly(channel)
        }
      } catch (error) {
        //
      }
    }
  }

  /**
   * Toggles the subscribers-only mode.
   */
  private toggleSubsOnly = async () => {
    const { channel, roomState } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel) && !_.isNil(roomState)) {
      try {
        if (roomState.subsOnly) {
          await client.subscribersoff(channel)
        } else {
          await client.subscribers(channel)
        }
      } catch (error) {
        //
      }
    }
  }

  /**
   * Toggles the emote-only mode.
   */
  private toggleEmoteOnly = async () => {
    const { channel, roomState } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel) && !_.isNil(roomState)) {
      try {
        if (roomState.emoteOnly) {
          await client.emoteonlyoff(channel)
        } else {
          await client.emoteonly(channel)
        }
      } catch (error) {
        //
      }
    }
  }

  /**
   * Clips the current stream.
   */
  private clip = async () => {
    const { roomState } = this.props

    if (_.isNil(roomState)) {
      return
    }

    try {
      const response = await Twitch.createClip(roomState.roomId)

      if (response.data.length > 0) {
        window.open(response.data[0].edit_url)
      } else {
        throw new Error('Something went wrong while creating the clip!')
      }
    } catch (error) {
      if (error instanceof Error) {
        Toaster.show({
          icon: 'error',
          intent: Intent.DANGER,
          message: error.message,
        })
      }
    }
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, {}>(
  connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
    (state) => ({
      autoFocusInput: getAutoFocusInput(state),
      channel: getChannel(state),
      chatters: getChatters(state),
      copyMessageOnDoubleClick: getCopyMessageOnDoubleClick(state),
      disableDialogAnimations: getDisableDialogAnimations(state),
      emotes: getEmotes(state),
      history: getHistory(state),
      historyIndex: getHistoryIndex(state),
      isAutoScrollPaused: getIsAutoScrollPaused(state),
      isMod: getIsMod(state),
      lastWhisperSender: getLastWhisperSender(state),
      loginDetails: getLoginDetails(state),
      logs: getLogs(state),
      roomState: getRoomState(state),
      showContextMenu: getShowContextMenu(state),
      showViewerCount: getShowViewerCount(state),
      status: getStatus(state),
    }),
    { addToHistory, ignoreUser, pauseAutoScroll, setChannel, updateHistoryIndex }
  ),
  withHeader
)

export default enhance(Channel)

/**
 * React Props.
 */
type StateProps = {
  autoFocusInput: ReturnType<typeof getAutoFocusInput>
  channel: ReturnType<typeof getChannel>
  chatters: ReturnType<typeof getChatters>
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
  emotes: ReturnType<typeof getEmotes>
  history: ReturnType<typeof getHistory>
  historyIndex: ReturnType<typeof getHistoryIndex>
  isAutoScrollPaused: ReturnType<typeof getIsAutoScrollPaused>
  isMod: ReturnType<typeof getIsMod>
  lastWhisperSender: ReturnType<typeof getLastWhisperSender>
  loginDetails: ReturnType<typeof getLoginDetails>
  logs: ReturnType<typeof getLogs>
  roomState: ReturnType<typeof getRoomState>
  showContextMenu: ReturnType<typeof getShowContextMenu>
  showViewerCount: ReturnType<typeof getShowViewerCount>
  status: ReturnType<typeof getStatus>
}

/**
 * React Props.
 */
type DispatchProps = {
  addToHistory: typeof addToHistory
  ignoreUser: typeof ignoreUser
  pauseAutoScroll: typeof pauseAutoScroll
  setChannel: typeof setChannel
  updateHistoryIndex: typeof updateHistoryIndex
}

/**
 * React Props.
 */
interface OwnProps extends WithHeaderProps {
  match: match<{
    channel: string
  }>
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
