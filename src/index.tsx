import { FocusStyleManager } from '@blueprintjs/core'
import * as React from 'react'
import { render } from 'react-dom'
import { injectGlobal } from 'styled-components'

import Wrapper from 'Components/Wrapper'
import configureStore, { StoreConfiguration } from 'Store'
import registerServiceWorker from './registerServiceWorker'

import 'node_modules/@blueprintjs/core/lib/css/blueprint.css'
import 'node_modules/normalize.css/normalize.css'

/**
 * Injects global CSS.
 */
injectGlobal`
  html,
  body,
  .root {
    height: 100%;
    overflow-y: hidden;
  }

  .__react_component_tooltip {
    width: 220px;
    height: 220px;
    padding: 10px;

    img {
      display: inline-block;
      max-height: 200px;
      max-width: 200px;
    }

    .preview {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      width: 100%;
    }
  }
`

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
 * Renders the application.
 */
renderApplication(Wrapper, storeConfiguration)

/**
 * Disables focus outline when using a mouse.
 */
FocusStyleManager.onlyShowFocusOnTabs()

/**
 * Registers service worker.
 */
registerServiceWorker()

/**
 * Props accepting a store configuration
 * @prop storeConfiguration - The store configuration
 */
type WithStoreConfiguration = {
  storeConfiguration: StoreConfiguration
}
