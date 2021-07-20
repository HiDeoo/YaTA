import _ from 'lodash'

import RequestMethod from 'constants/requestMethod'

/**
 * Ivr base API URL.
 */
const baseAPIUrl = 'https://api.ivr.fi'

/**
 * YaTA API class.
 */
export default class Ivr {
  /**
   * Fetches emote details.
   * @param  emoteId - The emote id.
   * @return The emote details.
   */
  public static async fetchEmoteDetails(emoteId: string): Promise<IvrEmoteDetails> {
    const emote = await Ivr.fetchEmoteData(emoteId)
    const emoteSet = await Ivr.fetchEmoteSetData(emote.setid)

    return { emote, emoteSet }
  }

  /**
   * Fetches subscription status for a channel of a specific user.
   * @param  username - The username.
   * @param  channel - The channel.
   * @return The subscription status.
   */
  public static async fetchSubscriptionStatus(username: string, channel: string): Promise<IvrSubscriptionStatus> {
    const response = await Ivr.fetch(`/twitch/subage/${username}/${channel}`, {}, RequestMethod.Get)

    return response.json()
  }

  /**
   * Fetches emote data.
   * @param  emoteId - The emote id.
   * @return The emote data.
   */
  private static async fetchEmoteData(emoteId: string): Promise<IvrEmoteData> {
    const response = await Ivr.fetch(`/twitch/emotes/${emoteId}`, { id: 1 }, RequestMethod.Get)

    return response.json()
  }

  /**
   * Fetches emote set data.
   * @param  emoteId - The emote id.
   * @return The emote set data.
   */
  private static async fetchEmoteSetData(emoteSetId: number): Promise<IvrEmoteSetData> {
    const response = await Ivr.fetch(`/twitch/emoteset/${emoteSetId}`, {}, RequestMethod.Get)

    return response.json()
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @return The URL.
   */
  private static getUrl(endpoint: string, searchParams: Record<string, string | number> = {}) {
    const url = new URL(baseAPIUrl.concat(endpoint))

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
    const url = Ivr.getUrl(endpoint, searchParams)
    const init: RequestInit = { method }

    const request = new Request(url, init)

    const response = await fetch(request)

    if (response.status >= 400) {
      throw new Error('Something went wrong while using the Ivr API.')
    }

    return response
  }
}

/**
 * Emote data returned by the Ivr API.
 */
type IvrEmoteData = {
  channel: string
  channelid: number
  channellogin: string
  emoteid: number
  emotecode: string
  emoteurl_1x: string
  emoteurl_2x: string
  emoteurl_3x: string
  setid: number
  tier: number
}

/**
 * Emote set data returned by the Ivr API.
 */
export type IvrEmoteSetData = {
  channel: string
  channelid: number
  channellogin: string
  tier: number
  emotes: {
    token: string
    id: number
    setID: number
    url: string
  }[]
}

/**
 * Emote & emote set data returned by the Ivr API.
 */
export type IvrEmoteDetails = {
  emote: IvrEmoteData
  emoteSet: IvrEmoteSetData
}

/**
 * Subscription status returned by the Ivr API.
 */
export type IvrSubscriptionStatus = {
  user: string
  userid: number
  channel: string
  channelid: number
  hidden: boolean
  subscribed: boolean
  followedAt: string | null
  meta: {
    type?: 'paid' | 'gift' | 'prime'
    tier?: string
    dnr?: boolean
    endsAt?: string | null
    renewsAt?: string | null
  }
  cumulative: IvrSubscriptionDetails
  streak: IvrSubscriptionDetails
}

/**
 * Subscription details returned by the Ivr API.
 */
type IvrSubscriptionDetails = {
  months?: number
  elapsed?: number
  remaining?: number
  end?: string
  start?: string
}
