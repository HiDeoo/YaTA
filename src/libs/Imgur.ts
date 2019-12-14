import * as _ from 'lodash'

import RequestMethod from 'constants/requestMethod'

/**
 * Imgur base API URL.
 */
const BaseUrl = 'https://api.imgur.com/3'

/**
 * Imgur class.
 */
export default class Imgur {
  /**
   * Uploads an anonymous image.
   * @param  file - The file to upload.
   * @return The upload data.
   */
  public static async uploadAnonymousFile(file: File): Promise<ImgurUpload> {
    const data = new FormData()
    data.append('image', file)

    const response = await Imgur.fetch('/image', RequestMethod.Post, data)

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
  private static async fetch(endpoint: string, method = RequestMethod.Get, body?: FormData) {
    const url = Imgur.getUrl(endpoint)

    const headers = new Headers({
      Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_CLIENT_ID}`,
    })
    const init: RequestInit = { headers, method }

    if (!_.isNil(body)) {
      init.body = body
    }

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
 * Imgur upload.
 */
export type ImgurUpload = {
  data: {
    account_id: number
    account_url: string | null
    ad_type: number
    ad_url: string
    animated: boolean
    bandwidth: number
    datetime: number
    deletehash: string
    description: string | null
    favorite: boolean
    has_sound: boolean
    height: number
    id: string
    in_gallery: boolean
    in_most_viral: boolean
    is_ad: boolean
    link: string
    name: string
    nsfw: boolean
    size: number
    tags: string[]
    length: number
    title: string | null
    type: string
    views: number
    vote: number | null
    width: number
  }
  status: number
  success: boolean
}
