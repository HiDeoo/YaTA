import { Reducer } from 'redux'

import { SerializedChat } from 'Libs/Chat'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'messages/ADD',
}

/**
 * Initial state.
 */
export const initialState = {
  allIds: [],
  byId: {},
}

/**
 * Messages reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const messagesReducer: Reducer<MessagesState, MessagesActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.ADD: {
      const { message } = action.payload

      return {
        ...state,
        allIds: [...state.allIds, message.id],
        byId: { ...state.byId, [message.id]: message },
      }
    }
    default: {
      return state
    }
  }
}

export default messagesReducer

/**
 * Adds a message.
 * @param  message - The message to add.
 * @return The action.
 */
export const addMessage = (message: SerializedChat) =>
  createAction(Actions.ADD, {
    message,
  })

/**
 * Messages actions.
 */
export type MessagesActions = ReturnType<typeof addMessage>

/**
 * Messages state.
 */
export type MessagesState = {
  /**
   * All messages keyed by ids.
   */
  byId: { [key: string]: SerializedChat }

  /**
   * All messages ordered by ids.
   */
  allIds: string[]
}
