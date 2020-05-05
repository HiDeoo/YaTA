import _ from 'lodash'
import { EmoteSets } from 'twitch-js'

import RequestMethod from 'constants/requestMethod'

/**
 * Twitch various APIs.
 */
enum TwitchApi {
  Auth = 'https://id.twitch.tv/oauth2',
  Badges = 'https://badges.twitch.tv/v1/badges',
  Base = 'https://api.twitch.tv',
  Helix = 'https://api.twitch.tv/helix',
  Kraken = 'https://api.twitch.tv/kraken',
  Status = 'https://devstatus.twitch.tv',
  Tmi = 'https://tmi.twitch.tv',
}

/**
 * Twitch broadcast type.
 */
export enum BroadcastType {
  Archive = 'archive',
  Highlight = 'highlight',
  Upload = 'upload',
}

/**
 * Twitch clip discovery period.
 */
export enum ClipPeriod {
  All = 'all',
  Day = 'day',
  Month = 'month',
  Week = 'week',
}

/**
 * Twitch status.
 */
export enum Status {
  Disrupted,
  Online,
  Unknown,
}

/**
 * Twitch commercial durations.
 */
export type CommercialDuration = 30 | 60 | 90 | 120 | 150 | 180

/**
 * CORS proxy URL.
 */
const ProxyURL = 'https://cors-anywhere.herokuapp.com/'

/**
 * Twitch class.
 */
export default class Twitch {
  /**
   * Sets the Twitch token and user id to use for authenticated calls.
   * @param userId - The user id or null to invalidate.
   * @param token - The token or null to invalidate.
   */
  public static setAuthDetails(userId: string | null, token: string | null = null) {
    Twitch.userId = userId
    Twitch.token = token
  }

  /**
   * Returns the Twitch authentication URL.
   * @return The auth URL.
   */
  public static getAuthURL() {
    const { REACT_APP_TWITCH_CLIENT_ID, REACT_APP_TWITCH_REDIRECT_URI } = process.env

    const params = {
      client_id: REACT_APP_TWITCH_CLIENT_ID,
      redirect_uri: REACT_APP_TWITCH_REDIRECT_URI,
      response_type: 'token id_token',
      scope:
        'openid chat:read chat:edit channel:moderate whispers:read whispers:edit user_read user_blocks_edit clips:edit user_follows_edit channel_editor channel_commercial user_subscriptions',
    }

    return Twitch.getUrl(TwitchApi.Auth, '/authorize', params)
  }

  /**
   * Returns the auth response token.
   * @param hash - The URL hash to parse
   * @return The parsed tokens.
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

    const jose = await import('node-jose')

    const keystore = await jose.JWK.asKeyStore(jwk)

    const jws = await jose.JWS.createVerify(keystore).verify(token)

    const idToken = JSON.parse(jws.payload.toString()) as IdToken

    if (_.get(idToken, 'aud') !== process.env.REACT_APP_TWITCH_CLIENT_ID || _.get(idToken, 'iss') !== TwitchApi.Auth) {
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
   * Fetches Twitch global status.
   * @return Twitch global status.
   */
  public static async fetchGlobalStatus(): Promise<Status> {
    const response = await Twitch.fetch(TwitchApi.Status, '/index.json')

    const { status } = (await response.json()) as RawStatus

    return status.indicator === 'none' ? Status.Online : Status.Disrupted
  }

  /**
   * Opens the viewer card of a specific user.
   * @param channel - The channel.
   * @param username - The user.
   */
  public static async openViewerCard(channel: string, username: string) {
    window.open(
      `https://www.twitch.tv/popout/${channel}/viewercard/${username}?popout=`,
      'twitchToolsPopupWindow',
      'height=600,width=500'
    )
  }

  /**
   * Opens the Twitch rewards queue of a specific channel.
   * @param channel - The channel.
   */
  public static async openRewardsQueue(channel: string) {
    window.open(
      `https://www.twitch.tv/popout/${channel}/reward-queue`,
      'twitchRewardsQueuePopupWindow',
      'height=500,width=800'
    )
  }

  /**
   * Opens the video player of a specific channel.
   * @param channel - The channel.
   */
  public static openVideoPlayer(channel: string) {
    window.open(`https://player.twitch.tv/?muted=false&channel=${channel}`, 'videoPopupWindow', 'height=360,width=600')
  }

  /**
   * Fetches Twitch badges.
   * @param channelId - The id of the channel.
   * @return The badges.
   */
  public static async fetchBadges(channelId: string): Promise<RawBadges> {
    const response = await Promise.all([
      (await Twitch.fetch(TwitchApi.Badges, '/global/display')).json(),
      (await Twitch.fetch(TwitchApi.Badges, `/channels/${channelId}/display`)).json(),
    ])

    const [globalBadges, channelBadges] = response

    return { ...globalBadges.badge_sets, ...channelBadges.badge_sets }
  }

  /**
   * Fetches details about a specific user.
   * @param  userId - The user id.
   * @return The user details.
   */
  public static async fetchUser(userId: string): Promise<RawUser> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/users/${userId}`)

    return response.json()
  }

  /**
   * Fetches details about a specific user using its name.
   * @param  name - The user name.
   * @return The user details.
   */
  public static async fetchUserByName(name: string): Promise<Optional<RawHelixUser>> {
    const response = await Twitch.fetch(TwitchApi.Helix, '/users', { login: name }, true, RequestMethod.Get)

    const { data: users }: { data: RawHelixUser[] } = await response.json()

    if (users.length === 1) {
      return _.first(users)
    }

    return
  }

  /**
   * Fetches details about a channel.
   * @param  channelId - The channel id.
   * @return The channel details.
   */
  public static async fetchChannel(channelId: string): Promise<RawChannel> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/channels/${channelId}`)

    return response.json()
  }

  /**
   * Updates a channel.
   * @param  channelId - The id of the channel to update.
   * @param  title - The channel status / title.
   * @param  game - The channel game.
   * @return The updated channel.
   */
  public static async updateChannel(channelId: string, title: string, game: string): Promise<RawChannel> {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/channels/${channelId}`,
      undefined,
      true,
      RequestMethod.Put,
      {
        channel: { game, status: title },
      }
    )

    return response.json()
  }

  /**
   * Starts a commercial on a channel.
   * @param channelId - The id of the channel.
   * @param duration - The commercial duration.
   */
  public static async startCommercial(channelId: string, duration: CommercialDuration) {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/channels/${channelId}/commercial`,
      undefined,
      true,
      RequestMethod.Post,
      {
        length: duration,
      }
    )

    return response.json()
  }

  /**
   * Fetches user emotes.
   * @param  channelId - The id of the channel.
   * @return The channel live notification.
   */
  public static async fetchUserEmotes(): Promise<{ emoticon_sets: EmoteSets }> {
    if (_.isNil(Twitch.userId)) {
      throw new Error('Missing user id for emotes fetching.')
    }

    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${Twitch.userId}/emotes`,
      undefined,
      true,
      RequestMethod.Get
    )

    return response.json()
  }

  /**
   * Fetches a channel live notification.
   * @param  channelId - The id of the channel.
   * @return The channel live notification.
   */
  public static async fetchChannelLiveNotification(channelId: string): Promise<RawNotification> {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${channelId}/notifications/custom`,
      { notification_type: 'streamup' },
      true,
      RequestMethod.Get
    )

    return response.json()
  }

  /**
   * Searches for games.
   * @param  query - The query to use for the search.
   * @param  [signal] - A signal to abort the search if necessary.
   * @return The results.
   */
  public static async searchGames(query: string, signal?: AbortSignal): Promise<RawGames> {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      '/search/games',
      { query },
      false,
      RequestMethod.Get,
      undefined,
      signal
    )

    return response.json()
  }

  /**
   * Returns the top clips for a specific channel.
   * @param  channel - The channel.
   * @param  period - The period to include.
   * @param  [limit=10] - The number of clips to return.
   * @return The top clips.
   */
  public static async fetchTopClips(channel: string, period: ClipPeriod, limit = 10): Promise<RawClips> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/clips/top`, { channel, limit: limit.toString(), period })

    return response.json()
  }

  /**
   * Fetches details about a stream.
   * @param  channelId - The channel id.
   * @return The stream details.
   */
  public static async fetchStream(channelId: string): Promise<{ stream: RawStream | null }> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/streams/${channelId}`)

    return response.json()
  }

  /**
   * Fetches videos for a channel.
   * @param  channelId - The channel id.
   * @param  [limit=10] - Number of videos to return.
   * @param  [type=BroadcastType.Archive] - Type of videos to return.
   * @return The channel videos.
   */
  public static async fetchChannelVideos(
    channelId: string,
    limit = 10,
    type = BroadcastType.Archive
  ): Promise<RawVideos> {
    const params = {
      broadcast_type: type,
      limit: limit.toString(),
    }

    const response = await Twitch.fetch(TwitchApi.Kraken, `/channels/${channelId}/videos`, params)

    return response.json()
  }

  /**
   * Creates a clip.
   * @param  channelId - The channel id.
   * @param  [withDelay=false] - Add a delay before capturing the clip.
   * @return The new clip details.
   */
  public static async createClip(channelId: string, withDelay = false): Promise<RawNewClips> {
    const params = {
      broadcaster_id: channelId,
      has_delay: withDelay.toString(),
    }

    const response = await Twitch.fetch(TwitchApi.Helix, '/clips', params, true, RequestMethod.Post)

    return response.json()
  }

  /**
   * Fetches cheermotes.
   * @param channelId - The id of the channel.
   * @return The cheermotes.
   */
  public static async fetchCheermotes(channelId: string): Promise<{ actions: RawCheermote[] }> {
    const response = await Twitch.fetch(TwitchApi.Kraken, '/bits/actions', { channel_id: channelId })

    return response.json()
  }

  /**
   * Fetches details about a clip.
   * @param  slug - The clip slug.
   * @return The clip details.
   */
  public static async fetchClip(slug: string): Promise<RawClip> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/clips/${slug}`)

    return response.json()
  }

  /**
   * Fetches details about a video.
   * @param  videoId - The video id.
   * @return The video details.
   */
  public static async fetchVideo(videoId: string): Promise<RawVideo> {
    const response = await Twitch.fetch(TwitchApi.Kraken, `/videos/${videoId}`)

    return response.json()
  }

  /**
   * Fetches chatters of a specific channel.
   * @param  channel - The channel.
   * @return The chatter.
   */
  public static async fetchChatters(channel: string): Promise<RawChattersDetails> {
    const response = await fetch(Twitch.getUrl(TwitchApi.Tmi, `/group/user/${channel}/chatters`, undefined, true))

    return response.json()
  }

  /**
   * Fetches hosts of a specific channel.
   * @param  channelId - The channel id.
   * @return The hosts.
   */
  public static async fetchHosts(channelId: string): Promise<RawHosts> {
    const response = await fetch(
      Twitch.getUrl(TwitchApi.Tmi, '/hosts', { include_logins: '1', target: channelId }, true)
    )

    return response.json()
  }

  /**
   * Fetches the current host of a specific channel.
   * @param  channelId - The channel id.
   * @return The host.
   */
  public static async fetchHost(channelId: string): Promise<RawHosts> {
    const response = await fetch(Twitch.getUrl(TwitchApi.Tmi, '/hosts', { include_logins: '1', host: channelId }, true))

    return response.json()
  }

  /**
   * Fetches follows for the current user which consist of online streams, offline channels and its own online stream if
   * streaming.
   * @return The streams and channels.
   */
  public static async fetchFollows(): Promise<Followers> {
    const follows = await Twitch.fetchAuthenticatedUserFollows()
    const streams = await Twitch.fetchAuthenticatedUserStreams()

    const offline = _.reduce(
      follows,
      (offlines, follow) => {
        if (_.isNil(_.find(streams, ['channel.name', follow.channel.name]))) {
          offlines.push(follow.channel)
        }

        return offlines
      },
      [] as RawChannel[]
    )

    let own: RawStream | null = null

    if (!_.isNil(this.userId)) {
      const { stream } = await Twitch.fetchStream(this.userId)

      if (!_.isNil(stream)) {
        own = stream
      }
    }

    return { offline, online: streams, own }
  }

  /**
   * Fetches the follow relationship between the current user and another user.
   * @param  targetId - The target user id.
   * @return The follow relationship if any.
   */
  public static async fetchRelationship(targetId: string) {
    if (_.isNil(Twitch.userId)) {
      throw new Error('Missing source user id for relationship fetching.')
    }

    const params = {
      from_id: Twitch.userId,
      to_id: targetId,
    }

    const response = await Twitch.fetch(TwitchApi.Helix, '/users/follows', params)
    const relationships = (await response.json()) as RawRelationships

    if (relationships.total === 1) {
      const relationship = _.head(relationships.data)

      if (!_.isNil(relationship)) {
        return relationship
      }
    }

    return null
  }

  /**
   * Fetches all follows for the current authenticated user.
   * @param  [offset=0] - The offset to use while fetching follows.
   * @param  [limit=100] - The number of follows to fetch per query.
   * @return The follows.
   */
  public static async fetchAuthenticatedUserFollows(offset = 0, limit = 100): Promise<RawFollow[]> {
    const params = {
      limit: limit.toString(),
      offset: offset.toString(),
      sortby: 'last_broadcast',
    }

    const response = await Twitch.fetch(TwitchApi.Kraken, `/users/${Twitch.userId}/follows/channels`, params, true)

    const { follows } = (await response.json()) as RawFollows

    let allFollows = [...follows]

    if (follows.length === limit) {
      const nextFollows = await Twitch.fetchAuthenticatedUserFollows(offset + limit, limit)

      allFollows = [...allFollows, ...nextFollows]
    }

    return allFollows
  }

  /**
   * Fetches all online followed streams for the current authenticated user.
   * @param  [offset=0] - The offset to use while fetching streams.
   * @param  [limit=100] - The number of streams to fetch per query.
   * @return The streams.
   */
  public static async fetchAuthenticatedUserStreams(offset = 0, limit = 100): Promise<RawStream[]> {
    const params = {
      limit: limit.toString(),
      offset: offset.toString(),
      stream_type: 'live',
    }

    const response = await Twitch.fetch(TwitchApi.Kraken, '/streams/followed', params, true)

    const { streams } = (await response.json()) as RawStreams

    let allStreams = [...streams]

    if (allStreams.length === limit) {
      const nextStreams = await Twitch.fetchAuthenticatedUserStreams(offset + limit, limit)

      allStreams = [...allStreams, ...nextStreams]
    }

    return allStreams
  }

  /**
   * Fetches details about the current authenticated user.
   * @return The user details.
   */
  public static async fetchAuthenticatedUser(): Promise<AuthenticatedUserDetails> {
    const response = await Twitch.fetch(TwitchApi.Kraken, '/user', undefined, true)

    return response.json()
  }

  /**
   * Blocks a user.
   * @param  targetId - The id of the user to block.
   * @return The blocked user.
   */
  public static async blockUser(targetId: string): Promise<RawBlockedUser> {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${Twitch.userId}/blocks/${targetId}`,
      undefined,
      true,
      RequestMethod.Put
    )

    return response.json()
  }

  /**
   * Unblocks a user.
   * @param  targetId - The id of the user to unblock.
   */
  public static async unblockUser(targetId: string) {
    return Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${Twitch.userId}/blocks/${targetId}`,
      undefined,
      true,
      RequestMethod.Delete
    )
  }

  /**
   * Follows a channel.
   * @param  targetId - The id of the channel to follow.
   * @param  withNotifications - `true` to get notifications when the channel goes live.
   * @return The follow action.
   */
  public static async followChannel(targetId: string, withNotifications = true): Promise<RawFollowing> {
    const response = await Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${Twitch.userId}/follows/channels/${targetId}`,
      { notifications: withNotifications ? 'true' : 'false' },
      true,
      RequestMethod.Put
    )

    return response.json()
  }

  /**
   * Unfollows a channel.
   * @param  targetId - The id of the channel to unfollow.
   */
  public static async unfollowChannel(targetId: string) {
    return Twitch.fetch(
      TwitchApi.Kraken,
      `/users/${Twitch.userId}/follows/channels/${targetId}`,
      undefined,
      true,
      RequestMethod.Delete
    )
  }

  /**
   * Defines if an object is either a stream or a channel.
   * @param  streamOrChannel - The stream or channel to identify.
   * @return `true` of the parameter is a stream.
   */
  public static isStream(streamOrChannel: RawStream | RawChannel): streamOrChannel is RawStream {
    return !_.isNil(_.get(streamOrChannel, 'stream_type'))
  }

  private static token: string | null
  private static userId: string | null

  /**
   * Returns the URL for a request.
   * @param  api - The Twitch API to use.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams] - Additional search parameters.
   * @param  [proxy=false] - `true` to use a CORS proxy.
   * @return The URL.
   */
  private static getUrl(api: TwitchApi, endpoint: string, searchParams: Record<string, string> = {}, proxy = false) {
    const url = new URL(`${proxy ? ProxyURL : ''}${api}${endpoint}`)

    _.forEach(searchParams, (value, key) => url.searchParams.set(key, value))

    return url.toString()
  }

  /**
   * Fetches an URL.
   * @param  api - The Twitch API to use.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams={}] - Additional search parameters.
   * @param  [authenticated=false] - Defines if the endpoint requires authentication or not.
   * @param  [method=RequestMethod.Get] - The request method.
   * @param  [body] - The request body.
   * @param  [signal] - A signal to abort the query.
   * @return The response.
   */
  private static async fetch(
    api: TwitchApi,
    endpoint: string,
    searchParams: Record<string, string> = {},
    authenticated = false,
    method = RequestMethod.Get,
    body?: object,
    signal?: AbortSignal
  ) {
    const url = Twitch.getUrl(api, endpoint, searchParams)

    const headers = new Headers({
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
      'Content-Type': 'application/json; charset=UTF-8',
    })

    if (authenticated || api === TwitchApi.Helix) {
      const authHeader = Twitch.getAuthHeader(api)

      _.forEach(authHeader, (value, name) => {
        headers.append(name, value)
      })
    }

    const init: RequestInit = { headers, method }

    if (!_.isNil(body)) {
      init.body = JSON.stringify(body)
    }

    if (!_.isNil(signal)) {
      init.signal = signal
    }

    const request = new Request(url, init)

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

  /**
   * Fetches Twitch public JWK.
   * @return The JWK.
   */
  private static async fetchJWK() {
    const jwkReponse = await fetch(Twitch.getUrl(TwitchApi.Auth, '/keys'))

    const jwk = await jwkReponse.json()

    return jwk as JsonWebKey
  }

  /**
   * Returns an auth header that can be used for authenticated request.
   * @param  api - The API to get an auth token for.
   * @return The header.
   */
  private static getAuthHeader(api: TwitchApi) {
    if (_.isNil(Twitch.token)) {
      throw new Error('Missing token for authenticated request.')
    }

    return { Authorization: `${api === TwitchApi.Helix ? 'Bearer' : 'OAuth'} ${Twitch.token}` }
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
export type RawBadges = Record<string, { versions: Record<string, RawBadge> }>

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
 * Twitch user details returned by the Helix API.
 */
export type RawHelixUser = {
  broadcaster_type: 'partner' | 'affiliate' | ''
  description: string
  display_name: string
  email?: string
  id: string
  login: string
  offline_image_url: string
  profile_image_url: string
  type: 'staff' | 'admin' | 'global_mod' | ''
  view_count: number
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
 * Twitch follow response.
 */
type RawFollowing = {
  channel: RawChannel
  created_at: string
  notifications: boolean
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
  broadcaster: string[]
  global_mods: string[]
  moderators: string[]
  staff: string[]
  viewers: string[]
  vips: string[]
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
type RawBlockedUser = {
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
  follows: RawFollow[]
  _total: number
}

/**
 * Twitch follow.
 */
export type RawFollow = { created_at: string; notifications: true; channel: RawChannel }

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
  images: Record<CheermoteImageBackground, RawCheermoteImages>
  min_bits: number
}

/**
 * Twitch videos.
 */
export type RawVideos = {
  videos: RawVideo[]
  _total: number
}

/**
 * Twitch video.
 */
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
 * Twitch clips.
 */
export type RawClips = {
  clips: RawClip[]
  _cursor: string
}

/**
 * Twitch follow relationships.
 */
type RawRelationships = {
  data: RawRelationship[]
  total: number
  pagination: {
    cursor: string
  }
}

/**
 * Twitch follow relationship.
 */
export type RawRelationship = {
  from_id: string
  to_id: string
  followed_at: string
}

/**
 * Twitch notification.
 */
export type RawNotification = {
  is_default: boolean
  message: string
  notification_type: string
  user_id: string
}

/**
 * Twitch games & categories.
 */
export type RawGames = {
  games: RawGame[] | null
}

/**
 * Twitch game or category.
 */
export type RawGame = {
  box: RawPreview
  giantbomb_id: number
  locale: string
  localized_name: string
  logo: RawPreview
  name: string
  popularity: number
  _id: number
}

/**
 * Twitch hosts.
 */
export type RawHosts = {
  hosts: RawHost[]
}

/**
 * Twitch host.
 */
export type RawHost = {
  host_id: string
  targer_id: string
  host_login: string
  target_login: string
  host_display_name: string
  target_display_name: string
}

/**
 * Twitch status.
 */
type RawStatus = {
  status: {
    description: string
    indicator: string
  }
}

/**
 * Twitch Cheermote images.
 */
type RawCheermoteImages = Record<CheermoteImageType, RawCheermoteImage>

/**
 * Twitch Cheermote image.
 */
export type RawCheermoteImage = Record<CheermoteImageScales, string>

/**
 * Cheermotes related types.
 */
export type CheermoteImageBackground = 'dark' | 'light'
type CheermoteImageType = 'static' | 'animated'
type CheermoteImageScales = '1' | '1.5' | '2' | '3' | '4'

/**
 * Online stream, offline channel and own stream if online.
 */
export type Followers = {
  offline: RawChannel[]
  online: RawStream[]
  own: RawStream | null
}

/**
 * Online stream or offline channel.
 */
export type Follower = RawStream | RawChannel
