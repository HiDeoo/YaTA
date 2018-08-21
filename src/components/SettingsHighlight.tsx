import { Button, EditableText, Intent } from '@blueprintjs/core'
import * as React from 'react'

import SettingsHighlightColorMenu from 'Components/SettingsHighlightColorMenu'
import Key from 'Constants/key'
import { HighlightColors, SerializedHighlight } from 'Libs/Highlight'
import styled from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  padding: 10px 4px 0 10px;

  &:last-child {
    padding-bottom: 10px;
  }
`

/**
 * Pattern component.
 */
const Pattern = styled(EditableText)`
  width: calc(100% - 154px);
`

/**
 * DeleteButton component.
 */
const DeleteButton = styled(Button)`
  margin-top: -5px;
  margin-left: 5px;
`

/**
 * React State.
 */
const initialState = { prevPropsPattern: '', pattern: '', patternIntent: Intent.NONE as Intent }
type State = Readonly<typeof initialState>

/**
 * SettingsHighlight Component.
 */
export default class SettingsHighlight extends React.Component<Props, State> {
  /**
   * Lifecycle: getDerivedStateFromProps.
   * @param  nextProps - The next props.
   * @param  prevState - The previous state
   * @return An object to update the state or `null` to update nothing.
   */
  public static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.highlight.pattern !== prevState.prevPropsPattern) {
      return {
        pattern: nextProps.highlight.pattern,
        patternIntent: Intent.NONE,
        prevPropsPattern: nextProps.highlight.pattern,
      }
    }

    return null
  }

  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { pattern, patternIntent } = this.state

    return (
      <Wrapper>
        <span onKeyDown={this.onKeyDown}>
          <Pattern
            confirmOnEnterKey
            value={pattern}
            intent={patternIntent}
            onCancel={this.onCancel}
            onChange={this.onChange}
            onConfirm={this.onConfirm}
          />
        </span>
        <SettingsHighlightColorMenu small color={this.props.highlight.color} onSelect={this.onSelectColor} />
        <DeleteButton minimal icon="trash" intent={Intent.DANGER} onClick={this.onClickRemove} title="Remove" />
      </Wrapper>
    )
  }

  /**
   * Triggerd when a key down is pressed when editing the highlight pattern.
   * We use this event to prevent closing the settings dialog when escaping the editing.
   * @param event - The associated event.
   */
  private onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === Key.Escape) {
      event.stopPropagation()
    }
  }
  /**
   * Triggered when the pattern is modified.
   * @param pattern - The new pattern.
   */
  private onChange = (pattern: string) => {
    const patternIntent = pattern.length > 0 && this.props.validate(pattern) ? Intent.SUCCESS : Intent.DANGER

    this.setState(() => ({ pattern, patternIntent }))
  }

  /**
   * Triggered when the pattern edition is cancelled.
   */
  private onCancel = () => {
    this.setState(({ prevPropsPattern }) => ({ pattern: prevPropsPattern, patternIntent: Intent.NONE }))
  }

  /**
   * Triggered when the pattern edition is confirmed.
   * @param pattern - The new pattern.
   */
  private onConfirm = (pattern: string) => {
    const { highlight, updatePattern, validate } = this.props

    if (pattern.length > 0 && validate(pattern)) {
      updatePattern(highlight.id, pattern.toLowerCase())
    } else {
      this.setState(({ prevPropsPattern }) => ({ pattern: prevPropsPattern, patternIntent: Intent.NONE }))
    }
  }

  /**
   * Triggered when the remove button is clicked.
   */
  private onClickRemove = () => {
    const { remove, highlight } = this.props

    remove(highlight.id)
  }

  /**
   * Triggered when a new color is selected.
   * @param color - The new color name.
   */
  private onSelectColor = (color: HighlightColors) => {
    const { highlight, updateColor } = this.props

    updateColor(highlight.id, color)
  }
}

/**
 * React Props.
 */
interface Props {
  highlight: SerializedHighlight
  remove: (id: string) => void
  updateColor: (id: string, color: HighlightColors) => void
  updatePattern: (id: string, pattern: string) => void
  validate: (pattern: string) => boolean
}
