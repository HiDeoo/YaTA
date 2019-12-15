import _ from 'lodash'
import { Action } from 'redux'

/**
 * Creates a Redux action creator.
 * @param  type - The action type.
 * @param  [payload] - The action payload.
 * @return The Redux action.
 */
export function createAction<T extends string>(type: T): Action<T>
export function createAction<T extends string, P>(type: T, payload: P): AnyAction<T, P>
export function createAction<T extends string, P>(type: T, payload?: P) {
  return _.isNil(payload) ? { type } : { type, payload }
}

/**
 * Redux-persist rehydrate action.
 * @prop type - The action type.
 * @prop key - The action key.
 * @prop [err] - The action error if any.
 * @prop [payload] - The action payload.
 */
export type RehydrateAction = {
  type: 'persist/REHYDRATE'
  key: string
  payload?: any
  err?: any
}

/**
 * Redux action with a payload.
 * @prop payload - The action payload.
 */
interface AnyAction<T extends string, P> extends Action<T> {
  payload: P
}
