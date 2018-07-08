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
 * Twitch base Helix URL.
 */
const baseHelixUrl = 'https://api.twitch.tv/helix'

/**
 * RegExp used to identify whisper command (/w user message).
 */
const WhisperRegExp = /^\/w \S+ .+/

/**
 * Twitch class.
 */
export default class Twitch {
  /**
   * Sets the Twitch token and user id to use for authenticated calls.
   * @param id - The user id or null to invalidate.
   * @param token - The token or null to invalidate.
   */
  public static setAuthDetails(id: string | null, token: string | null = null) {
    Twitch.userId = id
    Twitch.token = token
  }

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
    url.searchParams.set('scope', 'openid chat_login user_read user_blocks_edit clips:edit')

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
  public static async fetchBadges(channelId: string): Promise<RawBadges> {
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
  public static async fetchUser(id: string): Promise<RawUser> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/users/${id}`)

    return response.json()
  }

  /**
   * Fetches details about a channel.
   * @param  id - The channel id.
   * @return The channel details.
   */
  public static async fetchChannel(id: string): Promise<RawChannel> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/channels/${id}`)

    return response.json()
  }

  /**
   * Fetches details about a stream.
   * @param  id - The channel id.
   * @return The stream details.
   */
  public static async fetchStream(id: string): Promise<{ stream: RawStream | null }> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/streams/${id}`)

    return response.json()
  }

  /**
   * Fetches videos for a channel.
   * @param  id - The channel id.
   * @param  [limit=10] - Number of videos to return.
   * @param  [type=BroadcastType.Archive] - Type of videos to return.
   * @return The channel videos.
   */
  public static async fetchChannelVideos(id: string, limit = 10, type = BroadcastType.Archive): Promise<RawVideos> {
    const url = new URL(`${baseKrakenUrl}/channels/${id}/videos`)
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('broadcast_type', type)

    const response = await Twitch.fetch(url.toString())

    return response.json()
  }

  /**
   * Creates a clip.
   * @param  id - The channel id.
   * @param  [withDelay=false] - Add a delay before capturing the clip.
   * @return The new clip details.
   */
  public static async createClip(id: string, withDelay = false): Promise<RawNewClips> {
    const url = new URL(`${baseHelixUrl}/clips`)
    url.searchParams.append('broadcaster_id', id)
    url.searchParams.append('has_delay', withDelay.toString())

    const response = await Twitch.fetch(url.toString(), Twitch.getAuthHeader(true), {
      method: 'POST',
    })

    return response.json()
  }

  /**
   * Fetches cheermotes.
   * @return The cheermotes.
   */
  public static async fetchCheermotes(): Promise<{ actions: RawCheermote[] }> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/bits/actions`)

    return response.json()
  }

  /**
   * Fetches details about a clip.
   * @param  slug - The clip slug.
   * @return The clip details.
   */
  public static async fetchClip(slug: string): Promise<RawClip> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/clips/${slug}`)

    return response.json()
  }

  /**
   * Fetches details about multiple clips.
   * @param  slug - The clip slugs.
   * @return The clips details.
   */
  public static async fetchClips(slugs: string[]): Promise<RawClip[]> {
    const requests = _.map(slugs, async (slug) => Twitch.fetchClip(slug))

    return Promise.all(requests)
  }

  /**
   * Fetches chatters of a specific channel.
   * @param  channel - The channel.
   * @return The chatter.
   */
  public static async fetchChatters(channel: string): Promise<RawChattersDetails> {
    const response = await Twitch.fetch(
      `https://cors-anywhere.herokuapp.com/${baseTmiUrl}/group/user/${channel}/chatters`
    )

    return response.json()
  }

  /**
   * Fetches all followed streams for the current authenticated user.
   * @return The follows.
   */
  public static async fetchAuthenticatedUserFollows(): Promise<RawFollows> {
    const url = new URL(`${baseKrakenUrl}/users/${Twitch.userId}/follows/channels`)
    url.searchParams.append('limit', '100')
    url.searchParams.append('sortby', 'last_broadcast')

    const response = await Twitch.fetch(url.toString(), Twitch.getAuthHeader())

    return response.json()
  }

  /**
   * Fetches all online followed streams for the current authenticated user.
   * @return The streams.
   */
  public static async fetchAuthenticatedUserStreams(): Promise<RawStreams> {
    const url = new URL(`${baseKrakenUrl}/streams/followed`)
    url.searchParams.append('limit', '100')
    url.searchParams.append('stream_type', 'live')

    const response = await Twitch.fetch(url.toString(), Twitch.getAuthHeader())

    return response.json()
  }

  /**
   * Fetches details about the current authenticated user.
   * @return The user details.
   */
  public static async fetchAuthenticatedUser(): Promise<AuthenticatedUserDetails> {
    const response = await Twitch.fetch(`${baseKrakenUrl}/user`, Twitch.getAuthHeader())

    return response.json()
  }

  /**
   * Blocks a user.
   * @param  userId - The user id of the current user.
   * @param  targetId - The user id of the user to block.
   */
  public static async blockUser(targetId: string): Promise<RawBlockerUser> {
    const response = await Twitch.fetch(
      `${baseKrakenUrl}/users/${Twitch.userId}/blocks/${targetId}`,
      Twitch.getAuthHeader(),
      {
        method: 'PUT',
      }
    )

    return response.json()
  }

  /**
   * Defines if an object is either a live stream or a followed channel.
   * @param  streamOrChannel - The stream or channel to identify.
   * @return `true` of the parameter is a live stream.
   */
  public static isStream(streamOrChannel: RawStream | RawChannel): streamOrChannel is RawStream {
    return !_.isNil(_.get(streamOrChannel, 'stream_type'))
  }

  private static token: string | null
  private static userId: string | null

  /**
   * Fetches an URL.
   * @param  url - The URL to fetch.
   * @param  additionalHeaders -  Additional headers to pass down to the query.
   * @return The response.
   */
  private static async fetch(url: string, additionalHeaders?: { [key: string]: string }, options: RequestInit = {}) {
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

    const response = await fetch(request)

    if (response.status !== 200) {
      const json = await response.json()

      const { message } = JSON.parse(_.get(json, 'message'))

      throw new Error(message)
    }

    return response
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

  /**
   * Returns an auth header that can be used for authenticated request or throw.
   * @param  [useHelix=false] - Defines if the API call will use the new Twitch API or not.
   * @return The header.
   */
  private static getAuthHeader(useHelix = false) {
    if (_.isNil(Twitch.token)) {
      throw new Error('Missing token for authenticated request.')
    }

    return { Authorization: `${useHelix ? 'Bearer' : 'OAuth'} ${Twitch.token}` }
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
export type RawBadges = {
  [key: string]: {
    versions: {
      [key: string]: RawBadge
    }
  }
}

/**
 * Twitch badge.
 */
export type RawBadge = {
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
export type RawUser = {
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
export type RawChannel = {
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
export interface AuthenticatedUserDetails extends RawUser {
  email: string
  email_verified: boolean
  partnered: boolean
  twitter_connected: boolean
}

/**
 * Twitch chatters details.
 */
type RawChattersDetails = {
  chatter_count: number
  chatters: RawChatters
}

/**
 * Twitch chatters.
 */
export type RawChatters = {
  admins: string[]
  global_mods: string[]
  moderators: string[]
  staff: string[]
  viewers: string[]
}

/**
 * Twitch clip.
 */
export type RawClip = {
  broadcast_id: string
  broadcaster: RawClipUser
  created_at: string
  curator: RawClipUser
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
 * Twitch clip user.
 */
type RawClipUser = {
  channel_url: string
  display_name: string
  id: string
  logo: string
  name: string
}

/**
 * Blocked user.
 */
type RawBlockerUser = {
  user: {
    _id: string
    bio: string | null
    created_at: string
    display_name: string
    logo: string | null
    name: string
    type: string
    updated_at: string
  }
}

/**
 * Twitch follows.
 */
export type RawFollows = {
  follows: Array<{ created_at: string; notifications: true; channel: RawChannel }>
  _total: number
}

/**
 * Twitch streams.
 */
export type RawStreams = {
  streams: RawStream[]
  _total: number
}

/**
 * Twitch stream.
 */
export type RawStream = {
  average_fps: number
  broadcast_platform: string
  channel: RawChannel
  community_id: string
  community_ids: string[]
  created_at: string
  delay: number
  game: number
  is_playlist: boolean
  preview: RawPreview
  stream_type: string
  video_height: number
  viewers: number
  _id: string
}

/**
 * Twitch Cheermote.
 */
export type RawCheermote = {
  background: string[]
  prefix: string
  priority: number
  scales: string[]
  tiers: RawCheermoteTier[]
  type: string
  updated_at: string
}

/**
 * Twitch Cheermote tier.
 */
type RawCheermoteTier = {
  can_cheer: boolean
  color: string
  id: string
  images: { [key in CheermoteImageBackground]: RawCheermoteImages }
  min_bits: number
}

/**
 * Twitch videos.
 */
export type RawVideos = {
  videos: RawVideo[]
  _total: number
}

export type RawVideo = {
  animated_preview_url: string
  broadcast_id: number
  broadcast_type: BroadcastType
  channel: RawChannel
  communities: string[]
  created_at: string
  description: string | null
  description_html: string | null
  game: string
  language: string
  length: number
  preview: RawPreview
  published_at: string
  recorded_at: string
  restriction: string
  status: string
  tag_list: string
  title: string
  url: string
  viewable: string
  viewable_at: string | null
  views: number
  _id: string
}

/**
 * Twitch preview.
 */
type RawPreview = {
  large: string
  medium: string
  small: string
  template: string
}

/**
 * Twitch new clip.
 */
type RawNewClips = {
  data: Array<{ edit_url: string; id: string }>
}

/**
 * Twitch Cheermote images.
 */
type RawCheermoteImages = { [key in CheermoteImageType]: RawCheermoteImage }

/**
 * Twitch Cheermote image.
 */
export type RawCheermoteImage = { [key in CheermoteImageScales]: string }

/**
 * Cheermotes related types.
 */
export type CheermoteImageBackground = 'dark' | 'light'
type CheermoteImageType = 'static' | 'animated'
type CheermoteImageScales = '1' | '1.5' | '2' | '3' | '4'

/**
 * Twitch broadcast type.
 */
export enum BroadcastType {
  Archive = 'archive',
  Highlight = 'highlight',
  Upload = 'upload',
}
