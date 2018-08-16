import { Colors, Icon } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import SettingsPanel from 'Components/SettingsPanel'
import { color } from 'Utils/styled'

/**
 * Content component.
 */
const Content = styled.div`
  margin-bottom: 20px;
  text-align: center;

  p {
    line-height: 1.5rem;
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
  margin: 20px auto 40px auto;
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
  color: ${color('about.description')};
  font-size: 0.8rem;
  line-height: 1.8rem;
  margin-bottom: 30px;
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
export default () => (
  <SettingsPanel>
    <Content>
      <Logo>
        <Icon icon="chat" iconSize={70} color="#c2ccd6" />
      </Logo>
      <Name>
        YaTA <em>v{process.env.REACT_APP_VERSION}</em>
      </Name>
      <Description>Yet another Twitch App</Description>
      <p>
        Brewed using lots of <Coffee>☕</Coffee>
      </p>
      <p>
        Source code available on{' '}
        <a target="_blank" href="https://github.com/HiDeoo/yata">
          Github
        </a>
      </p>
      <p>
        Hosted by{' '}
        <a target="_blank" href="https://zeit.co">
          △ZEIT
        </a>
      </p>
      <p>
        Notification sound by{' '}
        <a target="_blank" href="https://freesound.org/people/rhodesmas/sounds/342759/">
          rhodesmas
        </a>
      </p>
    </Content>
  </SettingsPanel>
)
