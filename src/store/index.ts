import * as storage from 'localforage'
import { applyMiddleware, compose, createStore, Middleware, Store } from 'redux'
import { createMigrate, persistCombineReducers, Persistor, persistStore } from 'redux-persist'

import migrations from 'Store/migrations'
import reducers, { ApplicationState } from 'Store/reducers'

/**
 * Combined & persisted reducers.
 */
const persistedReducers = persistCombineReducers<ApplicationState>(
  {
    key: 'YaTA:store',
    migrate: createMigrate(migrations as any, { debug: false }),
    storage,
    version: 7,
    whitelist: ['settings', 'user'],
  },
  reducers
)

/**
 * Creates and configures the Redux Store.
 * @return The Redux store configuration containing the actual store and the persistor.
 */
export default function configureStore(): StoreConfiguration {
  const middlewares: Middleware[] = []

  const composeEnhancers: typeof compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(persistedReducers, composeEnhancers(applyMiddleware(...middlewares)))

  const persistor = persistStore(store)

  return { store, persistor }
}

/**
 * Store Configuration.
 * @prop store - The Redux store.
 * @prop [persistor] - The Redux persistor.
 */
export type StoreConfiguration = {
  store: Store<PersistedApplicationState>
  persistor: Persistor
}

/**
 * Persisted application state.
 */
export type PersistedApplicationState = ReturnType<typeof persistedReducers>
