import { Card, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { RawChannel } from 'Libs/Twitch'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(Card)`
  height: ${size('follows.height')}px;

  &.pt-card {
    padding: 10px;
  }
`

/**
 * Logo component.
 */
const Logo = styled.div`
  display: flex;
  justify-content: center;
  height: 45px;
  width: 80px;

  & > img {
    height: 45px;
    object-fit: cover;
    width: 80px;
  }
`

/**
 * Details component.
 */
const Details = styled(FlexContent)`
  padding-left: 10px;
  padding-top: 2px;
`

/**
 * Name component.
 */
const Name = styled(Text)`
  font-size: 0.9rem;
  line-height: 1.4rem;
`

/**
 * Meta component.
 */
const Meta = styled.div`
  color: ${color('follow.meta')};
  font-size: 0.8rem;
  line-height: 1.3rem;

  strong {
    color: ${color('follow.strong')};
    font-weight: normal;
  }
`

/**
 * FollowedChannel Component.
 */
export default class FollowedChannel extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel } = this.props

    const meta = `Last seen ${new Date(channel.updated_at).toLocaleDateString()}${
      !_.isNil(channel.game) ? ` in ${channel.game}` : ''
    }`

    return (
      <Wrapper interactive onClick={this.onClick}>
        <FlexLayout>
          <Logo>
            <img src={channel.logo} />
          </Logo>
          <Details>
            <Name ellipsize>{channel.display_name}</Name>
            <Meta>
              <Text ellipsize>{meta}</Text>
            </Meta>
          </Details>
        </FlexLayout>
      </Wrapper>
    )
  }

  /**
   * Triggered when the channel is clicked.
   */
  private onClick = () => {
    const { channel, goToChannel } = this.props

    goToChannel(channel.name)
  }
}

/**
 * React Props.
 */
type Props = {
  channel: RawChannel
  goToChannel: (channel: string) => void
}
