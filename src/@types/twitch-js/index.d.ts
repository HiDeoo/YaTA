declare module 'twitch-js' {
  import { Emote } from 'libs/EmotesProvider'
  import Event from 'constants/event'
  import LogType from 'constants/logType'
  import ReadyState from 'constants/readyState'
  import RitualType from 'constants/ritualType'

  type ClientOptions = {
    options?: {
      clientId: string
      debug: boolean
    }
    connection?: {
      server?: string
      port?: number
      reconnect?: boolean
      maxReconnectAttempts?: number
      maxReconnectInterval?: number
      reconnectDecay?: number
      reconnectInterval?: number
      secure?: boolean
      timeout?: number
    }
    identity?: {
      username: string
      password: string
    }
    channels: string[]
    logger?: {
      info: (message: string) => void
      warn: (message: string) => void
      error: (message: string) => void
    }
  }

  type Badges = Record<string, string>

  export type Emotes = Record<string, string[]>

  export type RoomState = {
    'broadcaster-lang'?: string | null
    'emote-only'?: boolean
    'followers-only'?: string | boolean
    r9k?: boolean
    rituals?: boolean
    'room-id': string
    slow?: boolean | string
    'subs-only'?: boolean
    channel: string
  }

  export type UserState = {
    badges: Badges | null
    bits?: number
    color: string | null
    'display-name': string
    emotes: Emotes | null
    id: string
    'msg-id'?: string | null
    mod: boolean
    'room-id'?: string
    'thread-id'?: string
    subscriber: boolean
    'tmi-sent-ts': string
    turbo?: boolean
    'message-id'?: string
    'user-id': string
    'user-type': null
    'emotes-raw'?: string
    'badges-raw': string
    username: string
    'message-type': LogType.Action | LogType.Chat | LogType.Whisper | LogType.Cheer
  }

  export type Payment = {
    prime: boolean
    plan: string
    planName: string
  }

  export type Ritual = {
    channel: string
    username: string
    type: RitualType
    userstate: UserState
  }

  export type Raid = {
    channel: string
    raider: string
    viewers: number
    userstate: UserState
  }

  export type EmoteSets = Record<number, Emote[]>

  export class Client {
    constructor()
    connect(): void
    disconnect(): void
    join(channel: string): void
    removeAllListeners(event?: Event): void
    readyState(): ReadyState

    on(
      event: Event.Message,
      listener: (channel: string, userstate: UserState, message: string, self: boolean, msgId: string | null) => void
    ): void
    on(event: Event.Notice, listener: (channel: string, msgid: string, message: string) => void): void
    on(event: Event.Connecting, listener: (adress: string, port: number) => void): void
    on(event: Event.Connected, listener: (adress: string, port: number) => void): void
    on(event: Event.Logon, listener: () => void): void
    on(event: Event.Disconnected, listener: (reason: string) => void): void
    on(event: Event.Reconnect, listener: () => void): void
    on(event: Event.Roomstate, listener: (channel: string, state: RoomState) => void): void
    on(event: Event.Clearchat, listener: (channel: string) => void): void
    on(event: Event.FollowersOnly, listener: (channel: string, enabled: boolean, length: number) => void): void
    on(event: Event.EmoteOnly, listener: (channel: string, enabled: boolean) => void): void
    on(
      event: Event.Hosted,
      listener: (channel: string, username: string, viewers: number, autohost: boolean) => void
    ): void
    on(event: Event.Hosting, listener: (channel: string, target: string, viewers: number) => void): void
    on(event: Event.R9k, listener: (channel: string, enabled: boolean) => void): void
    on(event: Event.Slowmode, listener: (channel: string, enabled: boolean, length: number) => void): void
    on(event: Event.Subscribers, listener: (channel: string, enabled: boolean) => void): void
    on(event: Event.Unhost, listener: (channel: string, viewers: number) => void): void
    on(event: Event.Ban, listener: (channel: string, username: string, reason: string | null) => void): void
    on(
      event: Event.Timeout,
      listener: (channel: string, username: string, reason: string | null, duration: number) => void
    ): void
    on(event: Event.Mod, listener: (channel: string, username: string) => void): void
    on(event: Event.Unmod, listener: (channel: string, username: string) => void): void
    on(event: Event.Mods, listener: (channel: string, mods: string[]) => void): void
    on(
      event: Event.Subscription,
      listener: (
        channel: string,
        username: string,
        method: Payment,
        message: string | null,
        userstate: UserState
      ) => void
    ): void
    on(
      event: Event.ReSub,
      listener: (
        channel: string,
        username: string,
        months: number,
        message: string | null,
        userstate: UserState,
        method: Payment,
        monthsStreak: number | null
      ) => void
    ): void
    on(
      event: Event.SubGift,
      listener: (
        channel: string,
        username: string,
        recipient: string,
        method: Omit<Payment, 'prime'>,
        userstate: UserState
      ) => void
    ): void
    on(event: Event.Ritual, listener: (ritual: Ritual) => void): void
    on(event: Event.Raid, listener: (raid: Raid) => void): void
    on(event: Event.Cheer, listener: (channel: string, userstate: UserState, message: string) => void): void
    on(event: Event.EmoteSets, listener: (setsList: string, sets: EmoteSets) => void): void
    on(event: Event.Notices, listener: (channel: string, noticeId: string, message: string) => void): void
    on(
      event: Event.MessageDeleted,
      listener: (channel: string, messageId: string, username: string, message: string) => void
    ): void
    on(
      event: Event.UserNotices,
      listener: (channel: string, noticeId: string, message: string, tags: Record<string, string>) => void
    ): void

    say(channel: string, message: string): void
    whisper(username: string, message: string): void
    timeout(channel: string, username: string, length: number, reason?: string): void
    ban(channel: string, username: string, reason?: string): void
    r9kbeta(channel: string): void
    r9kbetaoff(channel: string): void
    slow(channel: string, duration?: number): void
    slowoff(channel: string): void
    followersonly(channel: string, duration?: number): void
    followersonlyoff(channel: string): void
    subscribers(channel: string): void
    subscribersoff(channel: string): void
    emoteonly(channel: string): void
    emoteonlyoff(channel: string): void
    clear(channel: string): void
    unban(channel: string, username: string): void
    unhost(channel: string): void
  }

  namespace Client {}

  const _default: {
    client: (options?: ClientOptions) => Client
  }

  export default _default
}
