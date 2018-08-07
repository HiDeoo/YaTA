import * as _ from 'lodash'
import * as pluralize from 'pluralize'

import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'Libs/PreviewProvider'
import Twitch from 'Libs/Twitch'

/**
 * Preview types.
 */
enum TwitchPreviewType {
  Clip,
  Video,
}

/**
 * RegExp used to identify a clip link.
 */
const ClipRegExp = /https:\/\/clips\.twitch\.tv\/(\w+)/g

/**
 * RegExp used to identify a video link.
 */
const VideoRegExp = /https:\/\/(?:www\.)?twitch\.tv\/videos\/(\d+)/g

/**
 * Twitch preview provider.
 */
const PreviewTwitch: PreviewProvider = class {
  /**
   * Returns the preview provider id.
   * @return The provider id.
   */
  public static getProviderId() {
    return 'previewTwitch'
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
    while ((match = ClipRegExp.exec(message)) != null) {
      previews[match[1]] = {
        id: match[1],
        provider: PreviewTwitch.getProviderId(),
        resolved: false,
        type: TwitchPreviewType.Clip,
      }
    }

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = VideoRegExp.exec(message)) != null) {
      previews[match[1]] = {
        id: match[1],
        provider: PreviewTwitch.getProviderId(),
        resolved: false,
        type: TwitchPreviewType.Video,
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

    if (preview.type === TwitchPreviewType.Clip) {
      const clip = await Twitch.fetchClip(preview.id)

      const meta = `Clipped by ${clip.curator.display_name} on ${
        clip.broadcaster.display_name
      } (${clip.views.toLocaleString()} ${pluralize('view', clip.views)})`

      return {
        ...preview,
        image: clip.thumbnails.tiny,
        meta,
        resolved: true,
        title: clip.title,
        url: clip.url,
      }
    } else if (preview.type === TwitchPreviewType.Video) {
      const video = await Twitch.fetchVideo(preview.id)

      const meta = `Recorded by ${video.channel.display_name} on ${new Date(
        video.created_at
      ).toLocaleDateString()} (${video.views.toLocaleString()} ${pluralize('view', video.views)})`

      return {
        ...preview,
        image: video.preview.small,
        meta,
        resolved: true,
        title: video.title,
        url: video.url,
      }
    }

    throw new Error('Invalid preview type.')
  }
}

export default PreviewTwitch
