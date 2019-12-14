import * as _ from 'lodash'

import RequestMethod from 'constants/requestMethod'

/**
 * TwitchTools base API URL.
 */
const BaseUrl = 'https://twitch-tools.rootonline.de'

/**
 * TwitchTools class.
 */
export default class TwitchTools {
  /**
   * Fetches a username history.
   * @param  id - The user id.
   * @return The username history.
   */
  public static async fetchUsernameHistory(id: string): Promise<UsernameHistory> {
    const response = await TwitchTools.fetch('/username_changelogs_search.php', { q: id }, RequestMethod.Get)

    return response.json()
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @return The URL.
   */
  private static getUrl(endpoint: string, searchParams: Record<string, string> = {}) {
    const url = new URL(BaseUrl.concat(endpoint))

    _.forEach(searchParams, (value, key) => url.searchParams.set(key, value))

    return url.toString()
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @param  [method=RequestMethod.Get] - The request method.
   * @return The response.
   */
  private static async fetch(endpoint: string, searchParams: Record<string, string> = {}, method = RequestMethod.Get) {
    searchParams.format = 'json'

    const url = TwitchTools.getUrl(endpoint, searchParams)
    const init: RequestInit = { method }

    const request = new Request(url, init)

    const response = await fetch(request)

    if (response.status >= 400) {
      const json = await response.json()

      throw new Error(_.get(json, 'data.error', 'Something went wrong.'))
    }

    return response
  }
}

/**
 * Username history.
 */
export type UsernameHistory = NameChange[]

/**
 * Name change.
 */
type NameChange = {
  userid: string
  username_old: string
  username_new: string
  found_at: string
}
