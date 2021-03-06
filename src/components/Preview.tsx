import { Card, Classes, Icon, Text } from '@blueprintjs/core'
import _ from 'lodash'
import { Component } from 'react'

import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import Player from 'libs/Player'
import { isResolved, Preview as ResolvedPreview, UnresolvedPreview } from 'libs/PreviewProvider'
import PreviewTwitch, { TwitchPreviewType } from 'libs/PreviewTwitch'
import styled, { theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin: 6px 0;

  & > .${Classes.CARD} {
    padding: 6px;

    &.${Classes.INTERACTIVE}:hover {
      box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.2), 0 2px 4px rgba(16, 22, 26, 0.4), 0 3px 6px rgba(16, 22, 26, 0.4);
    }

    .${Classes.DARK} &.${Classes.INTERACTIVE}:hover {
      box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 2px 4px rgba(16, 22, 26, 0.2), 0 3px 6px rgba(16, 22, 26, 0.2);
    }
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
  color: ${theme('previews.meta')};
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

  & svg {
    color: ${theme('previews.meta')};
    height: 25px;
    width: 25px;
  }
`

/**
 * Preview Component.
 */
export default class Preview extends Component<Props> {
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
      if (
        preview.provider === PreviewTwitch.getProviderId() &&
        preview.type === TwitchPreviewType.Clip &&
        !_.isNil(Player.current)
      ) {
        Player.current.playTwitchClip(preview.id)
      } else {
        const initialLink = _.get(preview.extra, 'initialLink')
        const url = _.isString(initialLink) ? initialLink : preview.url

        window.open(url)
      }
    }
  }
}

/**
 * React Props.
 */
interface Props {
  preview: UnresolvedPreview | ResolvedPreview
}
