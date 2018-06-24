declare module 'twitch-js' {
  import Event from 'Constants/event'
  import LogType from 'Constants/logType'

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

  export enum ReadyState {
    Connecting = 'CONNECTING',
    Open = 'OPEN',
    Closing = 'CLOSING',
    Closed = 'CLOSED',
  }

  type Badges = {
    [key: string]: number
  }

  type Emotes = {
    [key: string]: string[]
  }

  export type RoomState = {
    'broadcaster-lang'?: string | null
    'emote-only'?: boolean
    'followers-only'?: string
    r9k?: boolean
    rituals?: boolean
    'room-id': string
    slow?: boolean
    'subs-only'?: boolean
    channel: string
  }

  export type UserState = {
    badges: Badges | null
    color: string | null
    'display-name': string
    emotes: Emotes | null
    id: string
    mod: boolean
    'room-id': string
    subscriber: boolean
    'tmi-sent-ts': string
    turbo: boolean
    'user-id': string
    'user-type': null
    'emotes-raw': string
    'badges-raw': string
    username: string
    'message-type': LogType.Action | LogType.Chat | LogType.Whisper
  }

  export class Client {
    constructor()
    connect(): void
    disconnect(): void
    join(channel: string): void
    removeAllListeners(event?: Event): void
    readyState(): ReadyState

    on(
      event: Event.Message,
      listener: (channel: string, userstate: UserState, message: string, self: boolean) => void
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
    on(event: Event.Emoteonly, listener: (channel: string, enabled: boolean) => void): void
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
  }

  namespace Client {

  }

  const _default: {
    client: (options?: ClientOptions) => Client
  }

  export default _default
}
