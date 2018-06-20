import { createSelector } from 'reselect'

import { ApplicationState } from 'Store/reducers'

/**
 * Returns the application state.
 * @param  state - The Redux state.
 * @return The application state.
 */
const getAppState = (state: ApplicationState) => state.app

/**
 * Returns the test state.
 * @param  state - The Redux state.
 * @return The test state.
 */
export const getTest = createSelector([getAppState], (app) => app.test)
