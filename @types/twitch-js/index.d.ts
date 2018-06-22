declare module 'twitch-js' {
  import Event from 'Constants/event'
  import LogType from 'Constants/logType'

  type ClientOptions = {
    options?: {
      clientId: string
      debug: boolean
    }
    connection?: {
      server: string
      port: number
      reconnect: boolean
      maxReconnectAttempts: number
      maxReconnectInterval: number
      reconnectDecay: number
      reconnectInterval: number
      secure: boolean
      timeout: number
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

  type Badges = {
    [key: string]: number
  }

  type Emotes = {
    [key: string]: string[]
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

    on(
      event: Event.Message,
      listener: (channel: string, userstate: UserState, message: string, self: boolean) => void
    ): void
    on(event: Event.FollowersOnly, listener: (channel: string, enabled: boolean, length: number) => void): void
    on(event: Event.Notice, listener: (channel: string, msgid: string, message: string) => void): void
  }

  namespace Client {

  }

  const _default: {
    client: (options?: ClientOptions) => Client
  }

  export default _default
}
