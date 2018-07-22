import { Colors, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import TimeAgo from 'react-timeago'
import styled from 'styled-components'

import Center from 'Components/Center'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { RawStream, RawVideo } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  height: 296px;
  width: 300px;
`

/**
 * Offline component.
 */
const Offline = styled.div`
  height: 88px;

  strong {
    margin-top: 4px;
  }
`

/**
 * Stream component.
 */
const Stream = styled(FlexLayout)`
  height: 84px;
  padding: 10px;
`

/**
 * Preview component.
 */
const Preview = styled.img`
  display: inline-block;
  height: 68px;
  margin-right: 10px;
  width: 120px;
`

/**
 * StreamDetails component.
 */
const StreamDetails = styled(FlexContent)`
  height: 70px;
  overflow: hidden;

  & > div {
    margin: 2px 0;
    width: 145px;
  }
`

/**
 * Title component.
 */
const Title = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${Colors.BLUE5};
  font-size: 13px;
  font-weight: bold;
`

/**
 * Game component.
 */
const Game = styled(Text).attrs({
  ellipsize: true,
})`
  font-size: 12px;
`
/**
 * Meta component.
 */
const Meta = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${color('follow.meta')};
  font-size: 11px;
`

/**
 * VodsWrapper component.
 */
const VodsWrapper = styled.div`
  height: 210px;
`

/**
 * Section component.
 */
const Section = styled.div`
  background-color: ${Colors.DARK_GRAY2};
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
  padding: 6px 10px;
`

/**
 * Vods component.
 */
const Vods = styled.div`
  padding: 10px;
`

/**
 * Vod component.
 */
const Vod = styled(FlexLayout)`
  margin-bottom: 10px;
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  display: inline-block;
  height: 45px;
  margin-right: 10px;
  width: 80px;
`

/**
 * VodDetails component.
 */
const VodDetails = styled(FlexContent)`
  & > div {
    margin: 4px 0 6px 0;
    width: 185px;
  }
`

/**
 * React State.
 */
const initialState = {
  didFail: false,
  stream: undefined as RawStream | null | undefined,
  videos: undefined as RawVideo[] | null | undefined,
}
type State = Readonly<typeof initialState>

/**
 * ChannelDetails Component.
 */
export default class ChannelDetails extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { channelId } = this.props

    if (!_.isNil(channelId)) {
      try {
        const response = await Promise.all([Twitch.fetchStream(channelId), Twitch.fetchChannelVideos(channelId, 3)])

        this.setState(() => ({ didFail: false, stream: response[0].stream, videos: response[1].videos }))
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
    const { didFail, stream, videos } = this.state

    if (didFail) {
      return this.renderError()
    }

    if (_.isUndefined(stream) && _.isUndefined(videos)) {
      return (
        <Wrapper>
          <Spinner />
        </Wrapper>
      )
    }

    return (
      <Wrapper>
        {this.renderStream()}
        {this.renderVods()}
      </Wrapper>
    )
  }

  /**
   * Renders the stream details.
   * @return Element to render.
   */
  private renderStream() {
    const { stream } = this.state

    if (_.isNil(stream)) {
      return (
        <Offline>
          <Center>
            <strong>Currently offline!</strong>
          </Center>
        </Offline>
      )
    }

    return (
      <Stream>
        <Preview src={stream.preview.medium} />
        <StreamDetails>
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
        </StreamDetails>
      </Stream>
    )
  }

  /**
   * Renders the vods.
   * @return Element to render.
   */
  private renderVods() {
    const { videos } = this.state

    if (_.isNil(videos) || _.size(videos) === 0) {
      return (
        <VodsWrapper>
          {this.renderVodsSection()}
          <NonIdealState small title="No vods yet!" details="Maybe try again in a while." />
        </VodsWrapper>
      )
    }

    return (
      <VodsWrapper>
        {this.renderVodsSection()}
        <Vods>
          {_.map(videos, (video) => (
            <Vod key={video._id}>
              <Thumbnail src={video.preview.small} />
              <VodDetails>
                <Title>
                  <a href={video.url} target="_blank">
                    {video.title}
                  </a>
                </Title>
                <Meta>
                  {new Date(video.created_at).toLocaleDateString()} - {video.views} views
                </Meta>
              </VodDetails>
            </Vod>
          ))}
        </Vods>
      </VodsWrapper>
    )
  }

  /**
   * Renders the vods section.
   * @return Element to render.
   */
  private renderVodsSection() {
    return <Section>Past Broadcasts…</Section>
  }

  /**
   * Renders an error while fetching details.
   * @return Element to render.
   */
  private renderError() {
    return (
      <Wrapper>
        <NonIdealState small title="Something went wrong!" details="Please try again in a few minutes" />
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  channelId?: string
}
