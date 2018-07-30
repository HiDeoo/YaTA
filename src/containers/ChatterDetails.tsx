import { Button, ButtonGroup, Classes, Colors, Dialog, Icon, Intent, Menu, Popover, Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import BanReason from 'Components/BanReason'
import ExternalButton from 'Components/ExternalButton'
import FlexLayout from 'Components/FlexLayout'
import History from 'Components/History'
import ActionMenuItems from 'Containers/ActionMenuItems'
import { ActionHandler, SerializedAction } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import Twitch, { RawChannel } from 'Libs/Twitch'
import { ApplicationState } from 'Store/reducers'
import { makeGetChatterMessages } from 'Store/selectors/chatters'
import { getLogsByIds } from 'Store/selectors/logs'
import { getDisableDialogAnimations } from 'Store/selectors/settings'
import { color, ifProp, size } from 'Utils/styled'

/**
 * DetailsRow component.
 */
const DetailsRow = styled(FlexLayout)<DetailsRowProps>`
  align-items: center;
  height: ${ifProp('loading', '127px', 'auto')};
  margin-bottom: 18px;

  .${Classes.SPINNER}.${Classes.SMALL} {
    margin-right: 15px;
  }
`

/**
 * DetailsCell component.
 */
const DetailsCell = styled.div`
  border-right: 1px solid ${color('chatter.details.border')};
  color: ${color('chatter.details.color')};
  font-size: 0.82rem;
  padding: 0 20px 0 12px;

  &:first-of-type {
    padding-left: 0;
  }

  &:last-of-type {
    border-right: 0;
  }

  & > strong {
    color: ${color('chatter.details.strong')};
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
    padding-bottom: 3px;
  }
`

/**
 * Header component.
 */
const Header = styled(FlexLayout)`
  align-items: center;
`

/**
 * Avatar component.
 */
const Avatar = styled.div`
  align-items: center;
  background-color: ${Colors.GRAY5};
  border-radius: 50%;
  display: flex;
  height: ${size('chatter.avatar.size')};
  justify-content: center;
  margin: ${size('chatter.avatar.margin')};
  width: ${size('chatter.avatar.size')};

  & > img {
    border-radius: 50%;
    display: block;
    height: ${size('chatter.avatar.size')};
    width: ${size('chatter.avatar.size')};
  }

  & > svg.${Classes.ICON}, .${Classes.DARK} & > svg.${Classes.ICON} {
    color: ${Colors.DARK_GRAY5};
    display: block;
    height: calc(${size('chatter.avatar.size')} - 15px);
    margin: 0;
    width: calc(${size('chatter.avatar.size')} - 15px);
  }
`

/**
 * Badges component.
 */
const Badges = styled.span`
  margin-left: 9px;

  .badge {
    border-radius: 50%;
    display: inline-block;
    margin-top: -1px;
    min-width: 18px;
    margin-right: 6px;
    vertical-align: middle;

    &:last-of-type {
      margin-right: 6px;
    }
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

    & > button,
    & > div.${Classes.BUTTON_GROUP} {
      margin-right: 10px;
    }
  }
`

/**
 * ButtonRow component.
 */
const ButtonRow = styled.div`
  display: flex;
`

/**
 * Hr component.
 */
const Hr = styled.div`
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.15);
  box-sizing: content-box;
  height: 0;
  margin: 20px 0;
  overflow: visible;
`

/**
 * React State.
 */
const initialState = {
  details: null as RawChannel | null,
  error: undefined as Error | undefined,
  showBanReasonAlert: false,
}
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

        if (chatter.isSelf) {
          const user = await Twitch.fetchAuthenticatedUser()
          details = await Twitch.fetchChannel(user._id)
        } else {
          details = await Twitch.fetchChannel(chatter.id)
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
    const { chatter, disableDialogAnimations, messages } = this.props
    const { details, showBanReasonAlert } = this.state

    if (_.isNil(chatter)) {
      return null
    }

    const lastMessage = _.last(messages)
    const badges = !_.isNil(lastMessage) ? lastMessage.badges : null

    const header = (
      <Header>
        <Avatar>{_.isNil(details) ? <Icon icon="person" /> : <img src={details.logo} />}</Avatar>
        {`${chatter.displayName}${chatter.showUserName ? ` (${chatter.userName})` : ''}`}
        {!_.isNil(badges) && <Badges dangerouslySetInnerHTML={{ __html: badges }} />}
      </Header>
    )

    return (
      <Dialog
        isOpen={!_.isNil(chatter)}
        onClose={this.onClose}
        title={header}
        transitionName={disableDialogAnimations ? '' : undefined}
      >
        <BanReason
          onConfirmBanReason={this.onConfirmBanReason}
          toggle={this.toggleBanReasonAlert}
          visible={showBanReasonAlert}
        />
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
   * Toggles the ban reason alert.
   */
  private toggleBanReasonAlert = () => {
    this.setState(({ showBanReasonAlert }) => ({ showBanReasonAlert: !showBanReasonAlert }))
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

    const banMenu = (
      <Menu>
        <Menu.Item text="Ban with reason" icon="disable" onClick={this.toggleBanReasonAlert} />
      </Menu>
    )

    return (
      <>
        <Hr />
        <Tools>
          <ButtonRow>
            <Button icon="trash" onClick={this.onClickPurge} text="Purge" />
            <ButtonGroup>
              <Button icon="disable" intent={Intent.DANGER} onClick={this.onClickBan} text="Ban" />
              <Popover content={banMenu} usePortal={false}>
                <Button icon="caret-down" intent={Intent.DANGER} />
              </Popover>
            </ButtonGroup>
            {chatter.banned && <Button icon="unlock" intent={Intent.DANGER} onClick={this.onClickUnban} text="Unban" />}
          </ButtonRow>
          <ButtonRow>
            <ButtonGroup>
              <Button icon="time" onClick={this.onClickTimeout10M} text="10m" />
              <Button icon="time" onClick={this.onClickTimeout1H} text="1h" />
              <Button icon="time" onClick={this.onClickTimeout6H} text="6h" />
              <Button icon="time" onClick={this.onClickTimeout24H} text="24h" />
            </ButtonGroup>
          </ButtonRow>
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
        <DetailsRow loading>
          <Spinner className={Classes.SMALL} intent={Intent.PRIMARY} /> Fetching user details…
        </DetailsRow>
      )
    }

    return (
      <>
        <DetailsRow>
          <DetailsCell>
            <strong>{new Date(details.created_at).toLocaleDateString()}</strong> Creation date
          </DetailsCell>
          <DetailsCell>
            <strong>{details.views}</strong> Views
          </DetailsCell>
          <DetailsCell>
            <strong>{details.followers}</strong> Followers
          </DetailsCell>
        </DetailsRow>
        {!chatter.isSelf && (
          <Tools>
            <Button icon="envelope" onClick={this.onClickWhisper} text="Whisper" />
            <Button
              icon="blocked-person"
              intent={Intent.DANGER}
              onClick={this.onClickBlockUnblock}
              text={chatter.blocked ? 'Unblock' : 'Block'}
            />
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
    const { copyMessageOnDoubleClick, copyMessageToClipboard, messages } = this.props

    if (_.isNil(messages) || messages.length === 0) {
      return null
    }

    return (
      <History
        messages={messages}
        copyMessageOnDoubleClick={copyMessageOnDoubleClick}
        copyMessageToClipboard={copyMessageToClipboard}
      />
    )
  }

  /**
   * Triggered when the ban with reason is clicked.
   * @param reason - The ban reason.
   */
  private onConfirmBanReason = (reason: string) => {
    this.toggleBanReasonAlert()

    const { ban, chatter, unfocus } = this.props

    if (!_.isNil(chatter)) {
      ban(chatter.userName, reason)
    }

    unfocus()
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
   * Triggered when the unban button is clicked.
   */
  private onClickUnban = () => {
    const { chatter, unban, unfocus } = this.props

    if (!_.isNil(chatter)) {
      unban(chatter.userName)
    }

    unfocus()
  }

  /**
   * Triggered when the block or unblock button is clicked.
   */
  private onClickBlockUnblock = () => {
    const { block, chatter, unblock, unfocus } = this.props

    if (!_.isNil(chatter)) {
      if (chatter.blocked) {
        unblock(chatter.id)
      } else {
        block(chatter.id)
      }
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
    disableDialogAnimations: getDisableDialogAnimations(state),
    messages: !_.isNil(ownProps.chatter) ? getLogsByIds(state, getChatterMessages(state, ownProps.chatter.id)) : null,
  }
})(ChatterDetails)

/**
 * React Props.
 */
type StateProps = {
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
  messages: ReturnType<typeof getLogsByIds> | null
}

/**
 * React Props.
 */
type OwnProps = {
  actionHandler: ActionHandler
  ban: (username: string, reason?: string) => void
  block: (targetId: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  chatter: SerializedChatter | null
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  timeout: (username: string, duration: number) => void
  unban: (username: string) => void
  unblock: (targetId: string) => void
  unfocus: () => void
  whisper: (username: string) => void
}

/**
 * React Props.
 */
type Props = OwnProps & StateProps

/**
 * React Props.
 */
type DetailsRowProps = {
  loading?: boolean
}
