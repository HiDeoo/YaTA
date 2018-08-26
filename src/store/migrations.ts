import * as _ from 'lodash'

import { HighlightColors } from 'Libs/Highlight'
import { initialState as SettingsInitialState, SerializedActions } from 'Store/ducks/settings'
import { initialState as UserInitialState } from 'Store/ducks/user'
import { ApplicationState } from 'Store/reducers'

/**
 * Redux store migrations.
 */
export default {
  0: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, lastKnownVersion: SettingsInitialState.lastKnownVersion },
    }
  },
  1: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, copyMessageOnDoubleClick: SettingsInitialState.copyMessageOnDoubleClick },
    }
  },
  2: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, showContextMenu: SettingsInitialState.showContextMenu },
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
      settings: { ...state.settings, highlights: SettingsInitialState.highlights },
    }
  },
  5: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlightsIgnoredUsers: SettingsInitialState.highlightsIgnoredUsers },
    }
  },
  6: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, actions: SettingsInitialState.actions },
    }
  },
  7: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, hideWhispers: SettingsInitialState.hideWhispers },
    }
  },
  8: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, autoFocusInput: SettingsInitialState.autoFocusInput },
    }
  },
  9: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, showViewerCount: SettingsInitialState.showViewerCount },
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
      settings: { ...state.settings, disableDialogAnimations: SettingsInitialState.disableDialogAnimations },
    }
  },
  12: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlightAllMentions: SettingsInitialState.highlightAllMentions },
    }
  },
  13: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, prioritizeUsernames: SettingsInitialState.prioritizeUsernames },
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
      settings: { ...state.settings, hostThreshold: SettingsInitialState.hostThreshold },
    }
  },
  19: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, playSoundOnMentions: SettingsInitialState.playSoundOnMentions },
    }
  },
  20: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, playSoundOnWhispers: SettingsInitialState.playSoundOnWhispers },
    }
  },
  21: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, autoHostThreshold: SettingsInitialState.autoHostThreshold },
    }
  },
  22: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, highlightsPermanentUsers: SettingsInitialState.highlightsPermanentUsers },
    }
  },
  23: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      user: UserInitialState,
    }
  },
  24: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      user: UserInitialState,
    }
  },
  25: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, followsSortOrder: SettingsInitialState.followsSortOrder },
    }
  },
  26: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, hideOfflineFollows: SettingsInitialState.hideOfflineFollows },
    }
  },
  27: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, shortcuts: SettingsInitialState.shortcuts },
    }
  },
}
