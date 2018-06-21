import { Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { match } from 'react-router'

import Center from 'Components/Center'
import ChatInput from 'Components/ChatInput'
import ChatMessages from 'Components/ChatMessages'
import FlexLayout from 'Components/FlexLayout'
import ChatClient from 'Containers/ChatClient'
import { AppState, setChannel } from 'Store/ducks/app'
import { SettingsState } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'
import { getMessages } from 'Store/selectors/messages'
import { getTheme } from 'Store/selectors/settings'

/**
 * Channel Component.
 */
class Channel extends React.Component<Props> {
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
    const { channel, messages, theme } = this.props

    if (_.isNil(channel)) {
      return (
        <Center>
          <Spinner large />
        </Center>
      )
    }

    return (
      <FlexLayout vertical>
        <ChatClient />
        <ChatMessages messages={messages} />
        <ChatInput theme={theme} />
      </FlexLayout>
    )
  }
}

export default connect<StateProps, DispatchProps, OwnProps, ApplicationState>(
  (state) => ({
    channel: getChannel(state),
    messages: getMessages(state),
    theme: getTheme(state),
  }),
  { setChannel }
)(Channel)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  messages: ReturnType<typeof getMessages>
  theme: SettingsState['theme']
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
