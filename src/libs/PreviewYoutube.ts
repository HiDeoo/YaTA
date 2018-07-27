import * as _ from 'lodash'

import RequestMethod from 'Constants/requestMethod'
import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'Libs/PreviewProvider'

/**
 * Youtube base API URL.
 */
const BaseUrl = 'https://www.googleapis.com/youtube/v3'

/**
 * RegExp used to identify a video link.
 */
const VideoRegExp = /https:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)(\w+)/g

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

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = VideoRegExp.exec(message)) != null) {
      previews[match[1]] = { id: match[1], provider: PreviewYoutube.getProviderId(), resolved: false }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    const url = new URL(`${BaseUrl}/videos`)
    url.searchParams.set('key', process.env.REACT_APP_YOUTUBE_API_KEY)
    url.searchParams.set('id', preview.id)
    url.searchParams.set('part', 'snippet,statistics')

    const request = new Request(url.toString(), { method: RequestMethod.Get })
    const response = await fetch(request)
    const videoResponse = (await response.json()) as Video
    const video = _.head(videoResponse.items)

    if (_.isNil(video)) {
      throw new Error('No Youtube video found.')
    }

    const meta = `Recorded by ${video.snippet.channelTitle} on ${new Date(
      video.snippet.publishedAt
    ).toLocaleDateString()} (${video.statistics.viewCount} view${video.statistics.viewCount > 1 ? 's' : ''})`

    return {
      ...preview,
      image: video.snippet.thumbnails.default.url,
      meta,
      resolved: true,
      title: video.snippet.title,
      url: `https://youtu.be/${preview.id}`,
    }
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
 * Youtube video details.
 */
type VideoDetails = {
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
    thumbnails: {
      default: VideoThumbnail
      high: VideoThumbnail
      maxres: VideoThumbnail
      medium: VideoThumbnail
      standard: VideoThumbnail
    }
    title: string
  }
  statistics: {
    commentCount: number
    disklikeCount: number
    favoriteCount: number
    likeCount: number
    viewCount: number
  }
}

/**
 * Youtube video thumbnail.
 */
type VideoThumbnail = { height: number; width: number; url: string }
