import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import ActionMenuItem from 'Components/ActionMenuItem'
import { ActionHandler } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { ApplicationState } from 'Store/reducers'
import { getActions } from 'Store/selectors/settings'

/**
 * ActionMenuItems Component.
 */
class ActionMenuItems extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { actionHandler, actions, chatter, endDivider, startDivider, wrap } = this.props

    if (_.size(actions) === 0) {
      if (wrap) {
        return (
          <Menu>
            <MenuItem disabled text="No action configured yet!" />
          </Menu>
        )
      }

      return null
    }

    const items: JSX.Element[] = []

    if (startDivider) {
      items.push(<MenuDivider key="actionMenuDivider-start" />)
    }

    items.push(
      ..._.map(actions, (action) => (
        <ActionMenuItem key={action.id} action={action} handler={actionHandler} chatter={chatter} />
      ))
    )

    if (endDivider) {
      items.push(<MenuDivider key="actionMenuDivider-end" />)
    }

    return wrap ? <Menu>{items}</Menu> : items
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
  actions: getActions(state),
}))(ActionMenuItems)

/**
 * React Props.
 */
type StateProps = {
  actions: ReturnType<typeof getActions>
}

/**
 * React Props.
 */
type OwnProps = {
  actionHandler: ActionHandler
  chatter?: SerializedChatter
  endDivider?: boolean
  startDivider?: boolean
  wrap?: boolean
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps
