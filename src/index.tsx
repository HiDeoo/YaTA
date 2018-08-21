import { Classes, Colors, FocusStyleManager } from '@blueprintjs/core'
import * as React from 'react'
import { render } from 'react-dom'

import Wrapper from 'Components/Wrapper'
import configureStore, { StoreConfiguration } from 'Store'
import { injectGlobal } from 'Styled'
import base from 'Styled/base'

import 'node_modules/@blueprintjs/core/lib/css/blueprint.css'
import 'node_modules/@blueprintjs/select/lib/css/blueprint-select.css'
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
    &.channelTooltip {
      background-color: ${base.tooltip.background};
      padding: 5px 10px;

      &.show {
        opacity: 1;
      }

      &.place-left::after {
        border-left: 8px solid ${base.tooltip.background};
      }

      &.place-right::after {
        border-right: 8px solid ${base.tooltip.background};
      }

      &.place-top::after {
        border-top: 8px solid ${base.tooltip.background};
      }

      &.place-bottom::after {
        border-bottom: 8px solid ${base.tooltip.background};
      }

      img {
        display: inline-block;
        max-height: 200px;
        max-width: 200px;
      }

      .preview {
        align-items: center;
        display: flex;
        height: 210px;
        justify-content: center;
        width: 220px;
      }
    }
  }

  .${Classes.POPOVER}.${Classes.MINIMAL}.${Classes.POPOVER}.emotePickerPopover,
  .${Classes.DARK} .${Classes.POPOVER}.${Classes.MINIMAL}.${Classes.POPOVER}.emotePickerPopover {
    transform: scale(1) translateY(-36px);
  }

  .${Classes.ALERT_CONTENTS} {
    flex: 1;
  }

  ::-webkit-scrollbar {
    width: 15px;
  }

  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    border-radius: 8px;
    border: 3px solid transparent;
    border-right-width: 4px;
  }

  ::-webkit-scrollbar-track-piece,
  ::-webkit-scrollbar-corner {
    background-color: transparent;
    border-color: transparent;
  }

  ::-webkit-scrollbar-track {
    background-color: ${Colors.LIGHT_GRAY2};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${Colors.GRAY3};
  }

  body.${Classes.DARK} ::-webkit-scrollbar-track {
    background-color: ${Colors.DARK_GRAY2};
  }

  body.${Classes.DARK} ::-webkit-scrollbar-thumb {
    background-color: ${Colors.DARK_GRAY1};
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
