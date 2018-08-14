import { Card, Classes, Icon, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Player from 'Libs/Player'
import { isResolved, Preview as ResolvedPreview, UnresolvedPreview } from 'Libs/PreviewProvider'
import PreviewTwitch, { TwitchPreviewType } from 'Libs/PreviewTwitch'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin: 6px 0;

  & > .${Classes.CARD} {
    padding: 6px;
  }
`

/**
 * Thumbnail component.
 */
const Thumbnail = styled.img`
  display: inline-block;
  height: 46px;
  margin-right: 10px;
  object-fit: cover;
  width: 80px;
`

/**
 * Details component.
 */
const Details = styled(FlexContent)`
  padding-top: 2px;
`

/**
 * Title component.
 */
const Title = styled(Text).attrs({
  ellipsize: true,
})`
  font-size: 0.9rem;
`

/**
 * Meta component.
 */
const Meta = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${color('previews.meta')};
  font-size: 0.72rem;
`

/**
 * IconWrapper component.
 */
const IconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: 5px;
  margin-right: 10px;

  & > svg {
    color: ${color('previews.meta')};
    height: 25px;
    width: 25px;
  }
`

/**
 * Preview Component.
 */
export default class Preview extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { preview } = this.props

    if (!isResolved(preview)) {
      return null
    }

    const hasUrl = !_.isNil(preview.url)

    return (
      <Wrapper>
        <Card interactive={hasUrl} onClick={hasUrl ? this.onClick : undefined}>
          <FlexLayout>
            {!_.isNil(preview.icon) && (
              <IconWrapper>
                <Icon icon={preview.icon} />
              </IconWrapper>
            )}
            {!_.isNil(preview.image) && <Thumbnail src={preview.image} />}
            <Details>
              <Title>{preview.title}</Title>
              <Meta>{preview.meta}</Meta>
            </Details>
          </FlexLayout>
        </Card>
      </Wrapper>
    )
  }

  /**
   * Triggered when a preview is clicked.
   */
  private onClick = () => {
    const { preview } = this.props

    if (isResolved(preview) && !_.isNil(preview.url)) {
      if (preview.provider === PreviewTwitch.getProviderId() && preview.type === TwitchPreviewType.Clip) {
        Player.playTwitchClip(preview.id)
      } else {
        window.open(preview.url)
      }
    }
  }
}

/**
 * React Props.
 */
type Props = {
  preview: UnresolvedPreview | ResolvedPreview
}
