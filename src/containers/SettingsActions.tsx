import { Button, ButtonGroup, Intent, Menu, Popover, Position, Tag } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import ActionTypeMenuItem from 'Components/ActionTypeMenuItem'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Help from 'Components/Help'
import NonIdealState from 'Components/NonIdealState'
import SettingsAction from 'Components/SettingsAction'
import SettingsInput from 'Components/SettingsInput'
import SettingsTable from 'Components/SettingsTable'
import SettingsView from 'Components/SettingsView'
import Action, { ActionPlaceholder, ActionType } from 'Libs/Action'
import { addAction, moveAction, removeAction, updateAction } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getActions } from 'Store/selectors/settings'
import styled from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(SettingsView)`
  display: flex;
  flex-direction: column;
  height: 100%;

  & > div,
  & > section {
    flex-shrink: 0;
  }
`

/**
 * Notice component.
 */
const Notice = styled(FlexLayout)`
  display: flex;
  font-style: italic;
  margin-bottom: 20px;

  & > span {
    font-style: normal;
  }
`

/**
 * Inline component.
 */
const Inline = styled.div`
  display: flex;
  margin-top: 10px;
`

/**
 * InlineInput component.
 */
const InlineInput = styled(SettingsInput)`
  flex: 1;
  margin-right: 10px;
`

/**
 * Placeholder component.
 */
const Placeholder = styled(Tag)`
  margin-left: 8px;
`

/**
 * React State.
 */
const initialState = {
  editing: false,
  id: undefined as Optional<string>,
  name: '',
  recipient: '',
  text: '',
  type: ActionType.Say,
  validation: Action.validate(false, ActionType.Say, '', '', ''),
}
type State = Readonly<typeof initialState>

/**
 * SettingsActions Component.
 */
class SettingsActions extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { editing, name, recipient, text, type } = this.state
    const { actions } = this.props

    return (
      <Wrapper>
        <Notice>
          <FlexContent>
            Available text placeholders:
            {_.map(ActionPlaceholder, (placeholder) => this.renderPlaceholder(placeholder))}
          </FlexContent>
          <Help>
            <p>Actions provide a mechanism to trigger various behaviors on users / mesages.</p>
            <p>
              Actions are triggered either by using the context menu on the left of each messages or in the dialog
              appearing when clicking a username.
            </p>
            <p>There are multiple action types:</p>
            <ul>
              <li>
                <u>Say</u>: Send the action text as a chat message.
              </li>
              <li>
                <u>Whisper</u>: Whisper the action text to a user.
              </li>
              <li>
                <u>Prepare</u>: Paste the action text in the chat input, ready to be shared.
              </li>
              <li>
                <u>Open URL</u>: Open the action text as an URL.
              </li>
            </ul>
          </Help>
        </Notice>
        <SettingsInput
          intent={this.getIntent('text')}
          value={text}
          onChange={this.onChangeText}
          placeholder="Action text…"
          rightElement={this.renderActionTypeMenu()}
        />
        <Inline>
          {type === ActionType.Whisper && (
            <InlineInput
              intent={this.getIntent('recipient')}
              value={recipient}
              onChange={this.onChangeRecipient}
              placeholder="Whisper recipient…"
            />
          )}
          <InlineInput
            intent={this.getIntent('name')}
            value={name}
            onChange={this.onChangeName}
            placeholder="Action name…"
          />
          {this.renderButtons()}
        </Inline>
        <SettingsTable>
          {actions.length > 0 ? (
            _.map(actions, (action, index) => (
              <SettingsAction
                canMoveDown={actions.length > 1 && index < actions.length - 1}
                canMoveUp={actions.length > 1 && index > 0}
                remove={this.props.removeAction}
                move={this.props.moveAction}
                isEditing={editing}
                edit={this.edit}
                action={action}
                key={action.id}
              />
            ))
          ) : (
            <NonIdealState small title="No action yet!" details="Try adding some above." />
          )}
        </SettingsTable>
      </Wrapper>
    )
  }

  /**
   * Renders action buttons.
   * @return Element to render.
   */
  private renderButtons() {
    const { editing, validation } = this.state

    if (editing) {
      return (
        <ButtonGroup>
          <Button text="Cancel" intent={Intent.NONE} onClick={this.onClickCancel} />
          <Button disabled={!validation.valid} text="Edit" intent={Intent.SUCCESS} onClick={this.onClickSubmit} />
        </ButtonGroup>
      )
    }

    return <Button disabled={!validation.valid} text="Add" intent={Intent.PRIMARY} onClick={this.onClickSubmit} />
  }

  /**
   * Renders an action placeholder.
   * @return Element to render.
   */
  private renderPlaceholder(placeholder: ActionPlaceholder) {
    return (
      <Placeholder key={placeholder}>
        {'{{'}
        {placeholder}
        {'}}'}
      </Placeholder>
    )
  }

  /**
   * Renders the action type menu.
   * @return Element to render.
   */
  private renderActionTypeMenu() {
    return (
      <Popover
        content={
          <Menu>
            {_.map(ActionType, (type) => (
              <ActionTypeMenuItem key={type} type={type} onClick={this.onChangeType} />
            ))}
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
        usePortal={false}
      >
        <Button minimal rightIcon="caret-down">
          {this.state.type}
        </Button>
      </Popover>
    )
  }

  /**
   * Returns the intent for a specific action key.
   * @param  key - The action key.
   * @return The intent.
   */
  private getIntent(key: keyof ReturnType<typeof Action.validate>) {
    const { editing, validation } = this.state

    const intent = validation[key] ? Intent.SUCCESS : Intent.DANGER

    if (editing) {
      return intent
    }

    return this.state[key].length === 0 ? Intent.NONE : intent
  }

  /**
   * Edits an action.
   * @param id - The id of the action to edit.
   */
  private edit = (id: string) => {
    const action = _.find(this.props.actions, ['id', id])

    if (!_.isNil(action)) {
      const recipient = _.get(action, 'recipient', '') as string

      this.setState(() => ({
        ...action,
        editing: true,
        recipient,
        validation: Action.validate(true, action.type, action.text, action.name, recipient),
      }))
    }
  }

  /**
   * Triggered when the cancel button is clicked.
   */
  private onClickCancel = () => {
    this.setState(initialState)
  }

  /**
   * Triggered when the add / edit button is clicked.
   */
  private onClickSubmit = () => {
    const { editing, id, type, text, name, recipient } = this.state

    const action = new Action(type, name, text, recipient, id)

    if (action.validate()) {
      if (editing && !_.isNil(id)) {
        this.props.updateAction(id, action.serialize())
      } else if (!editing) {
        this.props.addAction(action.serialize())
      }

      this.setState(({ type: oldType }) => ({ ...initialState, type: oldType }))
    }
  }

  /**
   * Triggered when a new type is selected.
   * @param type - The new type.
   */
  private onChangeType = (type: ActionType) => {
    this.setState(({ editing, name, recipient, text }) => ({
      type,
      validation: Action.validate(editing, type, text, name, recipient),
    }))
  }

  /**
   * Triggered when the new action text value is modified.
   * @param event - The associated event.
   */
  private onChangeText = (event: React.FormEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value

    this.setState(({ editing, name, recipient, type }) => ({
      text,
      validation: Action.validate(editing, type, text, name, recipient),
    }))
  }

  /**
   * Triggered when the new action recipient value is modified.
   * @param event - The associated event.
   */
  private onChangeRecipient = (event: React.FormEvent<HTMLInputElement>) => {
    const recipient = event.currentTarget.value

    this.setState(({ editing, name, text, type }) => ({
      recipient,
      validation: Action.validate(editing, type, text, name, recipient),
    }))
  }

  /**
   * Triggered when the new action name value is modified.
   * @param event - The associated event.
   */
  private onChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.value

    this.setState(({ editing, recipient, text, type }) => ({
      name,
      validation: Action.validate(editing, type, text, name, recipient),
    }))
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    actions: getActions(state),
  }),
  { addAction, moveAction, removeAction, updateAction }
)(SettingsActions)

/**
 * React Props.
 */
interface StateProps {
  actions: ReturnType<typeof getActions>
}

/**
 * React Props.
 */
interface DispatchProps {
  addAction: typeof addAction
  moveAction: typeof moveAction
  removeAction: typeof removeAction
  updateAction: typeof updateAction
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
