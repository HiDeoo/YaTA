import { Reducer } from 'redux'

import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  SET_CHANNEL = 'app/SET_CHANNEL',
}

/**
 * Initial state.
 */
export const initialState = {
  channel: null,
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
    default: {
      return state
    }
  }
}

export default appReducer

/**
 * Sets the current channel.
 * @param  state - The new channel.
 * @return The action.
 */
export const setChannel = (channel: string) =>
  createAction(Actions.SET_CHANNEL, {
    channel,
  })

/**
 * App actions.
 */
export type AppActions = ReturnType<typeof setChannel>

/**
 * App state.
 */
export type AppState = {
  /**
   * The current channel.
   */
  channel: string | null
}
