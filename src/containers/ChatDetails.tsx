import { Button, ButtonGroup, Classes, Dialog, Icon, Intent, Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import ChatHistory from 'Components/ChatHistory'
import ExternalButton from 'Components/ExternalButton'
import FlexLayout from 'Components/FlexLayout'
import { SerializedChatter } from 'Libs/Chatter'
import Twitch, { ChannelDetails } from 'Libs/Twitch'
import { ApplicationState } from 'Store/reducers'
import { makeGetChatterMessages } from 'Store/selectors/chatters'
import { getLogsByIds } from 'Store/selectors/logs'
import { getLoginDetails } from 'Store/selectors/user'

/**
 * DetailsRow component.
 */
const DetailsRow = styled(FlexLayout)`
  align-items: center;
  margin-bottom: 15px;

  & > div {
    margin-right: 25px;

    & > svg {
      margin-right: 6px;
    }
  }
`

/**
 * Tools component.
 */
const Tools = styled.div`
  margin-bottom: 20px;

  & > a {
    margin-right: 10px;
  }

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
const initialState = { details: null as ChannelDetails | null, didFailToFetchDetails: false }
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
        let details: ChannelDetails

        if (chatter.id !== 'self') {
          details = await Twitch.fetchChannel(chatter.id)
        } else if (chatter.id === 'self' && !_.isNil(loginDetails)) {
          const user = await Twitch.fetchAuthenticatedUser(loginDetails.password)
          details = await Twitch.fetchChannel(user._id)
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

    const title = `${chatter.displayName}${chatter.showUsername ? ` (${chatter.userName})` : ''}`

    return (
      <Dialog isOpen={!_.isNil(chatter)} onClose={this.onClose} icon="user" title={title}>
        <div className={Classes.DIALOG_BODY}>
          {this.renderDetails()}
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
    const { canModerate, chatter } = this.props

    if (_.isNil(chatter) || !canModerate(chatter)) {
      return null
    }

    return (
      <Tools>
        <hr />
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
      </Tools>
    )
  }

  /**
   * Renders the chatter details.
   * @return Element to render.
   */
  private renderDetails() {
    const { details, didFailToFetchDetails } = this.state
    const { chatter } = this.props

    if (_.isNil(chatter) || didFailToFetchDetails) {
      return null
    }

    if (_.isNil(details)) {
      return (
        <DetailsRow>
          <Spinner small /> Fetching user details…
        </DetailsRow>
      )
    }

    return (
      <>
        <DetailsRow>
          <div>
            <Icon icon="calendar" /> {new Date(details.created_at).toLocaleDateString()}
          </div>
          <div>
            <Icon icon="eye-open" /> {details.views}
          </div>
          <div>
            <Icon icon="follower" /> {details.followers}
          </div>
        </DetailsRow>
        <Tools>
          <ExternalButton text="Open Channel" icon="document-open" href={details.url} />
          <ExternalButton
            text="Username History"
            icon="history"
            href={`https://twitch-tools.rootonline.de/username_changelogs_search.php?q=${chatter.userName}`}
          />
        </Tools>
      </>
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
      timeout(chatter.userName, duration)
    }

    unfocus()
  }

  /**
   * Triggered when the ban button is clicked.
   */
  private onClickBan = () => {
    const { ban, chatter, unfocus } = this.props

    if (!_.isNil(chatter)) {
      ban(chatter.userName)
    }

    unfocus()
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state, ownProps: OwnProps) => {
  const getChatterMessages = makeGetChatterMessages()

  return {
    loginDetails: getLoginDetails(state),
    messages: !_.isNil(ownProps.chatter) ? getLogsByIds(state, getChatterMessages(state, ownProps.chatter.id)) : null,
  }
})(ChatDetails)

/**
 * React Props.
 */
type StateProps = {
  loginDetails: ReturnType<typeof getLoginDetails>
  messages: ReturnType<typeof getLogsByIds> | null
}

/**
 * React Props.
 */
type OwnProps = {
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  chatter: SerializedChatter | null
  timeout: (username: string, duration: number) => void
  unfocus: () => void
}

/**
 * React Props.
 */
type Props = OwnProps & StateProps
