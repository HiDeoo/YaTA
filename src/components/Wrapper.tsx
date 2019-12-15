import * as React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import App from 'containers/App'
import ErrorBoundary from 'containers/ErrorBoundary'
import { StoreConfiguration } from 'store'

/**
 * Wrapper Container.
 * This wrapper will wrap the application with the required components like Redux, React-Router, etc.
 */
const Wrapper: React.SFC<Props> = ({ storeConfiguration }) => {
  const { persistor, store } = storeConfiguration

  return (
    <Provider store={store}>
      <HelmetProvider>
        <ErrorBoundary>
          <PersistGate persistor={persistor}>
            <BrowserRouter basename={process.env.PUBLIC_URL}>
              <Route component={App} />
            </BrowserRouter>
          </PersistGate>
        </ErrorBoundary>
      </HelmetProvider>
    </Provider>
  )
}

export default Wrapper

/**
 * React Props.
 */
interface Props {
  storeConfiguration: StoreConfiguration
}
