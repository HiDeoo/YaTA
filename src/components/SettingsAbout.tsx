import { Colors } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import SettingsPanel from 'Components/SettingsPanel'
import Logo from 'Images/logo.png'
import Logo2x from 'Images/logo@2x.png'
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
 * Icon component.
 */
const Icon = styled.img.attrs({
  alt: 'YaTA',
  src: Logo,
  srcset: `${Logo} 1x,${Logo2x} 2x`,
})`
  background-color: ${Colors.DARK_GRAY5};
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 1px 1px 10px 1px ${Colors.DARK_GRAY1};
  display: block;
  height: 128px;
  margin: 0 auto 30px auto;
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
const SettingsAbout: React.SFC = () => (
  <SettingsPanel>
    <Content>
      <Icon />
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
    </Content>
  </SettingsPanel>
)

export default SettingsAbout
