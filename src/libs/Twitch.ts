import * as _ from 'lodash'
import jose from 'node-jose'

/**
 * Twitch base auth URL.
 */
const baseAuthUrl = 'https://id.twitch.tv/oauth2'

/**
 * Twitch base kraken URL.
 */
const baseKrakenUrl = 'https://api.twitch.tv/kraken'

/**
 * Twitch class.
 */
export default class Twitch {
  /**
   * Returns the Twitch authentication URL.
   * @return The auth URL.
   */
  public static getAuthURL() {
    const url = new URL(`${baseAuthUrl}/authorize`)

    const { REACT_APP_TWITCH_CLIENT_ID, REACT_APP_TWITCH_REDIRECT_URI } = process.env

    url.searchParams.set('client_id', REACT_APP_TWITCH_CLIENT_ID)
    url.searchParams.set('redirect_uri', REACT_APP_TWITCH_REDIRECT_URI)
    url.searchParams.set('response_type', 'token id_token')
    url.searchParams.set('scope', 'openid chat_login user_read')

    return url
  }

  /**
   * Returns the auth response token.
   * @param hash - The URL hash to parse
   * @return The parsed tokens
   */
  public static getAuthTokens(hash: string) {
    const params = new URLSearchParams(hash.substring(1))

    if (!params.has('access_token') || !params.has('id_token')) {
      throw new Error('Invalid auth response.')
    }

    return {
      access: params.get('access_token') as string,
      id: params.get('id_token') as string,
    }
  }

  /**
   * Validates an ID token.
   * @param  token - The ID token received during authentication.
   * @return The verified ID token.
   */
  public static async verifyIdToken(token: string) {
    const jwk = await Twitch.fetchJWK()

    const keystore = await jose.JWK.asKeyStore(jwk)

    const jws = await jose.JWS.createVerify(keystore).verify(token)

    const idToken = JSON.parse(jws.payload.toString()) as IdToken

    if (_.get(idToken, 'aud') !== process.env.REACT_APP_TWITCH_CLIENT_ID || _.get(idToken, 'iss') !== baseAuthUrl) {
      throw new Error('Unable to verify ID token.')
    }

    return idToken
  }

  /**
   * Sanitizes the name of a channel (remove the extra # at the beginning if present).
   * @param  channel - The channel name to sanitize.
   * @return The sanitized name.
   */
  public static sanitizeChannel(channel: string) {
    if (channel.charAt(0) === '#') {
      return channel.substr(1)
    }

    return channel
  }

  /**
   * Fetches Twitch badges.
   * @return The badges.
   */
  public static async fetchBadges(channelId: string): Promise<Badges> {
    const response = await Promise.all([
      (await Twitch.fetch('https://badges.twitch.tv/v1/badges/global/display')).json(),
      (await Twitch.fetch(`https://badges.twitch.tv/v1/badges/channels/${channelId}/display`)).json(),
    ])

    return { ...response[0].badge_sets, ...response[1].badge_sets }
  }

  /**
   * Fetches details about a specific user.
   * @param  id - The user id.
   * @return The user details.
   */
  public static async fetchUser(id: string): Promise<UserDetails> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/users/${id}`)

    return response.json()
  }

  /**
   * Fetches details about the current authenticated user.
   * @param  token - The user token.
   * @return The user details.
   */
  public static async fetchAuthenticatedUser(token: string): Promise<AuthenticatedUserDetails> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/user`, { Authorization: `OAuth ${token}` })

    return response.json()
  }

  /**
   * Fetches an URL.
   * @param  url - The URL to fetch.
   * @param  additionalHeaders -  Additional headers to pass down to the query.
   * @return The response.
   */
  private static fetch(url: string, additionalHeaders?: { [key: string]: string }) {
    const headers = new Headers({
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
    })

    if (_.size(additionalHeaders) > 0) {
      _.forEach(additionalHeaders, (value, name) => {
        headers.append(name, value)
      })
    }

    const request = new Request(url, { headers })

    return fetch(request)
  }

  /**
   * Fetches Twitch public JWK.
   * @return The JWK.
   */
  private static async fetchJWK() {
    const jwkReponse = await fetch('https://id.twitch.tv/oauth2/keys')

    const jwk = await jwkReponse.json()

    return jwk as JsonWebKey
  }
}

/**
 * ID token.
 */
export type IdToken = {
  aud: string
  azp: string
  exp: number
  iat: number
  iss: string
  preferred_username: string
  sub: string
}

/**
 * Twitch badges.
 */
export type Badges = {
  [key: string]: {
    versions: {
      [key: string]: Badge
    }
  }
}

/**
 * Twitch badge.
 */
export type Badge = {
  click_action: string
  click_url: string
  description: string
  image_url_1x: string
  image_url_2x: string
  image_url_4x: string
  title: string
}

/**
 * Twitch user details.
 */
export type UserDetails = {
  bio: string | null
  created_at: string
  display_name: string
  logo: string
  name: string
  type: string
  updated_at: string
  _id: string
}

/**
 * Twitch authenticated user details.
 */
export interface AuthenticatedUserDetails extends UserDetails {
  email: string
  email_verified: boolean
  partnered: boolean
  twitter_connected: boolean
}
