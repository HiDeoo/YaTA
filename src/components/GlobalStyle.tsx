import { Classes, Colors } from '@blueprintjs/core'

import { createGlobalStyle } from 'Styled'
import base from 'Styled/base'

/**
 * Global Style Component.
 */
export default createGlobalStyle`
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
