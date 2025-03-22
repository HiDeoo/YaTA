import * as storage from 'localforage'
import _ from 'lodash'

import RequestMethod from 'constants/requestMethod'
import { getRandomString } from 'utils/crypto'
import { subDays, subMonths } from 'utils/date'
import type { TwitchEmote } from './EmotesProvider'

/**
 * Twitch various APIs.
 */
enum TwitchApi {
  Auth = 'https://id.twitch.tv/oauth2',
  Badges = 'https://badges.twitch.tv/v1/badges',
  Helix = 'https://api.twitch.tv/helix',
  Tmi = 'https://tmi.twitch.tv',
}

/**
 * Twitch broadcast type.
 */
export enum BroadcastType {
  All = 'all',
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
const ProxyURL = 'https://cors.bridged.cc/'

/**
 * The key used to persist a state used while authenticating with Twitch.
 */
const AuthStorageKey = 'persist:YaTA:auth'

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
   * @param redirect - The optional channel to use when redirecting the user after authentication.
   * @return The auth URL.
   */
  public static getAuthURL(redirect: Optional<string>) {
    const { REACT_APP_TWITCH_CLIENT_ID, REACT_APP_TWITCH_REDIRECT_URI } = process.env

    const state: AuthState = {
      token: getRandomString(),
      redirect: redirect,
    }

    storage.setItem(AuthStorageKey, state)

    const params = {
      client_id: REACT_APP_TWITCH_CLIENT_ID,
      redirect_uri: REACT_APP_TWITCH_REDIRECT_URI,
      response_type: 'token id_token',
      scope:
        'openid chat:read chat:edit channel:moderate whispers:read whispers:edit user_blocks_edit clips:edit user:edit:follows user:edit:broadcast channel:edit:commercial user_subscriptions moderator:manage:automod user:read:follows',
      state: encodeURIComponent(JSON.stringify(state)),
    }

    return Twitch.getUrl(TwitchApi.Auth, '/authorize', params)
  }

  /**
   * Returns the auth response token.
   * @param hash - The URL hash to parse
   * @return The parsed tokens.
   */
  public static async getAuthTokens(hash: string) {
    const params = new URLSearchParams(hash.substring(1))

    if (!params.has('access_token') || !params.has('id_token') || !params.has('state')) {
      throw new Error('Invalid auth response.')
    }

    const persistedState = await storage.getItem<AuthState>(AuthStorageKey)

    storage.removeItem(AuthStorageKey)

    if (_.isNil(persistedState)) {
      throw new Error('No persisted state in storage.')
    }

    const stateStr = params.get('state')

    if (_.isNil(stateStr)) {
      throw new Error('No state in response.')
    }

    let state: AuthState

    try {
      state = JSON.parse(decodeURIComponent(stateStr))
    } catch (error) {
      throw new Error('Unable to parse state from response.')
    }

    if (state.token !== persistedState.token) {
      throw new Error('Invalid state from response.')
    }

    return {
      access: params.get('access_token') as string,
      id: params.get('id_token') as string,
      redirect: state.redirect,
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
   * Returns the URL to use to embed Twitch content.
   * @param  url - The Twitch URL to embed.
   * @return The parent parameter.
   */
  public static getTwitchEmbedUrl(url: string): string {
    return url.concat('&parent=yata.vercel.app')
  }

  /**
   * Returns an URL based on a URL template returned by Twitch.
   * @param  templateUrl - The URL template.
   * @param  params - An object describing the key & associated values for each template segments.
   * @return The transformed URL.
   */
  public static getTwitchTemplatedUrl(templateUrl: string, params: Record<string, string>): string {
    let url = templateUrl

    _.forEach(params, (value, key) => {
      const regExp = new RegExp(`%{${key}}`, 'g')
      url = url.replace(regExp, value)
    })

    return url
  }

  /**
   * Opens a specific Twitch channel.
   * @param channel - The channel.
   */
  public static openChannel(channel: string) {
    window.open(`https://www.twitch.tv/${channel}`)
  }

  /**
   * Opens the viewer card of a specific user.
   * @param channel - The channel.
   * @param username - The user.
   */
  public static openViewerCard(channel: string, username: string) {
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
  public static openRewardsQueue(channel: string) {
    window.open(
      `https://www.twitch.tv/popout/${channel}/reward-queue`,
      'twitchRewardsQueuePopupWindow',
      'height=500,width=800'
    )
  }

  /**
   * Opens the Twitch mod view of a specific channel.
   * @param channel - The channel.
   */
  public static openModView(channel: string) {
    window.open(`https://www.twitch.tv/moderator/${channel}`, 'twitchModViewPopupWindow', 'height=800,width=1200')
  }

  /**
   * Opens the Twitch stream manager of a specific channel.
   * @param channel - The channel.
   */
  public static openStreamManager(channel: string) {
    window.open(
      `https://dashboard.twitch.tv/u/${channel}/stream-manager`,
      'twitchStreamManagerPopupWindow',
      'height=800,width=1200'
    )
  }

  /**
   * Opens the Twitch stream summary of a specific channel.
   * @param channel - The channel.
   */
  public static openStreamSummary(channel: string) {
    window.open(
      `https://dashboard.twitch.tv/u/${channel}/stream-summary`,
      'twitchStreamSummaryPopupWindow',
      'height=800,width=1200'
    )
  }

  /**
   * Opens the Twitch stream infos of a specific channel.
   * @param channel - The channel.
   */
  public static openStreamInfos(channel: string) {
    window.open(
      `https://www.twitch.tv/popout/${channel}/dashboard/live/stream-info`,
      'twitchStreamInfosPopupWindow',
      'height=600,width=500'
    )
  }

  /**
   * Opens the Twitch activity feed of a specific channel.
   * @param channel - The channel.
   */
  public static openActivityFeed(channel: string) {
    window.open(
      `https://www.twitch.tv/popout/${channel}/dashboard/live/activity-feed`,
      'twitchActivityFeedPopupWindow',
      'height=800,width=500'
    )
  }

  /**
   * Opens the video player of a specific channel.
   * @param channel - The channel.
   */
  public static openVideoPlayer(channel: string) {
    window.open(
      Twitch.getTwitchEmbedUrl(`https://player.twitch.tv/?muted=false&channel=${channel}`),
      'videoPopupWindow',
      'height=360,width=600'
    )
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
   * Fetches informations about a channel.
   * @param  channelId - The channel id.
   * @return The channel informations.
   */
  public static async fetchChannelInformations(channelId: string): Promise<RawChannelInformations> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      '/channels',
      { broadcaster_id: channelId },
      true,
      RequestMethod.Get
    )

    return (await response.json()).data[0]
  }

  /**
   * Updates a channel informations.
   * @param  channelId - The id of the channel to update.
   * @param  title - The channel status / title.
   * @param  categoryId - The channel category ID.
   * @return The updated channel.
   */
  public static async updateChannelInformations(channelId: string, title: string, categoryId?: string) {
    const params: Record<string, string> = { broadcaster_id: channelId, title }

    if (categoryId) {
      params['game_id'] = categoryId
    }

    return Twitch.fetch(TwitchApi.Helix, '/channels', params, true, RequestMethod.Patch)
  }

  /**
   * Starts a commercial on a channel.
   * @param channelId - The id of the channel.
   * @param duration - The commercial duration.
   */
  public static async startCommercial(channelId: string, duration: CommercialDuration) {
    const response = await Twitch.fetch(TwitchApi.Helix, '/channels/commercial', undefined, true, RequestMethod.Post, {
      broadcaster_id: channelId,
      length: duration,
    })

    return response.json()
  }

  /**
   * Creates a stream marker.
   * @param channelId - The id of the channel.
   * @param description - A description of the marker.
   */
  public static async createMarker(channelId: string, description: Optional<string>) {
    const response = await Twitch.fetch(TwitchApi.Helix, '/streams/markers', undefined, true, RequestMethod.Post, {
      user_id: channelId,
      description,
    })

    return response.json()
  }

  /**
   * Fetches emote sets.
   * @param  emoteSetIds - The list of emote set ids to fetch.
   * @return The associated emotes.
   */
  public static async fetchEmoteSets(emoteSetIds: string[]): Promise<TwitchEmote[]> {
    if (_.isNil(Twitch.userId)) {
      throw new Error('Missing user id for emotes fetching.')
    }

    const emoteSetIdChunks = _.chunk(emoteSetIds, 25)

    const emoteSets: TwitchEmote[][] = await Promise.all(
      emoteSetIdChunks.map(async (chunk) => {
        const response = await Twitch.fetch(
          TwitchApi.Helix,
          '/chat/emotes/set',
          { emote_set_id: chunk },
          true,
          RequestMethod.Get
        )

        return (await response.json()).data
      })
    )

    return emoteSets.flat()
  }

  /**
   * Approves or denies a message rejected by AutoMod.
   * @param messageId - The ID of the rejected message.
   * @param action - The action to either allow or deny the rejected message.
   */
  public static manageAutoModMessage(messageId: string, action: 'allow' | 'deny') {
    if (_.isNil(Twitch.userId)) {
      throw new Error('Missing source user id for relationship fetching.')
    }

    return Twitch.fetch(
      TwitchApi.Helix,
      '/moderation/automod/message',
      {
        action: action.toUpperCase(),
        msg_id: messageId,
        user_id: Twitch.userId,
      },
      true,
      RequestMethod.Post
    )
  }

  /**
   * Returns the top clips for a specific channel.
   * @param  channelId - The ID of the channel.
   * @param  period - The period to include.
   * @param  [limit=10] - The number of clips to return.
   * @return The top clips.
   */
  public static async fetchTopClips(channelId: string, period: ClipPeriod, limit = 10): Promise<RawClip[]> {
    const params: Record<string, string> = {
      broadcaster_id: channelId,
      first: limit.toString(),
    }

    if (period !== ClipPeriod.All) {
      const now = new Date()

      params['ended_at'] = now.toISOString()

      if (period === ClipPeriod.Day) {
        params['started_at'] = subDays(now, 1).toISOString()
      } else if (period === ClipPeriod.Week) {
        params['started_at'] = subDays(now, 7).toISOString()
      } else if (period === ClipPeriod.Month) {
        params['started_at'] = subMonths(now, 1).toISOString()
      }
    }

    const response = await Twitch.fetch(TwitchApi.Helix, '/clips', params, true, RequestMethod.Get)

    return (await response.json()).data
  }

  /**
   * Fetches details about a stream.
   * @param  channelId - The channel id.
   * @return The stream details.
   */
  public static async fetchStream(channelId: string): Promise<RawStream | null> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      `/streams`,
      {
        user_id: channelId,
      },
      true
    )

    return (await response.json()).data[0]
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
  ): Promise<RawVideo[]> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      '/videos',
      {
        first: limit.toString(),
        type,
        user_id: channelId,
      },
      true,
      RequestMethod.Get
    )

    return (await response.json()).data
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
  public static async fetchCheermotes(channelId: string): Promise<{ data: RawCheermote[] }> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      '/bits/cheermotes',
      {
        broadcaster_id: channelId,
      },
      true,
      RequestMethod.Get
    )

    return response.json()
  }

  /**
   * Fetches details about a clip.
   * @param  clipId - The clip ID.
   * @return The clip details.
   */
  public static async fetchClip(clipId: string): Promise<RawClip> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      '/clips',
      {
        id: clipId,
      },
      true,
      RequestMethod.Get
    )

    return (await response.json()).data[0]
  }

  /**
   * Fetches details about a video.
   * @param  videoId - The video id.
   * @return The video details.
   */
  public static async fetchVideo(videoId: string): Promise<RawVideo> {
    const response = await Twitch.fetch(
      TwitchApi.Helix,
      '/videos',
      {
        id: videoId,
      },
      true,
      RequestMethod.Get
    )

    return (await response.json()).data[0]
  }

  /**
   * Fetches chatters of a specific channel.
   * @param  channel - The channel.
   * @return The chatter.
   */
  public static async fetchChatters(channel: string): Promise<RawChattersDetails> {
    const response = await fetch(Twitch.getUrl(TwitchApi.Tmi, `/group/user/${channel}/chatters`, undefined, true), {
      headers: {
        'X-Requested-With': '',
      },
    })

    return response.json()
  }

  /**
   * Fetches streams for the current user which consist of online streams and its own online stream if streaming.
   * @return The streams.
   */
  public static async fetchStreams(): Promise<Streams> {
    const streams = await Twitch.fetchAuthenticatedUserStreams()

    let own: RawStream | null = null

    if (!_.isNil(this.userId)) {
      const stream = await Twitch.fetchStream(this.userId)

      if (!_.isNil(stream)) {
        own = stream
      }
    }

    return { online: streams, own }
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
      user_id: Twitch.userId,
      broadcaster_id: targetId,
    }

    const response = await Twitch.fetch(TwitchApi.Helix, '/channels/followed', params)
    const relationships = (await response.json()) as RawRelationships

    if (relationships.data.length === 1) {
      const relationship = _.head(relationships.data)

      if (!_.isNil(relationship)) {
        return relationship
      }
    }

    return null
  }

  /**
   * Fetches the total number of followers of a specific user.
   * @param  targetId - The target user id.
   * @return The total number of followers.
   */
  public static async fetchFollowersCount(targetId: string) {
    const response = await Twitch.fetch(TwitchApi.Helix, '/channels/followers', { broadcaster_id: targetId })
    const relationships = (await response.json()) as RawRelationships

    return relationships.total
  }

  /**
   * Fetches all online followed streams for the current authenticated user.
   * @param  [offset=0] - The offset to use while fetching streams.
   * @param  [limit=100] - The number of streams to fetch per query.
   * @return The streams.
   */
  public static async fetchAuthenticatedUserStreams(limit = 100, offset?: string): Promise<RawStream[]> {
    if (_.isNil(Twitch.userId)) {
      throw new Error('Missing user id to fetch user streams.')
    }

    const params: { user_id: string; first: string; after?: string } = {
      user_id: Twitch.userId,
      first: limit.toString(),
      after: offset?.toString(),
    }

    const response = await Twitch.fetch(TwitchApi.Helix, '/streams/followed', params, true)

    const { data, pagination } = (await response.json()) as RawStreams

    let allStreams = [...data]

    if (allStreams.length === limit) {
      const nextStreams = await Twitch.fetchAuthenticatedUserStreams(limit, pagination.cursor)

      allStreams = [...allStreams, ...nextStreams]
    }

    return allStreams
  }

  /**
   * Blocks a user.
   * @param  targetId - The id of the user to block.
   */
  public static blockUser(targetId: string) {
    return Twitch.fetch(
      TwitchApi.Helix,
      '/users/blocks',
      { target_user_id: targetId, source_context: 'chat' },
      true,
      RequestMethod.Put
    )
  }

  /**
   * Unblocks a user.
   * @param  targetId - The id of the user to unblock.
   */
  public static unblockUser(targetId: string) {
    return Twitch.fetch(TwitchApi.Helix, '/users/blocks', { target_user_id: targetId }, true, RequestMethod.Delete)
  }

  /**
   * Fetches the schedule of a specific channel.
   * @param channelId - The id of the channel.
   * @return The schedule of a channel if any.
   */
  public static async fetchSchedule(channelId: string) {
    const response = await Twitch.fetch(TwitchApi.Helix, '/schedule', {
      broadcaster_id: channelId,
      first: '25',
      utc_offset: new Date().getTimezoneOffset().toString(),
    })
    const schedule = (await response.json()) as RawSchedule

    return schedule.data
  }

  /**
   * Defines if an object is either a stream or a follow.
   * @param  streamOrFollow - The stream or follow to identify.
   * @return `true` of the parameter is a stream.
   */
  public static isStream(streamOrFollow: RawStream | RawFollow): streamOrFollow is RawStream {
    return !_.isNil(_.get(streamOrFollow, 'started_at'))
  }

  private static token: string | null
  private static userId: string | null

  /**
   * Returns the ID of the current authenticated user.
   * @return The user ID.
   */
  public static getAuthenticatedUserId(): string {
    if (_.isNil(Twitch.userId)) {
      throw new Error('No user ID found.')
    }

    return Twitch.userId
  }

  /**
   * Returns the token of the current authenticated user.
   * @return The token.
   */
  public static getAuthenticatedUserToken(): string {
    if (_.isNil(Twitch.token)) {
      throw new Error('No token found.')
    }

    return Twitch.token
  }

  /**
   * Returns the URL for a request.
   * @param  api - The Twitch API to use.
   * @param  endpoint - The endpoint to fetch.
   * @param  [searchParams] - Additional search parameters.
   * @param  [proxy=false] - `true` to use a CORS proxy.
   * @return The URL.
   */
  private static getUrl(
    api: TwitchApi,
    endpoint: string,
    searchParams: Record<string, string | string[]> = {},
    proxy = false
  ) {
    const url = new URL(`${proxy ? ProxyURL : ''}${api}${endpoint}`)

    _.forEach(searchParams, (value, key) => {
      if (_.isString(value)) {
        url.searchParams.set(key, value)
      } else {
        _.forEach(value, (v) => url.searchParams.append(key, v))
      }
    })

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
    searchParams: Record<string, string | string[]> = {},
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
 * Twitch user details returned by the Helix API.
 */
export type RawHelixUser = {
  broadcaster_type: 'partner' | 'affiliate' | ''
  created_at: string
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
 * Twitch channel informations.
 */
export type RawChannelInformations = {
  broadcaster_id: string
  broadcaster_name: string
  broadcaster_language: string
  game_id: string
  game_name: string
  title: string
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
  broadcaster_id: string
  broadcaster_name: string
  created_at: string
  creator_id: string
  creator_name: string
  embed_url: string
  game_id: string
  id: string
  language: string
  thumbnail_url: string
  title: string
  url: string
  video_id: string
  view_count: number
}

/**
 * Twitch follows.
 */
export type RawFollows = {
  data: RawFollow[]
  pagination: {
    cursor: string
  }
}

/**
 * Twitch follow.
 */
export type RawFollow = {
  followed_at: string
  from_id: string
  from_login: string
  from_name: string
  to_id: string
  to_login: string
  to_name: string
  notifications: true
  channel: RawChannel
}

/**
 * Twitch streams.
 */
export type RawStreams = {
  data: RawStream[]
  pagination: {
    cursor: string
  }
}

/**
 * Twitch stream.
 */
export type RawStream = {
  game_id: string
  game_name: string
  id: string
  language: string
  started_at: string
  tag_ids: string
  thumbnail_url: string
  title: string
  type: string
  user_id: string
  user_login: string
  user_name: string
  viewer_count: number
}

/**
 * Twitch Cheermote.
 */
export type RawCheermote = {
  is_charitable: boolean
  last_updated: string
  order: number
  prefix: string
  tiers: RawCheermoteTier[]
  type: 'global_first_party' | 'global_third_party' | 'channel_custom' | 'display_only' | 'sponsored'
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
  show_in_bits_card: boolean
}

/**
 * Twitch video.
 */
export type RawVideo = {
  id: string
  user_id: string
  user_name: string
  title: string
  description: string
  created_at: string
  published_at: string
  url: string
  thumbnail_url: string
  viewable: 'public' | 'private'
  view_count: number
  language: string
  type: Exclude<BroadcastType, BroadcastType.All>
  duration: string
}

/**
 * Twitch new clip.
 */
type RawNewClips = {
  data: Array<{ edit_url: string; id: string }>
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
 * Twitch schedule.
 */
export type RawSchedule = {
  data: {
    segments: RawScheduleSegment[]
    broadcaster_id: string
    broadcaster_name: String
    broadcaster_login: string
    vacation: null | { start_time: string; end_time: string }
  }
  pagination: {
    cursor: string
  }
}

/**
 * Twitch schedule segment.
 */
export type RawScheduleSegment = {
  id: string
  start_time: string
  end_time: string
  title: string
  canceled_until: string | null
  category: null | {
    id: string
    name: string
  }
  is_recurring: boolean
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
 * Online streams and own stream if online.
 */
export type Streams = {
  online: RawStream[]
  own: RawStream | null
}

/**
 * State send to Twitch while authenticating.
 */
interface AuthState {
  token: string
  redirect?: string
}
