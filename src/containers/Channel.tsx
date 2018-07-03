import { Intent, Spinner } from '@blueprintjs/core'
import * as copy from 'copy-to-clipboard'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { match } from 'react-router'
import * as ReactTooltip from 'react-tooltip'

import Center from 'Components/Center'
import ChatInput from 'Components/ChatInput'
import ChatLogs from 'Components/ChatLogs'
import ChattersList from 'Components/ChattersList'
import FlexLayout from 'Components/FlexLayout'
import ReadyState from 'Constants/readyState'
import Status from 'Constants/status'
import ChatClient, { Client } from 'Containers/ChatClient'
import ChatDetails from 'Containers/ChatDetails'
import { SerializedChatter } from 'Libs/Chatter'
import Toaster from 'Libs/Toaster'
import Twitch from 'Libs/Twitch'
import { addToHistory, AppState, setChannel, toggleChattersList, updateHistoryIndex } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getEmotes, getHistory, getHistoryIndex, getShowChattersList, getStatus } from 'Store/selectors/app'
import { getChatters } from 'Store/selectors/chatters'
import { getLogs } from 'Store/selectors/logs'
import { getCopyMessageOnDoubleClick, getShowContextMenu } from 'Store/selectors/settings'
import { getIsMod, getLoginDetails } from 'Store/selectors/user'
import { sanitizeUrlForPreview } from 'Utils/preview'

/**
 * RegExp used to identify links to preview.
 */
const PreviewRegExp = /https?:\/\/.[\w\-\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv)/

/**
 * RegExp used to identify whisper command (/w user message).
 */
const WhisperRegExp = /^\/w (\S+) (.+)/g

/**
 * React State.
 */
const initialState = { inputValue: '', focusedChatter: null as SerializedChatter | null }
type State = Readonly<typeof initialState>

/**
 * Channel Component.
 */
class Channel extends React.Component<Props, State> {
  public state: State = initialState
  public chatClient = React.createRef<any>()
  private chatLogs = React.createRef<HTMLElement>()

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    if (this.props.match.params.channel !== this.props.channel) {
      this.props.setChannel(this.props.match.params.channel)
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel, copyMessageOnDoubleClick, logs, showChattersList, showContextMenu } = this.props
    const { focusedChatter } = this.state

    if (_.isNil(channel)) {
      return (
        <Center>
          <Spinner large />
        </Center>
      )
    }

    return (
      <FlexLayout vertical innerRef={this.chatLogs}>
        <ReactTooltip html effect="solid" getContent={this.getTooltipContent} />
        <ChattersList visible={showChattersList} toggle={this.props.toggleChattersList} channel={channel} />
        <ChatClient ref={this.chatClient} />
        <ChatLogs
          logs={logs}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          showContextMenu={showContextMenu}
          focusChatter={this.focusChatter}
          copyToClipboard={this.copyToClipboard}
          canModerate={this.canModerate}
          timeout={this.timeout}
          ban={this.ban}
        />
        <ChatInput
          disabled={this.props.status !== Status.Connected}
          value={this.state.inputValue}
          onChange={this.onChangeInputValue}
          onSubmit={this.sendMessage}
          getCompletions={this.getCompletions}
          getHistory={this.getHistory}
        />
        <ChatDetails
          chatter={focusedChatter}
          unfocus={this.unfocusChatter}
          timeout={this.timeout}
          ban={this.ban}
          canModerate={this.canModerate}
        />
      </FlexLayout>
    )
  }

  /**
   * Returns the content of a tooltip when hovering a link.
   * @return The tooltip content.
   */
  private getTooltipContent = () => {
    if (!_.isNil(this.chatLogs.current)) {
      const wrapper = this.chatLogs.current

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
      }
    }

    return ' '
  }

  /**
   * Triggered when input value is modified.
   */
  private onChangeInputValue = (value: string) => {
    this.setState(() => ({ inputValue: value }))
  }

  /**
   * Focuses a specific chatter.
   * @param chatter - The chatter to focus.
   */
  private focusChatter = (chatter: SerializedChatter) => {
    this.setState(() => ({ focusedChatter: chatter }))
  }

  /**
   * Unfocuses any focused chatter.
   */
  private unfocusChatter = () => {
    this.setState(() => ({ focusedChatter: null }))
  }

  /**
   * Copy a message to the clipboard if the feature is enabled.
   */
  private copyToClipboard = (message: string) => {
    copy(message)

    Toaster.show({ message: 'Copied!', intent: Intent.SUCCESS, icon: 'clipboard', timeout: 1000 })
  }

  /**
   * Determines if the current user can moderate a specific user.
   * @param  chatter - The user to moderate.
   * @retern `true` when the user can be moderated.
   */
  private canModerate = (chatter: SerializedChatter) => {
    const { channel, isMod, loginDetails } = this.props

    const chatterIsSelf = !_.isNil(loginDetails) && loginDetails.username === chatter.name
    const chatterIsBroadcaster = !_.isNil(channel) && chatter.name === channel

    return isMod && !chatterIsSelf && !chatterIsBroadcaster
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
        return emote.toLowerCase().startsWith(sanitizedWord)
      })
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
      const chatClient = this.chatClient.current.getWrappedInstance() as Client
      const twitchClient = chatClient.client

      if (twitchClient.readyState() !== ReadyState.Open) {
        return null
      }

      return twitchClient
    }

    return null
  }

  /**
   * Sends a message.
   */
  private sendMessage = async () => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      try {
        const message = this.state.inputValue

        if (Twitch.isWhisperCommand(message)) {
          const matches = WhisperRegExp.exec(message)

          if (!_.isNil(matches)) {
            const username = matches[1]
            const whisper = matches[2]

            const chatClient = this.chatClient.current.getWrappedInstance() as Client
            chatClient.nextWhisperRecipient = username

            await client.whisper(username, whisper)
          }
        } else {
          await client.say(channel, message)

          this.props.addToHistory(message)
        }

        this.setState(() => ({ inputValue: '' }))
      } catch (error) {
        //
      }
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
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
    chatters: getChatters(state),
    copyMessageOnDoubleClick: getCopyMessageOnDoubleClick(state),
    emotes: getEmotes(state),
    history: getHistory(state),
    historyIndex: getHistoryIndex(state),
    isMod: getIsMod(state),
    loginDetails: getLoginDetails(state),
    logs: getLogs(state),
    showChattersList: getShowChattersList(state),
    showContextMenu: getShowContextMenu(state),
    status: getStatus(state),
  }),
  { addToHistory, setChannel, toggleChattersList, updateHistoryIndex }
)(Channel)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  chatters: ReturnType<typeof getChatters>
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
  emotes: ReturnType<typeof getEmotes>
  history: AppState['history']
  historyIndex: AppState['historyIndex']
  isMod: ReturnType<typeof getIsMod>
  loginDetails: ReturnType<typeof getLoginDetails>
  logs: ReturnType<typeof getLogs>
  showChattersList: AppState['showChattersList']
  showContextMenu: ReturnType<typeof getShowContextMenu>
  status: AppState['status']
}

/**
 * React Props.
 */
type DispatchProps = {
  addToHistory: typeof addToHistory
  setChannel: typeof setChannel
  toggleChattersList: typeof toggleChattersList
  updateHistoryIndex: typeof updateHistoryIndex
}

/**
 * React Props.
 */
type OwnProps = {
  match: match<{
    channel: string
  }>
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & OwnProps
