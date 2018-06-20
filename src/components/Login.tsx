import { AnchorButton, Intent } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100%;
`

/**
 * Login Component.
 */
export default class Login extends React.Component {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <Wrapper>
        <AnchorButton
          text="Login with Twitch"
          intent={Intent.PRIMARY}
          large
          icon="log-in"
          rightIcon="document-open"
          href="https://twitch.tv"
        />
      </Wrapper>
    )
  }
}
