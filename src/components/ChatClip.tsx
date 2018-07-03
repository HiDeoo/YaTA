import { Card } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { Clip } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin: 6px 0;

  & > .pt-card {
    padding: 6px;
  }
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  display: inline-block;
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
const Title = styled.div`
  font-size: 0.9rem;
`

/**
 * Meta component.
 */
const Meta = styled.div`
  color: ${color('clips.meta')};
  font-size: 0.72rem;
`

/**
 * ChatClip Component.
 */
export default class ChatClip extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { clip } = this.props

    const viewStr = `view${clip.views > 1 ? 's' : ''}`

    return (
      <Wrapper>
        <Card interactive onClick={this.onClick}>
          <FlexLayout>
            <Thumbnail src={clip.thumbnails.tiny} />
            <Details>
              <Title>{clip.title}</Title>
              <Meta>
                Clipped by {clip.curator.display_name} on {clip.broadcaster.display_name} ({clip.views} {viewStr})
              </Meta>
            </Details>
          </FlexLayout>
        </Card>
      </Wrapper>
    )
  }

  /**
   * Triggered when a clip is clicked.
   */
  private onClick = () => {
    window.open(this.props.clip.url)
  }
}

/**
 * React Props.
 */
type Props = {
  clip: Clip
}
