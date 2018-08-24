import { Classes, Colors, Menu } from '@blueprintjs/core'
import * as React from 'react'

import styled from 'Styled'

/**
 * Name component.
 */
const Name = styled(Menu.Item)`
  &.${Classes.MENU_ITEM}, .${Classes.DARK} &.${Classes.MENU_ITEM} {
    color: ${Colors.WHITE} !important;
  }
`

/**
 * LastName component.
 */
const LastName = styled(Name)`
  &.${Classes.MENU_ITEM}, .${Classes.DARK} &.${Classes.MENU_ITEM} {
    font-weight: bold;
  }
`

/**
 * NameHistoryMenuItem Component.
 */
export default class NameHistoryMenuItem extends React.Component<Props> {
  /**
   * React Default Props.
   */
  public static defaultProps = {
    last: false,
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { last, name } = this.props

    const Component = last ? LastName : Name

    return <Component text={name} onClick={this.onClick} />
  }

  /**
   * Triggered when the menuitem is clicked.
   */
  private onClick = () => {
    const { name, onClick } = this.props

    onClick(name)
  }
}

/**
 * React Props.
 */
interface Props {
  last: boolean
  name: string
  onClick: (name: string) => void
}
