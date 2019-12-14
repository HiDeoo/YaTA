import { ReducersMapObject } from 'redux'

import app, { AppActions } from 'store/ducks/app'
import chatters, { ChattersActions } from 'store/ducks/chatters'
import logs, { LogsActions } from 'store/ducks/logs'
import notes, { NotesActions } from 'store/ducks/notes'
import settings, { SettingsActions } from 'store/ducks/settings'
import user, { UserActions } from 'store/ducks/user'

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
  notes,
  settings,
  user,
}

export default reducers

/**
 * Application actions
 */
type ApplicationActions = AppActions | LogsActions | NotesActions | UserActions | ChattersActions | SettingsActions

/**
 * Application state.
 */
export interface ApplicationState {
  app: ReturnType<typeof app>
  chatters: ReturnType<typeof chatters>
  logs: ReturnType<typeof logs>
  notes: ReturnType<typeof notes>
  user: ReturnType<typeof user>
  settings: ReturnType<typeof settings>
}
