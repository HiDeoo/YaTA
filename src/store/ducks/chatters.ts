import * as _ from 'lodash'
import { Reducer } from 'redux'

import { SerializedChatter } from 'libs/Chatter'
import { createAction } from 'utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'chatters/ADD',
  MARK_AS_BLOCKED = 'chatters/MARK_AS_BLOCKED',
  MARK_AS_UNBLOCKED = 'chatters/MARK_AS_UNBLOCKED',
  MARK_AS_BANNED = 'chatters/MARK_AS_BANNED',
  MARK_AS_UNBANNED = 'chatters/MARK_AS_UNBANNED',
  CLEAR = 'chatters/CLEAR',
  ADD_POTENTIAL = 'chatters/ADD_POTENTIAL',
}

/**
 * Initial state.
 */
export const initialState = {
  byId: {},
  byName: {},
}

/**
 * Chatters reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const chattersReducer: Reducer<ChattersState, ChattersActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.ADD: {
      const { chatter, logId } = action.payload

      if (_.isNil(_.get(state.byId, chatter.id))) {
        let { byId } = state

        const potentialUserId = _.get(state.byName, chatter.userName)
        let potentialLogs: string[] = []

        // If the user is known as a potential chatter, remove the old entry.
        if (!_.isNil(potentialUserId)) {
          const { [potentialUserId]: potentialUser, ...byIdWithoutPotentialChatter } = byId
          byId = byIdWithoutPotentialChatter
          potentialLogs = potentialUser.logs
        }

        return {
          ...state,
          byId: { ...byId, [chatter.id]: { ...chatter, logs: [...potentialLogs, logId] } },
          byName: { ...state.byName, [chatter.userName]: chatter.id },
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [chatter.id]: { ...state.byId[chatter.id], logs: [...state.byId[chatter.id].logs, logId] },
        },
      }
    }
    case Actions.ADD_POTENTIAL: {
      const { chatter, logId } = action.payload

      const potentialUserId = _.get(state.byName, chatter.userName)
      let logs: string[] = []

      if (!_.isNil(potentialUserId)) {
        logs = _.isNil(logId) ? state.byId[potentialUserId].logs : [...state.byId[potentialUserId].logs, logId]

        return {
          ...state,
          byId: {
            ...state.byId,
            [potentialUserId]: { ...state.byId[potentialUserId], logs },
          },
        }
      }

      if (!_.isNil(logId)) {
        logs = [logId]
      }

      return {
        ...state,
        byId: { ...state.byId, [chatter.id]: { ...chatter, logs } },
        byName: { ...state.byName, [chatter.userName]: chatter.id },
      }
    }
    case Actions.MARK_AS_BLOCKED: {
      const { id } = action.payload

      if (!_.isNil(_.get(state.byId, id))) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: { ...state.byId[id], blocked: true },
          },
        }
      }

      return state
    }
    case Actions.MARK_AS_UNBLOCKED: {
      const { id } = action.payload

      if (!_.isNil(_.get(state.byId, id))) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: { ...state.byId[id], blocked: false },
          },
        }
      }

      return state
    }
    case Actions.CLEAR: {
      return initialState
    }
    case Actions.MARK_AS_BANNED: {
      const { id } = action.payload

      if (!_.isNil(_.get(state.byId, id))) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: { ...state.byId[id], banned: true },
          },
        }
      }

      return state
    }
    case Actions.MARK_AS_UNBANNED: {
      const { userName } = action.payload

      const id = _.get(state.byName, userName)

      if (!_.isNil(id)) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: { ...state.byId[id], banned: false },
          },
        }
      }

      return state
    }
    default: {
      return state
    }
  }
}

export default chattersReducer

/**
 * Adds a chatter with a sent log id.
 * @param  chatter - The chatter to add.
 * @param  logId - The id of the log which triggered the chatter to be added.
 * @return The action.
 */
export const addChatter = (chatter: SerializedChatter, logId: string) =>
  createAction(Actions.ADD, {
    chatter,
    logId,
  })

/**
 * Marks a chatter as blocked.
 * @param  id - The chatter id.
 * @return The action.
 */
export const markChatterAsBlocked = (id: string) =>
  createAction(Actions.MARK_AS_BLOCKED, {
    id,
  })

/**
 * Marks a chatter as unblocked.
 * @param  id - The chatter id.
 * @return The action.
 */
export const markChatterAsUnblocked = (id: string) =>
  createAction(Actions.MARK_AS_UNBLOCKED, {
    id,
  })

/**
 * Marks a chatter as banned.
 * @param  id - The chatter id.
 * @return The action.
 */
export const markChatterAsBanned = (id: string) =>
  createAction(Actions.MARK_AS_BANNED, {
    id,
  })

/**
 * Marks a chatter as unblocked.
 * @param  userName - The chatter userName.
 * @return The action.
 */
export const markChatterAsUnbanned = (userName: string) =>
  createAction(Actions.MARK_AS_UNBANNED, {
    userName,
  })

/**
 * Clears all the chatters.
 * @return The action.
 */
export const clearChatters = () => createAction(Actions.CLEAR)

/**
 * Adds a potential chatter with a sent log id.
 * @param  user - The potential chatter to add.
 * @param  [logId] - The id of the log which triggered the chatter to be added
 * if any.
 * @return The action.
 */
export const addPotentialChatter = (chatter: SerializedChatter, logId?: string) =>
  createAction(Actions.ADD_POTENTIAL, {
    chatter,
    logId,
  })

/**
 * Chatters actions.
 */
export type ChattersActions =
  | ReturnType<typeof addChatter>
  | ReturnType<typeof markChatterAsBlocked>
  | ReturnType<typeof markChatterAsUnblocked>
  | ReturnType<typeof clearChatters>
  | ReturnType<typeof addPotentialChatter>
  | ReturnType<typeof markChatterAsBanned>
  | ReturnType<typeof markChatterAsUnbanned>

/**
 * Chatters state.
 */
export type ChattersState = {
  /**
   * All chatters keyed by ids.
   */
  byId: Record<string, SerializedChatter & { logs: string[] }>

  /**
   * All chatters keyed by names.
   * Note: this is only a reference to the chatter id.
   */
  byName: Record<string, string>
}
