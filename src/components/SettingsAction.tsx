import { Button, ButtonGroup, Classes, Colors, Icon, Intent, Text } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import ActionIconMap from 'Constants/actionIconMap'
import { ActionType, SerializedAction } from 'Libs/Action'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  display: flex;
  padding: 10px 4px 0 10px;

  &:last-child {
    padding-bottom: 10px;
  }
`

/**
 * ActionIcon component.
 */
const ActionIcon = styled(Icon).attrs({
  color: Colors.GRAY2,
})`
  margin-right: 12px;
  margin-top: 9px;
`

/**
 * ActionName component.
 */
const ActionName = styled(Text).attrs({
  ellipsize: true,
})`
  font-weight: bold;
  max-width: 280px;

  em {
    font-weight: normal;
  }
`

/**
 * OrderButtonGroup component.
 */
const OrderButtonGroup = styled(ButtonGroup)`
  & > .${Classes.BUTTON} {
    min-height: 18px;
    min-width: 30px;
    padding: 0 10px;

    &:only-child {
      min-height: 36px;
    }
  }
`

/**
 * ActionText component.
 */
const ActionText = styled(Text).attrs({
  ellipsize: true,
})`
  font-style: italic;
  max-width: 280px;
`

/**
 * SettingsAction Component.
 */
export default class SettingsAction extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { action, isEditing } = this.props

    const recipient =
      action.type === ActionType.Whisper ? (
        <em>
          {' '}
          (@
          {action.recipient})
        </em>
      ) : null

    return (
      <Wrapper>
        <ActionIcon icon={ActionIconMap[action.type]} />
        <FlexContent>
          <ActionName>
            {action.name}
            {recipient}
          </ActionName>
          <ActionText>{action.text}</ActionText>
        </FlexContent>
        {this.renderOrderButtons()}
        <Button disabled={isEditing} minimal icon="edit" onClick={this.onClickEdit} title="Edit" />
        <Button
          onClick={this.onClickRemove}
          intent={Intent.DANGER}
          disabled={isEditing}
          title="Remove"
          icon="trash"
          minimal
        />
      </Wrapper>
    )
  }

  /**
   * Renders the order buttons if needed.
   * @return Element to render.
   */
  private renderOrderButtons() {
    const { canMoveDown, canMoveUp } = this.props

    if (!canMoveDown && !canMoveUp) {
      return null
    }

    return (
      <OrderButtonGroup minimal vertical>
        {canMoveUp && <Button icon="caret-up" title="Move up" onClick={this.onClickMoveUp} />}
        {canMoveDown && <Button icon="caret-down" title="Move down" onClick={this.onClickMoveDown} />}
      </OrderButtonGroup>
    )
  }

  /**
   * Triggered when the remove button is clicked.
   */
  private onClickRemove = () => {
    const { action, remove } = this.props

    remove(action.id)
  }

  /**
   * Triggered when the edit button is clicked.
   */
  private onClickEdit = () => {
    const { action, edit } = this.props

    edit(action.id)
  }

  /**
   * Triggered when the move up button is clicked.
   */
  private onClickMoveUp = () => {
    const { action, move } = this.props

    move(action.id, false)
  }

  /**
   * Triggered when the move down button is clicked.
   */
  private onClickMoveDown = () => {
    const { action, move } = this.props

    move(action.id, true)
  }
}

/**
 * React Props.
 */
interface Props {
  action: SerializedAction
  canMoveUp: boolean
  canMoveDown: boolean
  edit: (id: string) => void
  isEditing: boolean
  move: (id: string, down: boolean) => void
  remove: (id: string) => void
}
