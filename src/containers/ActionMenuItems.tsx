import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core'
import _ from 'lodash'
import { Component } from 'react'
import { connect } from 'react-redux'

import ActionMenuItem from 'components/ActionMenuItem'
import { ActionHandler } from 'libs/Action'
import { SerializedChatter } from 'libs/Chatter'
import { ApplicationState } from 'store/reducers'
import { getActions } from 'store/selectors/settings'

/**
 * ActionMenuItems Component.
 */
class ActionMenuItems extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { actionHandler, actions, chatter, endDivider, startDivider, wrap } = this.props

    if (actions.length === 0) {
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
interface StateProps {
  actions: ReturnType<typeof getActions>
}

/**
 * React Props.
 */
interface OwnProps {
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
