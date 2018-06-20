import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import { createAction, RehydrateAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  TEST = 'app/TEST',
}

/**
 * Initial state.
 */
export const initialState = {
  test: 'test1',
}

/**
 * Application reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const appReducer: Reducer<AppState, AppActions> = (state = initialState, action) => {
  switch (action.type) {
    case REHYDRATE: {
      if (!_.get(action.payload, 'app')) {
        return state
      }

      return action.payload.app
    }
    case Actions.TEST: {
      return {
        ...state,
        test: state.test === 'test2' ? 'test1' : 'test2',
      }
    }
    default: {
      return state
    }
  }
}

export default appReducer

/**
 * Tests.
 * @return The action.
 */
export const updateTest = () => createAction(Actions.TEST)

/**
 * App actions.
 */
export type AppActions = RehydrateAction | ReturnType<typeof updateTest>

/**
 * App state.
 */
export type AppState = {
  /**
   * Test state.
   */
  test: string
}
