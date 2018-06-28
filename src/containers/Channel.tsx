import { Spinner } from '@blueprintjs/core'
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
import { AppState, setChannel } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getChannel, getStatus } from 'Store/selectors/app'
import { getLogs } from 'Store/selectors/logs'

/**
 * React State.
 */
const initialState = { inputValue: '' }
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
        <ChatLogs logs={logs} />
        <ChatInput
          disabled={this.props.status !== Status.Connected}
          value={this.state.inputValue}
          onChange={this.onChangeInputValue}
          onSubmit={this.sendMessage}
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
   * Send a message.
   */
  private sendMessage = () => {
    const { channel } = this.props
    const client = this.getTwitchClient()

    if (!_.isNil(client) && !_.isNil(channel)) {
      client.say(channel, this.state.inputValue)

      this.setState(() => ({ inputValue: '' }))
    }
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
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
