import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'Libs/PreviewProvider'
import Twitch from 'Libs/Twitch'

/**
 * RegExp used to identify a clip link.
 */
const ClipRegExp = /https:\/\/clips\.twitch\.tv\/(\w+)/g

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
      previews[match[1]] = { id: match[1], provider: PreviewTwitch.getProviderId(), resovled: false }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    const clip = await Twitch.fetchClip(preview.id)

    const viewsStr = `view${clip.views > 1 ? 's' : ''}`
    const meta = `Clipped by ${clip.curator.display_name} on ${clip.broadcaster.display_name} (${
      clip.views
    } ${viewsStr})`

    return {
      ...preview,
      image: clip.thumbnails.tiny,
      meta,
      resovled: true,
      title: clip.title,
      url: clip.url,
    }
  }
}

export default PreviewTwitch
