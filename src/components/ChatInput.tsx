import { Intent, IToastOptions, Position, TextArea, Toast as _Toast, Toaster } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Message from 'Constants/message'
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
const Input = styled(TextArea)`
  outline: none;
  resize: none;
`

/**
 * React State.
 */
const initialState = { toasts: [] as IToastOptions[], intent: Intent.NONE }
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
    let intent = Intent.NONE

    const { value } = nextProps

    if (ChatInput.isWhisper(value)) {
      toasts.push({
        icon: 'inbox',
        intent: Intent.SUCCESS,
        message: "You're about to send a whisper.",
      })

      intent = Intent.SUCCESS
    } else if (value.length > Message.Max) {
      toasts.push({
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: 'Your message exceed the 500 characters limit.',
      })

      intent = Intent.DANGER
    } else if (value.length > Message.Warning) {
      toasts.push({
        icon: 'hand',
        intent: Intent.WARNING,
        message: 'Your message exceed 400 characters. Try to avoid long messages.',
      })

      intent = Intent.WARNING
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

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { disabled, value } = this.props
    const { intent, toasts } = this.state

    return (
      <Wrapper>
        <Toaster position={Position.BOTTOM}>
          {_.map(toasts, (toast, index) => <Toast key={index} {...toast} />)}
        </Toaster>
        <Input
          value={value}
          intent={intent}
          onChange={this.onChangeInputValue}
          onKeyDown={this.onKeyDownInputValue}
          disabled={disabled}
          large
          fill
        />
      </Wrapper>
    )
  }

  /**
   * Triggered when a key is pressed down in the input.
   * We use this event to detect when the 'Enter' key is pressed.
   */
  private onKeyDownInputValue = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  onChange: (value: string) => void
  onSubmit: () => void
  value: string
}
