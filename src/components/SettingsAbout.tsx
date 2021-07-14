import { Colors, Icon } from '@blueprintjs/core'
import * as React from 'react'

import ExternalLink from 'components/ExternalLink'
import SettingsView from 'components/SettingsView'
import styled, { theme, ThemeProps, withTheme } from 'styled'

/**
 * Content component.
 */
const Content = styled.div`
  margin-bottom: 20px;
  overflow: hidden;
  text-align: center;

  p {
    line-height: 1.5rem;
    margin-bottom: 10px;
  }
`
/**
 * Logo component.
 */
const Logo = styled.div`
  align-items: center;
  background-color: ${Colors.DARK_GRAY5};
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 1px 1px 10px 1px ${Colors.DARK_GRAY1};
  display: flex;
  height: 128px;
  justify-content: center;
  margin: 30px auto 40px auto;
  width: 128px;
`

/**
 * Name component.
 */
const Name = styled.div`
  font-size: 1rem;
  font-weight: bold;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${theme('about.description')};
  font-size: 0.8rem;
  line-height: 1.8rem;
  margin-bottom: 25px;
`

/**
 * Coffee component.
 */
const Coffee = styled.span`
  font-size: 1.5rem;
  margin-left: 6px;
  vertical-align: middle;
`

/**
 * SettingsAbout Component.
 */
const SettingsAbout: React.FunctionComponent<ThemeProps> = (props) => (
  <SettingsView>
    <Content>
      <Logo>
        <Icon icon="chat" iconSize={70} color={props.theme.logo} />
      </Logo>
      <Name>
        YaTA <em>v{process.env.REACT_APP_VERSION}</em>
      </Name>
      <Description>Yet another Twitch App</Description>
      <p>
        Brewed using lots of{' '}
        <Coffee>
          <span role="img" aria-label="Coffee">
            ☕
          </span>
        </Coffee>
      </p>
      <p>
        Source code available on <ExternalLink href="https://github.com/HiDeoo/yata">Github</ExternalLink>
      </p>
      <p>
        Hosted by <ExternalLink href="https://vercel.com">△Vercel</ExternalLink>
      </p>
      <p>
        Notification sound by{' '}
        <ExternalLink href="https://freesound.org/people/rhodesmas/sounds/342759/">rhodesmas</ExternalLink>
      </p>
      <p>
        Message sound by{' '}
        <ExternalLink href="https://freesound.org/people/kwahmah_02/sounds/268822/">kwahmah_02</ExternalLink>
      </p>
    </Content>
  </SettingsView>
)

export default withTheme(SettingsAbout)
