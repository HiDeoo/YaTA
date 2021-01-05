import _ from 'lodash'

/**
 * Base API URL.
 */
const BaseUrl = 'https://recent-messages.robotty.de/api/v2'

/**
 * Robotty class.
 */
export default class Robotty {
  /**
   * Fetches recent messages for a specific channel.
   * @param  channel - The name of the channel.
   * @return The recent message.
   */
  public static async fetchRecentMessages(channel: string) {
    const response = await Robotty.fetch(
      Robotty.getUrl(`/recent-messages/${channel}`, { hideModerationMessages: true, hideModeratedMessages: true })
    )
    const json = (await response.json()) as RawRecentMessages

    if (!_.isNil(json.error)) {
      throw new Error(json.error)
    }

    return _.filter(_.takeRight(json.messages, 15), (message) => message.includes(`PRIVMSG #${channel}`))
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @return The URL.
   */
  private static getUrl(endpoint: string, searchParams: Record<string, string | boolean> = {}) {
    const url = new URL(BaseUrl.concat(endpoint))

    _.forEach(searchParams, (value, key) => url.searchParams.set(key, _.isString(value) ? value : value.toString()))

    return url.toString()
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
 * Recent messages returned by the API.
 */
type RawRecentMessages = {
  messages: string[]
  error: string | null
}
