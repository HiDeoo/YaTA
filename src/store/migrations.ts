import * as _ from 'lodash'

import { HighlightColors } from 'Libs/Highlight'
import { initialState, SerializedActions } from 'Store/ducks/settings'
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
      settings: { ...state.settings, autoConnectInDev: undefined } as ApplicationState['settings'] & {
        autoConnectInDev: undefined
      },
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
  11: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, disableDialogAnimations: initialState.disableDialogAnimations },
    }
  },
  12: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlightAllMentions: initialState.highlightAllMentions },
    }
  },
  13: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, prioritizeUsernames: initialState.prioritizeUsernames },
    }
  },
  14: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, enablePollEditor: undefined } as ApplicationState['settings'] & {
        enablePollEditor: undefined
      },
    }
  },
  15: (state: ApplicationState): ApplicationState => {
    if (!_.isNil(state.settings.actions.allIds) && !_.isNil(state.settings.actions.byId)) {
      return state
    }

    const oldActions = (_.get(state.settings, 'actions') as any) as SerializedActions
    const allIds = _.map(oldActions, (action) => action.id)

    return {
      ...state,
      settings: { ...state.settings, actions: { byId: oldActions, allIds } },
    }
  },
  16: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, autoConnectInDev: undefined } as ApplicationState['settings'] & {
        autoConnectInDev: undefined
      },
    }
  },
  17: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, enablePollEditor: undefined } as ApplicationState['settings'] & {
        enablePollEditor: undefined
      },
    }
  },
  18: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, hostThreshold: initialState.hostThreshold },
    }
  },
  19: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, playSoundOnMentions: initialState.playSoundOnMentions },
    }
  },
  20: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, playSoundOnWhispers: initialState.playSoundOnWhispers },
    }
  },
}
