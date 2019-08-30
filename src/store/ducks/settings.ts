import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import { ShortcutCombo, ShortcutType } from 'Constants/shortcut'
import Theme from 'Constants/theme'
import { SerializedAction } from 'Libs/Action'
import { HighlightColors, SerializedHighlight } from 'Libs/Highlight'
import { SoundId } from 'Libs/Sound'
import { createAction, RehydrateAction } from 'Utils/redux'

/**
 * Follows sort order.
 */
export enum FollowsSortOrder {
  ViewersDesc,
  ViewersAsc,
  UptimeDesc,
  UptimeAsc,
}

/**
 * Actions types.
 */
export enum Actions {
  TOGGLE_THEME = 'settings/TOGGLE_THEME',
  SET_VERSION = 'settings/SET_VERSION',
  TOGGLE_COPY_MESSAGE_DOUBLE_CLICK = 'settings/TOGGLE_COPY_MESSAGE_DOUBLE_CLICK',
  TOGGLE_SHOW_CONTEXT_MENU = 'settings/TOGGLE_SHOW_CONTEXT_MENU',
  ADD_HIGHLIGHT = 'settings/ADD_HIGHLIGHT',
  UPDATE_HIGHLIGHT_PATTERN = 'settings/UPDATE_HIGHLIGHT_PATTERN',
  UPDATE_HIGHLIGHT_COLOR = 'settings/UPDATE_HIGHLIGHT_COLOR',
  REMOVE_HIGHLIGHT = 'settings/REMOVE_HIGHLIGHT',
  ADD_HIGHLIGHTS_IGNORED_USERS = 'settings/ADD_HIGHLIGHTS_IGNORED_USERS',
  REMOVE_HIGHLIGHTS_IGNORED_USER = 'settings/REMOVE_HIGHLIGHTS_IGNORED_USER',
  ADD_HIGHLIGHTS_PERMANENT_USERS = 'settings/ADD_HIGHLIGHTS_PERMANENT_USERS',
  REMOVE_HIGHLIGHTS_PERMANENT_USER = 'settings/REMOVE_HIGHLIGHTS_PERMANENT_USER',
  ADD_ACTION = 'settings/ADD_ACTION',
  REMOVE_ACTION = 'settings/REMOVE_ACTION',
  UPDATE_ACTION = 'settings/UPDATE_ACTION',
  MOVE_ACTION = 'settings/MOVE_ACTION',
  TOGGLE_HIDE_WHISPERS = 'settings/TOGGLE_HIDE_WHISPERS',
  RESTORE = 'settings/RESTORE',
  TOGGLE_AUTO_FOCUS_INPUT = 'settings/TOGGLE_AUTO_FOCUS_INPUT',
  TOGGLE_SHOW_VIEWER_COUNT = 'settings/TOGGLE_SHOW_VIEWER_COUNT',
  TOGGLE_DISABLE_DIALOG_ANIMATIONS = 'settings/TOGGLE_DISABLE_DIALOG_ANIMATIONS',
  TOGGLE_HIGHLIGHT_ALL_MENTIONS = 'settings/TOGGLE_HIGHLIGHT_ALL_MENTIONS',
  TOGGLE_PRIORITIZE_USERNAMES = 'settings/TOGGLE_PRIORITIZE_USERNAMES',
  UPDATE_HOST_THRESHOLD = 'settings/UPDATE_HOST_THRESHOLD',
  UPDATE_AUTO_HOST_THRESHOLD = 'settings/UPDATE_AUTO_HOST_THRESHOLD',
  SET_FOLLOWS_SORT_ORDER = 'settings/SET_FOLLOWS_SORT_ORDER',
  TOGGLE_HIDE_OFFLINE_FOLLOWS = 'settings/TOGGLE_HIDE_OFFLINE_FOLLOWS',
  SET_SHORTCUT = 'settings/SET_SHORTCUT',
  TOGGLE_HIDE_VIP_BADGES = 'settings/TOGGLE_HIDE_VIP_BADGES',
  TOGGLE_ADD_WHISPERS_TO_HISTORY = 'settings/TOGGLE_ADD_WHISPERS_TO_HISTORY',
  TOGGLE_SOUND = 'TOGGLE_SOUND',
  UPDATE_SOUND_VOLUME = 'UPDATE_SOUND_VOLUME',
  TOGGLE_PLAY_MESSAGE_SOUND_ONLY_IN_OWN_CHANNEL = 'TOGGLE_PLAY_MESSAGE_SOUND_ONLY_IN_OWN_CHANNEL',
  UPDATE_DELAY_BETWEEN_THROTTLED_SOUNDS = 'UPDATE_DELAY_BETWEEN_THROTTLED_SOUNDS',
  TOGGLE_HIDE_HEADER = 'TOGGLE_HIDE_HEADER',
  TOGGLE_ALTERNATE_MESSAGE_BACKGROUNDS = 'settings/TOGGLE_ALTERNATE_MESSAGE_BACKGROUNDS',
  TOGGLE_MARK_NEW_AS_UNREAD = 'settings/TOGGLE_MARK_NEW_AS_UNREAD',
}

/**
 * Initial state.
 */
export const initialState = {
  actions: {
    allIds: [],
    byId: {},
  },
  addWhispersToHistory: false,
  alternateMessageBackgrounds: false,
  autoFocusInput: true,
  autoHostThreshold: 1,
  copyMessageOnDoubleClick: true,
  delayBetweenThrottledSounds: 10,
  disableDialogAnimations: false,
  followsSortOrder: FollowsSortOrder.ViewersDesc,
  hideHeader: false,
  hideOfflineFollows: false,
  hideVIPBadges: true,
  hideWhispers: false,
  highlightAllMentions: false,
  highlights: {},
  highlightsIgnoredUsers: [],
  highlightsPermanentUsers: [],
  hostThreshold: 1,
  lastKnownVersion: null,
  markNewAsUnread: false,
  playMessageSoundOnlyInOwnChannel: true,
  prioritizeUsernames: false,
  shortcuts: {
    [ShortcutType.OpenSettings]: 'alt + ,',
    [ShortcutType.NavigateHome]: 'alt + h',
    [ShortcutType.NavigateOwnChannel]: 'alt + o',
    [ShortcutType.CreateClip]: 'alt + x',
    [ShortcutType.ToggleSearch]: 'alt + f',
    [ShortcutType.ToggleOmnibar]: 'alt + p',
    [ShortcutType.TogglePollEditor]: 'alt + c',
    [ShortcutType.FocusChatInput]: 'alt + a',
    [ShortcutType.AddMarker]: 'alt + m',
    [ShortcutType.CreatePoll]: 'alt + enter',
    [ShortcutType.HiDeHeader]: 'alt + t',
  },
  showContextMenu: true,
  showViewerCount: false,
  sounds: {
    [SoundId.Mention]: {
      enabled: false,
      volume: 0.5,
    },
    [SoundId.Message]: {
      enabled: false,
      volume: 0.5,
    },
    [SoundId.Whisper]: {
      enabled: false,
      volume: 0.5,
    },
  },
  theme: Theme.Dark as SettingsState['theme'],
}

/**
 * Settings reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const settingsReducer: Reducer<SettingsState, SettingsActions> = (state = initialState, action) => {
  switch (action.type) {
    case REHYDRATE: {
      if (!_.get(action.payload, 'settings')) {
        return state
      }

      return action.payload.settings
    }
    case Actions.TOGGLE_THEME: {
      return {
        ...state,
        theme: state.theme === Theme.Dark ? Theme.Light : Theme.Dark,
      }
    }
    case Actions.SET_VERSION: {
      return {
        ...state,
        lastKnownVersion: action.payload.version,
      }
    }
    case Actions.TOGGLE_COPY_MESSAGE_DOUBLE_CLICK: {
      return {
        ...state,
        copyMessageOnDoubleClick: !state.copyMessageOnDoubleClick,
      }
    }
    case Actions.TOGGLE_SHOW_CONTEXT_MENU: {
      return {
        ...state,
        showContextMenu: !state.showContextMenu,
      }
    }
    case Actions.ADD_HIGHLIGHT: {
      const { highlight } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [highlight.id]: highlight },
      }
    }
    case Actions.UPDATE_HIGHLIGHT_PATTERN: {
      const { id, pattern } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [id]: { ...state.highlights[id], pattern } },
      }
    }
    case Actions.UPDATE_HIGHLIGHT_COLOR: {
      const { id, color } = action.payload

      return {
        ...state,
        highlights: { ...state.highlights, [id]: { ...state.highlights[id], color } },
      }
    }
    case Actions.REMOVE_HIGHLIGHT: {
      const { id } = action.payload

      const { [id]: highlightToRemove, ...otherHighlights } = state.highlights

      return {
        ...state,
        highlights: otherHighlights,
      }
    }
    case Actions.ADD_HIGHLIGHTS_IGNORED_USERS: {
      return {
        ...state,
        highlightsIgnoredUsers: [...state.highlightsIgnoredUsers, ...action.payload.usernames],
      }
    }
    case Actions.REMOVE_HIGHLIGHTS_IGNORED_USER: {
      return {
        ...state,
        highlightsIgnoredUsers: _.filter(
          state.highlightsIgnoredUsers,
          (username) => username !== action.payload.username
        ),
      }
    }
    case Actions.ADD_HIGHLIGHTS_PERMANENT_USERS: {
      return {
        ...state,
        highlightsPermanentUsers: [...state.highlightsPermanentUsers, ...action.payload.usernames],
      }
    }
    case Actions.REMOVE_HIGHLIGHTS_PERMANENT_USER: {
      return {
        ...state,
        highlightsPermanentUsers: _.filter(
          state.highlightsPermanentUsers,
          (username) => username !== action.payload.username
        ),
      }
    }
    case Actions.ADD_ACTION: {
      const { action: newAction } = action.payload

      return {
        ...state,
        actions: {
          allIds: [...state.actions.allIds, newAction.id],
          byId: { ...state.actions.byId, [newAction.id]: newAction },
        },
      }
    }
    case Actions.REMOVE_ACTION: {
      const { id } = action.payload

      const { [id]: actionToRemove, ...otherActions } = state.actions.byId
      const index = _.indexOf(state.actions.allIds, id)

      return {
        ...state,
        actions: {
          allIds: [...state.actions.allIds.slice(0, index), ...state.actions.allIds.slice(index + 1)],
          byId: otherActions,
        },
      }
    }
    case Actions.MOVE_ACTION: {
      const { down, id } = action.payload

      const index = _.indexOf(state.actions.allIds, id)
      const otherIndex = index + (down ? 1 : -1)

      const newAllIds = [...state.actions.allIds]
      const actionToSwap = newAllIds[index]
      newAllIds[index] = newAllIds[otherIndex]
      newAllIds[otherIndex] = actionToSwap

      return {
        ...state,
        actions: {
          allIds: newAllIds,
          byId: state.actions.byId,
        },
      }
    }
    case Actions.UPDATE_ACTION: {
      const { id, action: updatedAction } = action.payload

      return {
        ...state,
        actions: {
          ...state.actions,
          byId: { ...state.actions.byId, [id]: { ...state.actions.byId[id], ...updatedAction } },
        },
      }
    }
    case Actions.TOGGLE_HIDE_WHISPERS: {
      return {
        ...state,
        hideWhispers: !state.hideWhispers,
      }
    }
    case Actions.RESTORE: {
      return {
        ...state,
        ...action.payload.json,
      }
    }
    case Actions.TOGGLE_AUTO_FOCUS_INPUT: {
      return {
        ...state,
        autoFocusInput: !state.autoFocusInput,
      }
    }
    case Actions.TOGGLE_SHOW_VIEWER_COUNT: {
      return {
        ...state,
        showViewerCount: !state.showViewerCount,
      }
    }
    case Actions.TOGGLE_DISABLE_DIALOG_ANIMATIONS: {
      return {
        ...state,
        disableDialogAnimations: !state.disableDialogAnimations,
      }
    }
    case Actions.TOGGLE_ALTERNATE_MESSAGE_BACKGROUNDS: {
      return {
        ...state,
        alternateMessageBackgrounds: !state.alternateMessageBackgrounds,
      }
    }
    case Actions.TOGGLE_HIGHLIGHT_ALL_MENTIONS: {
      return {
        ...state,
        highlightAllMentions: !state.highlightAllMentions,
      }
    }
    case Actions.TOGGLE_PRIORITIZE_USERNAMES: {
      return {
        ...state,
        prioritizeUsernames: !state.prioritizeUsernames,
      }
    }
    case Actions.UPDATE_HOST_THRESHOLD: {
      return {
        ...state,
        hostThreshold: action.payload.threshold,
      }
    }
    case Actions.UPDATE_AUTO_HOST_THRESHOLD: {
      return {
        ...state,
        autoHostThreshold: action.payload.threshold,
      }
    }
    case Actions.SET_FOLLOWS_SORT_ORDER: {
      return {
        ...state,
        followsSortOrder: action.payload.order,
      }
    }
    case Actions.TOGGLE_HIDE_OFFLINE_FOLLOWS: {
      return {
        ...state,
        hideOfflineFollows: !state.hideOfflineFollows,
      }
    }
    case Actions.SET_SHORTCUT: {
      const { combo, type } = action.payload

      return {
        ...state,
        shortcuts: {
          ...state.shortcuts,
          [type]: combo,
        },
      }
    }
    case Actions.TOGGLE_HIDE_VIP_BADGES: {
      return {
        ...state,
        hideVIPBadges: !state.hideVIPBadges,
      }
    }
    case Actions.TOGGLE_ADD_WHISPERS_TO_HISTORY: {
      return {
        ...state,
        addWhispersToHistory: !state.addWhispersToHistory,
      }
    }
    case Actions.TOGGLE_SOUND: {
      const { soundId } = action.payload

      return {
        ...state,
        sounds: {
          ...state.sounds,
          [soundId]: {
            ...state.sounds[soundId],
            enabled: !state.sounds[soundId].enabled,
          },
        },
      }
    }
    case Actions.UPDATE_SOUND_VOLUME: {
      const { soundId, volume } = action.payload

      return {
        ...state,
        sounds: {
          ...state.sounds,
          [soundId]: {
            ...state.sounds[soundId],
            volume,
          },
        },
      }
    }
    case Actions.TOGGLE_PLAY_MESSAGE_SOUND_ONLY_IN_OWN_CHANNEL: {
      return {
        ...state,
        playMessageSoundOnlyInOwnChannel: !state.playMessageSoundOnlyInOwnChannel,
      }
    }
    case Actions.UPDATE_DELAY_BETWEEN_THROTTLED_SOUNDS: {
      return {
        ...state,
        delayBetweenThrottledSounds: action.payload.delay,
      }
    }
    case Actions.TOGGLE_HIDE_HEADER: {
      return {
        ...state,
        hideHeader: !state.hideHeader,
      }
    }
    case Actions.TOGGLE_MARK_NEW_AS_UNREAD: {
      return {
        ...state,
        markNewAsUnread: !state.markNewAsUnread,
      }
    }
    default: {
      return state
    }
  }
}

export default settingsReducer

/**
 * Toggle between the light & dark theme.
 * @return The action.
 */
export const toggleTheme = () => createAction(Actions.TOGGLE_THEME)

/**
 * Sets the last known version of the application.
 * @param  version - The new version.
 * @return The action.
 */
export const setVersion = (version: string) =>
  createAction(Actions.SET_VERSION, {
    version,
  })

/**
 * Toggle the 'Copy message on double click' setting.
 * @return The action.
 */
export const toggleCopyMessageOnDoubleClick = () => createAction(Actions.TOGGLE_COPY_MESSAGE_DOUBLE_CLICK)

/**
 * Toggle the 'Show context menu' setting.
 * @return The action.
 */
export const toggleShowContextMenu = () => createAction(Actions.TOGGLE_SHOW_CONTEXT_MENU)

/**
 * Add an highlight.
 * @param  highlight - The new highlight.
 * @return The action.
 */
export const addHighlight = (highlight: SerializedHighlight) =>
  createAction(Actions.ADD_HIGHLIGHT, {
    highlight,
  })

/**
 * Update an highlight pattern.
 * @param  id - The highlight id.
 * @param  pattern - The new pattern.
 * @return The action.
 */
export const updateHighlightPattern = (id: string, pattern: string) =>
  createAction(Actions.UPDATE_HIGHLIGHT_PATTERN, {
    id,
    pattern,
  })

/**
 * Update an highlight color.
 * @param  id - The highlight id.
 * @param  color - The new color.
 * @return The action.
 */
export const updateHighlightColor = (id: string, color: HighlightColors) =>
  createAction(Actions.UPDATE_HIGHLIGHT_COLOR, {
    color,
    id,
  })

/**
 * Removes an highlight.
 * @param  id - The highlight id.
 * @return The action.
 */
export const removeHighlight = (id: string) =>
  createAction(Actions.REMOVE_HIGHLIGHT, {
    id,
  })

/**
 * Ignores one or multiple users for highlights and mentions.
 * @param  usernames - The usernames to ignore.
 * @return The action.
 */
export const addHighlightsIgnoredUsers = (usernames: string[]) =>
  createAction(Actions.ADD_HIGHLIGHTS_IGNORED_USERS, {
    usernames,
  })

/**
 * Removes an ignored user for highlights and mentions.
 * @param  username - The username to remove.
 * @return The action.
 */
export const removeHighlightsIgnoredUser = (username: string) =>
  createAction(Actions.REMOVE_HIGHLIGHTS_IGNORED_USER, {
    username,
  })

/**
 * Adds one or multiple users to always be highlighted.
 * @param  usernames - The usernames to always highlight.
 * @return The action.
 */
export const addHighlightsPermanentUsers = (usernames: string[]) =>
  createAction(Actions.ADD_HIGHLIGHTS_PERMANENT_USERS, {
    usernames,
  })

/**
 * Removes an always highlighted user.
 * @param  username - The username to remove.
 * @return The action.
 */
export const removeHighlightsPermanentUser = (username: string) =>
  createAction(Actions.REMOVE_HIGHLIGHTS_PERMANENT_USER, {
    username,
  })

/**
 * Add an Action.
 * @param  action - The new action.
 * @return The action.
 */
export const addAction = (action: SerializedAction) =>
  createAction(Actions.ADD_ACTION, {
    action,
  })

/**
 * Removes an action.
 * @param  id - The action id.
 * @return The action.
 */
export const removeAction = (id: string) =>
  createAction(Actions.REMOVE_ACTION, {
    id,
  })

/**
 * Update an action.
 * @param  id - The action id.
 * @param  pattern - The updated action.
 * @return The action.
 */
export const updateAction = (id: string, action: SerializedAction) =>
  createAction(Actions.UPDATE_ACTION, {
    action,
    id,
  })

/**
 * Moves an action up or down.
 * @param  id - The action id.
 * @param  down - `true` when moving down.
 * @return The action.
 */
export const moveAction = (id: string, down: boolean) =>
  createAction(Actions.MOVE_ACTION, {
    down,
    id,
  })

/**
 * Toggle the 'Hide whispers' setting.
 * @return The action.
 */
export const toggleHideWhispers = () => createAction(Actions.TOGGLE_HIDE_WHISPERS)

/**
 * Restores settings from a backup.
 * @param  json - The JSON backup.
 * @return The action.
 */
export const restoreSettings = (json: SettingsState) =>
  createAction(Actions.RESTORE, {
    json,
  })

/**
 * Toggle the 'Automatically focus the input field' setting.
 * @return The action.
 */
export const toggleAutoFocusInput = () => createAction(Actions.TOGGLE_AUTO_FOCUS_INPUT)

/**
 * Toggle the 'Show viewer count' setting.
 * @return The action.
 */
export const toggleShowViewerCount = () => createAction(Actions.TOGGLE_SHOW_VIEWER_COUNT)

/**
 * Toggle the 'Disable dialog animations' setting.
 * @return The action.
 */
export const toggleDisableDialogAnimations = () => createAction(Actions.TOGGLE_DISABLE_DIALOG_ANIMATIONS)

/**
 * Toggle the 'Alternate message background colors' setting.
 * @return The action.
 */
export const toggleAlternateMessageBackgrounds = () => createAction(Actions.TOGGLE_ALTERNATE_MESSAGE_BACKGROUNDS)

/**
 * Toggle the 'Highlight all mentions' setting.
 * @return The action.
 */
export const toggleHighlightAllMentions = () => createAction(Actions.TOGGLE_HIGHLIGHT_ALL_MENTIONS)

/**
 * Toggle the 'Prioritize usernames' setting.
 * @return The action.
 */
export const togglePrioritizeUsernames = () => createAction(Actions.TOGGLE_PRIORITIZE_USERNAMES)

/**
 * Updates the host threshold.
 * @param  threshold - The new threshold.
 * @return The action.
 */
export const updateHostThreshold = (threshold: number) =>
  createAction(Actions.UPDATE_HOST_THRESHOLD, {
    threshold,
  })

/**
 * Updates the auto-host threshold.
 * @param  threshold - The new threshold.
 * @return The action.
 */
export const updateAutoHostThreshold = (threshold: number) =>
  createAction(Actions.UPDATE_AUTO_HOST_THRESHOLD, {
    threshold,
  })

/**
 * Sets the follows sort order.
 * @param  order - The new sort order.
 * @return The action.
 */
export const setFollowsSortOrder = (order: FollowsSortOrder) =>
  createAction(Actions.SET_FOLLOWS_SORT_ORDER, {
    order,
  })

/**
 * Toggle the 'Hide offline follows' setting.
 * @return The action.
 */
export const toggleHideOfflineFollows = () => createAction(Actions.TOGGLE_HIDE_OFFLINE_FOLLOWS)

/**
 * Sets the combo of a specific shortcut type.
 * @param  type - The shortcut type.
 * @param  combo - The new combo.
 * @return The action.
 */
export const setShortcut = (type: ShortcutType, combo: ShortcutCombo) =>
  createAction(Actions.SET_SHORTCUT, {
    combo,
    type,
  })

/**
 * Toggles the 'Hide VIP badges' setting.
 * @return The action.
 */
export const toggleHideVIPBadges = () => createAction(Actions.TOGGLE_HIDE_VIP_BADGES)

/**
 * Toggles the 'Add whispers to history' setting.
 * @return The action.
 */
export const toggleAddWhispersToHistory = () => createAction(Actions.TOGGLE_ADD_WHISPERS_TO_HISTORY)

/**
 * Toggles a sound enabled or not.
 * @param  soundId - The id of the sound to toggle.
 * @return The action.
 */
export const toggleSound = (soundId: SoundId) =>
  createAction(Actions.TOGGLE_SOUND, {
    soundId,
  })

/**
 * Updates a sound volume.
 * @param  soundId - The id of the sound to update.
 * @param  volume - The new volume.
 * @return The action.
 */
export const updateSoundVolume = (soundId: SoundId, volume: number) =>
  createAction(Actions.UPDATE_SOUND_VOLUME, {
    soundId,
    volume,
  })

/**
 * Toggles the 'Play sound on messages only in my channel' setting.
 * @return The action.
 */
export const togglePlayMessageSoundOnlyInOwnChannel = () =>
  createAction(Actions.TOGGLE_PLAY_MESSAGE_SOUND_ONLY_IN_OWN_CHANNEL)

/**
 * Updates the delay in seconds between throttled sounds.
 * @param  delay - The new delay.
 * @return The action.
 */
export const updateDelayBetweenThrottledSounds = (delay: number) =>
  createAction(Actions.UPDATE_DELAY_BETWEEN_THROTTLED_SOUNDS, {
    delay,
  })

/**
 * Toggles the 'Hides header' setting.
 * @return The action.
 */
export const toggleHideHeader = () => createAction(Actions.TOGGLE_HIDE_HEADER)

/**
 * Toggles the 'Mark new messages as unread' setting.
 * @return The action.
 */
export const toggleMarkNewAsUnread = () => createAction(Actions.TOGGLE_MARK_NEW_AS_UNREAD)

/**
 * Settings actions.
 */
export type SettingsActions =
  | RehydrateAction
  | ReturnType<typeof toggleTheme>
  | ReturnType<typeof setVersion>
  | ReturnType<typeof toggleCopyMessageOnDoubleClick>
  | ReturnType<typeof toggleShowContextMenu>
  | ReturnType<typeof addHighlight>
  | ReturnType<typeof updateHighlightPattern>
  | ReturnType<typeof updateHighlightColor>
  | ReturnType<typeof removeHighlight>
  | ReturnType<typeof addHighlightsIgnoredUsers>
  | ReturnType<typeof removeHighlightsIgnoredUser>
  | ReturnType<typeof addHighlightsPermanentUsers>
  | ReturnType<typeof removeHighlightsPermanentUser>
  | ReturnType<typeof addAction>
  | ReturnType<typeof removeAction>
  | ReturnType<typeof updateAction>
  | ReturnType<typeof toggleHideWhispers>
  | ReturnType<typeof restoreSettings>
  | ReturnType<typeof toggleAutoFocusInput>
  | ReturnType<typeof toggleShowViewerCount>
  | ReturnType<typeof toggleDisableDialogAnimations>
  | ReturnType<typeof toggleAlternateMessageBackgrounds>
  | ReturnType<typeof toggleHighlightAllMentions>
  | ReturnType<typeof togglePrioritizeUsernames>
  | ReturnType<typeof moveAction>
  | ReturnType<typeof updateHostThreshold>
  | ReturnType<typeof updateAutoHostThreshold>
  | ReturnType<typeof setFollowsSortOrder>
  | ReturnType<typeof toggleHideOfflineFollows>
  | ReturnType<typeof setShortcut>
  | ReturnType<typeof toggleHideVIPBadges>
  | ReturnType<typeof toggleAddWhispersToHistory>
  | ReturnType<typeof toggleSound>
  | ReturnType<typeof updateSoundVolume>
  | ReturnType<typeof togglePlayMessageSoundOnlyInOwnChannel>
  | ReturnType<typeof updateDelayBetweenThrottledSounds>
  | ReturnType<typeof toggleHideHeader>
  | ReturnType<typeof toggleMarkNewAsUnread>

/**
 * Settings state.
 */
export type SettingsState = {
  /**
   * Selected theme.
   */
  theme: Theme

  /**
   * Last know version of the application.
   */
  lastKnownVersion: string | null

  /**
   * Defines if messages should be copied in the clipboard when double clicking them.
   */
  copyMessageOnDoubleClick: boolean

  /**
   * Defines if a context menu should be added to each message.
   */
  showContextMenu: boolean

  /**
   * Highlights.
   */
  highlights: SerializedHighlights

  /**
   * Users ignored for highlights & mentions.
   */
  highlightsIgnoredUsers: string[]

  /**
   * Users with messages always highlighted.
   */
  highlightsPermanentUsers: string[]

  /**
   * Actions.
   */
  actions: {
    /**
     * All actions keyed by ids.
     */
    byId: SerializedActions

    /**
     * All actions ordered by ids.
     */
    allIds: string[]
  }

  /**
   * Hides VIPs badges except in your own channel.
   */
  hideVIPBadges: boolean

  /**
   * Hides whispers (received & sent).
   */
  hideWhispers: boolean

  /**
   * Automatically focus the input field when focusing the application.
   */
  autoFocusInput: boolean

  /**
   * Shows the viewer count in the header.
   */
  showViewerCount: boolean

  /**
   * Disables dialog animations.
   */
  disableDialogAnimations: boolean

  /**
   * Highlights all mentions (@notYou) instead of only you.
   */
  highlightAllMentions: boolean

  /**
   * Prioritizes usernames when auto-completing.
   */
  prioritizeUsernames: boolean

  /**
   * Hosts below this threshold will be ignored.
   */
  hostThreshold: number

  /**
   * Auto-hosts below this threshold will be ignored.
   */
  autoHostThreshold: number

  /**
   * Follows sort order.
   */
  followsSortOrder: FollowsSortOrder

  /**
   * Hide offline follows.
   */
  hideOfflineFollows: boolean

  /**
   * Shortcuts.
   */
  shortcuts: Record<ShortcutType, ShortcutCombo>

  /**
   * Adds whispers to the history when enabled.
   */
  addWhispersToHistory: boolean

  /**
   * Sounds.
   */
  sounds: Record<SoundId, SoundSettings>

  /**
   * When enabled, only plays message sounds in your own channel.
   */
  playMessageSoundOnlyInOwnChannel: boolean

  /**
   * Minimum delay (in seconds) between two throttled sounds like message sounds.
   */
  delayBetweenThrottledSounds: number

  /**
   * Hides the header.
   */
  hideHeader: boolean

  /**
   * Alternate message background colors.
   */
  alternateMessageBackgrounds: boolean

  /**
   * Mark new messages as unread.
   */
  markNewAsUnread: boolean
}

/**
 * Highlights.
 */
export type SerializedHighlights = Record<SerializedHighlight['id'], SerializedHighlight>

/**
 * Actions.
 */
export type SerializedActions = Record<SerializedAction['id'], SerializedAction>

/**
 * Sound settings.
 */
export type SoundSettings = {
  enabled: boolean
  volume: number
}
