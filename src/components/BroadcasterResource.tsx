import { Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { ResourceType } from 'Components/BroadcasterResources'
import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Player from 'Libs/Player'
import { color, ifProp } from 'Utils/styled'

/**
 * ListRow component.
 */
const ListRow = styled.div<ListRowProps>`
  cursor: ${ifProp('link', 'pointer', 'auto')};
  padding: 8px;

  &:hover {
    background-color: ${color('broadcaster.hover.background')};
  }
`

/**
 * Content component.
 */
const Content = styled(FlexContent)`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: bold;
  justify-content: center;

  ${ListRow}:hover & {
    color: ${color('broadcaster.hover.color')};
  }
`

/**
 * Meta component.
 */
const Meta = styled.div`
  color: ${color('broadcaster.meta')};
  font-size: 12px;
  font-weight: normal;
  margin-top: 5px;

  ${ListRow}:hover & {
    color: ${color('broadcaster.hover.meta')};
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
  background-image: ${color('broadcaster.divider')};
  border: 0;
  height: 1px;
  margin: 0;
  padding: 0;

  &:last-of-type {
    display: none;
  }
`

/**
 * BroadcasterResource Component.
 */
export default class BroadcasterResource extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { meta, text, thumbnail, url } = this.props.resource

    return (
      <>
        <ListRow link={!_.isNil(url)} onClick={this.onClick}>
          <FlexLayout>
            {!_.isNil(thumbnail) && <Thumbnail src={thumbnail} />}
            <Content>
              <Text ellipsize>{text}</Text>
              {!_.isNil(meta) && <Meta>{meta}</Meta>}
            </Content>
          </FlexLayout>
        </ListRow>
        <Divider />
      </>
    )
  }

  /**
   * Triggered when a row is clicked.
   */
  private onClick = () => {
    const { resource } = this.props

    if (!_.isNil(resource.url)) {
      if (resource.type === ResourceType.Clips) {
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
  resource: Resource
}

/**
 * React Props.
 */
interface ListRowProps {
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
