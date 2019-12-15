import _ from 'lodash'
import pluralize from 'pluralize'

import RequestMethod from 'constants/requestMethod'
import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'libs/PreviewProvider'
import { durationToString } from 'utils/time'

/**
 * Preview types.
 */
enum YoutubePreviewType {
  Video,
  Channel,
}

/**
 * Youtube base API URL.
 */
const BaseUrl = 'https://www.googleapis.com/youtube/v3'

/**
 * RegExp used to identify a video link.
 */
const VideoRegExp = /https:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([\w-]+)(?:[^\s]+)?/g

/**
 * RegExp used to identify a channel link.
 */
const ChannelRegExp = /https:\/\/(?:www\.)?youtube\.com\/channel\/([\w-]+)/g

/**
 * Youtube preview provider.
 */
const PreviewYoutube: PreviewProvider = class {
  /**
   * Returns the preview provider id.
   * @return The provider id.
   */
  public static getProviderId() {
    return 'previewYoutube'
  }

  /**
   * Parses a message for potential previews.
   * @param  message - The message to parse.
   * @return The previews.
   */
  public static parse(message: string) {
    const previews: Previews = {}

    let match

    while ((match = VideoRegExp.exec(message)) != null) {
      previews[match[1]] = {
        extra: { initialLink: match[0] },
        id: match[1],
        provider: PreviewYoutube.getProviderId(),
        resolved: false,
        type: YoutubePreviewType.Video,
      }
    }

    while ((match = ChannelRegExp.exec(message)) != null) {
      previews[match[1]] = {
        id: match[1],
        provider: PreviewYoutube.getProviderId(),
        resolved: false,
        type: YoutubePreviewType.Channel,
      }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    if (_.isNil(preview.type)) {
      throw new Error('Missing preview type.')
    }

    if (preview.type === YoutubePreviewType.Video) {
      const url = new URL(`${BaseUrl}/videos`)
      url.searchParams.set('key', process.env.REACT_APP_YOUTUBE_API_KEY)
      url.searchParams.set('id', preview.id)
      url.searchParams.set('part', 'snippet,statistics,contentDetails')

      const request = new Request(url.toString(), { method: RequestMethod.Get })
      const response = await fetch(request)
      const videoResponse = (await response.json()) as Video
      const video = _.head(videoResponse.items)

      if (_.isNil(video)) {
        throw new Error('No Youtube video found.')
      }

      const duration = durationToString(video.contentDetails.duration)
      const durationStr = !_.isNil(duration) ? ` - ${duration}` : ''
      const viewCount = parseInt(video.statistics.viewCount, 10)

      const meta = `Recorded by ${video.snippet.channelTitle} on ${new Date(
        video.snippet.publishedAt
      ).toLocaleDateString()}${durationStr} (${viewCount.toLocaleString()} ${pluralize('view', viewCount)})`

      return {
        ...preview,
        image: video.snippet.thumbnails.default.url,
        meta,
        resolved: true,
        title: video.snippet.title,
        url: `https://youtu.be/${preview.id}`,
      }
    } else if (preview.type === YoutubePreviewType.Channel) {
      const url = new URL(`${BaseUrl}/channels`)
      url.searchParams.set('key', process.env.REACT_APP_YOUTUBE_API_KEY)
      url.searchParams.set('id', preview.id)
      url.searchParams.set('part', 'snippet,statistics')

      const request = new Request(url.toString(), { method: RequestMethod.Get })
      const response = await fetch(request)
      const channelResponse = (await response.json()) as Channel
      const channel = _.head(channelResponse.items)

      if (_.isNil(channel)) {
        throw new Error('No Youtube channel found.')
      }

      const subscriberCount = parseInt(channel.statistics.subscriberCount, 10)
      const videoCount = parseInt(channel.statistics.videoCount, 10)
      const viewCount = parseInt(channel.statistics.viewCount, 10)

      const meta = `${viewCount.toLocaleString()} ${pluralize(
        'view',
        viewCount
      )} - ${subscriberCount.toLocaleString()} ${pluralize(
        'subscriber',
        subscriberCount
      )} - ${videoCount.toLocaleString()} ${pluralize('video', videoCount)}`

      return {
        ...preview,
        image: channel.snippet.thumbnails.default.url,
        meta,
        resolved: true,
        title: channel.snippet.title,
        url: `https://youtube.com/channel/${preview.id}`,
      }
    }

    throw new Error('Invalid preview type.')
  }
}

export default PreviewYoutube

/**
 * Youtube video.
 */
type Video = {
  etag: string
  items: VideoDetails[]
  kind: string
}

/**
 * Youtube channel.
 */
type Channel = {
  etag: string
  items: ChannelDetails[]
  kind: string
}

/**
 * Youtube video details.
 */
type VideoDetails = {
  contentDetails: {
    caption: boolean
    definition: string
    dimensions: string
    duration: string
    licensedContent: boolean
    projection: string
  }
  etag: string
  id: string
  kind: string
  snippet: {
    categoryId: string
    channelId: string
    channelTitle: string
    description: string
    publishedAt: string
    tags: string[]
    thumbnails: Thumbnails
    title: string
  }
  statistics: {
    commentCount: string
    disklikeCount: string
    favoriteCount: string
    likeCount: string
    viewCount: string
  }
}

/**
 * Youtube channel details.
 */
type ChannelDetails = {
  etag: string
  id: string
  kind: string
  snippet: {
    customUrl: string
    description: string
    thumbnails: Thumbnails
    title: string
  }
  statistics: {
    commentCount: string
    subscriberCount: string
    videoCount: string
    viewCount: string
  }
}

/**
 * Youtube  thumbnails.
 */
type Thumbnails = {
  default: Thumbnail
  high: Thumbnail
  maxres: Thumbnail
  medium: Thumbnail
  standard: Thumbnail
}

/**
 * Youtube  thumbnail.
 */
type Thumbnail = { height: number; width: number; url: string }
