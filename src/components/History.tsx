import { Button, Classes, Tooltip } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer'
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer'
import { List, ListRowRenderer } from 'react-virtualized/dist/es/List'

import HeadlessMessage from 'Components/HeadlessMessage'
import Notification from 'Components/Notification'
import { SerializedMessage } from 'Libs/Message'
import { SerializedNotification } from 'Libs/Notification'
import { isMessage, isNotification } from 'Store/ducks/logs'
import styled, { size, theme, ThemeProps, withTheme } from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${theme('history.background')};
  border: 1px solid ${theme('history.border')};
  font-size: 0.82rem;
  height: ${size('history.height')};
  line-height: 1.4rem;
  margin-top: 20px;
  padding: 0;
  position: relative;
  width: 100%;
`

/**
 * ButtonWrapper component.
 */
const ButtonWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`

/**
 * CopyButton component.
 */
const CopyButton = styled(Button)`
  &.${Classes.BUTTON} {
    border-bottom-right-radius: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`

/**
 * History Component.
 */
class History extends React.Component<Props> {
  private logMeasureCache: CellMeasurerCache

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.logMeasureCache = new CellMeasurerCache({
      defaultHeight: props.theme.log.minHeight,
      fixedWidth: true,
      minHeight: props.theme.log.minHeight,
    })
  }

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
              deferredMeasurementCache={this.logMeasureCache}
              height={this.props.theme.history.height - 2}
              rowHeight={this.logMeasureCache.rowHeight}
              scrollToIndex={logs.length - 1}
              rowRenderer={this.logRenderer}
              rowCount={logs.length}
              overscanRowCount={10}
              width={width}
            />
          )}
        </AutoSizer>
        <ButtonWrapper>
          <Tooltip content="Copy all messages">
            <CopyButton icon="clipboard" onClick={this.onClickCopyAllMessages} />
          </Tooltip>
        </ButtonWrapper>
      </Wrapper>
    )
  }

  /**
   * Clears the measures cache when resize the window.
   */
  private onResize = () => {
    this.logMeasureCache.clearAll()
  }

  /**
   * Render a log.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private logRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const { logs } = this.props
    const log = logs[index]

    let LogComponent: Optional<JSX.Element>

    if (isMessage(log)) {
      LogComponent = <HeadlessMessage style={style} onDoubleClick={this.onDoubleClick} message={log} />
    } else if (isNotification(log)) {
      LogComponent = <Notification style={style} notification={log} />
    }

    if (_.isNil(LogComponent)) {
      return null
    }

    return (
      <CellMeasurer cache={this.logMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
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

  /**
   * Triggered when the copy all messages button is clicked.
   */
  private onClickCopyAllMessages = () => {
    const { copyMessageToClipboard, logs } = this.props

    const messages = _.filter(logs, isMessage)

    copyMessageToClipboard(messages)
  }
}

export default withTheme(History)

/**
 * React Props.
 */
interface Props extends ThemeProps {
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage | SerializedMessage[]) => void
  logs: Array<SerializedMessage | SerializedNotification>
}
