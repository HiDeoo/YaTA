import * as _ from 'lodash'

import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'Libs/PreviewProvider'
import StrawPoll from 'Libs/StrawPoll'

/**
 * RegExp used to identify a poll link.
 */
const PollRegExp = /https:\/\/(?:www\.)?strawpoll\.me\/(\d+)/g

/**
 * Straw Poll preview provider.
 */
const PreviewStrawPoll: PreviewProvider = class {
  /**
   * Returns the preview provider id.
   * @return The provider id.
   */
  public static getProviderId() {
    return 'previewStrawPoll'
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
    while ((match = PollRegExp.exec(message)) != null) {
      previews[match[1]] = { id: match[1], provider: PreviewStrawPoll.getProviderId(), resolved: false }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    const poll = await StrawPoll.fetchPoll(preview.id)

    return {
      ...preview,
      icon: 'horizontal-bar-chart',
      meta: `Total votes: ${_.sum(
        poll.votes
      ).toLocaleString()} - Total options: ${poll.options.length.toLocaleString()}`,
      resolved: true,
      title: poll.title,
      url: `https://www.strawpoll.me/${preview.id}`,
    }
  }
}

export default PreviewStrawPoll
