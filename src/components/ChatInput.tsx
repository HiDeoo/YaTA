import { Classes, Intent, IToastOptions, Position, Toast as _Toast, Toaster } from '@blueprintjs/core'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Message from 'Constants/message'
import { getWordAtPosition } from 'Utils/string'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('chatInput.background')};
  border-top: 1px solid ${color('chatInput.border')};
  padding: 10px;
`

/**
 * Toast component.
 */
const Toast = styled(_Toast)`
  margin-bottom: 60px !important;

  .pt-button-group {
    display: none;
  }
`

/**
 * Input component.
 */
const Input = styled.textarea`
  outline: none;
  resize: none;
`

/**
 * React State.
 */
const initialState = { toasts: [] as IToastOptions[], intent: '' }
type State = Readonly<typeof initialState>

/**
 * ChatInput Component.
 */
export default class ChatInput extends React.Component<Props, State> {
  /**
   * Lifecycle: getDerivedStateFromProps.
   * @param  nextProps - The next props.
   * @return An object to update the state or `null` to update nothing.
   */
  public static getDerivedStateFromProps(nextProps: Props) {
    const toasts: IToastOptions[] = []
    let intent = ''

    const { value } = nextProps

    if (ChatInput.isWhisper(value)) {
      toasts.push({
        icon: 'inbox',
        intent: Intent.SUCCESS,
        message: "You're about to send a whisper.",
      })

      intent = Classes.INTENT_SUCCESS
    } else if (value.length > Message.Max) {
      toasts.push({
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: 'Your message exceed the 500 characters limit.',
      })

      intent = Classes.INTENT_DANGER
    } else if (value.length > Message.Warning) {
      toasts.push({
        icon: 'hand',
        intent: Intent.WARNING,
        message: 'Your message exceed 400 characters. Try to avoid long messages.',
      })

      intent = Classes.INTENT_WARNING
    }

    return { intent, toasts }
  }

  /**
   * Determines if a message looks like a whisper command (/w user message).
   * @return `true` if the value is a whisper.
   */
  private static isWhisper(message: string) {
    return /^\/w \S+ /.test(message)
  }

  public state: State = initialState
  private input = React.createRef<HTMLTextAreaElement>()
  private completions: string[] | null = null
  private completionIndex = -1
  private completionCursor = null as number | null
  private splittedValueBeforeCompletion: string[] | null = null // [ 'before', 'word being auto-completed', 'after']

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public componentDidUpdate(prevProps: Props) {
    if (!_.isNil(this.completionCursor) && prevProps.value !== this.props.value && !_.isNil(this.input.current)) {
      this.input.current.setSelectionRange(this.completionCursor, this.completionCursor)

      this.completionCursor = null
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { disabled, value } = this.props
    const { intent, toasts } = this.state

    const classes = classnames(Classes.INPUT, Classes.FILL, Classes.LARGE, intent)

    return (
      <Wrapper>
        <Toaster position={Position.BOTTOM}>
          {_.map(toasts, (toast, index) => <Toast key={index} {...toast} />)}
        </Toaster>
        <Input
          dir="auto"
          value={value}
          disabled={false && disabled}
          className={classes}
          innerRef={this.input}
          onChange={this.onChangeInputValue}
          onKeyDown={this.onKeyDownInputValue}
        />
      </Wrapper>
    )
  }

  /**
   * Triggered when a key is pressed down in the input.
   */
  private onKeyDownInputValue = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()

      if (!_.isNil(this.input.current)) {
        // Fetching completions only if needed.
        if (_.isNil(this.completions)) {
          const cursor = this.input.current.selectionStart
          const text = this.input.current.value

          const { word, end, start } = getWordAtPosition(text, cursor)

          if (word.length === 0) {
            return
          }

          this.splittedValueBeforeCompletion = [text.substring(0, start), word, text.substring(end)]

          this.completions = this.props.getCompletions(word)
        }

        // Only auto-complete if we have results.
        if (this.completions.length > 0 && !_.isNil(this.splittedValueBeforeCompletion)) {
          this.completionIndex += !event.shiftKey ? 1 : -1

          if (this.completionIndex >= this.completions.length) {
            this.completionIndex = 0
          } else if (this.completionIndex < 0) {
            this.completionIndex = this.completions.length - 1
          }

          const completion = this.completions[this.completionIndex]

          const before = this.splittedValueBeforeCompletion[0]
          let after = this.splittedValueBeforeCompletion[2]

          let cursorOffset = 0

          // Add an extra space so we can continue typing immediately after auto-completing.
          if (after.length === 0) {
            after = ' '
            cursorOffset += 1
          }

          const sentence = `${before}${completion}${after}`

          this.props.onChange(sentence)

          this.completionCursor = before.length + completion.length + cursorOffset
        }
      }
    } else if (event.key === 'Escape' && !_.isNil(this.splittedValueBeforeCompletion)) {
      // Restore the value as it was before auto-completing.
      this.props.onChange(this.splittedValueBeforeCompletion.join(''))
    } else if (event.key !== 'Shift') {
      this.completions = null
      this.completionIndex = -1
      this.splittedValueBeforeCompletion = null
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (!this.validateInputValue()) {
        return
      }

      this.props.onSubmit()
    }
  }

  /**
   * Triggered when the input is modified.
   * @param event - The associated event.
   */
  private onChangeInputValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(event.target.value)
  }

  /**
   * Validates the input value to determine if the message can be sent or not.
   */
  private validateInputValue() {
    const { value } = this.props

    return value.length > 0 && _.trim(value).length > 0 && value.length <= Message.Max
  }
}

/**
 * React Props.
 */
type Props = {
  disabled: boolean
  getCompletions: (word: string) => string[]
  onChange: (value: string) => void
  onSubmit: () => void
  value: string
}
