import { Button, Menu, Popover, Position } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import HighlightColorMenuItem from 'Components/HighlightColorMenuItem'
import { HighlightColors } from 'Libs/Highlight'
import { withSCProps } from 'Utils/react'
import { color, ifProp } from 'Utils/styled'

/**
 * ColorMenuButton component.
 */
const ColorMenuButton = styled(Button)`
  margin-left: 10px;
  margin-top: ${ifProp('minimal', '-20px', 'initial')};
  width: 109px;

  &.pt-button {
    justify-content: flex-end;

    & .pt-button-text {
      align-items: center;
      display: inline-flex;
      flex: 1;
    }
  }
`

/**
 * ColorPreview component.
 */
const ColorPreview = withSCProps<ColorPreviewProps, HTMLDivElement>(styled.div)`
  background-color: ${(props) => color(`log.highlight.${props.highlightColor}.background`)};
  border-radius: 2px;
  height: 11px;
  margin-right: 10px;
  width: 11px;
`

/**
 * ColorName component.
 */
const ColorName = styled.div`
  flex: 1;
  text-align: right;
`

/**
 * SettingsHighlightColorMenu Component.
 */
export default class SettingsHighlightColorMenu extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { color: highlightColor, onSelect, small } = this.props

    return (
      <Popover
        content={
          <Menu>
            {_.map(HighlightColors, (name) => (
              <HighlightColorMenuItem key={name} color={name} onClick={onSelect} selected={name === highlightColor} />
            ))}
          </Menu>
        }
        position={small ? undefined : Position.BOTTOM_RIGHT}
        usePortal={false}
      >
        <ColorMenuButton rightIcon="caret-down" minimal={small || false}>
          <ColorPreview highlightColor={highlightColor} />
          <ColorName>{highlightColor}</ColorName>
        </ColorMenuButton>
      </Popover>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  color: HighlightColors
  onSelect: (color: HighlightColors) => void
  small?: boolean
}

/**
 * React Props.
 */
type ColorPreviewProps = {
  highlightColor: HighlightColors
}
