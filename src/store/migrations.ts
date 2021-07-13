import _ from 'lodash'

import { ShortcutType } from 'constants/shortcut'
import { HighlightColors } from 'libs/Highlight'
import { SoundId } from 'libs/Sound'
import { initialState as SettingsInitialState, SerializedActions, SettingsState } from 'store/ducks/settings'
import { initialState as UserInitialState } from 'store/ducks/user'
import { ApplicationState } from 'store/reducers'

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
      {} as typeof state.settings.highlights
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

    const oldActions = _.get(state.settings, 'actions') as any as SerializedActions
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
      // @ts-ignore
      settings: { ...state.settings, playSoundOnMentions: _.get(SettingsInitialState, 'playSoundOnMentions', false) },
    }
  },
  20: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      // @ts-ignore
      settings: { ...state.settings, playSoundOnWhispers: _.get(SettingsInitialState, 'playSoundOnWhispers', false) },
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
  28: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, hideVIPBadges: SettingsInitialState.hideVIPBadges },
    }
  },
  29: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, addWhispersToHistory: SettingsInitialState.addWhispersToHistory },
    }
  },
  30: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      // @ts-ignore
      settings: { ...state.settings, playSoundOnMessages: _.get(SettingsInitialState, 'playSoundOnMessages', false) },
    }
  },
  31: (state: ApplicationState): ApplicationState => {
    const oldPlaySoundOnMentions = _.get(state.settings, 'playSoundOnMentions', false) as boolean
    const oldPlaySoundOnMessages = _.get(state.settings, 'playSoundOnMessages', false) as boolean
    const oldPlaySoundOnWhispers = _.get(state.settings, 'playSoundOnWhispers', false) as boolean

    const newSettingsState: SettingsState = {
      ...state.settings,
      sounds: {
        [SoundId.Mention]: {
          enabled: oldPlaySoundOnMentions,
          volume: SettingsInitialState.sounds[SoundId.Mention].volume,
        },
        [SoundId.Message]: {
          enabled: oldPlaySoundOnMessages,
          volume: SettingsInitialState.sounds[SoundId.Message].volume,
        },
        [SoundId.Whisper]: {
          enabled: oldPlaySoundOnWhispers,
          volume: SettingsInitialState.sounds[SoundId.Whisper].volume,
        },
      },
    }

    // @ts-ignore
    const { playSoundOnMentions, playSoundOnMessages, playSoundOnWhispers, ...settings } = newSettingsState

    return {
      ...state,
      settings,
    }
  },
  32: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: {
        ...state.settings,
        playMessageSoundOnlyInOwnChannel: SettingsInitialState.playMessageSoundOnlyInOwnChannel,
      },
    }
  },
  33: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: {
        ...state.settings,
        delayBetweenThrottledSounds: SettingsInitialState.delayBetweenThrottledSounds,
      },
    }
  },
  34: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: {
        ...state.settings,
        hideHeader: SettingsInitialState.hideHeader,
      },
    }
  },
  35: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: {
        ...state.settings,
        shortcuts: {
          ...state.settings.shortcuts,
          [ShortcutType.HiDeHeader]: SettingsInitialState.shortcuts[ShortcutType.HiDeHeader],
        },
      },
    }
  },
  36: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: {
        ...state.settings,
        shortcuts: {
          ...state.settings.shortcuts,
          [ShortcutType.NavigateOwnChannel]: SettingsInitialState.shortcuts[ShortcutType.NavigateOwnChannel],
        },
      },
    }
  },
  37: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, alternateMessageBackgrounds: SettingsInitialState.alternateMessageBackgrounds },
    }
  },
  38: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      user: UserInitialState,
    }
  },
  39: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, markNewAsUnread: SettingsInitialState.markNewAsUnread },
    }
  },
  40: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      user: UserInitialState,
    }
  },
  41: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      settings: { ...state.settings, increaseTwitchHighlight: SettingsInitialState.increaseTwitchHighlight },
    }
  },
  42: (state: ApplicationState): ApplicationState => {
    return {
      ...state,
      user: UserInitialState,
    }
  },
}
