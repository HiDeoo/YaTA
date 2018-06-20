import * as React from 'react'
import { Provider } from 'react-redux'

import App from 'Containers/App'
import { StoreConfiguration } from 'Store'

/**
 * Wrapper Container.
 * This wrapper will wrap the application with the required components like Redux, etc.
 */
const Wrapper: React.SFC<Props> = ({ storeConfiguration }) => {
  const { store } = storeConfiguration

  return (
    <Provider store={store}>
      <App />
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
