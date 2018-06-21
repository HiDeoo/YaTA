import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import ErrorBoundary from 'Components/ErrorBoundary'
import App from 'Containers/App'
import { StoreConfiguration } from 'Store'

/**
 * Wrapper Container.
 * This wrapper will wrap the application with the required components like Redux, React-Router, etc.
 */
const Wrapper: React.SFC<Props> = ({ storeConfiguration }) => {
  const { persistor, store } = storeConfiguration

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Route component={App} />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}

export default Wrapper

/**
 * React Props.
 */
type Props = {
  storeConfiguration: StoreConfiguration
}
