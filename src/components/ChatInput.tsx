import { Intent, TextArea } from '@blueprintjs/core'
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
 * Input component.
 */
const Input = styled(TextArea)`
  outline: none;
  resize: none;
`

/**
 * ChatInput Component.
 */
export default class ChatInput extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { disabled, value } = this.props

    let intent: Intent

    if (value.length > Message.Max) {
      intent = Intent.DANGER
    } else if (value.length > Message.Warning) {
      intent = Intent.WARNING
    } else {
      intent = Intent.NONE
    }

    return (
      <Wrapper>
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
