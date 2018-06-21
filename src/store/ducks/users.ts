import * as _ from 'lodash'
import { Reducer } from 'redux'

import { SerializedUser } from 'Libs/User'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  ADD = 'users/ADD',
}

/**
 * Initial state.
 */
export const initialState = {
  byId: {},
}

/**
 * Users reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const usersReducer: Reducer<UsersState, UsersActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.ADD: {
      const { messageId, user } = action.payload

      if (_.isNil(_.get(state.byId, action.payload.user.id))) {
        return {
          ...state,
          byId: { ...state.byId, [user.id]: { ...user, messages: [messageId] } },
        }
      }

      return {
        ...state,
        byId: { ...state.byId, [user.id]: { ...user, messages: [...state.byId[user.id].messages, messageId] } },
      }
    }
    default: {
      return state
    }
  }
}

export default usersReducer

/**
 * Adds a user with a sent message id.
 * @param  user - The user to add.
 * @param  messageId - The id of the message which triggered the user to be added.
 * @return The action.
 */
export const addUserWithMessage = (user: SerializedUser, messageId: string) =>
  createAction(Actions.ADD, {
    messageId,
    user,
  })

/**
 * Users actions.
 */
export type UsersActions = ReturnType<typeof addUserWithMessage>

/**
 * Users state.
 */
export type UsersState = {
  /**
   * All users keyed by ids.
   */
  byId: { [key: string]: SerializedUser & { messages: string[] } }
}
