import * as _ from 'lodash'
import { Reducer } from 'redux'

import Logs from 'Constants/logs'
import { SerializedMessage } from 'Libs/Message'
import { SerializedNotice } from 'Libs/Notice'
import { createAction } from 'Utils/redux'

/**
 * Determines if logs should be rotated.
 * @param state - The state holding the logs.
 * @return `true` when logs should be rotated.
 */
function shouldRotateLogs(state: LogsState) {
  return state.allIds.length > Logs.Max + Logs.Threshold
}

/**
 * Rotates the logs.
 * @param  state - The state holding the logs.
 * @return The new state with rotated logs.
 */
function rotateLogs(state: LogsState) {
  const rotationIndex = state.allIds.length - Logs.Max

  const allIds = state.allIds.slice(rotationIndex)

  const byId = _.reduce(
    allIds,
    (newById, id) => {
      newById[id] = state.byId[id]

      return newById
    },
    {}
  )

  return {
    ...state,
    allIds,
    byId,
  }
}

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

      const newState = shouldRotateLogs(state) ? rotateLogs(state) : state

      return {
        ...newState,
        allIds: [...newState.allIds, log.id],
        byId: { ...newState.byId, [log.id]: log },
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
