import { ReducersMapObject } from 'redux'

import settings, { SettingsActions } from 'Store/ducks/settings'

/**
 * Reducers.
 * Bug: Looks like we're forced to cast to any here due to an issue with typings.
 * @see https://github.com/reactjs/redux/issues/2709
 * @see https://github.com/reactjs/redux/pull/2773
 */
const reducers: ReducersMapObject<ApplicationState, ApplicationActions | any> = {
  settings,
}

export default reducers

/**
 * Application actions
 */
type ApplicationActions = SettingsActions

/**
 * Application state.
 */
export interface ApplicationState {
  settings: ReturnType<typeof settings>
}
