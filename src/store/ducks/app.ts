import { Reducer } from 'redux'

import Status from 'Constants/status'
import { Emote, EmoteProviderPrefix } from 'Libs/EmotesProvider'
import { SerializedRoomState } from 'Libs/RoomState'
import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  SET_CHANNEL = 'app/SET_CHANNEL',
  UPDATE_STATUS = 'app/UPDATE_STATUS',
  UPDATE_ROOM_STATE = 'app/UPDATE_ROOM_STATE',
  SET_SHOULD_READ_CHANGELOG = 'app/SET_SHOULD_READ_CHANGELOG',
  ADD_TO_HISTORY = 'app/ADD_TO_HISTORY',
  UPDATE_HISTORY_INDEX = 'app/UPDATE_HISTORY_INDEX',
  UPDATE_EMOTES = 'app/UPDATE_EMOTES',
  RESET_APP_STATE = 'app/RESET_APP_STATE',
  SET_LAST_WHISPER_SENDER = 'app/SET_LAST_WHISPER_SENDER',
}

/**
 * Initial state.
 */
export const initialState = {
  channel: null,
  emotes: {},
  history: [],
  historyIndex: -1,
  lastWhisperSender: '',
  roomState: null,
  shouldReadChangelog: false,
  status: Status.Default,
}

/**
 * App reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const appReducer: Reducer<AppState, AppActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_CHANNEL: {
      return {
        ...state,
        channel: action.payload.channel,
      }
    }
    case Actions.UPDATE_STATUS: {
      return {
        ...state,
        status: action.payload.status,
      }
    }
    case Actions.UPDATE_ROOM_STATE: {
      return {
        ...state,
        roomState: {
          ...state.roomState,
          ...action.payload.state,
        },
      }
    }
    case Actions.SET_SHOULD_READ_CHANGELOG: {
      return {
        ...state,
        shouldReadChangelog: action.payload.shouldRead,
      }
    }
    case Actions.ADD_TO_HISTORY: {
      return {
        ...state,
        history: [action.payload.message, ...state.history],
        historyIndex: initialState.historyIndex,
      }
    }
    case Actions.UPDATE_HISTORY_INDEX: {
      return {
        ...state,
        historyIndex: action.payload.index,
      }
    }
    case Actions.UPDATE_EMOTES: {
      const { prefix, emotes } = action.payload

      return {
        ...state,
        emotes: { ...state.emotes, [prefix]: emotes },
      }
    }
    case Actions.RESET_APP_STATE: {
      return {
        ...initialState,
        shouldReadChangelog: state.shouldReadChangelog,
      }
    }
    case Actions.SET_LAST_WHISPER_SENDER: {
      return {
        ...state,
        lastWhisperSender: action.payload.username,
      }
    }
    default: {
      return state
    }
  }
}

export default appReducer

/**
 * Sets the current channel.
 * @param  channel - The new channel.
 * @return The action.
 */
export const setChannel = (channel: string) =>
  createAction(Actions.SET_CHANNEL, {
    channel,
  })

/**
 * Updates the current status.
 * @param  status - The new status.
 * @return The action.
 */
export const updateStatus = (status: Status) =>
  createAction(Actions.UPDATE_STATUS, {
    status,
  })

/**
 * Updates the room state.
 * @param  state - The new state.
 * @return The action.
 */
export const updateRoomState = (state: SerializedRoomState) =>
  createAction(Actions.UPDATE_ROOM_STATE, {
    state,
  })

/**
 * Indicates or not that a new changelog is available.
 * @param  shouldRead - `true` when a new changelog is available.
 * @return The action.
 */
export const setShouldReadChangelog = (shouldRead: boolean) =>
  createAction(Actions.SET_SHOULD_READ_CHANGELOG, {
    shouldRead,
  })

/**
 * Adds a message to the history.
 * @param  message - The message to add.
 * @return The action.
 */
export const addToHistory = (message: string) =>
  createAction(Actions.ADD_TO_HISTORY, {
    message,
  })

/**
 * Updates the history index.
 * @param  index - The new index.
 * @return The action.
 */
export const updateHistoryIndex = (index: number) =>
  createAction(Actions.UPDATE_HISTORY_INDEX, {
    index,
  })

/**
 * Updates emotes.
 * @param  prefix - The emote provider prefix.
 * @param  emotes - The emotes.
 * @return The action.
 */
export const updateEmotes = (prefix: EmoteProviderPrefix, emotes: Emote[]) =>
  createAction(Actions.UPDATE_EMOTES, {
    emotes,
    prefix,
  })

/**
 * Reset the app state.
 * @return The action.
 */
export const resetAppState = () => createAction(Actions.RESET_APP_STATE)

/**
 * Sets the username of the last user that sent us a whisper.
 * @param  username - The user name.
 * @return The action.
 */
export const setLastWhisperSender = (username: string) =>
  createAction(Actions.SET_LAST_WHISPER_SENDER, {
    username,
  })

/**
 * App actions.
 */
export type AppActions =
  | ReturnType<typeof setChannel>
  | ReturnType<typeof updateStatus>
  | ReturnType<typeof updateRoomState>
  | ReturnType<typeof setShouldReadChangelog>
  | ReturnType<typeof addToHistory>
  | ReturnType<typeof updateHistoryIndex>
  | ReturnType<typeof updateEmotes>
  | ReturnType<typeof resetAppState>
  | ReturnType<typeof setLastWhisperSender>

/**
 * App state.
 */
export type AppState = {
  /**
   * The current channel.
   */
  channel: string | null

  /**
   * Connection status.
   */
  status: Status

  /**
   * Room state.
   */
  roomState: SerializedRoomState | null

  /**
   * Defines if the user is using a new version of the application and should read the associated changelog.
   */
  shouldReadChangelog: boolean

  /**
   * Messages sent by the current user.
   */
  history: string[]

  /**
   * Current position in the history.
   */
  historyIndex: number

  /**
   * Emotes.
   */
  emotes: { [key: string]: Emote[] }

  /**
   * The username of the last user that sent us a whisper.
   */
  lastWhisperSender: string
}
