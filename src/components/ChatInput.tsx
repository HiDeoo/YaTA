import { TextArea } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

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
export default class ChatInput extends React.Component {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <Wrapper>
        <Input large fill value="" />
      </Wrapper>
    )
  }
}
