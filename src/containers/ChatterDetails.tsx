import {
  Button,
  ButtonGroup,
  Classes,
  Dialog,
  Icon,
  Intent,
  Popover,
  Position,
  Spinner,
  Tooltip,
} from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import ExternalButton from 'Components/ExternalButton'
import FlexLayout from 'Components/FlexLayout'
import History from 'Components/History'
import ActionMenuItems from 'Containers/ActionMenuItems'
import { ActionHandler, SerializedAction } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import Twitch, { RawChannel } from 'Libs/Twitch'
import { ApplicationState } from 'Store/reducers'
import { makeGetChatterMessages } from 'Store/selectors/chatters'
import { getLogsByIds } from 'Store/selectors/logs'

/**
 * DetailsRow component.
 */
const DetailsRow = styled(FlexLayout)`
  align-items: right;
  margin-bottom: 15px;
`

/**
 * DetailTooltip component.
 */
const DetailTooltip = styled(Tooltip).attrs({
  position: Position.BOTTOM,
})`
  margin-right: 25px;

  & svg {
    margin-right: 6px;
  }
`

/**
 * Tools component.
 */
const Tools = styled.div`
  margin-bottom: 10px;

  & > a,
  & > button {
    margin-right: 10px;
  }

  & > div {
    margin-bottom: 10px;

    & > button {
      margin-right: 10px;
    }
  }
`

/**
 * React State.
 */
const initialState = { details: null as RawChannel | null, error: undefined as Error | undefined }
type State = Readonly<typeof initialState>

/**
 * ChatterDetails Component.
 */
class ChatterDetails extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    const { chatter } = this.props

    if (!_.isNil(chatter) && prevProps.chatter !== chatter) {
      try {
        let details: RawChannel

        if (!chatter.isSelf) {
          details = await Twitch.fetchChannel(chatter.id)
        } else if (chatter.isSelf) {
          const user = await Twitch.fetchAuthenticatedUser()
          details = await Twitch.fetchChannel(user._id)
        }

        this.setState(() => ({ details, error: undefined }))
      } catch (error) {
        this.setState(() => ({ error }))
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
      <>
        <hr />
        <Tools>
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
      </>
    )
  }

  /**
   * Renders the chatter details.
   * @return Element to render.
   */
  private renderDetails() {
    const { details, error } = this.state
    const { chatter } = this.props

    if (_.isNil(chatter)) {
      return null
    } else if (!_.isNil(error)) {
      throw error
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
          <DetailTooltip content="Creation date">
            <>
              <Icon icon="calendar" /> {new Date(details.created_at).toLocaleDateString()}
            </>
          </DetailTooltip>
          <DetailTooltip content="Views">
            <>
              <Icon icon="eye-open" /> {details.views}
            </>
          </DetailTooltip>
          <DetailTooltip content="Followers">
            <>
              <Icon icon="follower" /> {details.followers}
            </>
          </DetailTooltip>
        </DetailsRow>
        {!chatter.isSelf && (
          <Tools>
            <Button icon="envelope" onClick={this.onClickWhisper}>
              Whisper
            </Button>
            <Button disabled={chatter.ignored} icon="blocked-person" intent={Intent.DANGER} onClick={this.onClickBlock}>
              Block
            </Button>
          </Tools>
        )}
        <Tools>
          <ExternalButton text="Open Channel" icon="document-open" href={details.url} />
          <ExternalButton
            text="Username History"
            icon="history"
            href={`https://twitch-tools.rootonline.de/username_changelogs_search.php?q=${chatter.userName}`}
          />
          <Popover content={<ActionMenuItems actionHandler={this.actionHandler} wrap />} usePortal={false}>
            <Button icon="caret-down" />
          </Popover>
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

    return <History messages={messages} />
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

  /**
   * Triggered when the block button is clicked.
   */
  private onClickBlock = () => {
    const { block, chatter, unfocus } = this.props

    if (!_.isNil(chatter)) {
      block(chatter.id)
    }

    unfocus()
  }

  /**
   * Triggered when the whisper button is clicked.
   */
  private onClickWhisper = () => {
    const { chatter, unfocus, whisper } = this.props

    if (!_.isNil(chatter)) {
      whisper(chatter.userName)
    }

    unfocus()
  }

  /**
   * Handle an action triggered from the details screen.
   * @param action - The action to execute.
   */
  private actionHandler = (action: SerializedAction) => {
    const { actionHandler, unfocus } = this.props

    actionHandler(action, undefined)

    unfocus()
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state, ownProps: OwnProps) => {
  const getChatterMessages = makeGetChatterMessages()

  return {
    messages: !_.isNil(ownProps.chatter) ? getLogsByIds(state, getChatterMessages(state, ownProps.chatter.id)) : null,
  }
})(ChatterDetails)

/**
 * React Props.
 */
type StateProps = {
  messages: ReturnType<typeof getLogsByIds> | null
}

/**
 * React Props.
 */
type OwnProps = {
  actionHandler: ActionHandler
  ban: (username: string) => void
  block: (targetId: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  chatter: SerializedChatter | null
  timeout: (username: string, duration: number) => void
  unfocus: () => void
  whisper: (username: string) => void
}

/**
 * React Props.
 */
type Props = OwnProps & StateProps
