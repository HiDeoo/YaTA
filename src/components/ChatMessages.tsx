import * as React from 'react'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'

import ChatMessage from 'Components/ChatMessage'
import FlexContent from 'Components/FlexContent'
import { Sizes } from 'Constants/theme'
import { SerializedChat } from 'Libs/Chat'

/**
 * Message measures cache.
 */
const messageMeasureCache = new CellMeasurerCache({
  defaultHeight: Sizes.Message.minHeight,
  fixedWidth: true,
  minHeight: Sizes.Message.minHeight,
})

/**
 * ChatMessages Component.
 */
export default class ChatMessages extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { messages } = this.props

    return (
      <FlexContent>
        <AutoSizer>
          {({ height, width }) => (
            <List
              deferredMeasurementCache={messageMeasureCache}
              height={height}
              overscanRowCount={10}
              rowCount={messages.length}
              rowHeight={messageMeasureCache.rowHeight}
              rowRenderer={this.messageRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </FlexContent>
    )
  }

  private messageRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    return (
      <CellMeasurer cache={messageMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        <ChatMessage style={style} message={this.props.messages[index]} />
      </CellMeasurer>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  messages: SerializedChat[]
}
