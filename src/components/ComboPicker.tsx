import { Button, Classes, getKeyComboString, KeyCombo } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import FlexContent from 'Components/FlexContent'
import { Shortcut, ShortcutCombo, ShortcutType } from 'Constants/shortcut'
import styled, { ifProp } from 'Styled'

/**
 * Name component.
 */
const Name = styled(FlexContent)`
  cursor: default;
  height: 36px;
  line-height: 36px;
`

/**
 * Combo component.
 */
const Combo = styled.div<ReadOnlyProps>`
  cursor: ${ifProp('readonly', 'not-allowed', 'pointer')};

  &.${Classes.INPUT}, .${Classes.DARK} &.${Classes.INPUT} {
    height: 36px;

    line-height: 23px;
    padding: 3px 7px;
    text-align: right;

    ${(props) =>
      props.readonly &&
      `&:focus {
      box-shadow: unset;
    }`};
  }
`

/**
 * RemoveButton component.
 */
const RemoveButton = styled(Button)`
  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    margin-right: -7px;

    &:hover {
      background: unset;
    }
  }
`

/**
 * Tooltip component.
 */
const Tooltip = styled.div`
  opacity: 0.8;
  font-size: 0.8rem;
  line-height: 1.94rem;
  padding-right: 2px;
  text-align: center;
`

/**
 * React State.
 */
const initialState = { isEditing: false }
type State = Readonly<typeof initialState>

/**
 * ComboPicker Component.
 */
export default class ComboPicker extends React.Component<Props, State> {
  public state: State = initialState
  private picker = React.createRef<HTMLDivElement>()

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { shortcut } = this.props

    return (
      <>
        <Name>{shortcut.name}</Name>
        <Combo
          readonly={shortcut.readonly || false}
          tabIndex={shortcut.readonly ? -1 : 0}
          onKeyDown={this.onKeyDown}
          className={Classes.INPUT}
          innerRef={this.picker}
          onClick={this.focus}
          onBlur={this.onBlur}
        >
          {this.state.isEditing ? (
            <Tooltip>Type new shortcut</Tooltip>
          ) : !_.isNil(shortcut.combo) ? (
            <>
              <KeyCombo combo={shortcut.combo} />
              <RemoveButton
                title={shortcut.readonly ? 'Locked shortcut' : 'Remove shortcut'}
                icon={shortcut.readonly ? 'lock' : 'small-cross'}
                disabled={shortcut.readonly}
                onClick={this.remove}
                minimal
              />
            </>
          ) : (
            <Tooltip>Click to record shortcut</Tooltip>
          )}
        </Combo>
      </>
    )
  }

  /**
   * Focus the picker.
   */
  private focus = () => {
    this.setState(() => ({ isEditing: true }))

    if (!_.isNil(this.picker.current)) {
      this.picker.current.focus()
    }
  }

  /**
   * Triggered when blurred.
   */
  private onBlur = () => {
    if (this.state.isEditing) {
      this.setState(() => ({ isEditing: false }))
    }
  }

  /**
   * Triggered when the combo is changed.
   * @param event - The associated event.
   */
  private onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const { onChange, shortcut } = this.props

    if (shortcut.readonly) {
      return
    }

    if (this.state.isEditing) {
      this.setState(() => ({ isEditing: false }))
    }

    if (event.key === 'Escape' || event.key === 'Enter') {
      if (!_.isNil(this.picker.current)) {
        this.picker.current.blur()
      }

      return
    }

    const combo = getKeyComboString(event.nativeEvent)

    onChange(shortcut.type, combo)
  }

  /**
   * Removes a combos.
   */
  private remove = () => {
    const { onChange, shortcut } = this.props

    if (shortcut.readonly) {
      return
    }

    onChange(shortcut.type, null)
  }
}

/**
 * React Props.
 */
interface Props {
  onChange: (type: ShortcutType, combo: ShortcutCombo) => void
  shortcut: Shortcut
}

/**
 * React Props.
 */
interface ReadOnlyProps {
  readonly: boolean
}
