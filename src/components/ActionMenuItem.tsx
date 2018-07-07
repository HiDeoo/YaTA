import { MenuItem } from '@blueprintjs/core'
import * as React from 'react'

import ActionIconMap from 'Constants/actionIconMap'
import { ActionHandler, SerializedAction } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'

/**
 * ActionMenuItem Component.
 */
export default class ActionMenuItem extends React.Component<Props> {
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
type Props = {
  action: SerializedAction
  chatter?: SerializedChatter
  handler: ActionHandler
}
