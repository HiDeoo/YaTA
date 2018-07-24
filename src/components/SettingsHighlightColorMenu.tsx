import { Button, Menu, Popover, Position } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import HighlightColorMenuItem from 'Components/HighlightColorMenuItem'
import { HighlightColors } from 'Libs/Highlight'
import { ifProp } from 'Utils/styled'

/**
 * ColorMenuButton component.
 */
const ColorMenuButton = styled(Button)`
  margin-left: 10px;
  margin-top: ${ifProp('minimal', '-20px', 'initial')};
  width: 90px;

  &.pt-button {
    justify-content: flex-end;
  }
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
    const { color, onSelect, small } = this.props

    return (
      <Popover
        content={
          <Menu>
            {_.map(HighlightColors, (name) => <HighlightColorMenuItem key={name} color={name} onClick={onSelect} />)}
          </Menu>
        }
        position={small ? undefined : Position.BOTTOM_RIGHT}
        usePortal={false}
      >
        <ColorMenuButton rightIcon="caret-down" minimal={small || false}>
          {color}
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
