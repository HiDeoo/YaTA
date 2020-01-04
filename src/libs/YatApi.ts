import _ from 'lodash'

import RequestMethod from 'constants/requestMethod'

/**
 * YaTA API class.
 */
export default class YatApi {
  /**
   * Fetches emote details.
   * @param  emoteId - The emote id.
   * @return The emote details.
   */
  public static async fetchEmoteDetails(emoteId: string): Promise<YAEmoteDetails> {
    const response = await YatApi.fetch('/emotes', { id: emoteId }, RequestMethod.Get)

    return response.json()
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @return The URL.
   */
  private static getUrl(endpoint: string, searchParams: Record<string, string | number> = {}) {
    const url = new URL(process.env.REACT_APP_YATA_API_URL.concat(endpoint))

    _.forEach(searchParams, (value, key) => {
      const sanitizedValue = _.isNumber(value) ? value.toString() : value
      url.searchParams.set(key, sanitizedValue)
    })

    return url.toString()
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @param  [method=RequestMethod.Get] - The request method.
   * @return The response.
   */
  private static async fetch(
    endpoint: string,
    searchParams: Record<string, string | number> = {},
    method = RequestMethod.Get
  ) {
    const url = YatApi.getUrl(endpoint, searchParams)
    const init: RequestInit = { method }

    const request = new Request(url, init)

    const response = await fetch(request)

    if (response.status >= 400) {
      throw new Error('Something went wrong while using the YaTA API.')
    }

    return response
  }
}

/**
 * Emote details returned by the YaTA API.
 */
export type YAEmoteDetails = {
  channel_name: string
  display_name: string
  broadcaster_type: 'partner' | 'affiliate' | null
  plans: {
    '$4.99': string | null
    '$9.99': string | null
    '$24.99': string | null
  }
  emotes: Array<{
    code: string
    emoticon_set: number
    id: number
  }>
}
