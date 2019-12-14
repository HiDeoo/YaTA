import { AnchorButton, Classes, Colors, H2, H3, Icon, IconName, Intent } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import loginBackground from 'images/loginBackground.png'
import PreviewImg from 'images/preview.png'
import Twitch from 'libs/Twitch'
import styled, { prop, size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  overflow-x: hidden;
`

/**
 * Header component.
 */
const Header = styled.div`
  background: url(${loginBackground}) 0 bottom no-repeat;
  background-size: cover;
  flex-shrink: 0;
  height: 350px;
  margin-bottom: 100px;
  position: relative;
  width: 100%;
`

/**
 * Preview component.
 */
const Preview = styled.img`
  bottom: 0;
  display: block;
  max-width: 55%;
  position: absolute;
  right: 0;
  transform: translateY(50px);

  @media (max-width: 550px) {
    display: none;
  }
`

/**
 * LoginButton component.
 */
const LoginButton = styled(AnchorButton)`
  left: calc(25% - 100px);
  position: absolute;
  top: calc(40% - 20px);

  @media (max-width: 550px) {
    left: calc(50% - 100px);
  }
`

/**
 * Features component.
 */
const Features = styled.div`
  align-items: center;
  display: flex;
  height: ${size('login.features.height')};
  justify-content: center;
  margin-bottom: 50px;
  width: 100%;

  @media (max-width: 880px) {
    display: block;
    height: auto;
  }
`

/**
 * Feature component.
 */
const Feature = styled(FlexLayout)<FeatureProps>`
  left: ${prop('left')}px;
  position: absolute;
  top: ${prop('top')}px;
  width: ${size('login.feature.width')};

  @media (max-width: 880px) {
    margin: 20px 0;
    padding: 0 20px;
    position: static;
    width: 100%;
  }
`

/**
 * FeatureOrigin component.
 */
const FeatureOrigin = styled.div`
  position: relative;

  & > .${Classes.HEADING}, .${Classes.DARK} & > .${Classes.HEADING} {
    color: ${theme('login.features.color')};
    font-size: 5rem;

    @media (max-width: 880px) {
      margin-bottom: 50px;
      padding: 0 20px;
    }
  }
`

/**
 * FeatureIcon component.
 */
const FeatureIcon = styled(Icon)`
  background-color: ${theme('login.feature.background')};
  border-radius: 8px;
  box-shadow: ${theme('login.feature.shadow')};
  height: ${size('login.feature.height')};
  padding: 12px;
  width: ${size('login.feature.height')};
`

/**
 * FeatureContent component.
 */
const FeatureContent = styled(FlexContent)`
  color: ${theme('login.feature.meta')};
  font-size: 0.8rem;
  margin-left: 10px;

  & > .${Classes.HEADING}, .${Classes.DARK} & > .${Classes.HEADING} {
    color: ${theme('login.feature.title')};
    font-size: 1.1rem;
    margin: 4px 0;
  }
`

/**
 * Highlighted features.
 */
const FeaturesList: FeatureDefinition[] = [
  {
    color: Colors.GOLD5,
    desc: "Don't miss anything you're interested in.",
    icon: 'highlight',
    left: -240,
    name: 'Highlights',
    top: -200,
  },
  {
    color: Colors.FOREST4,
    desc: 'Customizable actions to whisper, chat, open URLs, etc…',
    icon: 'pulse',
    left: -110,
    name: 'Actions',
    top: -100,
  },
  {
    color: Colors.GREEN3,
    desc: 'Actions, statistics, message history, notes, everything you need to know about any chatter…',
    icon: 'list-detail-view',
    left: 325,
    name: 'Chatter details',
    top: -68,
  },
  {
    color: Colors.VERMILION4,
    desc: 'Create a Strawpoll without even opening a new tab.',
    icon: 'pie-chart',
    left: 290,
    name: 'Polls',
    top: -160,
  },
  {
    color: Colors.INDIGO4,
    desc: 'Inline previews for Twitch, Youtube, Strawpoll & Github content.',
    icon: 'eye-open',
    left: -200,
    name: 'Previews',
    top: 20,
  },
  {
    color: Colors.ORANGE5,
    desc: 'Use your favorite emotes and 3rd-party ones like BetterTTV.',
    icon: 'flame',
    left: 80,
    name: 'Emotes',
    top: 70,
  },
  { name: 'Clips', desc: 'Play clips in-app.', icon: 'film', color: Colors.TURQUOISE3, left: 420, top: 210 },
  {
    color: Colors.BLUE4,
    desc: 'Send & reply to whispers inside the application.',
    icon: 'envelope',
    left: 40,
    name: 'Whispers',
    top: -230,
  },
  {
    color: Colors.VERMILION3,
    desc: 'Everything you need to deal with that troll from timeouts to bans.',
    icon: 'build',
    left: -240,
    name: 'Moderation tools',
    top: 160,
  },
  {
    color: Colors.LIME4,
    desc: 'Exportable settings to customize your own experience.',
    icon: 'settings',
    left: 50,
    name: 'Settings',
    top: 170,
  },
  {
    color: Colors.VIOLET4,
    desc: 'Filter through chat message quickly.',
    icon: 'search',
    left: 370,
    name: 'Search',
    top: 80,
  },
]

/**
 * Login Component.
 */
export default () => (
  <Wrapper>
    <Header>
      <Preview src={PreviewImg} />
      <LoginButton
        href={Twitch.getAuthURL().toString()}
        rightIcon="document-open"
        text="Login with Twitch"
        intent={Intent.PRIMARY}
        icon="log-in"
        large
      />
    </Header>
    <Features>
      <FeatureOrigin>
        <H2>FEATURES</H2>
        {_.map(FeaturesList, ({ color, desc, icon, left, name, top }, index) => (
          <Feature key={index} top={top} left={left}>
            <FeatureIcon icon={icon} iconSize={36} color={color} />
            <FeatureContent>
              <H3>{name}</H3>
              {desc}
            </FeatureContent>
          </Feature>
        ))}
      </FeatureOrigin>
    </Features>
  </Wrapper>
)

/**
 * React Props.
 */
interface FeatureProps {
  left: number
  top: number
}

/**
 * Feature definition.
 */
type FeatureDefinition = {
  color: string
  desc: string
  icon: IconName
  left: number
  name: string
  top: number
}
