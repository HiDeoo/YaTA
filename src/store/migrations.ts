import { initialState } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'

/**
 * Redux store migrations.
 */
export default {
  0: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, lastKnownVersion: initialState.lastKnownVersion },
    }
  },
}
