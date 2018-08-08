import { Button, Classes, Colors, InputGroup } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import { connect } from 'react-redux'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import HeadlessMessage from 'Components/HeadlessMessage'
import NonIdealState from 'Components/NonIdealState'
import Notification from 'Components/Notification'
import Spinner from 'Components/Spinner'
import Dialog from 'Containers/Dialog'
import { SerializedMessage } from 'Libs/Message'
import { isMessage, isNotification } from 'Store/ducks/logs'
import { ApplicationState } from 'Store/reducers'
import { getLogs } from 'Store/selectors/logs'
import base from 'Styled/base'
import { color } from 'Utils/styled'

/**
 * Content component.
 */
const Content = styled.div`
  height: 80vh;
  margin-bottom: 30px;
`

/**
 * SearchInput component.
 */
const SearchInput = styled(InputGroup)`
  margin: 10px;
`

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  border-top: 1px solid ${color('follows.border')};
  height: 100%;
  line-height: 1.4rem;
  overflow-x: hidden;
  overflow-y: auto;
`

/**
 * Refresh component.
 */
const Refresh = styled(Button)`
  margin-left: -4px;
  margin-right: 8px;

  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    & > svg {
      color: ${Colors.LIGHT_GRAY1};
    }

    &:hover {
      background: inherit;

      & > svg {
        color: ${Colors.GRAY4};
      }
    }
  }
`

/**
 * React State.
 */
const initialState = {
  filter: '',
  results: [] as ReturnType<typeof getLogs>['logs'],
  searching: false,
}
type State = Readonly<typeof initialState>

/**
 * Search Component.
 */
class Search extends React.Component<Props, State> {
  public state: State = initialState
  private search: HTMLInputElement | null = null
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
      keyMapper: (index) => _.get(this.props.allLogs.logs[index], 'id'),
      minHeight: base.log.minHeight,
    })
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   * @param prevState - The previous state.
   */
  public componentDidUpdate(prevProps: Props) {
    requestAnimationFrame(() => {
      if (!prevProps.visible && this.props.visible && !_.isNil(this.search)) {
        this.search.focus()
      }
    })
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props
    const { filter, results } = this.state

    let title = 'Search'

    if (!_.isNil(results) && results.length > 0) {
      title = title.concat(` - ${results.length.toLocaleString()} ${pluralize('results', results.length)}`)
    }

    return (
      <Dialog isOpen={visible} onClose={this.toggle} icon="search" title={title}>
        <Content>
          <FlexLayout>
            <FlexContent>
              <SearchInput
                placeholder="Type your query & press Enter to search…"
                inputRef={this.setSearchElementRef}
                onChange={this.onChangeFilter}
                value={filter}
                type="search"
              />
            </FlexContent>
            <Refresh
              disabled={filter.length === 0}
              onClick={this.computeResults}
              title="Search again…"
              icon="refresh"
              minimal
            />
          </FlexLayout>
          <Wrapper>{this.renderResults()}</Wrapper>
        </Content>
      </Dialog>
    )
  }

  /**
   * Renders the results.
   * @return Element to render.
   */
  private renderResults() {
    const { filter, results, searching } = this.state

    if (searching) {
      return <Spinner large />
    }

    if (filter.length === 0) {
      return <NonIdealState details="Start typing your query in the field above." title="Nothing yet!" />
    }

    if (results.length === 0) {
      return <NonIdealState details="Maybe try another query." title="No results!" />
    }

    return (
      <AutoSizer onResize={this.onResize}>
        {({ height, width }) => (
          <List
            deferredMeasurementCache={this.logMeasureCache}
            height={height - 1}
            overscanRowCount={10}
            rowCount={results.length}
            rowHeight={this.logMeasureCache.rowHeight}
            rowRenderer={this.resultRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    )
  }

  /**
   * Render a result based on its type.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private resultRenderer: ListRowRenderer = ({ key, index, parent, style }) => {
    const { results } = this.state

    if (results.length === 0) {
      return null
    }

    const result = results[index]

    let LogComponent: JSX.Element | null = null

    if (isMessage(result)) {
      LogComponent = (
        <HeadlessMessage style={style} onDoubleClick={this.onDoubleClickMessage} message={result} showUsername />
      )
    } else if (isNotification(result)) {
      LogComponent = <Notification style={style} notification={result} />
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
   * Clears the measures cache when resizing the window.
   */
  private onResize = () => {
    this.logMeasureCache.clearAll()
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    this.setState(
      () => ({ filter, results: [], searching: true }),
      () => {
        this.computeResults()
      }
    )
  }

  /**
   * Computes search results.
   */
  private computeResults = () => {
    if (this.state.filter.length === 0) {
      this.setState(() => ({ searching: false }))

      return
    }

    const { allLogs } = this.props

    const filters = _.map(this.state.filter.split(' '), (filter) => filter.toLowerCase().trim())

    const results = _.filter(allLogs.logs, (log) => {
      if (isMessage(log)) {
        return _.every(
          filters,
          (filter) =>
            log.text.includes(filter) ||
            log.user.userName.includes(filter) ||
            log.user.displayName.toLowerCase().includes(filter)
        )
      } else if (isNotification(log)) {
        return _.every(
          filters,
          (filter) =>
            log.title.toLowerCase().includes(filter) ||
            (!_.isNil(log.message) && log.message.toLowerCase().includes(filter))
        )
      }

      return false
    })

    this.setState(() => ({ results, searching: false }))
  }

  /**
   * Triggered when toggling the modal.
   */
  private toggle = () => {
    this.setState(initialState)

    this.props.toggle()
  }

  /**
   * Sets the search input ref.
   * @param ref - The reference to the inner input element.
   */
  private setSearchElementRef = (ref: HTMLInputElement | null) => {
    this.search = ref
  }

  /**
   * Triggered when a message is double clicked.
   * @param message - The message.
   */
  private onDoubleClickMessage = (message: SerializedMessage) => {
    const { copyMessageOnDoubleClick, copyMessageToClipboard } = this.props

    if (copyMessageOnDoubleClick) {
      copyMessageToClipboard(message)
    }
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
  allLogs: getLogs(state),
}))(Search)

/**
 * React Props.
 */
type StateProps = {
  allLogs: ReturnType<typeof getLogs>
}

/**
 * React Props.
 */
type OwnProps = {
  copyMessageOnDoubleClick: boolean
  copyMessageToClipboard: (message: SerializedMessage) => void
  toggle: () => void
  visible: boolean
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps
