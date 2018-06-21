import { ReducersMapObject } from 'redux'

import app, { AppActions } from 'Store/ducks/app'
import messages, { MessagesActions } from 'Store/ducks/messages'
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
  messages,
  settings,
  user,
  users,
}

export default reducers

/**
 * Application actions
 */
type ApplicationActions = AppActions | MessagesActions | UserActions | UsersActions | SettingsActions

/**
 * Application state.
 */
export interface ApplicationState {
  app: ReturnType<typeof app>
  messages: ReturnType<typeof messages>
  user: ReturnType<typeof user>
  users: ReturnType<typeof users>
  settings: ReturnType<typeof settings>
}
