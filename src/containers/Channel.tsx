import { Intent, Spinner } from '@blueprintjs/core'
import * as copy from 'copy-to-clipboard'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { match } from 'react-router'

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
import { AppState, setChannel, toggleChattersList } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getShowChattersList, getStatus } from 'Store/selectors/app'
import { getChatters } from 'Store/selectors/chatters'
import { getLogs } from 'Store/selectors/logs'
import { getCopyMessageOnDoubleClick, getShowContextMenu } from 'Store/selectors/settings'
import { getIsMod, getLoginDetails } from 'Store/selectors/user'

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
      <FlexLayout vertical>
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
   * @return The list of completions.
   */
  private getCompletions = (word: string) => {
    const sanitizedWord = word.toLowerCase()

    return _.filter(this.props.chatters, (chatter) => {
      return chatter.displayName.toLowerCase().startsWith(sanitizedWord)
    }).map((chatter) => chatter.displayName)
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
        await client.say(channel, this.state.inputValue)

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
    isMod: getIsMod(state),
    loginDetails: getLoginDetails(state),
    logs: getLogs(state),
    showChattersList: getShowChattersList(state),
    showContextMenu: getShowContextMenu(state),
    status: getStatus(state),
  }),
  { setChannel, toggleChattersList }
)(Channel)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  chatters: ReturnType<typeof getChatters>
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
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
  setChannel: typeof setChannel
  toggleChattersList: typeof toggleChattersList
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
