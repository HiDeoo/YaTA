import * as React from 'react'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import HistoryMessage from 'Components/HistoryMessage'
import { SerializedMessage } from 'Libs/Message'
import base from 'Styled/base'
import { color } from 'Utils/styled'

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
    const { messages } = this.props
    const message = messages[index]

    return (
      <CellMeasurer cache={messageMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        <HistoryMessage style={style} onDoubleClick={this.onDoubleClick} message={message} />
      </CellMeasurer>
    )
  }

  /**
   * Triggered when a message is double clicked.
   * @param message - The message.
   */
  private onDoubleClick = (message: SerializedMessage) => {
    const { copyMessageOnDoubleClick, copyMessageToClipboard } = this.props

    if (copyMessageOnDoubleClick) {
      copyMessageToClipboard(message)
    }
  }
}

/**
 * React Props.
 */
type Props = {
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  messages: SerializedMessage[]
}
