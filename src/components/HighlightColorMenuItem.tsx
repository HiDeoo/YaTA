import { MenuItem } from '@blueprintjs/core'
import * as React from 'react'

import { HighlightColors } from 'Libs/Highlight'

/**
 * HighlightColorMenuItem Component.
 */
export default class HighlightColorMenuItem extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return <MenuItem text={this.props.color} onClick={this.onClick} />
  }

  /**
   * Triggered when the menu item is clicked.
   */
  private onClick = () => {
    const { color, onClick } = this.props

    onClick(color)
  }
}

/**
 * React Props.
 */
type Props = {
  onClick: (color: HighlightColors) => void
  color: HighlightColors
}
