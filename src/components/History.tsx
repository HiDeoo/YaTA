import * as React from 'react'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import MessageContent from 'Components/MessageContent'
import { SerializedMessage } from 'Libs/Message'
import base from 'Styled/base'
import { color, size } from 'Utils/styled'

/**
 * Message measures cache.
 */
const messageMeasureCache = new CellMeasurerCache({
  defaultHeight: base.log.minHeight,
  fixedWidth: true,
  minHeight: base.log.minHeight,
})

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('history.background')};
  border: 1px solid ${color('history.border')};
  font-size: 0.82rem;
  height: 200px;
  line-height: 1.4rem;
  margin-top: 20px;
  padding: 0;
  width: 100%;
`

/**
 * Message component.
 */
const Message = styled.div`
  min-height: ${size('log.minHeight')}px;
  padding: 4px 8px;
`

/**
 * Time component.
 */
const Time = styled.span`
  color: ${color('message.time.color')};
  font-size: 0.77rem;
  padding-right: 6px;
`

/**
 * History Component.
 */
export default class History extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { messages } = this.props

    return (
      <Wrapper>
        <AutoSizer onResize={this.onResize}>
          {({ height, width }) => (
            <List
              deferredMeasurementCache={messageMeasureCache}
              height={height}
              overscanRowCount={10}
              rowCount={messages.length}
              rowHeight={messageMeasureCache.rowHeight}
              rowRenderer={this.messageRenderer}
              scrollToIndex={messages.length - 1}
              width={width}
            />
          )}
        </AutoSizer>
      </Wrapper>
    )
  }

  /**
   * Clears the measures cache when resize the window.
   */
  private onResize = () => {
    messageMeasureCache.clearAll()
  }

  /**
   * Render a message.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private messageRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const message = this.props.messages[index]

    return (
      <CellMeasurer cache={messageMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        <Message style={style}>
          <Time>{message.time}</Time>
          <MessageContent message={message} />
        </Message>
      </CellMeasurer>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  messages: SerializedMessage[]
}
