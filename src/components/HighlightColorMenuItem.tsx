import { Menu } from '@blueprintjs/core'
import * as React from 'react'

import { HighlightColors } from 'Libs/Highlight'
import styled, { theme } from 'Styled'

/**
 * ColorPreview component.
 */
const ColorPreview = styled.div<ColorPreviewProps>`
  background-color: ${(props) => theme(`log.highlight.${props.highlightColor}.background`)};
  border-radius: 2px;
  height: 15px;
  margin-right: 2px;
  margin-top: 3px;
  width: 15px;
`

/**
 * HighlightColorMenuItem Component.
 */
export default class HighlightColorMenuItem extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { color: highlightColor, selected } = this.props

    return (
      <Menu.Item
        text={highlightColor}
        icon={selected ? 'tick' : 'blank'}
        onClick={this.onClick}
        labelElement={<ColorPreview highlightColor={highlightColor} />}
      />
    )
  }

  /**
   * Triggered when the menu item is clicked.
   */
  private onClick = () => {
    const { color: highlightColor, onClick } = this.props

    onClick(highlightColor)
  }
}

/**
 * React Props.
 */
interface Props {
  color: HighlightColors
  onClick: (color: HighlightColors) => void
  selected: boolean
}

/**
 * React Props.
 */
interface ColorPreviewProps {
  highlightColor: HighlightColors
}
