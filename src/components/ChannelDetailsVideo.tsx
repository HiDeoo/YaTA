import { Colors, Text } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { Video } from 'Components/ChannelDetailsVideos'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  cursor: pointer;
  padding: 10px;

  &:hover {
    background-color: ${color('channel.background')};
  }
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  display: inline-block;
  height: 45px;
  margin-right: 10px;
  width: 80px;
`

/**
 * Detail component.
 */
const Detail = styled(Text).attrs({
  ellipsize: true,
})`
  margin: 3px 0 5px 0;
`

/**
 * Title component.
 */
const Title = styled(Detail)`
  color: ${Colors.BLUE5};
  font-size: 13px;
  font-weight: bold;
`

/**
 * Meta component.
 */
const Meta = styled(Detail)`
  color: ${color('follow.meta')};
  font-size: 11px;
`

/**
 * ChannelDetailsVideo Component.
 */
export default class ChannelDetailsVideo extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { video } = this.props

    return (
      <Wrapper key={video.id} onClick={this.onClick}>
        <Thumbnail src={video.thumbnail} />
        <FlexContent>
          <Title>{video.title}</Title>
          <Meta>{video.meta}</Meta>
        </FlexContent>
      </Wrapper>
    )
  }

  /**
   * Triggered when a video is clicked.
   */
  private onClick = () => {
    window.open(this.props.video.url)
  }
}

/**
 * React Props.
 */
type Props = {
  video: Video
}
