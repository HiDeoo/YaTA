import { AnchorButton, Callout, Classes, Intent } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import PreviewImg from 'Images/preview.png'
import Twitch from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  align-items: center;
`

/**
 * LoginWrapper component.
 */
const LoginWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 80px 0 10px 0;
`

/**
 * PreviewWrapper component.
 */
const PreviewWrapper = styled(FlexContent)`
  overflow: hidden;
`

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
 * Preview component.
 */
const Preview = styled.img`
  display: block;
  max-width: 800px;

  @media (max-width: 800px) {
    max-width: 100%;
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
  <Wrapper vertical>
    <LoginWrapper>
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
          <li>Update your channel's metadata.</li>
        </Permissions>
      </Details>
    </LoginWrapper>
    <PreviewWrapper>
      <Preview src={PreviewImg} />
    </PreviewWrapper>
  </Wrapper>
)

export default Login
