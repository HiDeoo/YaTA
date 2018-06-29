import { Reducer } from 'redux'

import Status from 'Constants/status'
import { SerializedRoomState } from 'Libs/RoomState'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  SET_CHANNEL = 'app/SET_CHANNEL',
  UPDATE_STATUS = 'app/UPDATE_STATUS',
  UPDATE_ROOM_STATE = 'app/UPDATE_ROOM_STATE',
  SET_SHOULD_READ_CHANGELOG = 'app/SET_SHOULD_READ_CHANGELOG',
}

/**
 * Initial state.
 */
export const initialState = {
  channel: null,
  roomState: null,
  shouldReadChangelog: false,
  status: Status.Default,
}

/**
 * App reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const appReducer: Reducer<AppState, AppActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_CHANNEL: {
      return {
        ...state,
        channel: action.payload.channel,
      }
    }
    case Actions.UPDATE_STATUS: {
      return {
        ...state,
        status: action.payload.status,
      }
    }
    case Actions.UPDATE_ROOM_STATE: {
      return {
        ...state,
        roomState: {
          ...state.roomState,
          ...action.payload.state,
        },
      }
    }
    case Actions.SET_SHOULD_READ_CHANGELOG: {
      return {
        ...state,
        shouldReadChangelog: action.payload.shouldRead,
      }
    }
    default: {
      return state
    }
  }
}

export default appReducer

/**
 * Sets the current channel.
 * @param  channel - The new channel.
 * @return The action.
 */
export const setChannel = (channel: string) =>
  createAction(Actions.SET_CHANNEL, {
    channel,
  })

/**
 * Updates the current status.
 * @param  status - The new status.
 * @return The action.
 */
export const updateStatus = (status: Status) =>
  createAction(Actions.UPDATE_STATUS, {
    status,
  })

/**
 * Updates the room state.
 * @param  state - The new state.
 * @return The action.
 */
export const updateRoomState = (state: SerializedRoomState) =>
  createAction(Actions.UPDATE_ROOM_STATE, {
    state,
  })

/**
 * Indicates or not that a new changelog is available.
 * @return The action.
 */
export const setShouldReadChangelog = (shouldRead: boolean) =>
  createAction(Actions.SET_SHOULD_READ_CHANGELOG, {
    shouldRead,
  })

/**
 * App actions.
 */
export type AppActions =
  | ReturnType<typeof setChannel>
  | ReturnType<typeof updateStatus>
  | ReturnType<typeof updateRoomState>
  | ReturnType<typeof setShouldReadChangelog>

/**
 * App state.
 */
export type AppState = {
  /**
   * The current channel.
   */
  channel: string | null

  /**
   * Connection status.
   */
  status: Status

  /**
   * Room state.
   */
  roomState: SerializedRoomState | null

  /**
   * Defines if the user is using a new version of the application and should read the associated changelog.
   */
  shouldReadChangelog: boolean
}
