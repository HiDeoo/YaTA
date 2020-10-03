import _ from 'lodash'
import { Reducer } from 'redux'
import shortid from 'shortid'

import Logs from 'constants/logs'
import LogType from 'constants/logType'
import { SerializedMessage } from 'libs/Message'
import { SerializedNotice } from 'libs/Notice'
import { SerializedNotification } from 'libs/Notification'
import { SerializedRejectedMessage } from 'libs/RejectedMessage'
import { createAction } from 'utils/redux'
import { padTimeUnit } from 'utils/time'

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
    {} as LogsState['byId']
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
  PURGE_LOG = 'logs/PURGE_LOG',
  CLEAR = 'logs/CLEAR',
  PAUSE_AUTO_SCROLL = 'logs/PAUSE_AUTO_SCROLL',
  ADD_MARKER = 'logs/ADD_MARKER',
  UNSHIFT = 'logs/UNSHIFT',
  MARK_AS_READ = 'logs/MARK_AS_READ',
  MARK_REJECTED_MESSAGE_AS_HANDLED = 'logs/MARK_REJECTED_MESSAGE_AS_HANDLED',
  TOGGLE_COMPRESS = 'logs/TOGGLE_COMPRESS',
}

/**
 * Initial state.
 */
export const initialState = {
  allIds: [],
  byId: {},
  isAutoScrollPaused: false,
  lastReadId: null,
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
    case Actions.UNSHIFT: {
      const { log } = action.payload

      return {
        ...state,
        allIds: [log.id, ...state.allIds],
        byId: { ...state.byId, [log.id]: log },
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
    case Actions.PURGE_LOG: {
      const id = action.payload.log
      const message = _.get(state.byId, id)

      if (_.isNil(message)) {
        return state
      }

      return { ...state, byId: { ...state.byId, [id]: { ...message, purged: true } } }
    }
    case Actions.ADD_MARKER: {
      const id = shortid.generate()
      const date = new Date()
      const time = `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`

      return {
        ...state,
        allIds: [...state.allIds, id],
        byId: { ...state.byId, [id]: { id, time, type: LogType.Marker } },
      }
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
    case Actions.MARK_AS_READ: {
      const { allIds, byId, lastReadId } = state
      const { id } = action.payload

      const clickedLog = byId[id]

      if (!isMessage(clickedLog) || (clickedLog.read && !clickedLog.self)) {
        return state
      }

      const startIndex = _.isNil(lastReadId) ? 0 : _.indexOf(allIds, lastReadId) + 1
      const endIndex = _.indexOf(allIds, id)

      if (endIndex < startIndex) {
        return state
      }

      const ids = _.slice(allIds, startIndex, endIndex + 1)

      if (ids.length === 0) {
        return { ...state, lastReadId: id }
      }

      const newById = _.reduce(
        allIds,
        (acc, logId) => {
          const log = byId[logId]

          if (_.includes(ids, log.id) && isMessage(log)) {
            return { ...acc, [logId]: { ...log, read: true } }
          }

          return acc
        },
        byId
      )

      return {
        ...state,
        byId: newById,
        lastReadId: id,
      }
    }
    case Actions.MARK_REJECTED_MESSAGE_AS_HANDLED: {
      const { id } = action.payload
      const rejectedMessage = _.get(state.byId, id)

      if (_.isNil(rejectedMessage)) {
        return state
      }

      return { ...state, byId: { ...state.byId, [id]: { ...rejectedMessage, handled: true } } }
    }
    case Actions.TOGGLE_COMPRESS: {
      const { id } = action.payload
      const compressedMessage = _.get(state.byId, id)

      if (_.isNil(compressedMessage) || !isMessage(compressedMessage)) {
        return state
      }

      console.log(`Hi Numbers, this is called ${compressedMessage.compressed}`)

      return { ...state, byId: { ...state.byId, [id]: { ...compressedMessage, compressed: false } } }
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
 * Adds a log entry at the beginning.
 * @param  log - The log entry to add.
 * @return The action.
 */
export const unshiftLog = (log: Log) =>
  createAction(Actions.UNSHIFT, {
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
 * Purges a log entry.
 * @param  log - The log id to purge.
 * @return The action.
 */
export const purgeLog = (log: string) =>
  createAction(Actions.PURGE_LOG, {
    log,
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
 * Add a marker.
 * @return The action.
 */
export const addMarker = () => createAction(Actions.ADD_MARKER)

/**
 * Mark a message (and all previous unread) as read.
 * @param  id - The id of the message.
 * @return The action.
 */
export const markAsRead = (id: string) =>
  createAction(Actions.MARK_AS_READ, {
    id,
  })

/**
 * Mark a rejected message as handled.
 * @param  id - The id of the rejected message.
 * @return The action.
 */
export const markRejectedMessageAsHandled = (id: string) =>
  createAction(Actions.MARK_REJECTED_MESSAGE_AS_HANDLED, {
    id,
  })

export const markAsDecompressed = (id: string) =>
  createAction(Actions.TOGGLE_COMPRESS, {
    id,
  })

/**
 * Logs actions.
 */
export type LogsActions =
  | ReturnType<typeof addLog>
  | ReturnType<typeof purgeLogs>
  | ReturnType<typeof clearLogs>
  | ReturnType<typeof pauseAutoScroll>
  | ReturnType<typeof addMarker>
  | ReturnType<typeof purgeLog>
  | ReturnType<typeof unshiftLog>
  | ReturnType<typeof markAsRead>
  | ReturnType<typeof markRejectedMessageAsHandled>
  | ReturnType<typeof markAsDecompressed>

/**
 * Logs state.
 */
export type LogsState = {
  /**
   * All logs keyed by ids.
   */
  byId: Record<string, Log>

  /**
   * All logs ordered by ids.
   */
  allIds: string[]

  /**
   * Defines if auto-scroll is paused or not.
   */
  isAutoScrollPaused: boolean

  /**
   * The id of the last message marked as read.
   */
  lastReadId: string | null
}

/**
 * Log possible types.
 */
export type Log =
  | SerializedMessage
  | SerializedNotice
  | SerializedNotification
  | SerializedMarker
  | SerializedRejectedMessage

/**
 * Marker.
 */
export type SerializedMarker = {
  time: string
  id: string
  type: LogType.Marker
}

/**
 * Determines if an item is a log.
 * @param  item - The item to validate.
 * @return `true` if the log is a log.
 */
export function isLog(item: any): item is Log {
  return isMessage(item) || isNotice(item) || isNotification(item) || isWhisper(item) || isMarker(item)
}

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

/**
 * Determines if a log entry is a marker.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a marker.
 */
export function isMarker(log: Log): log is SerializedMarker {
  return log.type === LogType.Marker
}

/**
 * Determines if a log entry is a rejected message.
 * @param  log - The log entry to validate.
 * @return `true` if the log is a rejected message.
 */
export function isRejectedMessage(log: Log): log is SerializedRejectedMessage {
  return log.type === LogType.RejectedMessage
}
