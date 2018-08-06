import { Button, Classes, Colors, Intent, IPanel, IPanelProps, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import TimeAgo from 'react-timeago'
import styled from 'styled-components'

import { ChannelDetailsProps } from 'Components/ChannelDetails'
import ChannelDetailsDescription from 'Components/ChannelDetailsDescription'
import ChannelDetailsPanel from 'Components/ChannelDetailsPanel'
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
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr;
  padding: 0 10px 10px 10px;
`

/**
 * PanelButton component.
 */
const PanelButton = styled(Button).attrs({
  intent: Intent.PRIMARY,
})`
  &.${Classes.BUTTON} {
    justify-content: left;
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
  [ChannelDetailsType.Description]: ChannelDetailsDescription,
  [ChannelDetailsType.LastVods]: ChannelDetailsVideos,
  [ChannelDetailsType.RecentClips]: ChannelDetailsVideos,
  [ChannelDetailsType.TopClips]: ChannelDetailsVideos,
}

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
          <PanelButton icon="align-left" onClick={this.onClickDescription} text={ChannelDetailsType.Description} />
          <PanelButton icon="video" onClick={this.onClickLastVods} text={ChannelDetailsType.LastVods} />
          <PanelButton icon="film" onClick={this.onClickTopClips} text={ChannelDetailsType.TopClips} />
          <PanelButton icon="film" onClick={this.onClickRecentTopClips} text={ChannelDetailsType.RecentClips} />
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
  private showPanel(type: ChannelDetailsType) {
    const { channel, id } = this.props

    const panel: IPanel<any> = {
      component: ChannelDetailsPanels[type],
      props: { channel, id, type },
      title: type,
    }

    this.props.openPanel(panel)
  }

  /**
   * Triggered when the last vods button is clicked.
   */
  private onClickLastVods = () => {
    this.showPanel(ChannelDetailsType.LastVods)
  }

  /**
   * Triggered when the top clips button is clicked.
   */
  private onClickTopClips = () => {
    this.showPanel(ChannelDetailsType.TopClips)
  }

  /**
   * Triggered when the recent top clips button is clicked.
   */
  private onClickRecentTopClips = () => {
    this.showPanel(ChannelDetailsType.RecentClips)
  }

  /**
   * Triggered when the description button is clicked.
   */
  private onClickDescription = () => {
    this.showPanel(ChannelDetailsType.Description)
  }
}
