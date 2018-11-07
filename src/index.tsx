import { FocusStyleManager } from '@blueprintjs/core'
import * as React from 'react'
import { render } from 'react-dom'

import Wrapper from 'Components/Wrapper'
import configureStore, { StoreConfiguration } from 'Store'

import 'node_modules/@blueprintjs/core/lib/css/blueprint.css'
import 'node_modules/@blueprintjs/select/lib/css/blueprint-select.css'
import 'node_modules/normalize.css/normalize.css'

/**
 * Renders the application while passing down the Redux store.
 * @param Component - The root component of the application.
 * @param configuration - The store configuration to pass down to the root component.
 */
function renderApplication(Component: React.ComponentType<WithStoreConfiguration>, configuration: StoreConfiguration) {
  render(<Component storeConfiguration={configuration} />, document.getElementById('root'))
}

/**
 * The Redux store configuration.
 */
const storeConfiguration = configureStore()

/**
 * Enables HMR.
 */
if (module.hot) {
  module.hot.accept()
}

/**
 * Renders the application.
 */
renderApplication(Wrapper, storeConfiguration)

/**
 * Disables focus outline when using a mouse.
 */
FocusStyleManager.onlyShowFocusOnTabs()

/**
 * Props accepting a store configuration
 * @prop storeConfiguration - The store configuration
 */
type WithStoreConfiguration = {
  storeConfiguration: StoreConfiguration
}
