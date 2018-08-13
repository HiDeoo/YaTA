import { Classes, Colors, Text } from '@blueprintjs/core'
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
  background-image: linear-gradient(
    90deg,
    rgba(206, 217, 224, 1) 0%,
    rgba(206, 217, 224, 0.7) 50%,
    rgba(206, 217, 224, 0) 100%
  );
  border: 0;
  height: 1px;
  margin: 0;
  padding: 0;

  .${Classes.DARK} & {
    background-image: linear-gradient(
      90deg,
      rgba(116, 134, 147, 1) 0%,
      rgba(116, 134, 147, 0.4) 50%,
      rgba(116, 134, 147, 0) 100%
    );
  }

  &:last-of-type {
    display: none;
  }
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
