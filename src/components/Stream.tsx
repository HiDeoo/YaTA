import { Colors, Icon, Text } from '@blueprintjs/core'
import anime from 'animejs'
import _ from 'lodash'
import pluralize from 'pluralize'
import { Component } from 'react'
import { Flipped } from 'react-flip-toolkit'
import TimeAgo, { Formatter } from 'react-timeago'

import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import type { RawStream } from 'libs/Twitch'
import styled, { ifProp, size, theme, ThemeProps, withTheme } from 'styled'
import base from 'styled/base'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  background-color: ${theme('streams.background')};
  border-radius: 4px;
  box-shadow: 0 0 0 1px ${theme('streams.shadow')};
  cursor: pointer;
  height: ${size('streams.height')};
  position: relative;
  transition: box-shadow 0.25s cubic-bezier(0.4, 1, 0.75, 0.9);

  &:hover {
    box-shadow: 0 0 0 1px ${theme('streams.hover.shadow1')}, 0 0 0 3px ${theme('streams.hover.shadow2')};
  }
`

/**
 * ThumbnailWrapper component.
 */
const ThumbnailWrapper = styled.div`
  background-color: ${theme('streams.thumbnail')};
  border-right: 1px solid ${theme('streams.shadow')};
  border-bottom-left-radius: 4px;
  border-top-left-radius: 4px;
  overflow: hidden;
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  height: ${size('streams.height')};
  object-fit: cover;
  position: relative;
  transition: transform 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  width: ${size('streams.thumbnail_width')};

  ${/* sc-selector */ Wrapper}:hover & {
    transform: scale(1.15);
  }
`

/**
 * LiveIconBackground component.
 */
const LiveIconBackground = styled(Icon)`
  color: ${theme('streams.liveBackground')};
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
 * Details component.
 */
const Details = styled(FlexContent)`
  color: ${theme('streams.details')};
  font-size: 0.8rem;
  padding: 8px;

  ${/* sc-selector */ Wrapper}:hover & {
    color: ${theme('streams.hover.details')};
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
  color: ${ifProp('stream', theme('streams.titleStream'), theme('streams.titleChannel'))};
  font-size: 0.88rem;
  font-weight: bold;
  position: relative;

  ${/* sc-selector */ Wrapper}:hover & {
    color: ${theme('streams.hover.title')};
  }
`

/**
 * Meta component.
 */
const Meta = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${theme('streams.meta')};
  font-size: 0.76rem;

  ${/* sc-selector */ Wrapper}:hover & {
    color: ${theme('streams.hover.meta')};
  }
`

/**
 * Stream Component.
 */
class Stream extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { stream } = this.props

    return (
      <Flipped flipId={stream.id} onAppear={this.onAppear} onExit={this.onExit}>
        <div>
          <Wrapper onClick={this.onClick}>{this.renderStream(stream)}</Wrapper>
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
          <Thumbnail
            src={stream.thumbnail_url
              .replace('{width}', base.streams.thumbnail_width.toString())
              .replace('{height}', base.streams.height.toString())}
          />
        </ThumbnailWrapper>
        <LiveIconBackground icon="full-circle" iconSize={16} />
        <LiveIcon icon="full-circle" iconSize={10} />
        <Details>
          <Title stream>{stream.title || ''}</Title>
          <Text ellipsize>
            {stream.user_name} - {stream.game_name}
          </Text>
          <Meta>
            {stream.viewer_count.toLocaleString()} viewers -{' '}
            <TimeAgo date={new Date(stream.started_at)} formatter={this.uptimeRenderer} />
          </Meta>
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
    const { goToChannel, stream } = this.props

    goToChannel(stream.user_login)
  }

  /**
   * Triggered when the component appears.
   * @param element - The associated DOM node.
   */
  private onAppear = (element: HTMLElement) => {
    anime({
      duration: this.props.theme.streams.flip,
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
  private onExit = (element: HTMLElement, index: number, removeElement: (anim: anime.AnimeInstance) => void) => {
    anime({
      complete: removeElement,
      delay: index,
      duration: this.props.theme.streams.flip,
      easing: 'easeOutSine',
      opacity: 0,
      targets: element,
    })
  }
}

export default withTheme(Stream)

/**
 * React Props.
 */
interface Props extends ThemeProps {
  stream: RawStream
  goToChannel: (channel: string) => void
}

/**
 * React Props.
 */
interface TitleProps {
  stream?: boolean
}
