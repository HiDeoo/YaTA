/**
 * Shortcut type.
 */
export enum ShortcutType {
  OpenSettings = 'open_settings',
  NavigateHome = 'navigate_home',
  CreateClip = 'create_clip',
  ToggleSearch = 'toggle_search',
  ToggleOmnibar = 'toggle_omnibar',
  TogglePollEditor = 'toggle_poll_editor',
  FocusChatInput = 'focus_chat_input',
  AddMarker = 'add_marker',
  CreatePoll = 'create_poll',
  HiDeHeader = 'hide_header',
}

/**
 * Shortcut group.
 */
export enum ShortcutGroup {
  Global = 'Global',
  Chat = 'Chat',
  Poll = 'Poll Editor',
}

/**
 * Shortcut definitions (do not include the associated combo).
 */
export const ShortcutDefinitions: Record<ShortcutType, ShortcutDefinition> = {
  [ShortcutType.OpenSettings]: {
    group: ShortcutGroup.Global,
    name: 'Open settings',
    type: ShortcutType.OpenSettings,
  },
  [ShortcutType.NavigateHome]: {
    group: ShortcutGroup.Global,
    name: 'Navigate to the homepage',
    type: ShortcutType.NavigateHome,
  },
  [ShortcutType.HiDeHeader]: {
    group: ShortcutGroup.Global,
    name: 'Toggle header',
    type: ShortcutType.HiDeHeader,
  },
  [ShortcutType.CreateClip]: { group: ShortcutGroup.Chat, name: 'Create clip', type: ShortcutType.CreateClip },
  [ShortcutType.ToggleSearch]: { group: ShortcutGroup.Chat, name: 'Toggle search', type: ShortcutType.ToggleSearch },
  [ShortcutType.ToggleOmnibar]: { group: ShortcutGroup.Chat, name: 'Toggle omnibar', type: ShortcutType.ToggleOmnibar },
  [ShortcutType.TogglePollEditor]: {
    group: ShortcutGroup.Chat,
    name: 'Toggle poll editor',
    type: ShortcutType.TogglePollEditor,
  },
  [ShortcutType.FocusChatInput]: {
    group: ShortcutGroup.Chat,
    name: 'Focus chat input field',
    type: ShortcutType.FocusChatInput,
  },
  [ShortcutType.AddMarker]: { group: ShortcutGroup.Chat, name: 'Add marker', type: ShortcutType.AddMarker },
  [ShortcutType.CreatePoll]: {
    group: ShortcutGroup.Poll,
    name: 'Create poll',
    readonly: true,
    type: ShortcutType.CreatePoll,
  },
}

/**
 * Shortcut definition (do not include the associated combo).
 */
type ShortcutDefinition = {
  group?: ShortcutGroup
  name: string
  readonly?: boolean
  type: ShortcutType
}

/**
 * Shortcut combo.
 */
export type ShortcutCombo = string | null

/**
 * Shortcut (include the associated combo).
 */
export type Shortcut = ShortcutDefinition & { combo: ShortcutCombo }

/**
 * Shortcut implementations.
 */
export type ShortcutImplementations = Array<{ type: ShortcutType; action: () => void }>
