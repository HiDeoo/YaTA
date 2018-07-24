import * as _ from 'lodash'

import { HighlightColors } from 'Libs/Highlight'
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
  6: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, actions: initialState.actions },
    }
  },
  7: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, hideWhispers: initialState.hideWhispers },
    }
  },
  8: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, autoFocusInput: initialState.autoFocusInput },
    }
  },
  9: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, showViewerCount: initialState.showViewerCount },
    }
  },
  10: (state: ApplicationState): ApplicationState => {
    const newHighlights = _.reduce(
      state.settings.highlights,
      (highlights, highlight) => {
        highlights[highlight.id] = !_.isNil(highlight.color)
          ? highlight
          : { ...highlight, color: HighlightColors.Yellow }

        return highlights
      },
      {}
    )

    return {
      ...state,
      settings: { ...state.settings, highlights: newHighlights },
    }
  },
}
