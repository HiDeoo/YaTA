import { Card, Text } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { RawStream } from 'Libs/Twitch'
import { color, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(Card)`
  border: 2px solid rgba(168, 42, 42, 0.75);
  height: ${size('follows.height')}px;

  &.pt-card {
    padding: 10px;
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
 * Title component.
 */
const Title = styled(Text)`
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
 * FollowedStream Component.
 */
export default class FollowedStream extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { stream } = this.props

    return (
      <Wrapper interactive onClick={this.onClick}>
        <FlexLayout>
          <div>
            <img src={stream.preview.small} />
          </div>
          <Details>
            <Title ellipsize>{stream.channel.status}</Title>
            <Meta>
              <Text ellipsize>
                <strong>{stream.channel.display_name}</strong> - {stream.game} - {stream.viewers} viewers
              </Text>
            </Meta>
          </Details>
        </FlexLayout>
      </Wrapper>
    )
  }

  /**
   * Triggered when the stream is clicked.
   */
  private onClick = () => {
    const { stream, goToChannel } = this.props

    goToChannel(stream.channel.name)
  }
}

/**
 * React Props.
 */
type Props = {
  goToChannel: (channel: string) => void
  stream: RawStream
}
