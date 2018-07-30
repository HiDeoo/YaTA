import { Alert, InputGroup, Intent } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Key from 'Constants/key'

/**
 * ReasonInput component.
 */
const ReasonInput = styled(InputGroup)`
  margin-bottom: 10px;
`

/**
 * React State.
 */
const initialState = {
  reason: '',
}
type State = Readonly<typeof initialState>

/**
 * BanReason Component.
 */
export default class BanReason extends React.Component<Props, State> {
  public state: State = initialState
  private reason: HTMLInputElement | null = null

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props
    const { reason } = this.state

    return (
      <Alert
        onConfirm={this.confirmBanReason}
        onCancel={this.onCancelBanReason}
        cancelButtonText="Cancel"
        confirmButtonText="Ban"
        intent={Intent.DANGER}
        onOpened={this.focus}
        isOpen={visible}
        icon="disable"
      >
        <ReasonInput
          inputRef={this.setReasonElementRef}
          onKeyDown={this.onKeyDownReason}
          onChange={this.onChangeReason}
          placeholder="Ban reason…"
          value={reason}
          large
        />
      </Alert>
    )
  }

  /**
   * Focus the input field.
   */
  private focus = () => {
    if (!_.isNil(this.reason)) {
      this.reason.focus()
    }
  }

  /**
   * Triggered when a key is pressed down in the reason input.
   * @param event - The associated event.
   */
  private onKeyDownReason = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      this.confirmBanReason()
    }
  }

  /**
   * Triggered when the reason is modified.
   * @param event - The associated event.
   */
  private onChangeReason = (event: React.FormEvent<HTMLInputElement>) => {
    const reason = event.currentTarget.value

    this.setState(() => ({ reason }))
  }

  /**
   * Triggered when the cancel button is clicked.
   */
  private onCancelBanReason = () => {
    this.props.toggle()

    this.setState(initialState)
  }

  /**
   * Triggered when the ban button is clicked.
   */
  private confirmBanReason = () => {
    const { reason } = this.state
    const { onConfirmBanReason } = this.props

    if (reason.length > 0) {
      onConfirmBanReason(reason)

      this.setState(initialState)
    } else {
      this.focus()
    }
  }

  /**
   * Sets the reason input ref.
   * @param ref - The reference to the inner input element.
   */
  private setReasonElementRef = (ref: HTMLInputElement | null) => {
    this.reason = ref
  }
}

/**
 * React Props.
 */
type Props = {
  onConfirmBanReason: (reason: string) => void
  toggle: () => void
  visible: boolean
}
