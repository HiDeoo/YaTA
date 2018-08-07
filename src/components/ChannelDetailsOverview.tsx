import { ButtonGroup, Classes, Colors, IconName, IPanel, IPanelProps, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import TimeAgo from 'react-timeago'
import styled from 'styled-components'

import { ChannelDetailsProps } from 'Components/ChannelDetails'
import ChannelDetailsDescription from 'Components/ChannelDetailsDescription'
import ChannelDetailsPanel from 'Components/ChannelDetailsPanel'
import ChannelDetailsPanelButton from 'Components/ChannelDetailsPanelButton'
import ChannelDetailsVideos from 'Components/ChannelDetailsVideos'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { RawStream } from 'Libs/Twitch'
import { color } from 'Utils/styled'

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
  color: ${color('follow.meta')};
  font-size: 0.82rem;
`

/**
 * Preview component.
 */
const Preview = styled.img`
  border: 1px solid ${Colors.DARK_GRAY3};
  display: block;
  margin-top: 10px;
  max-width: 100%;
`

/**
 * PanelButtons component.
 */
const PanelButtons = styled.div`
  border-top: 1px solid ${color('channel.border')};
  padding: 0;

  & .${Classes.BUTTON_GROUP}.${Classes.MINIMAL}.${Classes.FILL} {
    background-color: ${color('channel.background')};
  }
`

/**
 * The various panel types.
 */
export enum ChannelDetailsType {
  Description = 'Description',
  LastVods = 'Last Vods',
  RecentClips = 'Recent Clips',
  TopClips = 'Top Clips',
}

/**
 * A map between panel types & their associated components.
 */
const ChannelDetailsPanels = {
  [ChannelDetailsType.Description]: { component: ChannelDetailsDescription, icon: 'info-sign' },
  [ChannelDetailsType.LastVods]: { component: ChannelDetailsVideos, icon: 'video' },
  [ChannelDetailsType.RecentClips]: { component: ChannelDetailsVideos, icon: 'film' },
  [ChannelDetailsType.TopClips]: { component: ChannelDetailsVideos, icon: 'crown' },
} as { [key in ChannelDetailsType]: ChannelDetailsPanel }

/**
 * React State.
 */
const initialState = { didFail: false, stream: undefined as RawStream | null | undefined }
type State = Readonly<typeof initialState>

/**
 * ChannelDetailsOverview Component.
 */
export default class ChannelDetailsOverview extends React.Component<IPanelProps & ChannelDetailsProps, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { id } = this.props

    if (!_.isNil(id)) {
      try {
        const { stream } = await Twitch.fetchStream(id)

        this.setState(() => ({ didFail: false, stream }))
      } catch (error) {
        this.setState(() => ({ didFail: true }))
      }
    } else {
      this.setState(() => ({ didFail: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, stream } = this.state

    if (didFail) {
      return <NonIdealState small title="Something went wrong!" details="Please try again in a few minutes." />
    }

    if (_.isUndefined(stream)) {
      return <Spinner />
    }

    return (
      <>
        <ChannelDetailsPanel>{this.renderStream()}</ChannelDetailsPanel>
        <PanelButtons>
          <ButtonGroup fill minimal large>
            {_.map(ChannelDetailsType, (type) => (
              <ChannelDetailsPanelButton
                panel={ChannelDetailsPanels[type]}
                onClick={this.showPanel}
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
    const { stream } = this.state

    if (_.isNil(stream)) {
      return <NonIdealState small title="Currently offline!" />
    }

    return (
      <>
        <Title>
          <a href={stream.channel.url} target="_blank">
            {stream.channel.status}
          </a>
        </Title>
        <Game>{stream.channel.game}</Game>
        <Meta>{stream.viewers} viewers</Meta>
        <Meta>
          Started <TimeAgo date={new Date(stream.created_at)} />
        </Meta>
        <Preview src={stream.preview.medium} />
      </>
    )
  }

  /**
   * Shows a specific panel.
   * @param type - The panel type.
   */
  private showPanel = (type: ChannelDetailsType) => {
    const { channel, id } = this.props

    const panel: IPanel<any> = {
      component: ChannelDetailsPanels[type].component,
      props: { channel, id, type },
      title: type,
    }

    this.props.openPanel(panel)
  }
}

/**
 * Channel details panel.
 */
export type ChannelDetailsPanel = { component: React.ComponentType<any>; icon: IconName }
