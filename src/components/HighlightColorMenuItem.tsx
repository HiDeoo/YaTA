import { MenuItem } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { HighlightColors } from 'Libs/Highlight'
import { withSCProps } from 'Utils/react'
import { color } from 'Utils/styled'

/**
 * ColorPreview component.
 */
const ColorPreview = withSCProps<ColorPreviewProps, HTMLDivElement>(styled.div)`
  background-color: ${(props) => color(`log.highlight.${props.highlightColor}.background`)};
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
      <MenuItem
        text={highlightColor}
        icon={selected === true ? 'tick' : 'blank'}
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
type Props = {
  color: HighlightColors
  onClick: (color: HighlightColors) => void
  selected?: boolean
}

/**
 * React Props.
 */
type ColorPreviewProps = {
  highlightColor: HighlightColors
}
