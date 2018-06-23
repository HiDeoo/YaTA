import { Reducer } from 'redux'

import Status from 'Constants/status'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  SET_CHANNEL = 'app/SET_CHANNEL',
  UPDATE_STATUS = 'app/UPDATE_STATUS',
}

/**
 * Initial state.
 */
export const initialState = {
  channel: null,
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
 * App actions.
 */
export type AppActions = ReturnType<typeof setChannel> | ReturnType<typeof updateStatus>

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
}
