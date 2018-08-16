import { IPanelProps } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import styled from 'styled-components'

import { ChannelDetailsProps } from 'Components/ChannelDetails'
import { ChannelDetailsType } from 'Components/ChannelDetailsOverview'
import ChannelDetailsPanel from 'Components/ChannelDetailsPanel'
import ExternalResource, { Resource, ResourceType } from 'Components/ExternalResource'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { ClipPeriod } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * ChannelDetailsVideo component.
 */
const ChannelDetailsVideo = styled(ExternalResource)`
  &:hover {
    background-color: ${color('channel.background')};
  }
`

/**
 * React State.
 */
const initialState = { didFail: false, videos: undefined as Optional<Resource[]> }
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
    const { id, name, type } = this.props

    try {
      if (type === ChannelDetailsType.LastVods) {
        const { videos } = await Twitch.fetchChannelVideos(id, 10)

        const parsedVideos = _.map(videos, (video) => ({
          id: video._id,
          meta: `${new Date(video.created_at).toLocaleDateString()} - ${video.views.toLocaleString()} ${pluralize(
            'views',
            video.views
          )}`,
          text: video.title,
          thumbnail: video.preview.small,
          type: ResourceType.Vod,
          url: video.url,
        }))

        this.setState(() => ({ didFail: false, videos: parsedVideos }))
      } else if (type === ChannelDetailsType.TopClips || type === ChannelDetailsType.RecentClips) {
        const period = type === ChannelDetailsType.TopClips ? ClipPeriod.All : ClipPeriod.Week

        const { clips } = await Twitch.fetchTopClips(name, period)

        const parsedVideos = _.map(clips, (clip) => ({
          id: clip.slug,
          meta: `${new Date(clip.created_at).toLocaleDateString()} - ${clip.views.toLocaleString()} ${pluralize(
            'views',
            clip.views
          )} - ${clip.curator.display_name}`,
          text: clip.title,
          thumbnail: clip.thumbnails.small,
          type: ResourceType.Clip,
          url: clip.url,
        }))

        this.setState(() => ({ didFail: false, videos: parsedVideos }))
      } else {
        this.setState(() => ({ didFail: true }))
      }
    } catch (error) {
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
      return <NonIdealState small retry />
    }

    if (_.isUndefined(videos)) {
      return <Spinner />
    }

    if (_.isNil(videos) || _.size(videos) === 0) {
      return <NonIdealState small title="Nothing yet!" retry />
    }

    return (
      <ChannelDetailsPanel minimal>
        {_.map(videos, (video) => (
          <ChannelDetailsVideo key={video.id} resource={video} />
        ))}
      </ChannelDetailsPanel>
    )
  }
}

/**
 * React Props.
 */
interface Props {
  type: VideoType
}

/**
 * Channel video type.
 */
type VideoType = ChannelDetailsType.LastVods | ChannelDetailsType.RecentClips | ChannelDetailsType.TopClips

/**
 * Channel details video.
 */
export type Video = {
  id: string
  meta: string
  thumbnail: string
  title: string
  type: VideoType
  url: string
}
