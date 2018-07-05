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
  1: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, copyMessageOnDoubleClick: initialState.copyMessageOnDoubleClick },
    }
  },
  2: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, showContextMenu: initialState.showContextMenu },
    }
  },
  3: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, autoConnectInDev: initialState.autoConnectInDev },
    }
  },
  4: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlights: initialState.highlights },
    }
  },
  5: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlightsIgnoredUsers: initialState.highlightsIgnoredUsers },
    }
  },
}
