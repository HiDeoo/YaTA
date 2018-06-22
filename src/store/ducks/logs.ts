import { Reducer } from 'redux'

import { SerializedMessage } from 'Libs/Message'
import { SerializedNotice } from 'Libs/Notice'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'logs/ADD',
}

/**
 * Initial state.
 */
export const initialState = {
  allIds: [],
  byId: {},
}

/**
 * Logs reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const logsReducer: Reducer<LogsState, LogsActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.ADD: {
      const { log } = action.payload

      return {
        ...state,
        allIds: [...state.allIds, log.id],
        byId: { ...state.byId, [log.id]: log },
      }
    }
    default: {
      return state
    }
  }
}

export default logsReducer

/**
 * Adds a log entry.
 * @param  log - The log entry to add.
 * @return The action.
 */
export const addLog = (log: Log) =>
  createAction(Actions.ADD, {
    log,
  })

/**
 * Logs actions.
 */
export type LogsActions = ReturnType<typeof addLog>

/**
 * Logs state.
 */
export type LogsState = {
  /**
   * All logs keyed by ids.
   */
  byId: { [key: string]: Log }

  /**
   * All logs ordered by ids.
   */
  allIds: string[]
}

/**
 * Log possible types.
 */
export type Log = SerializedMessage | SerializedNotice
