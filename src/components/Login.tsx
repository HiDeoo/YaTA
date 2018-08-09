import { AnchorButton, Callout, Classes, Intent } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import Twitch from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Details component.
 */
const Details = styled(Callout)`
  &.${Classes.CALLOUT} {
    margin-top: 40px;
    width: 360px;

    & h4.${Classes.HEADING} {
      font-size: 1rem;
    }

    & > svg {
      height: 18px;
      width: 18px;

      &.${Classes.ICON}:first-child {
        left: 13px;
        top: 11px;
      }
    }
  }
`

/**
 * Permissions component.
 */
const Permissions = styled.ul`
  font-size: 0.8rem;
  margin: 12px 0 0 0;
  padding-left: 2px;

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
    <Details title="Required permissions" intent={Intent.WARNING} icon="key">
      <Permissions>
        <li>
          View your email address.
          <em>Your email is never used but the permission is required to fetch various details about yourself.</em>
        </li>
        <li>Log into chat and send messages.</li>
        <li>Create clips from a broadcast or video.</li>
        <li>Follow users on your behalf.</li>
        <li>Block users on your behalf.</li>
      </Permissions>
    </Details>
  </Center>
)

export default Login
