import * as _ from 'lodash'
import { Reducer } from 'redux'

import Logs from 'Constants/logs'
import LogType from 'Constants/logType'
import { SerializedMessage } from 'Libs/Message'
import { SerializedNotice } from 'Libs/Notice'
import { SerializedNotification } from 'Libs/Notification'
import { createAction } from 'Utils/redux'

/**
 * Determines if logs should be rotated.
 * @param state - The state holding the logs.
 * @return `true` when logs should be rotated.
 */
function shouldRotateLogs(state: LogsState) {
  return !state.isAutoScrollPaused && state.allIds.length > Logs.Max + Logs.Threshold
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
  PURGE = 'logs/PURGE',
  CLEAR = 'logs/CLEAR',
  PAUSE_AUTO_SCROLL = 'logs/PAUSE_AUTO_SCROLL',
}

/**
 * Initial state.
 */
export const initialState = {
  allIds: [],
  byId: {},
  isAutoScrollPaused: false,
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
    case Actions.PURGE: {
      const updatedMessages = _.reduce(
        action.payload.logs,
        (messages, id) => {
          const message = _.get(state.byId, id)

          if (_.isNil(message)) {
            return messages
          }

          return { ...messages, [id]: { ...message, purged: true } }
        },
        {}
      )

      return { ...state, byId: { ...state.byId, ...updatedMessages } }
    }
    case Actions.CLEAR: {
      return initialState
    }
    case Actions.PAUSE_AUTO_SCROLL: {
      return {
        ...state,
        isAutoScrollPaused: action.payload.pause,
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
 * Purges log entries.
 * @param  logs - The log ids to purge.
 * @return The action.
 */
export const purgeLogs = (logs: string[]) =>
  createAction(Actions.PURGE, {
    logs,
  })

/**
 * Clears all the logs.
 * @return The action.
 */
export const clearLogs = () => createAction(Actions.CLEAR)

/**
 * Pauses auto-scroll.
 * @param  pause - `true` to pause.
 * @return The action.
 */
export const pauseAutoScroll = (pause: boolean) =>
  createAction(Actions.PAUSE_AUTO_SCROLL, {
    pause,
  })

/**
 * Logs actions.
 */
export type LogsActions =
  | ReturnType<typeof addLog>
  | ReturnType<typeof purgeLogs>
  | ReturnType<typeof clearLogs>
  | ReturnType<typeof pauseAutoScroll>

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

  /**
   * Defines if auto-scroll is paused or not.
   */
  isAutoScrollPaused: boolean
}

/**
 * Log possible types.
 */
export type Log = SerializedMessage | SerializedNotice | SerializedNotification

/**
 * Determines if a log entry is a message.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a message.
 */
export function isMessage(log: Log): log is SerializedMessage {
  return log.type === LogType.Action || log.type === LogType.Chat || log.type === LogType.Cheer
}

/**
 * Determines if a log entry is a notice.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a notice.
 */
export function isNotice(log: Log): log is SerializedNotice {
  return log.type === LogType.Notice
}

/**
 * Determines if a log entry is a notification.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a notification.
 */
export function isNotification(log: Log): log is SerializedNotification {
  return log.type === LogType.Notification
}

/**
 * Determines if a log entry is a whisper.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a whisper.
 */
export function isWhisper(log: Log): log is SerializedMessage {
  return log.type === LogType.Whisper
}
