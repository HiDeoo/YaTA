import { Colors, IPanelProps, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import styled from 'styled-components'

import { ChannelDetailsProps } from 'Components/ChannelDetails'
import { ChannelDetailsType } from 'Components/ChannelDetailsOverview'
import ChannelDetailsPanel from 'Components/ChannelDetailsPanel'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { ClipPeriod } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Vod component.
 */
const Vod = styled(FlexLayout)`
  margin-bottom: 10px;

  &:last-of-type {
    margin-bottom: 0;
  }
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
 * Detail component.
 */
const Detail = styled(Text).attrs({
  ellipsize: true,
})`
  margin: 3px 0 5px 0;
`

/**
 * Title component.
 */
const Title = styled(Detail)`
  color: ${Colors.BLUE5};
  font-size: 13px;
  font-weight: bold;
`

/**
 * Meta component.
 */
const Meta = styled(Detail)`
  color: ${color('follow.meta')};
  font-size: 11px;
`

/**
 * React State.
 */
const initialState = { didFail: false, videos: undefined as Video[] | null | undefined }
type State = Readonly<typeof initialState>

/**
 * ChannelDetailsVideos Component.
 */
export default class ChannelDetailsVideos extends React.Component<IPanelProps & ChannelDetailsProps & Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { channel, id, type } = this.props

    if (!_.isNil(id) && !_.isNil(channel)) {
      try {
        if (type === ChannelDetailsType.LastVods) {
          const { videos } = await Twitch.fetchChannelVideos(id, 10)

          const parsedVideos = _.map(videos, (video) => ({
            id: video._id,
            meta: `${new Date(video.created_at).toLocaleDateString()} - ${video.views} ${pluralize(
              'views',
              video.views
            )}`,
            thumbnail: video.preview.small,
            title: video.title,
            url: video.url,
          }))

          this.setState(() => ({ didFail: false, videos: parsedVideos }))
        } else if (type === ChannelDetailsType.TopClips || type === ChannelDetailsType.RecentClips) {
          const period = type === ChannelDetailsType.TopClips ? ClipPeriod.All : ClipPeriod.Week

          const { clips } = await Twitch.fetchTopClips(channel, period)

          const parsedVideos = _.map(clips, (clip) => ({
            id: clip.slug,
            meta: `${new Date(clip.created_at).toLocaleDateString()} - ${clip.views} ${pluralize(
              'views',
              clip.views
            )} - ${clip.curator.display_name}`,
            thumbnail: clip.thumbnails.small,
            title: clip.title,
            url: clip.url,
          }))

          this.setState(() => ({ didFail: false, videos: parsedVideos }))
        } else {
          this.setState(() => ({ didFail: true }))
        }
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
    const { didFail, videos } = this.state

    if (didFail) {
      return <NonIdealState small title="Something went wrong!" details="Please try again in a few minutes." />
    }

    if (_.isUndefined(videos)) {
      return <Spinner />
    }

    if (_.isNil(videos) || _.size(videos) === 0) {
      return <NonIdealState small title="Nothing yet!" details="Maybe try again in a while." />
    }

    return (
      <ChannelDetailsPanel>
        {_.map(videos, (video) => (
          <Vod key={video.id}>
            <Thumbnail src={video.thumbnail} />
            <FlexContent>
              <Title>
                <a href={video.url} target="_blank">
                  {video.title}
                </a>
              </Title>
              <Meta>{video.meta}</Meta>
            </FlexContent>
          </Vod>
        ))}
      </ChannelDetailsPanel>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  type: ChannelDetailsType.LastVods | ChannelDetailsType.RecentClips | ChannelDetailsType.TopClips
}

/**
 * Channel details video.
 */
type Video = {
  id: string
  meta: string
  thumbnail: string
  title: string
  url: string
}
