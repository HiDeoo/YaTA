import { Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Player from 'Libs/Player'
import { color, ifProp } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  cursor: ${ifProp('link', 'pointer', 'auto')};
  padding: 10px;

  &:hover {
    background-color: ${color('resource.hover.background')};
  }
`

/**
 * Content component.
 */
const Content = styled(FlexContent)`
  display: flex;
  flex-direction: column;
  font-size: 0.92em;
  font-weight: bold;
  justify-content: center;

  ${Wrapper}:hover & {
    color: ${color('resource.hover.color')};
  }
`

/**
 * Meta component.
 */
const Meta = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${color('resource.meta')};
  font-size: 0.84em;
  font-weight: normal;
  margin-top: 5px;

  ${Wrapper}:hover & {
    color: ${color('resource.hover.meta')};
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
 * Divider component.
 */
const Divider = styled.hr`
  background-image: ${color('resource.divider')};
  border: 0;
  height: 1px;
  margin: 0;
  padding: 0;

  &:last-of-type {
    display: none;
  }
`

/**
 * Available resource types.
 */
export enum ResourceType {
  Clip,
  Host,
  Vod,
}

/**
 * ExternalResource Component.
 */
export default class ExternalResource extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { divider, resource, ...restProps } = this.props
    const { meta, text, thumbnail, url } = resource

    return (
      <>
        <Wrapper link={!_.isNil(url)} onClick={this.onClick} {...restProps}>
          <FlexLayout>
            {!_.isNil(thumbnail) && <Thumbnail src={thumbnail} />}
            <Content>
              <Text ellipsize>{text}</Text>
              {!_.isNil(meta) && <Meta>{meta}</Meta>}
            </Content>
          </FlexLayout>
        </Wrapper>
        {divider && <Divider />}
      </>
    )
  }

  /**
   * Triggered when a row is clicked.
   */
  private onClick = () => {
    const { resource } = this.props

    if (!_.isNil(resource.url)) {
      if (resource.type === ResourceType.Clip) {
        Player.playTwitchClip(resource.id)
      } else {
        window.open(resource.url)
      }
    }
  }
}

/**
 * React Props.
 */
interface Props {
  divider?: boolean
  resource: Resource
}

/**
 * React Props.
 */
interface WrapperProps {
  link: boolean
}

/**
 * Broadcaster resource.
 */
export type Resource = {
  id: string
  meta?: string
  text: string
  thumbnail?: string
  type: ResourceType
  url?: string
}
