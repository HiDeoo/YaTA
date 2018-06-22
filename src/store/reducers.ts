import { ReducersMapObject } from 'redux'

import app, { AppActions } from 'Store/ducks/app'
import logs, { LogsActions } from 'Store/ducks/logs'
import settings, { SettingsActions } from 'Store/ducks/settings'
import user, { UserActions } from 'Store/ducks/user'
import users, { UsersActions } from 'Store/ducks/users'

/**
 * Reducers.
 * Bug: Looks like we're forced to cast to any here due to an issue with typings.
 * @see https://github.com/reactjs/redux/issues/2709
 * @see https://github.com/reactjs/redux/pull/2773
 */
const reducers: ReducersMapObject<ApplicationState, ApplicationActions | any> = {
  app,
  logs,
  settings,
  user,
  users,
}

export default reducers

/**
 * Application actions
 */
type ApplicationActions = AppActions | LogsActions | UserActions | UsersActions | SettingsActions

/**
 * Application state.
 */
export interface ApplicationState {
  app: ReturnType<typeof app>
  logs: ReturnType<typeof logs>
  user: ReturnType<typeof user>
  users: ReturnType<typeof users>
  settings: ReturnType<typeof settings>
}
