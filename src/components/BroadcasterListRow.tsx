import { Colors, Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { color, ifProp } from 'Utils/styled'

/**
 * ListRow component.
 */
const ListRow = styled.div<ListRowProps>`
  cursor: ${ifProp('link', 'pointer', 'auto')};
  padding: 8px;

  &:hover {
    background-color: ${color('broadcaster.hover')};
  }
`

/**
 * Content component.
 */
const Content = styled(FlexContent)`
  color: ${Colors.BLUE5};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: bold;
  justify-content: center;
`

/**
 * Meta component.
 */
const Meta = styled.div`
  color: ${color('follow.meta')};
  font-size: 11px;
  margin-top: 5px;
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
 * BroadcasterListRow Component.
 */
export default class BroadcasterListRow extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { meta, text, thumbnail, url } = this.props.row

    return (
      <ListRow link={!_.isNil(url)} onClick={this.onClick}>
        <FlexLayout>
          {!_.isNil(thumbnail) && <Thumbnail src={thumbnail} />}
          <Content>
            <Text ellipsize>{text}</Text>
            {!_.isNil(meta) && <Meta>{meta}</Meta>}
          </Content>
        </FlexLayout>
      </ListRow>
    )
  }

  /**
   * Triggered when a row is clicked.
   */
  private onClick = () => {
    const { url } = this.props.row

    if (!_.isNil(url)) {
      window.open(url)
    }
  }
}

/**
 * React Props.
 */
type Props = {
  row: Row
}

/**
 * React Props.
 */
type ListRowProps = {
  link: boolean
}

/**
 * Broadcaster list row.
 */
export type Row = {
  id: string
  meta?: string
  text: string
  thumbnail?: string
  url?: string
}
