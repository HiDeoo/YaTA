import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import HistoryMessage from 'Components/HistoryMessage'
import Notification from 'Components/Notification'
import { SerializedMessage } from 'Libs/Message'
import { SerializedNotification } from 'Libs/Notification'
import { isMessage, isNotification } from 'Store/ducks/logs'
import base from 'Styled/base'
import { color, size } from 'Utils/styled'

/**
 * Log measures cache.
 */
const logMeasureCache = new CellMeasurerCache({
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
  height: ${size('history.height')};
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
    const { logs } = this.props

    return (
      <Wrapper>
        <AutoSizer onResize={this.onResize} disableHeight>
          {({ width }) => (
            <List
              deferredMeasurementCache={logMeasureCache}
              height={base.history.height - 2}
              overscanRowCount={10}
              rowCount={logs.length}
              rowHeight={logMeasureCache.rowHeight}
              rowRenderer={this.logRenderer}
              scrollToIndex={logs.length - 1}
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
    logMeasureCache.clearAll()
  }

  /**
   * Render a log.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private logRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const { logs } = this.props
    const log = logs[index]

    let LogComponent: JSX.Element | null = null

    if (isMessage(log)) {
      LogComponent = <HistoryMessage style={style} onDoubleClick={this.onDoubleClick} message={log} />
    } else if (isNotification(log)) {
      LogComponent = <Notification style={style} notification={log} />
    }

    if (_.isNil(LogComponent)) {
      return null
    }

    return (
      <CellMeasurer cache={logMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {LogComponent}
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
  logs: Array<SerializedMessage | SerializedNotification>
}
