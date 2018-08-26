import * as _ from 'lodash'
import { Reducer } from 'redux'
import { REHYDRATE } from 'redux-persist/lib/constants'

import { ShortcutCombo, ShortcutType } from 'Constants/shortcut'
import Theme from 'Constants/theme'
import { SerializedAction } from 'Libs/Action'
import { HighlightColors, SerializedHighlight } from 'Libs/Highlight'
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
  TOGGLE_PLAY_SOUND_ON_MENTIONS = 'settings/TOGGLE_PLAY_SOUND_ON_MENTIONS',
  TOGGLE_PLAY_SOUND_ON_WHISPERS = 'settings/TOGGLE_PLAY_SOUND_ON_WHISPERS',
  SET_FOLLOWS_SORT_ORDER = 'settings/SET_FOLLOWS_SORT_ORDER',
  TOGGLE_HIDE_OFFLINE_FOLLOWS = 'settings/TOGGLE_HIDE_OFFLINE_FOLLOWS',
  SET_SHORTCUT = 'settings/SET_SHORTCUT',
}

/**
 * Initial state.
 */
export const initialState = {
  actions: {
    allIds: [],
    byId: {},
  },
  autoFocusInput: true,
  autoHostThreshold: 1,
  copyMessageOnDoubleClick: true,
  disableDialogAnimations: false,
  followsSortOrder: FollowsSortOrder.ViewersDesc,
  hideOfflineFollows: false,
  hideWhispers: false,
  highlightAllMentions: false,
  highlights: {},
  highlightsIgnoredUsers: [],
  highlightsPermanentUsers: [],
  hostThreshold: 1,
  lastKnownVersion: null,
  playSoundOnMentions: false,
  playSoundOnWhispers: false,
  prioritizeUsernames: false,
  shortcuts: {
    [ShortcutType.OpenSettings]: 'alt + ,',
    [ShortcutType.NavigateHome]: 'alt + h',
    [ShortcutType.CreateClip]: 'alt + x',
    [ShortcutType.ToggleSearch]: 'alt + f',
    [ShortcutType.ToggleOmnibar]: 'alt + p',
    [ShortcutType.TogglePollEditor]: 'alt + c',
    [ShortcutType.FocusChatInput]: 'alt + a',
    [ShortcutType.AddMarker]: 'alt + m',
    [ShortcutType.CreatePoll]: 'alt + enter',
  },
  showContextMenu: true,
  showViewerCount: false,
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
    case Actions.TOGGLE_PLAY_SOUND_ON_MENTIONS: {
      return {
        ...state,
        playSoundOnMentions: !state.playSoundOnMentions,
      }
    }
    case Actions.TOGGLE_PLAY_SOUND_ON_WHISPERS: {
      return {
        ...state,
        playSoundOnWhispers: !state.playSoundOnWhispers,
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
 * Toggle the 'Play sound on mentions' setting.
 * @return The action.
 */
export const togglePlaySoundOnMentions = () => createAction(Actions.TOGGLE_PLAY_SOUND_ON_MENTIONS)

/**
 * Toggle the 'Play sound on whispers' setting.
 * @return The action.
 */
export const togglePlaySoundOnWhispers = () => createAction(Actions.TOGGLE_PLAY_SOUND_ON_WHISPERS)

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
  | ReturnType<typeof toggleHighlightAllMentions>
  | ReturnType<typeof togglePrioritizeUsernames>
  | ReturnType<typeof moveAction>
  | ReturnType<typeof updateHostThreshold>
  | ReturnType<typeof updateAutoHostThreshold>
  | ReturnType<typeof togglePlaySoundOnMentions>
  | ReturnType<typeof togglePlaySoundOnWhispers>
  | ReturnType<typeof setFollowsSortOrder>
  | ReturnType<typeof toggleHideOfflineFollows>
  | ReturnType<typeof setShortcut>

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
   * Plays a sound on mentions.
   */
  playSoundOnMentions: boolean

  /**
   * Plays a sound on whispers.
   */
  playSoundOnWhispers: boolean

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
}

/**
 * Highlights.
 */
export type SerializedHighlights = Record<SerializedHighlight['id'], SerializedHighlight>

/**
 * Actions.
 */
export type SerializedActions = Record<SerializedAction['id'], SerializedAction>
