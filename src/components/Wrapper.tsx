import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import App from 'Containers/App'
import ErrorBoundary from 'Containers/ErrorBoundary'
import { StoreConfiguration } from 'Store'

/**
 * Wrapper Container.
 * This wrapper will wrap the application with the required components like Redux, React-Router, etc.
 */
const Wrapper: React.SFC<Props> = ({ storeConfiguration }) => {
  const { persistor, store } = storeConfiguration

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <PersistGate persistor={persistor}>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Route component={App} />
          </BrowserRouter>
        </PersistGate>
      </ErrorBoundary>
    </Provider>
  )
}

export default Wrapper

/**
 * React Props.
 */
type Props = {
  storeConfiguration: StoreConfiguration
}
