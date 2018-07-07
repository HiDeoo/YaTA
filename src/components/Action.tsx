import { Button, Colors, Icon, Intent, Text } from '@blueprintjs/core'
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
 * ActionText component.
 */
const ActionText = styled(Text).attrs({
  ellipsize: true,
})`
  font-style: italic;
  max-width: 280px;
`

/**
 * Action Component.
 */
export default class Action extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { action, editing } = this.props

    const recipient = action.type === ActionType.Whisper ? <em> (@{action.recipient})</em> : null

    return (
      <Wrapper>
        {this.renderIcon()}
        <FlexContent>
          <ActionName>
            {action.name}
            {recipient}
          </ActionName>
          <ActionText>{action.text}</ActionText>
        </FlexContent>
        <Button disabled={editing} minimal icon="edit" onClick={this.onClickEdit} />
        <Button disabled={editing} minimal icon="trash" intent={Intent.DANGER} onClick={this.onClickRemove} />
      </Wrapper>
    )
  }

  /**
   * Renders the action icon.
   * @return Element to render.
   */
  private renderIcon() {
    const { action } = this.props

    return <ActionIcon icon={ActionIconMap[action.type]} />
  }

  /**
   * Triggered when the remove button is clicked.
   */
  private onClickRemove = () => {
    const { remove, action } = this.props

    remove(action.id)
  }

  /**
   * Triggered when the edit button is clicked.
   */
  private onClickEdit = () => {
    const { edit, action } = this.props

    edit(action.id)
  }
}

/**
 * React Props.
 */
type Props = {
  action: SerializedAction
  edit: (id: string) => void
  editing: boolean
  remove: (id: string) => void
}
