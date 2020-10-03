import _ from 'lodash'
import * as React from 'react'
import ReactTooltip from 'react-tooltip'
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer'
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer'
import { List, ListRowRenderer } from 'react-virtualized/dist/es/List'

import FlexContent from 'components/FlexContent'
import Marker from 'components/Marker'
import Message from 'components/Message'
import Notice from 'components/Notice'
import Notification from 'components/Notification'
import RejectedMessage from 'components/RejectedMessage'
import Whisper from 'components/Whisper'
import { ActionHandler } from 'libs/Action'
import { SerializedChatter } from 'libs/Chatter'
import { SerializedMessage } from 'libs/Message'
import { ChattersState } from 'store/ducks/chatters'
import { isMarker, isMessage, isNotice, isNotification, isRejectedMessage, isWhisper, Log } from 'store/ducks/logs'
import styled, { ifProp, size, theme, ThemeProps, withTheme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexContent)<WrapperProps>`
  border-bottom: ${size('log.border.bottom')} solid ${ifProp('pauseAutoScroll', theme('log.pause'), 'transparent')};
  border-top: ${size('log.border.top')} solid ${ifProp('pauseAutoScroll', theme('log.pause'), 'transparent')};
  font-size: 0.82rem;
  line-height: 1.4rem;
  overflow: hidden;
`

/**
 * Logs Component.
 */
export class Logs extends React.Component<Props> {
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
      defaultHeight: props.theme.log.minHeight,
      fixedWidth: true,
      keyMapper: (index) => _.get(this.props.logs[index], 'id'),
      minHeight: props.theme.log.minHeight,
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
    const {
      alternateMessageBackgrounds,
      copyMessageOnDoubleClick,
      compressedCount,
      increaseTwitchHighlight,
      lastReadId,
      logs,
      markNewAsUnread,
      purgedCount,
      showContextMenu,
      unhandledRejectedMessageCount,
    } = this.props
    const { bottom, top } = this.props.theme.log.border

    const scrollToIndex = this.pauseAutoScroll ? undefined : logs.length - 1

    return (
      <Wrapper pauseAutoScroll={this.pauseAutoScroll}>
        <AutoSizer onResize={this.onResize}>
          {({ height, width }) => (
            <List
              unhandledRejectedMessageCount={unhandledRejectedMessageCount}
              alternateMessageBackgrounds={alternateMessageBackgrounds}
              copyMessageOnDoubleClick={copyMessageOnDoubleClick}
              increaseTwitchHighlight={increaseTwitchHighlight}
              deferredMeasurementCache={this.logMeasureCache}
              rowHeight={this.logMeasureCache.rowHeight}
              showContextMenu={showContextMenu}
              markNewAsUnread={markNewAsUnread}
              height={height - bottom - top}
              rowRenderer={this.logRenderer}
              scrollToIndex={scrollToIndex}
              purgedCount={purgedCount}
              compressedCount={compressedCount}
              onScroll={this.onScroll}
              lastReadId={lastReadId}
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
   * Triggered when a message is clicked.
   * @param id - The clicked message id.
   */
  private onClickMessage = (id: string) => {
    const { markAsRead, markNewAsUnread } = this.props

    if (markNewAsUnread) {
      markAsRead(id)
    }
  }

  private onMessageContentClicked = (id: string, index: number) => {
    const { markAsDecompressed, logs } = this.props

    const message = logs[index]

    if (isMessage(message) && message.compressed) {
      markAsDecompressed(id)

      // Clear the cache to force a height rerender if necessary
      this.logMeasureCache.clear(index, 0)
    }
  }

  /**
   * Render a log based on its type.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private logRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const log = this.props.logs[index]

    let LogComponent: Optional<JSX.Element>

    const {
      actionHandler,
      addHighlightsIgnoredUser,
      alternateMessageBackgrounds,
      addUserToCompress,
      deleteUserFromCompress,
      compressedUserIds,
      ban,
      canModerate,
      chatters,
      copyMessageOnDoubleClick,
      copyMessageToClipboard,
      copyToClipboard,
      deleteMessage,
      focusChatter,
      focusEmote,
      increaseTwitchHighlight,
      markNewAsUnread,
      markRejectedMessageAsHandled,
      openTwitchViewerCard,
      quoteMessage,
      showContextMenu,
      timeout,
      unban,
      whisper,
    } = this.props

    if (isMessage(log)) {
      const chatter = _.get(chatters, log.user.id)
      const isBanned = _.isNil(chatter) ? false : chatter.banned
      const useAlternate = alternateMessageBackgrounds && index % 2 === 0
      const isCompressedUser = compressedUserIds.indexOf(log.user.id) >= 0

      LogComponent = (
        <Message
          messageIndex={index}
          addHighlightsIgnoredUser={addHighlightsIgnoredUser}
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          increaseTwitchHighlight={increaseTwitchHighlight}
          copyMessageToClipboard={copyMessageToClipboard}
          onToggleContextMenu={this.onToggleContextMenu}
          openTwitchViewerCard={openTwitchViewerCard}
          addUserToCompress={addUserToCompress}
          deleteUserFromCompress={deleteUserFromCompress}
          isCompressedUser={isCompressedUser}
          showUnbanContextMenuItem={isBanned}
          copyToClipboard={copyToClipboard}
          showContextMenu={showContextMenu}
          markNewAsUnread={markNewAsUnread}
          actionHandler={actionHandler}
          deleteMessage={deleteMessage}
          onClick={this.onClickMessage}
          onMessageContentClicked={this.onMessageContentClicked}
          focusChatter={focusChatter}
          quoteMessage={quoteMessage}
          useAlternate={useAlternate}
          canModerate={canModerate}
          focusEmote={focusEmote}
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
          copyMessageOnDoubleClick={copyMessageOnDoubleClick}
          copyMessageToClipboard={copyMessageToClipboard}
          focusEmote={focusEmote}
          style={style}
          whisper={log}
        />
      )
    } else if (isMarker(log)) {
      LogComponent = <Marker style={style} marker={log} />
    } else if (isRejectedMessage(log)) {
      LogComponent = (
        <RejectedMessage
          markRejectedMessageAsHandled={markRejectedMessageAsHandled}
          rejectedMessage={log}
          style={style}
        />
      )
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

export default withTheme(Logs)

/**
 * React Props.
 */
interface Props extends ThemeProps {
  actionHandler: ActionHandler
  addHighlightsIgnoredUser: (username: string) => void
  addUserToCompress: (userId: string) => void
  alternateMessageBackgrounds: boolean
  ban: (username: string) => void
  canModerate: (chatter: SerializedChatter) => boolean
  chatters: ChattersState['byId']
  compressedCount: number
  compressedUserIds: string[]
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  copyToClipboard: (message: string) => void
  deleteMessage: (id: string) => void
  deleteUserFromCompress: (userId: string) => void
  focusChatter: (chatter: SerializedChatter) => void
  focusEmote: (id: string, name: string, provider: string) => void
  increaseTwitchHighlight: boolean
  lastReadId: string | null
  logs: Log[]
  markAsRead: (id: string) => void
  markRejectedMessageAsHandled: (id: string) => void
  markAsDecompressed: (id: string) => void
  markNewAsUnread: boolean
  openTwitchViewerCard: (user: Optional<SerializedChatter>) => void
  pauseAutoScroll: (pause: boolean) => void
  purgedCount: number
  quoteMessage: (message: SerializedMessage) => void
  scrollToNewestLog: () => void
  showContextMenu: boolean
  timeout: (username: string, duration: number) => void
  unban: (username: string) => void
  unhandledRejectedMessageCount: number
  whisper: (username: string) => void
}

/**
 * React Props.
 */
interface WrapperProps {
  pauseAutoScroll: boolean
}
