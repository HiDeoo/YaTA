import * as _ from 'lodash'
import * as React from 'react'
import * as ReactTooltip from 'react-tooltip'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import ChatMessage from 'Components/ChatMessage'
import ChatNotice from 'Components/ChatNotice'
import ChatNotification from 'Components/ChatNotification'
import ChatWhisper from 'Components/ChatWhisper'
import FlexContent from 'Components/FlexContent'
import { SerializedChatter } from 'Libs/Chatter'
import { isMessage, isNotice, isNotification, isWhisper, Log } from 'Store/ducks/logs'
import base from 'Styled/base'

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
const Wrapper = styled(FlexContent)`
  font-size: 0.82rem;
  line-height: 1.4rem;
  padding: 8px 0;
`

/**
 * ChatMessages Component.
 */
export default class ChatMessages extends React.Component<Props> {
  /**
   * Lifecycle: componentDidUpdate.
   */
  public componentDidUpdate() {
    ReactTooltip.rebuild()
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { copyMessageOnDoubleClick, logs, showContextMenu } = this.props

    return (
      <Wrapper>
        <AutoSizer onResize={this.onResize}>
          {({ height, width }) => (
            <List
              deferredMeasurementCache={messageMeasureCache}
              height={height}
              overscanRowCount={10}
              rowCount={logs.length}
              rowHeight={messageMeasureCache.rowHeight}
              rowRenderer={this.messageRenderer}
              scrollToIndex={logs.length - 1}
              width={width}
              showContextMenu={showContextMenu}
              copyMessageOnDoubleClick={copyMessageOnDoubleClick}
              purgedCount={_.sumBy(logs, 'purged')}
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
   * Render a log based on its type.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private messageRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const log = this.props.logs[index]

    let LogComponent: JSX.Element | null = null

    const {
      ban,
      canModerate,
      copyMessageOnDoubleClick,
      copyToClipboard,
      focusChatter,
      showContextMenu,
      timeout,
    } = this.props

    if (isMessage(log)) {
      LogComponent = (
        <ChatMessage
          style={style}
          message={log}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          copyToClipboard={copyToClipboard}
          showContextMenu={showContextMenu}
          focusChatter={focusChatter}
          canModerate={canModerate}
          timeout={timeout}
          ban={ban}
        />
      )
    } else if (isNotice(log)) {
      LogComponent = <ChatNotice style={style} notice={log} />
    } else if (isNotification(log)) {
      LogComponent = <ChatNotification style={style} notification={log} />
    } else if (isWhisper(log)) {
      LogComponent = <ChatWhisper style={style} whisper={log} />
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
}

/**
 * React Props.
 */
type Props = {
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  copyMessageOnDoubleClick: boolean
  copyToClipboard: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  logs: Log[]
  showContextMenu: boolean
  timeout: (username: string, duration: number) => void
}
