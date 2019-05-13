import * as _ from 'lodash'
import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the note of a specific chatter based in its id.
 * @param  state - The Redux state.
 * @param  id - The chatter id.
 * @return The chatter note.
 */
const getChatterNote = (state: ApplicationState, id: string) => _.get(state.notes, id)

/**
 * Creates the selector retuning the note of a chatter.
 * @return The selector.
 */
export const makeGetChatterNote = () =>
  createSelector(
    [getChatterNote],
    (note) => {
      return _.isNil(note) ? '' : note
    }
  )

/**
 * Returns all notes available for a backup.
 * @param  state - The Redux state.
 * @return The notes.
 */
export const getNotesBackup = (state: ApplicationState) => state.notes
