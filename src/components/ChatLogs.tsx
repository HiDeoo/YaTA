import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'

import ChatMessage from 'Components/ChatMessage'
import ChatNotice from 'Components/ChatNotice'
import FlexContent from 'Components/FlexContent'
import LogType from 'Constants/logType'
import { SerializedMessage } from 'Libs/Message'
import { SerializedNotice } from 'Libs/Notice'
import { Log } from 'Store/ducks/logs'
import base from 'Styled/base'

/**
 * Message measures cache.
 */
const messageMeasureCache = new CellMeasurerCache({
  defaultHeight: base.message.minHeight,
  fixedWidth: true,
  minHeight: base.message.minHeight,
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
    const { logs } = this.props

    return (
      <FlexContent>
        <AutoSizer>
          {({ height, width }) => (
            <List
              deferredMeasurementCache={messageMeasureCache}
              height={height}
              overscanRowCount={10}
              rowCount={logs.length}
              rowHeight={messageMeasureCache.rowHeight}
              rowRenderer={this.messageRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </FlexContent>
    )
  }

  /**
   * Render a log based on its type.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private messageRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const log = this.props.logs[index]

    let LogComponent: JSX.Element | null = null

    if (this.isMessage(log)) {
      LogComponent = <ChatMessage style={style} message={log} />
    } else if (this.isNotice(log)) {
      LogComponent = <ChatNotice style={style} notice={log} />
    }

    if (_.isNil(LogComponent)) {
      return null
    }

    return (
      <CellMeasurer cache={messageMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {LogComponent}
      </CellMeasurer>
    )
  }

  /**
   * Determines if a log entry is a message.
   * @param  log - The log entry to validate.
   * @return `true` if the log is a message.
   */
  private isMessage(log: Log): log is SerializedMessage {
    return log.type === LogType.Action || log.type === LogType.Chat
  }

  /**
   * Determines if a log entry is a message.
   * @param  log - The log entry to validate.
   * @return `true` if the log is a message.
   */
  private isNotice(log: Log): log is SerializedNotice {
    return log.type === LogType.Notice
  }
}

/**
 * React Props.
 */
type Props = {
  logs: Log[]
}
