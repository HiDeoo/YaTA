import _ from 'lodash'

import RequestMethod from 'constants/requestMethod'

/**
 * StrawPoll base API URL.
 */
const BaseUrl = 'https://www.strawpoll.me/api/v2'

/**
 * StrawPoll class.
 */
export default class StrawPoll {
  /**
   * Fetches details about a specific poll.
   * @param  id - The poll id.
   * @return The poll.
   */
  public static async fetchPoll(id: string): Promise<RawPoll> {
    const response = await StrawPoll.fetch(`/polls/${id}`)

    return response.json()
  }

  /**
   * Creates a new poll.
   * @param  title - The poll title.
   * @param  options - The poll options.
   * @param  multi - `true` when multiple answers are allowed.
   * @param  dupcheck - The duplication check mechanism.
   * @param  captcha - `true` when a CAPTCHA should be included.
   * @return The new poll.
   */
  public static async createPoll(
    title: string,
    options: string[],
    multi: boolean,
    dupcheck: StrawPollDuplicationStrategy,
    captcha: boolean
  ): Promise<RawPoll> {
    const response = await StrawPoll.fetch('/polls', RequestMethod.Post, {
      captcha,
      dupcheck,
      multi,
      options,
      title,
    })

    return response.json()
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @return The URL.
   */
  private static getUrl(endpoint: string) {
    return BaseUrl.concat(endpoint)
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @param  [method=RequestMethod.Get] - The request method.
   * @param  [body] - The request body.
   * @return The response.
   */
  private static async fetch(endpoint: string, method = RequestMethod.Get, body?: object) {
    const url = StrawPoll.getUrl(endpoint)

    const init: RequestInit = { method }

    if (!_.isNil(body)) {
      init.body = JSON.stringify(body)
    }

    const request = new Request(url, init)

    return fetch(request)
  }
}

/**
 * Straw Poll duplication check strategies.
 */
export enum StrawPollDuplicationStrategy {
  Cookie = 'permissive',
  Ip = 'normal',
  None = 'disabled',
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
