/**
 * List of toggleable UIs with visibility controlled by local React state.
 * Note: The string value is the state property used to control the visibility.
 */
export enum ToggleableUI {
  Chatters = 'showChatters',
  CommandsHelp = 'showCommandsHelp',
  StreamOmnibar = 'showStreamOmnibar',
  LogsExporter = 'showLogsExporter',
  PollEditor = 'showPollEditor',
  Reason = 'showReason',
  Search = 'showSearch',
  Settings = 'showSettings',
}

/**
 * React Props.
 */
export interface ToggleableProps {
  toggle: () => void
  visible: boolean
}
