import * as _ from 'lodash'

import RequestMethod from 'Constants/requestMethod'

/**
 * StrawPoll base API URL.
 */
const BaseUrl = 'https://strawpoll.me/api/v2/'

/**
 * StrawPoll class.
 */
export default class StrawPoll {
  /**
   * Fetches details about a specific poll.
   * @param id - The poll id.
   * @return The poll.
   */
  public static async fetchPoll(id: string): Promise<RawPoll> {
    const response = await StrawPoll.fetch(`/polls/${id}`)

    return response.json()
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams] - Additional search parameters.
   * @return The URL.
   */
  private static getUrl(endpoint: string, searchParams: { [key: string]: string } = {}) {
    const url = new URL(`${BaseUrl}${endpoint}`)

    _.forEach(searchParams, (value, key) => url.searchParams.set(key, value))

    return url.toString()
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams] - Additional search parameters.
   * @param  [method] - The request method.
   * @return The response.
   */
  private static async fetch(
    endpoint: string,
    searchParams: { [key: string]: string } = {},
    method = RequestMethod.Get
  ) {
    const url = StrawPoll.getUrl(endpoint, searchParams)

    const request = new Request(url, { method })

    const response = await fetch(request)

    if (response.status >= 400) {
      const json = await response.json()

      const originalMessage = _.get(json, 'message', 'Something went wrong.')

      const message =
        originalMessage.charAt(0) === '{'
          ? _.get(JSON.parse(originalMessage), 'message', 'Something went wrong.')
          : originalMessage

      throw new Error(message)
    }

    return response
  }
}

/**
 * Poll.
 */
export type RawPoll = {
  id: number
  title: string
  options: string[]
  votes: number[]
  multi: boolean
  dupcheck: string
  captcha: boolean
}
