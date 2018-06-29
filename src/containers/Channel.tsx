import { Intent, Spinner } from '@blueprintjs/core'
import * as copy from 'copy-to-clipboard'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { match } from 'react-router'

import Center from 'Components/Center'
import ChatInput from 'Components/ChatInput'
import ChatLogs from 'Components/ChatLogs'
import FlexLayout from 'Components/FlexLayout'
import ReadyState from 'Constants/readyState'
import Status from 'Constants/status'
import ChatClient, { Client } from 'Containers/ChatClient'
import ChatDetails from 'Containers/ChatDetails'
import { SerializedChatter } from 'Libs/Chatter'
import Toaster from 'Libs/Toaster'
import { AppState, setChannel } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getStatus } from 'Store/selectors/app'
import { getLogs } from 'Store/selectors/logs'
import { getCopyMessageOnDoubleClick } from 'Store/selectors/settings'

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
    const { channel, logs } = this.props
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
        <ChatClient ref={this.chatClient} />
        <ChatLogs logs={logs} focusChatter={this.focusChatter} copyMessage={this.copyMessage} />
        <ChatInput
          disabled={this.props.status !== Status.Connected}
          value={this.state.inputValue}
          onChange={this.onChangeInputValue}
          onSubmit={this.sendMessage}
        />
        <ChatDetails chatter={focusedChatter} unfocus={this.unfocusChatter} timeout={this.timeout} ban={this.ban} />
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
  private copyMessage = (message: string) => {
    const { copyMessageOnDoubleClick } = this.props

    if (!copyMessageOnDoubleClick) {
      return
    }

    copy(message)

    Toaster.show({ message: 'Copied!', intent: Intent.SUCCESS, icon: 'clipboard', timeout: 1000 })
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
    copyMessageOnDoubleClick: getCopyMessageOnDoubleClick(state),
    logs: getLogs(state),
    status: getStatus(state),
  }),
  { setChannel }
)(Channel)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  copyMessageOnDoubleClick: ReturnType<typeof getCopyMessageOnDoubleClick>
  logs: ReturnType<typeof getLogs>
  status: AppState['status']
}

/**
 * React Props.
 */
type DispatchProps = {
  setChannel: typeof setChannel
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
