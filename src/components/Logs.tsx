import * as _ from 'lodash'
import * as React from 'react'
import * as ReactTooltip from 'react-tooltip'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import Marker from 'Components/Marker'
import Message from 'Components/Message'
import Notice from 'Components/Notice'
import Notification from 'Components/Notification'
import Whisper from 'Components/Whisper'
import { ActionHandler } from 'Libs/Action'
import { SerializedChatter } from 'Libs/Chatter'
import { SerializedMessage } from 'Libs/Message'
import { ChattersState } from 'Store/ducks/chatters'
import { isMarker, isMessage, isNotice, isNotification, isWhisper, Log } from 'Store/ducks/logs'
import base from 'Styled/base'
import { ifProp, size } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexContent)<WrapperProps>`
  border-bottom: ${size('log.border.bottom')} solid
    ${ifProp('pauseAutoScroll', 'rgba(245, 86, 86, 0.78)', 'transparent')};
  border-top: ${size('log.border.top')} solid ${ifProp('pauseAutoScroll', 'rgba(245, 86, 86, 0.78)', 'transparent')};
  font-size: 0.82rem;
  line-height: 1.4rem;
  overflow: hidden;
`

/**
 * Logs Component.
 */
export default class Logs extends React.Component<Props> {
  public list = React.createRef<List>()
  private pauseAutoScroll: boolean = false
  private previousPauseAutoScroll: boolean = false
  private logMeasureCache: CellMeasurerCache

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.logMeasureCache = new CellMeasurerCache({
      defaultHeight: base.log.minHeight,
      fixedWidth: true,
      keyMapper: (index) => _.get(this.props.logs[index], 'id'),
      minHeight: base.log.minHeight,
    })
  }

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
    const { copyMessageOnDoubleClick, logs, purgedCount, showContextMenu } = this.props
    const { bottom, top } = base.log.border

    const scrollToIndex = this.pauseAutoScroll ? undefined : logs.length - 1

    return (
      <Wrapper pauseAutoScroll={this.pauseAutoScroll}>
        <AutoSizer onResize={this.onResize}>
          {({ height, width }) => (
            <List
              copyMessageOnDoubleClick={copyMessageOnDoubleClick}
              deferredMeasurementCache={this.logMeasureCache}
              rowHeight={this.logMeasureCache.rowHeight}
              showContextMenu={showContextMenu}
              height={height - bottom - top}
              rowRenderer={this.logRenderer}
              scrollToIndex={scrollToIndex}
              purgedCount={purgedCount}
              onScroll={this.onScroll}
              rowCount={logs.length}
              overscanRowCount={10}
              ref={this.list}
              width={width}
            />
          )}
        </AutoSizer>
      </Wrapper>
    )
  }

  /**
   * Triggered when the list is scrolled.
   * @param info - The scrolling informations.
   */
  private onScroll = ({
    clientHeight,
    scrollHeight,
    scrollTop,
  }: {
    clientHeight: number
    scrollHeight: number
    scrollTop: number
  }) => {
    const offset = scrollHeight - scrollTop

    // Allow for a little bit of threshold.
    const pauseAutoScroll = offset - clientHeight > 10

    if (pauseAutoScroll !== this.pauseAutoScroll) {
      this.togglePauseAutoScroll(pauseAutoScroll)
    }
  }

  /**
   * Clears the measures cache when resizing the window.
   */
  private onResize = () => {
    this.logMeasureCache.clearAll()
  }

  /**
   * Triggered when a message context menu is opened or closed.
   * @param open - `true` when opening.
   */
  private onToggleContextMenu = (open: boolean) => {
    if (open) {
      this.previousPauseAutoScroll = this.pauseAutoScroll

      this.togglePauseAutoScroll(open)
    } else if (!open && !this.previousPauseAutoScroll) {
      this.togglePauseAutoScroll(open)

      this.props.scrollToNewestLog()
    }
  }

  /**
   * Pauses or un-pauses the auto scroll.
   * @param pause - `true` when pausing.
   */
  private togglePauseAutoScroll(pause: boolean) {
    this.pauseAutoScroll = pause

    this.props.pauseAutoScroll(pause)
  }

  /**
   * Render a log based on its type.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private logRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const log = this.props.logs[index]

    let LogComponent: JSX.Element | null = null

    const {
      actionHandler,
      ban,
      canModerate,
      chatters,
      copyMessageOnDoubleClick,
      copyMessageToClipboard,
      copyToClipboard,
      focusChatter,
      quoteMessage,
      showContextMenu,
      timeout,
      unban,
      whisper,
    } = this.props

    if (isMessage(log)) {
      const chatter = _.get(chatters, log.user.id)
      const isBanned = _.isNil(chatter) ? false : chatter.banned

      LogComponent = (
        <Message
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          copyMessageToClipboard={copyMessageToClipboard}
          onToggleContextMenu={this.onToggleContextMenu}
          showUnbanContextMenuItem={isBanned}
          copyToClipboard={copyToClipboard}
          showContextMenu={showContextMenu}
          actionHandler={actionHandler}
          focusChatter={focusChatter}
          quoteMessage={quoteMessage}
          canModerate={canModerate}
          timeout={timeout}
          whisper={whisper}
          unban={unban}
          style={style}
          message={log}
          ban={ban}
        />
      )
    } else if (isNotice(log)) {
      LogComponent = <Notice style={style} notice={log} />
    } else if (isNotification(log)) {
      LogComponent = <Notification style={style} notification={log} />
    } else if (isWhisper(log)) {
      LogComponent = (
        <Whisper
          style={style}
          whisper={log}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          copyMessageToClipboard={copyMessageToClipboard}
        />
      )
    } else if (isMarker(log)) {
      LogComponent = <Marker style={style} marker={log} />
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
}

/**
 * React Props.
 */
type Props = {
  actionHandler: ActionHandler
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  chatters: ChattersState['byId']
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  copyToClipboard: (message: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  logs: Log[]
  pauseAutoScroll: (pause: boolean) => void
  purgedCount: number
  quoteMessage: (message: SerializedMessage) => void
  scrollToNewestLog: () => void
  showContextMenu: boolean
  timeout: (username: string, duration: number) => void
  unban: (username: string) => void
  whisper: (username: string) => void
}

/**
 * React Props.
 */
type WrapperProps = {
  pauseAutoScroll: boolean
}
