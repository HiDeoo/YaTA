import _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import { IdToken } from 'libs/Twitch'
import { createAction, RehydrateAction } from 'utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  SET_TOKENS = 'user/SET_TOKENS',
  RESET = 'user/RESET',
  SET_MODERATOR = 'user/SET_MODERATOR',
}

/**
 * Initial state.
 */
export const initialState = {
  isMod: false,
  tokens: null,
  username: null,
}

/**
 * User reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const userReducer: Reducer<UserState, UserActions> = (state = initialState, action) => {
  switch (action.type) {
    case REHYDRATE: {
      if (!_.get(action.payload, 'user')) {
        return state
      }

      return { ...action.payload.user, isMod: false }
    }
    case Actions.SET_TOKENS: {
      return {
        ...state,
        tokens: action.payload,
        username: action.payload.id.preferred_username.toLowerCase(),
      }
    }
    case Actions.RESET: {
      return initialState
    }
    case Actions.SET_MODERATOR: {
      return {
        ...state,
        isMod: action.payload.isMod,
      }
    }
    default: {
      return state
    }
  }
}

export default userReducer

/**
 * Sets the current user tokens.
 * @param  access - The access token.
 * @param  id - The ID token.
 * @return The action.
 */
export const setTokens = (access: string, id: IdToken) =>
  createAction(Actions.SET_TOKENS, {
    access,
    id,
  })

/**
 * Resets the current user.
 * @return The action.
 */
export const resetUser = () => createAction(Actions.RESET)

/**
 * Sets the current user moderator status.
 * @param  isMod - Defines if the current user is a mod.
 * @return The action.
 */
export const setModerator = (isMod: boolean) =>
  createAction(Actions.SET_MODERATOR, {
    isMod,
  })

/**
 * User actions.
 */
export type UserActions =
  | RehydrateAction
  | ReturnType<typeof setTokens>
  | ReturnType<typeof resetUser>
  | ReturnType<typeof setModerator>

/**
 * User state.
 */
export type UserState = {
  /**
   * Tokens.
   */
  tokens: {
    access: string
    id: IdToken
  } | null

  /**
   * Username.
   */
  username: string | null

  /**
   * `true` when the user is a moderator.
   */
  isMod: boolean
}
