import { MenuItem } from '@blueprintjs/core'
import { Component } from 'react'

import { ActionType } from 'libs/Action'

/**
 * ActionTypeMenuItem Component.
 */
export default class ActionTypeMenuItem extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return <MenuItem text={this.props.type} onClick={this.onClick} />
  }

  /**
   * Triggered when the menu item is clicked.
   */
  private onClick = () => {
    const { onClick, type } = this.props

    onClick(type)
  }
}

/**
 * React Props.
 */
interface Props {
  onClick: (type: ActionType) => void
  type: ActionType
}
