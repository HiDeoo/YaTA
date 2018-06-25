import * as _ from 'lodash'
import { RoomState as RawRoomState } from 'twitch-js'

import { Serializable } from 'Utils/typescript'

/**
 * Room state class.
 */
export default class RoomState implements Serializable<SerializedRoomState> {
  public roomId: string
  private language?: string | null
  private emoteOnly?: boolean
  private followersOnly?: string
  private r9k?: boolean
  private rituals?: boolean
  private slow?: boolean
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
    this.followersOnly = state['followers-only']
    this.r9k = state.r9k
    this.rituals = state.rituals
    this.slow = state.slow
    this.subsOnly = state['subs-only']
  }

  /**
   * Serializes a room state.
   * @return The serialized room state.
   */
  public serialize() {
    const state = {
      emoteOnly: this.emoteOnly,
      followersOnly: this.followersOnly,
      language: this.language,
      r9k: this.r9k,
      rituals: this.rituals,
      roomId: this.roomId,
      slow: this.slow,
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
  followersOnly?: string
  r9k?: boolean
  rituals?: boolean
  slow?: boolean
  subsOnly?: boolean
}
