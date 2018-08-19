import { Colors, Icon, Text } from '@blueprintjs/core'
import * as anime from 'animejs'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import { Flipped } from 'react-flip-toolkit'
import TimeAgo, { Formatter } from 'react-timeago'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Twitch, { Follower, RawChannel, RawStream } from 'Libs/Twitch'
import base from 'Styled/base'
import { color, ifProp, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  background-color: ${color('follows.background')};
  border-radius: 4px;
  box-shadow: 0 0 0 1px ${color('follows.shadow')};
  cursor: pointer;
  height: ${size('follows.height')};
  position: relative;
  transition: box-shadow 0.25s cubic-bezier(0.4, 1, 0.75, 0.9);

  &:hover {
    box-shadow: 0 0 0 1px ${color('follows.hover.shadow1')}, 0 0 0 3px ${color('follows.hover.shadow2')};
  }
`

/**
 * ThumbnailWrapper component.
 */
const ThumbnailWrapper = styled.div`
  background-color: ${color('follows.thumbnail')};
  border-right: 1px solid ${color('follows.shadow')};
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  overflow: hidden;
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  height: ${size('follows.height')};
  object-fit: cover;
  position: relative;
  transition: transform 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  width: 120px;

  ${Wrapper}:hover & {
    transform: scale(1.15);
  }
`

/**
 * LiveIconBackground component.
 */
const LiveIconBackground = styled(Icon)`
  color: ${color('follows.liveBackground')};
  position: absolute;
  right: -5px;
  top: -5px;
`

/**
 * LiveIcon component.
 */
const LiveIcon = styled(Icon)`
  color: ${Colors.RED3};
  opacity: 0.8;
  position: absolute;
  right: -2px;
  top: -2px;
`

/**
 * AvatarBackground component.
 */
const AvatarBackground = styled(Icon)`
  bottom: -8px;
  color: ${color('follows.liveBackground')};
  left: -8px;
  position: absolute;
`

/**
 * Avatar component.
 */
const Avatar = styled.img`
  border-radius: 50%;
  bottom: -5px;
  left: -5px;
  position: absolute;
  width: 24px;
`

/**
 * Details component.
 */
const Details = styled(FlexContent)`
  color: ${color('follows.details')};
  font-size: 0.8rem;
  padding: 8px;

  ${Wrapper}:hover & {
    color: ${color('follows.hover.details')};
  }

  & > div {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`

/**
 * Title component.
 */
const Title = styled(Text).attrs({
  ellipsize: true,
})<TitleProps>`
  color: ${ifProp('stream', color('follows.titleStream'), color('follows.titleChannel'))};
  font-size: 0.88rem;
  font-weight: bold;
  position: relative;

  ${Wrapper}:hover & {
    color: ${color('follows.hover.title')};
  }
`

/**
 * Meta component.
 */
const Meta = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${color('follows.meta')};
  font-size: 0.76rem;

  ${Wrapper}:hover & {
    color: ${color('follows.hover.meta')};
  }
`

/**
 * Follow Component.
 */
export default class Follow extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { follow } = this.props

    return (
      <Flipped flipId={follow._id.toString()} onDelayedAppear={this.onAppear} onExit={this.onExit}>
        <div>
          <Wrapper onClick={this.onClick}>
            {Twitch.isStream(follow) ? this.renderStream(follow) : this.renderChannel(follow)}
          </Wrapper>
        </div>
      </Flipped>
    )
  }

  /**
   * Renders a stream.
   * @return Element to render.
   */
  private renderStream(stream: RawStream) {
    return (
      <>
        <ThumbnailWrapper>
          <Thumbnail src={stream.preview.medium} />
        </ThumbnailWrapper>
        <LiveIconBackground icon="full-circle" iconSize={16} />
        <LiveIcon icon="full-circle" iconSize={10} />
        <AvatarBackground icon="full-circle" iconSize={30} />
        <Avatar src={stream.channel.logo} />
        <Details>
          <Title stream>{stream.channel.status || ''}</Title>
          <Text ellipsize>
            {stream.channel.display_name} - {stream.game}
          </Text>
          <Meta>
            {stream.viewers.toLocaleString()} viewers -{' '}
            <TimeAgo date={new Date(stream.created_at)} formatter={this.uptimeRenderer} />
          </Meta>
        </Details>
      </>
    )
  }

  /**
   * Renders a channel.
   * @return Element to render.
   */
  private renderChannel(channel: RawChannel) {
    return (
      <>
        <ThumbnailWrapper>
          <Thumbnail src={channel.logo} />
        </ThumbnailWrapper>
        <Details>
          <Title>{channel.display_name}</Title>
          {!_.isNil(channel.game) && <Meta>{channel.game}</Meta>}
          <Meta>Last seen {new Date(channel.updated_at).toLocaleDateString()}</Meta>
        </Details>
      </>
    )
  }

  /**
   * Renders the uptime.
   * @return Element to render.
   */
  private uptimeRenderer: Formatter = (value, units) => {
    return `${value.toString()} ${_.isNil(units) ? '' : pluralize(units, value)}`
  }

  /**
   * Triggered when the channel is clicked.
   */
  private onClick = () => {
    const { follow, goToChannel } = this.props

    goToChannel(Twitch.isStream(follow) ? follow.channel.name : follow.name)
  }

  /**
   * Triggered when the component appears.
   * @param element - The associated DOM node.
   */
  private onAppear(element: HTMLElement) {
    anime({
      duration: base.follows.flip,
      easing: 'easeOutSine',
      opacity: [0, 1],
      targets: element,
    })
  }

  /**
   * Triggered when the component disappears.
   * @param element - The associated DOM node.
   * @param index - The element index.
   * @param removeElement - The callback to remove the DOM node after the animation.
   */
  private onExit(element: HTMLElement, index: number, removeElement: (anim: anime.AnimeInstance) => void) {
    anime({
      complete: removeElement,
      delay: index,
      duration: base.follows.flip,
      easing: 'easeOutSine',
      opacity: 0,
      targets: element,
    })
  }
}

/**
 * React Props.
 */
interface Props {
  follow: Follower
  goToChannel: (channel: string) => void
}

/**
 * React Props.
 */
interface TitleProps {
  stream?: boolean
}
