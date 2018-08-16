import { Menu } from '@blueprintjs/core'
import * as React from 'react'

import { ActionType } from 'Libs/Action'

/**
 * ActionTypeMenuItem Component.
 */
export default class ActionTypeMenuItem extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return <Menu.Item text={this.props.type} onClick={this.onClick} />
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
