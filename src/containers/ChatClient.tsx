import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import tmi, { Client, UserState } from 'twitch-js'

import Event from 'Constants/event'
import MessageType from 'Constants/messageType'
import Chat from 'Libs/Chat'
import { AppState } from 'Store/ducks/app'
import { addMessage } from 'Store/ducks/messages'
import { addUserWithMessage } from 'Store/ducks/users'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'

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

    this.client = tmi.client({
      channels: [],
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

    // await this.client.connect()
    // await this.client.join(channel)

    this.subscribe()
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
    this.client.on(Event.Message, (_channel, userstate, message, self) => {
      const parsedMessage = this.parseRawMessage(message, userstate, self)

      if (!_.isNil(parsedMessage)) {
        const serializedMessage = parsedMessage.serialize()

        this.props.addMessage(serializedMessage)

        if (parsedMessage instanceof Chat) {
          this.props.addUserWithMessage(serializedMessage.user, serializedMessage.id)
        }
      }
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
    let parsedMessage: Chat | null

    switch (userstate['message-type']) {
      case MessageType.Chat: {
        parsedMessage = new Chat(message, userstate, self)
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
    channel: getChannel(state),
  }),
  { addMessage, addUserWithMessage }
)(ChatClient)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
}

/**
 * React Props.
 */
type DispatchProps = {
  addMessage: typeof addMessage
  addUserWithMessage: typeof addUserWithMessage
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
