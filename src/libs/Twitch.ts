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
 * Twitch base tmi URL.
 */
const baseTmiUrl = 'https://tmi.twitch.tv'

/**
 * RegExp used to identify whisper command (/w user message).
 */
const WhisperRegExp = /^\/w \S+ .+/

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
   * Determines if a message is a whisper command (/w user message).
   * @return `true` if the value is a whisper.
   */
  public static isWhisperCommand(message: string) {
    return WhisperRegExp.test(message)
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
   * Fetches details about a channel.
   * @param  id - The channel id.
   * @return The channel details.
   */
  public static async fetchChannel(id: string): Promise<ChannelDetails> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/channels/${id}`)

    return response.json()
  }

  /**
   * Fetches details about a clip.
   * @param  slug - The clip slug.
   * @return The clip details.
   */
  public static async fetchClip(slug: string): Promise<Clip> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/clips/${slug}`)

    return response.json()
  }

  /**
   * Fetches details about multiple clips.
   * @param  slug - The clip slugs.
   * @return The clips details.
   */
  public static async fetchClips(slugs: string[]): Promise<Clip[]> {
    const requests = _.map(slugs, async (slug) => Twitch.fetchClip(slug))

    return Promise.all(requests)
  }

  /**
   * Fetches chatters of a specific channel.
   * @param  channel - The channel.
   * @return The chatter.
   */
  public static async fetchChatters(channel: string): Promise<ChattersDetails> {
    const response = await Twitch.fetch(
      `https://cors-anywhere.herokuapp.com/${baseTmiUrl}/group/user/${channel}/chatters`
    )

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
  private static fetch(url: string, additionalHeaders?: { [key: string]: string }, options: RequestInit = {}) {
    const headers = new Headers({
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
    })

    if (_.size(additionalHeaders) > 0) {
      _.forEach(additionalHeaders, (value, name) => {
        headers.append(name, value)
      })
    }

    const request = new Request(url, { ...options, headers })

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
 * Twitch channel details.
 */
export type ChannelDetails = {
  mature: boolean
  status: string | null
  broadcaster_language: string
  display_name: string
  game: string | null
  language: string
  _id: string
  name: string
  created_at: string
  updated_at: string
  partner: boolean
  logo: string
  video_banner: string | null
  profile_banner: string | null
  profile_banner_background_color: string | null
  url: string
  views: number
  followers: number
  broadcaster_type: string
  description: string
  private_video: boolean
  privacy_options_enabled: boolean
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

/**
 * Twitch chatters details.
 */
type ChattersDetails = {
  chatter_count: number
  chatters: Chatters
}

/**
 * Twitch chatters.
 */
export type Chatters = {
  admins: string[]
  global_mods: string[]
  moderators: string[]
  staff: string[]
  viewers: string[]
}

/**
 * Twitch clip.
 */
export type Clip = {
  broadcast_id: string
  broadcaster: ClipUser
  created_at: string
  curator: ClipUser
  duration: number
  embed_html: string
  embed_url: string
  game: string
  language: string
  slug: string
  thumbnails: {
    medium: string
    small: string
    tiny: string
  }
  title: string
  tracking_id: string
  url: string
  views: number
  vod: {
    id: string
    offset: number
    preview_image_url: string
    url: string
  }
}

/**
 * Twitch clip user details.
 */
type ClipUser = {
  channel_url: string
  display_name: string
  id: string
  logo: string
  name: string
}
