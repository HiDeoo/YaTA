import { ReducersMapObject } from 'redux'

import app, { AppActions } from 'Store/ducks/app'
import chatters, { ChattersActions } from 'Store/ducks/chatters'
import logs, { LogsActions } from 'Store/ducks/logs'
import settings, { SettingsActions } from 'Store/ducks/settings'
import user, { UserActions } from 'Store/ducks/user'

/**
 * Reducers.
 * Bug: Looks like we're forced to cast to any here due to an issue with typings.
 * @see https://github.com/reactjs/redux/issues/2709
 * @see https://github.com/reactjs/redux/pull/2773
 */
const reducers: ReducersMapObject<ApplicationState, ApplicationActions | any> = {
  app,
  chatters,
  logs,
  settings,
  user,
}

export default reducers

/**
 * Application actions
 */
type ApplicationActions = AppActions | LogsActions | UserActions | ChattersActions | SettingsActions

/**
 * Application state.
 */
export interface ApplicationState {
  app: ReturnType<typeof app>
  chatters: ReturnType<typeof chatters>
  logs: ReturnType<typeof logs>
  user: ReturnType<typeof user>
  settings: ReturnType<typeof settings>
}
