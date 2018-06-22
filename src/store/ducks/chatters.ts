import * as _ from 'lodash'
import { Reducer } from 'redux'

import { SerializedChatter } from 'Libs/Chatter'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'chatters/ADD',
}

/**
 * Initial state.
 */
export const initialState = {
  byId: {},
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

      if (_.isNil(_.get(state.byId, action.payload.chatter.id))) {
        return {
          ...state,
          byId: { ...state.byId, [chatter.id]: { ...chatter, messages: [messageId] } },
        }
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [chatter.id]: { ...chatter, messages: [...state.byId[chatter.id].messages, messageId] },
        },
      }
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
 * Chatters actions.
 */
export type ChattersActions = ReturnType<typeof addChatterWithMessage>

/**
 * Chatterss state.
 */
export type ChattersState = {
  /**
   * All chatters keyed by ids.
   */
  byId: { [key: string]: SerializedChatter & { messages: string[] } }
}
