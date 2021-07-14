import { MenuItem } from '@blueprintjs/core'
import { Component } from 'react'

import ActionIconMap from 'constants/actionIconMap'
import { ActionHandler, SerializedAction } from 'libs/Action'
import { SerializedChatter } from 'libs/Chatter'

/**
 * ActionMenuItem Component.
 */
export default class ActionMenuItem extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { action } = this.props

    return <MenuItem icon={ActionIconMap[action.type]} text={action.name} onClick={this.onClick} />
  }

  /**
   * Triggered when the menu item is clicked.
   */
  private onClick = () => {
    const { action, chatter, handler } = this.props

    handler(action, chatter)
  }
}

/**
 * React Props.
 */
interface Props {
  action: SerializedAction
  chatter?: SerializedChatter
  handler: ActionHandler
}
