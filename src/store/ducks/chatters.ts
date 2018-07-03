import * as _ from 'lodash'
import { Reducer } from 'redux'

import { SerializedChatter } from 'Libs/Chatter'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'chatters/ADD',
  IGNORE_USER = 'chatters/MARK_AS_IGNORED',
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
      const { messageId, chatter } = action.payload

      if (_.isNil(_.get(state.byId, chatter.id))) {
        return {
          ...state,
          byId: { ...state.byId, [chatter.id]: { ...chatter, messages: [messageId] } },
          byName: { ...state.byName, [chatter.userName]: chatter.id },
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [chatter.id]: { ...state.byId[chatter.id], messages: [...state.byId[chatter.id].messages, messageId] },
        },
      }
    }
    case Actions.IGNORE_USER: {
      const { id } = action.payload

      if (!_.isNil(_.get(state.byId, id))) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [id]: { ...state.byId[id], ignored: true },
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
 * Adds a chatter with a sent message id.
 * @param  user - The chatter to add.
 * @param  messageId - The id of the message which triggered the chatter to be added.
 * @return The action.
 */
export const addChatterWithMessage = (chatter: SerializedChatter, messageId: string) =>
  createAction(Actions.ADD, {
    chatter,
    messageId,
  })

/**
 * Marks a chatter as ignored.
 * @param  id - The chatter id.
 * @return The action.
 */
export const ignoreUser = (id: string) =>
  createAction(Actions.IGNORE_USER, {
    id,
  })

/**
 * Chatters actions.
 */
export type ChattersActions = ReturnType<typeof addChatterWithMessage> | ReturnType<typeof ignoreUser>

/**
 * Chatterss state.
 */
export type ChattersState = {
  /**
   * All chatters keyed by ids.
   */
  byId: { [key: string]: SerializedChatter & { messages: string[] } }

  /**
   * All chatters keyed by names.
   * Note: this is only a reference to the chatter id.
   */
  byName: { [key: string]: string }
}
