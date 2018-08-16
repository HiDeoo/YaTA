import * as _ from 'lodash'
import { RoomState as RawRoomState } from 'twitch-js'

/**
 * Room state class.
 */
export default class RoomState implements Serializable<SerializedRoomState> {
  public roomId: string
  private language?: string | null
  private emoteOnly?: boolean
  private followersOnly?: boolean
  private followersOnlyDuration?: number
  private r9k?: boolean
  private rituals?: boolean
  private slow?: boolean
  private slowDuration?: number
  private subsOnly?: boolean

  /**
   * Creates a new room state instance.
   * @class
   * @param state - The raw room state.
   */
  constructor(state: RawRoomState) {
    this.roomId = state['room-id']
    this.language = state['broadcaster-lang']
    this.emoteOnly = state['emote-only']
    this.r9k = state.r9k
    this.rituals = state.rituals
    this.subsOnly = state['subs-only']

    if (!_.isNil(state.slow)) {
      this.slow = _.isString(state.slow)
      this.slowDuration = _.isString(state.slow) ? parseInt(state.slow, 10) : 0
    }

    if (!_.isNil(state['followers-only'])) {
      const followersOnly = state['followers-only']

      if (_.isString(followersOnly)) {
        if (followersOnly === '-1') {
          this.followersOnly = false
          this.followersOnlyDuration = 0
        } else {
          this.followersOnly = true
          this.followersOnlyDuration = parseInt(followersOnly, 10)
        }
      } else {
        this.followersOnly = true
        this.followersOnlyDuration = 0
      }
    }
  }

  /**
   * Serializes a room state.
   * @return The serialized room state.
   */
  public serialize() {
    const state = {
      emoteOnly: this.emoteOnly,
      followersOnly: this.followersOnly,
      followersOnlyDuration: this.followersOnlyDuration,
      language: this.language,
      r9k: this.r9k,
      rituals: this.rituals,
      roomId: this.roomId,
      slow: this.slow,
      slowDuration: this.slowDuration,
      subsOnly: this.subsOnly,
    }

    return _.omitBy(state, _.isUndefined) as SerializedRoomState
  }
}

/**
 * Serialized room state.
 */
export type SerializedRoomState = {
  roomId: string
  language?: string | null
  emoteOnly?: boolean
  followersOnly?: boolean
  followersOnlyDuration?: number
  r9k?: boolean
  rituals?: boolean
  slow?: boolean
  slowDuration?: number
  subsOnly?: boolean
}
