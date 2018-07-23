import { AnchorButton, Card, Intent } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import Twitch from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Details component.
 */
const Details = styled(Card)`
  color: ${color('permissions.color')};
  font-size: 0.82rem;
  margin-top: 40px;
  width: 360px;
`

/**
 * Permissions component.
 */
const Permissions = styled.ul`
  font-size: 0.78rem;
  margin: 20px 0 0 0;
  padding-left: 30px;

  & > li {
    margin: 4px 0;

    & > em {
      color: ${color('permissions.detail')};
      display: block;
      font-size: 0.72rem;
      font-style: normal;
      line-height: 16px;
      margin: 2px 0 4px 0;
    }
  }
`

/**
 * Login Component.
 */
const Login: React.SFC = () => (
  <Center>
    <AnchorButton
      text="Login with Twitch"
      intent={Intent.PRIMARY}
      large
      icon="log-in"
      rightIcon="document-open"
      href={Twitch.getAuthURL().toString()}
    />
    <Details>
      The following permissions are required:
      <Permissions>
        <li>
          View your email address.
          <em>Your email is never used but the permission is required to fetch various details about yourself.</em>
        </li>
        <li>Block users on your behalf.</li>
        <li>Log into chat and send messages.</li>
        <li>Create clips from a broadcast or video.</li>
      </Permissions>
    </Details>
  </Center>
)

export default Login
