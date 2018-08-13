import * as _ from 'lodash'

import RequestMethod from 'Constants/requestMethod'

/**
 * TwitchStatus base API URL.
 */
const BaseUrl = 'https://twitchstatus.com/api'

/**
 * CORS proxy URL.
 */
const ProxyURL = 'https://cors-anywhere.herokuapp.com/'

/**
 * Twitch statuses.
 */
export enum Status {
  Disrupted,
  Online,
  Unknown,
}

/**
 * TwitchStatus class.
 */
export default class TwitchStatus {
  /**
   * Fetches Twitch global status.
   * @return Twitch global status.
   */
  public static async fetchGlobalStatus(): Promise<Status> {
    try {
      const response = await TwitchStatus.fetch(`/status`)

      const statuses = (await response.json()) as RawStatuses

      let issueCount = 0

      _.forEach(statuses, (type) => {
        _.forEach(type.servers, (server) => {
          if (server.status !== 'online') {
            issueCount += 1

            return false
          }

          return true
        })
      })

      return issueCount > 0 ? Status.Disrupted : Status.Online
    } catch (error) {
      return Status.Disrupted
    }
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @return The URL.
   */
  private static getUrl(endpoint: string) {
    return ProxyURL.concat(BaseUrl.concat(endpoint))
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @param  [method=RequestMethod.Get] - The request method.
   * @return The response.
   */
  private static async fetch(endpoint: string, method = RequestMethod.Get) {
    const url = TwitchStatus.getUrl(endpoint)

    const init: RequestInit = { method }

    const request = new Request(url, init)

    return fetch(request)
  }
}

/**
 * Twitch statuses.
 */
type RawStatuses = { [key: string]: { servers: RawServer[] } }

/**
 * Twitch server.
 */
type RawServer = {
  server: string
  status: string
}
