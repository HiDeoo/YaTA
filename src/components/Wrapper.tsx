import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'

import App from 'Containers/App'
import { StoreConfiguration } from 'Store'

/**
 * Wrapper Container.
 * This wrapper will wrap the application with the required components like Redux, React-Router, etc.
 */
const Wrapper: React.SFC<Props> = ({ storeConfiguration }) => {
  const { store } = storeConfiguration

  return (
    <Provider store={store}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Route component={App} />
      </BrowserRouter>
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
