import { Button, ButtonGroup, Classes, Dialog, Icon, Intent, Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import ChatHistory from 'Components/ChatHistory'
import FlexLayout from 'Components/FlexLayout'
import { SerializedChatter } from 'Libs/Chatter'
import Twitch, { AuthenticatedUserDetails, UserDetails } from 'Libs/Twitch'
import { AppState } from 'Store/ducks/app'
import { ApplicationState } from 'Store/reducers'
import { getChannel } from 'Store/selectors/app'
import { makeGetChatterMessages } from 'Store/selectors/chatters'
import { getLogsByIds } from 'Store/selectors/logs'
import { getIsMod, getLoginDetails } from 'Store/selectors/user'

/**
 * Details component.
 */
const Details = styled(FlexLayout)`
  align-items: center;

  & > svg,
  & > div:first-child {
    margin-right: 10px;
  }
`

/**
 * ModerationTools component.
 */
const ModerationTools = styled.div`
  margin-bottom: 20px;

  & > div {
    margin-bottom: 10px;

    & > button {
      margin-right: 10px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`

/**
 * React State.
 */
const initialState = { details: null as UserDetails | AuthenticatedUserDetails | null, didFailToFetchDetails: false }
type State = Readonly<typeof initialState>

/**
 * ChatDetails Component.
 */
class ChatDetails extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    const { chatter, loginDetails } = this.props

    if (!_.isNil(chatter) && prevProps.chatter !== chatter) {
      try {
        let details: UserDetails | AuthenticatedUserDetails

        if (chatter.id !== 'self') {
          details = await Twitch.fetchUser(chatter.id)
        } else if (chatter.id === 'self' && !_.isNil(loginDetails)) {
          details = await Twitch.fetchAuthenticatedUser(loginDetails.password)
        }

        this.setState(() => ({ details, didFailToFetchDetails: false }))
      } catch (error) {
        this.setState(() => ({ didFailToFetchDetails: true }))
      }
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { chatter } = this.props

    if (_.isNil(chatter)) {
      return null
    }

    return (
      <Dialog isOpen={!_.isNil(chatter)} onClose={this.onClose} icon="user" title={chatter.displayName}>
        <div className={Classes.DIALOG_BODY}>
          {this.renderDetails()}
          <hr />
          {this.renderModerationTools()}
          {this.renderHistory()}
        </div>
      </Dialog>
    )
  }

  /**
   * Triggered when the dialog should be closed.
   */
  private onClose = () => {
    this.setState(() => initialState)

    this.props.unfocus()
  }

  /**
   * Renders the moderation tools.
   * @return Element to render.
   */
  private renderModerationTools() {
    if (!this.showModerationTools()) {
      return null
    }

    return (
      <ModerationTools>
        <div>
          <Button icon="trash" onClick={this.onClickPurge}>
            Purge
          </Button>
          <Button icon="disable" intent={Intent.DANGER} onClick={this.onClickBan}>
            Ban
          </Button>
        </div>
        <div>
          <ButtonGroup>
            <Button icon="time" onClick={this.onClickTimeout10M}>
              10m
            </Button>
            <Button icon="time" onClick={this.onClickTimeout1H}>
              1h
            </Button>
            <Button icon="time" onClick={this.onClickTimeout6H}>
              6h
            </Button>
            <Button icon="time" onClick={this.onClickTimeout24H}>
              24h
            </Button>
          </ButtonGroup>
        </div>
      </ModerationTools>
    )
  }

  /**
   * Renders the chatter details.
   * @return Element to render.
   */
  private renderDetails() {
    const { details, didFailToFetchDetails } = this.state

    if (didFailToFetchDetails) {
      return null
    }

    if (_.isNil(details)) {
      return (
        <Details>
          <Spinner small /> Fetching user details…
        </Details>
      )
    }

    return (
      <Details>
        <Icon icon="calendar" /> {new Date(details.created_at).toLocaleDateString()}
      </Details>
    )
  }

  /**
   * Renders the chatter messages history if possible.
   * @return Element to render.
   */
  private renderHistory() {
    const { messages } = this.props

    if (_.isNil(messages) || messages.length === 0) {
      return null
    }

    return <ChatHistory messages={messages} />
  }

  /**
   * Defines if moderation tools should be visible or not.
   * @return `true` when to show moderation tools.
   */
  private showModerationTools() {
    const { channel, chatter, isMod, loginDetails } = this.props

    const chatterIsSelf = !_.isNil(loginDetails) && !_.isNil(chatter) && loginDetails.username === chatter.name
    const chatterIsBroadcaster = !_.isNil(chatter) && !_.isNil(channel) && chatter.name === channel

    return isMod && !chatterIsSelf && !chatterIsBroadcaster
  }

  /**
   * Triggered when purge button is clicked.
   */
  private onClickPurge = () => {
    this.timeout(1)
  }

  /**
   * Triggered when 10 minutes timeout button is clicked.
   */
  private onClickTimeout10M = () => {
    this.timeout(600)
  }

  /**
   * Triggered when 1 hour timeout button is clicked.
   */
  private onClickTimeout1H = () => {
    this.timeout(3600)
  }

  /**
   * Triggered when 6 hours timeout button is clicked.
   */
  private onClickTimeout6H = () => {
    this.timeout(21600)
  }

  /**
   * Triggered when 24 hours timeout button is clicked.
   */
  private onClickTimeout24H = () => {
    this.timeout(86400)
  }

  /**
   * Timeouts a user.
   * @param duration - The duration of the timeout in seconds.
   */
  private timeout(duration: number) {
    const { chatter, timeout, unfocus } = this.props

    if (!_.isNil(chatter)) {
      timeout(chatter.name, duration)
    }

    unfocus()
  }

  /**
   * Triggered when ban button is clicked.
   */
  private onClickBan = () => {
    const { ban, chatter, unfocus } = this.props

    if (!_.isNil(chatter)) {
      ban(chatter.name)
    }

    unfocus()
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state, ownProps: OwnProps) => {
  const getChatterMessages = makeGetChatterMessages()

  return {
    channel: getChannel(state),
    isMod: getIsMod(state),
    loginDetails: getLoginDetails(state),
    messages: !_.isNil(ownProps.chatter) ? getLogsByIds(state, getChatterMessages(state, ownProps.chatter.id)) : null,
  }
})(ChatDetails)

/**
 * React Props.
 */
type StateProps = {
  channel: AppState['channel']
  isMod: ReturnType<typeof getIsMod>
  loginDetails: ReturnType<typeof getLoginDetails>
  messages: ReturnType<typeof getLogsByIds> | null
}

/**
 * React Props.
 */
type OwnProps = {
  ban: (username: string) => void
  chatter: SerializedChatter | null
  timeout: (username: string, duration: number) => void
  unfocus: () => void
}

/**
 * React Props.
 */
type Props = OwnProps & StateProps
