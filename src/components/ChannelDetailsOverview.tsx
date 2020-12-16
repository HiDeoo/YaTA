import { ButtonGroup, Classes, Colors, Icon, IconName, Intent, IPanel, IPanelProps, Text } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import TimeAgo from 'react-timeago'

import { ChannelDetailsProps } from 'components/ChannelDetails'
import ChannelDetailsButton from 'components/ChannelDetailsButton'
import ChannelDetailsPanel from 'components/ChannelDetailsPanel'
import ChannelDetailsVideos from 'components/ChannelDetailsVideos'
import ExternalLink from 'components/ExternalLink'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import Twitch, { RawRelationship, RawStream } from 'libs/Twitch'
import { ApplicationState } from 'store/reducers'
import { getChannel } from 'store/selectors/app'
import { getChatLoginDetails } from 'store/selectors/user'
import styled, { theme } from 'styled'

/**
 * Detail component.
 */
const Detail = styled(Text).attrs({
  ellipsize: true,
})`
  margin: 4px 0;

  &:first-of-type {
    margin-top: 0;
  }
`

/**
 * Title component.
 */
const Title = styled(Detail)`
  color: ${Colors.BLUE5};
  font-size: 0.96rem;
  font-weight: bold;
`

/**
 * Game component.
 */
const Game = styled(Detail)`
  font-size: 0.88rem;
`

/**
 * Meta component.
 */
const Meta = styled(Detail)`
  color: ${theme('follow.meta')};
  font-size: 0.82rem;
`

/**
 * PreviewWrapper component.
 */
const PreviewWrapper = styled.div`
  cursor: pointer;
  margin-top: 10px;
  position: relative;
`

/**
 * PlayIcon component.
 */
const PlayIcon = styled(Icon)`
  filter: drop-shadow(1px 1px 0 ${Colors.DARK_GRAY5});
  height: 100px;
  left: calc(50% - 50px);
  pointer-events: none;
  position: absolute;
  top: calc(50% - 50px);
  width: 100px;

  & > svg {
    height: 100px;
    width: 100px;
  }
`

/**
 * Preview component.
 */
const Preview = styled.img`
  border: 1px solid ${Colors.DARK_GRAY3};
  display: block;
  max-width: 100%;
`

/**
 * PanelButtons component.
 */
const PanelButtons = styled.div`
  border-top: 1px solid ${theme('channel.border')};
  padding: 0;

  & .${Classes.BUTTON_GROUP}.${Classes.MINIMAL}.${Classes.FILL} {
    background-color: ${theme('channel.background')};
  }
`

/**
 * The various panel types.
 */
export enum ChannelDetailsType {
  LastVods = 'Last Vods',
  RecentClips = 'Recent Clips',
  TopClips = 'Top Clips',
}

/**
 * A map between panel types & their associated components.
 */
const ChannelDetailsPanels = {
  [ChannelDetailsType.LastVods]: { component: ChannelDetailsVideos, icon: 'video' },
  [ChannelDetailsType.RecentClips]: { component: ChannelDetailsVideos, icon: 'film' },
  [ChannelDetailsType.TopClips]: { component: ChannelDetailsVideos, icon: 'crown' },
} as Record<ChannelDetailsType, ChannelDetailsPanelConfiguration>

/**
 * React State.
 */
const initialState = {
  didFail: false,
  isFollowingOrUnfollowing: false,
  relationship: undefined as Optional<RawRelationship> | null,
  stream: undefined as Optional<RawStream> | null,
}
type State = Readonly<typeof initialState>

/**
 * ChannelDetailsOverview Component.
 */
export class ChannelDetailsOverview extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { id } = this.props

    try {
      const response = await Promise.all([Twitch.fetchStream(id), Twitch.fetchRelationship(id)])

      const [streamResponse, relationship] = response
      const stream = streamResponse?.stream

      this.setState(() => ({ didFail: false, stream, relationship }))
    } catch {
      this.setState(() => ({ didFail: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, isFollowingOrUnfollowing, relationship, stream } = this.state
    const { channel, loginDetails } = this.props

    if (didFail) {
      return <NonIdealState small retry />
    }

    if (_.isUndefined(stream)) {
      return <Spinner />
    }

    const followed = !_.isNil(relationship)
    const followedTooltip = `${followed ? 'Unfollow' : 'Follow'} ${this.props.name}`
    const hideFollowButton = !_.isNil(loginDetails) && !_.isNil(channel) && loginDetails.username === channel

    return (
      <>
        <ChannelDetailsPanel>{this.renderStream()}</ChannelDetailsPanel>
        <PanelButtons>
          <ButtonGroup fill minimal large>
            {!hideFollowButton && (
              <ChannelDetailsButton
                buttonProps={{
                  disabled: isFollowingOrUnfollowing,
                  icon: followed ? 'follower' : 'following',
                  intent: followed ? Intent.DANGER : Intent.PRIMARY,
                  loading: isFollowingOrUnfollowing,
                }}
                onClick={this.onClickFollowUnfollow}
                tooltip={followedTooltip}
              />
            )}
            {_.map(ChannelDetailsType, (type) => (
              <ChannelDetailsButton
                panel={ChannelDetailsPanels[type]}
                onClickPanel={this.showPanel}
                type={type}
                key={type}
              />
            ))}
          </ButtonGroup>
        </PanelButtons>
      </>
    )
  }

  /**
   * Renders the stream details.
   * @return Element to render.
   */
  private renderStream() {
    const { relationship, stream } = this.state

    if (_.isNil(stream)) {
      return <NonIdealState small title="Currently offline!" />
    }

    return (
      <>
        <Title>
          <ExternalLink href={stream.channel.url}>{stream.channel.status}</ExternalLink>
        </Title>
        <Game>{stream.channel.game}</Game>
        <Meta>{stream.viewers.toLocaleString()} viewers</Meta>
        <Meta>
          Started <TimeAgo date={new Date(stream.created_at)} />.
        </Meta>
        <Meta>
          {_.isNil(relationship)
            ? 'Channel not followed.'
            : `Followed since ${new Date(relationship.followed_at).toLocaleDateString()}.`}
        </Meta>
        <PreviewWrapper>
          <Preview className={Classes.POPOVER_DISMISS} src={stream.preview.medium} onClick={this.onClickPreview} />
          <PlayIcon icon="play" />
        </PreviewWrapper>
      </>
    )
  }

  /**
   * Shows a specific panel.
   * @param type - The panel type.
   */
  private showPanel = (type: ChannelDetailsType) => {
    const { id, name } = this.props

    const panel: IPanel<any> = {
      component: ChannelDetailsPanels[type].component,
      props: { id, name, type },
      title: type,
    }

    this.props.openPanel(panel)
  }

  /**
   * Triggered when the follow or unfollow button is clicked.
   */
  private onClickFollowUnfollow = async () => {
    const { id } = this.props

    try {
      this.setState(() => ({ isFollowingOrUnfollowing: true }))

      let relationship: RawRelationship | null

      if (!_.isNil(this.state.relationship)) {
        await Twitch.unfollowChannel(id)
        relationship = null
      } else {
        await Twitch.followChannel(id)
        relationship = { from_id: '', to_id: id, followed_at: new Date().toString() }
      }

      this.setState(() => ({ isFollowingOrUnfollowing: false, relationship }))
    } catch {
      this.setState(() => ({ isFollowingOrUnfollowing: false }))
    }
  }

  /**
   * Triggered when a preview is clicked.
   */
  private onClickPreview = () => {
    Twitch.openVideoPlayer(this.props.name)
  }
}

export default connect<StateProps, {}, {}, ApplicationState>((state) => ({
  channel: getChannel(state),
  loginDetails: getChatLoginDetails(state),
}))(ChannelDetailsOverview)

/**
 * React Props.
 */
interface StateProps {
  channel: ReturnType<typeof getChannel>
  loginDetails: ReturnType<typeof getChatLoginDetails>
}

/**
 * React Props.
 */
type Props = StateProps & IPanelProps & ChannelDetailsProps

/**
 * Channel details panel configuration.
 */
export type ChannelDetailsPanelConfiguration = { component: React.ComponentType<any>; icon: IconName }
