import * as _ from 'lodash'
import { Reducer } from 'redux'

import { createAction } from 'Utils/redux'

/**
 * Actions types.
 */
export enum Actions {
  EDIT = 'notes/EDIT',
  RESTORE = 'notes/RESTORE',
}

/**
 * Initial state.
 */
export const initialState = {}

/**
 * Notes reducer.
 * @param  [state=initialState] - Current state.
 * @param  action - Current action.
 * @return The new state.
 */
const notesReducer: Reducer<NotesState, NotesActions> = (state = initialState, action) => {
  switch (action.type) {
    case Actions.EDIT: {
      const { id, note } = action.payload

      return {
        ...state,
        [id]: note,
      }
    }
    case Actions.RESTORE: {
      return {
        ...state,
        ...action.payload.json,
      }
    }
    default: {
      return state
    }
  }
}

export default notesReducer

/**
 * Updates a note.
 * @param  id - The chatter id associated to the note.
 * @param  note - The note.
 * @return The action.
 */
export const updateNote = (id: string, note: string) =>
  createAction(Actions.EDIT, {
    id,
    note,
  })

/**
 * Restores notes from a backup.
 * @param  json - The JSON backup.
 * @return The action.
 */
export const restoreNotes = (json: NotesState) =>
  createAction(Actions.RESTORE, {
    json,
  })

/**
 * Notes actions.
 */
export type NotesActions = ReturnType<typeof updateNote> | ReturnType<typeof restoreNotes>

/**
 * Notes state.
 */
export type NotesState = Record<string, string>
