import _ from 'lodash'

import EmotesProvider, { Emote, EmoteProviderPrefix } from 'libs/EmotesProvider'

/**
 * Ffz base API URL.
 */
const baseAPIUrl = 'https://api.frankerfacez.com/v1'

/**
 * Ffz class.
 */
export default class Ffz {
  /**
   * Fetches Ffz emotes for a specific channel.
   * @param  channel - The name of the channel.
   * @return The emotes provider.
   */
  public static async fetchEmotes(channel: string): Promise<EmotesProvider<FfzEmote>> {
    const response = await Promise.all([
      (await Ffz.fetch(`${baseAPIUrl}/set/global`)).json(),
      (await Ffz.fetch(`${baseAPIUrl}/room/${channel}`)).json(),
    ])

    const [globalResponse, channelResponse] = response

    const rawEmotes = _.reduce(
      globalResponse.default_sets,
      (acc, setId) => {
        acc.push(...globalResponse.sets[setId].emoticons)

        return acc
      },
      [] as FfzEmote[]
    )

    const isChannelRegistered = !_.has(channelResponse, 'error') && _.has(channelResponse, 'sets')

    if (isChannelRegistered) {
      _.forEach(channelResponse.sets, (set) => {
        rawEmotes.push(...set.emoticons)
      })
    }

    return new EmotesProvider(EmoteProviderPrefix.Ffz, Ffz.sanitizeRawEmotes(rawEmotes))
  }

  /**
   * Sanitizes emotes returned by the Ffz API.
   * @param  rawEmotes - The emotes returned by the API.
   * @return The sanitized emotes.
   */
  private static sanitizeRawEmotes(rawEmotes: FfzEmote[]): FfzEmote[] {
    return _.map(rawEmotes, ({ id, name, urls, width }) => {
      return {
        name,
        id: id.toString(),
        urls,
        width,
      }
    })
  }

  /**
   * Fetches an URL.
   * @param  url - The URL to fetch.
   * @return The response.
   */
  private static fetch(url: string) {
    const headers = new Headers({
      Accept: 'application/json',
    })

    const request = new Request(url, { headers })

    return fetch(request)
  }
}

/**
 * Ffz emote URLs.
 */
interface FfzEmoteUrls {
  1: string
  2?: string
  4?: string
}

/**
 * Ffz emote.
 */
export interface FfzEmote extends Emote {
  urls: FfzEmoteUrls
  width: number
}
