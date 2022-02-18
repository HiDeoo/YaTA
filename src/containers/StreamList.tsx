import { Button, ButtonGroup, InputGroup, Position, Tooltip } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { Flipper } from 'react-flip-toolkit'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'recompose'

import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import Stream from 'components/Stream'
import Twitch, { RawStream, Streams } from 'libs/Twitch'
import { StreamsSortOrder, setStreamsSortOrder } from 'store/ducks/settings'
import { ApplicationState } from 'store/reducers'
import { getStreamsSortOrder } from 'store/selectors/settings'
import styled, { size, theme } from 'styled'

/**
 * Toolbar component.
 */
const Toolbar = styled(FlexLayout)`
  border-bottom: 1px solid ${theme('streams.border')};
  display: flex;
  align-items: center;
  padding-right: 10px;
`

/**
 * SortGroup component.
 */
const SortGroup = styled(ButtonGroup)`
  margin-right: 10px;
`

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  height: calc(100% - 51px);
  overflow-x: hidden;
  overflow-y: scroll;
`

/**
 * Grid component.
 */
const Grid = styled.div`
  display: grid;
  grid-auto-rows: ${size('streams.height')};
  grid-column-gap: ${size('streams.margin')};
  grid-row-gap: ${size('streams.margin')};
  grid-template-columns: repeat(auto-fit, minmax(${size('streams.width')}, 1fr));
  padding: ${size('streams.margin')};
  padding-right: 10px;
`

/**
 * Search component.
 */
const Search = styled(InputGroup)`
  margin: 10px;
`

/**
 * Sort type.
 */
enum SortType {
  Viewers,
  Uptime,
}

/**
 * React State.
 */
const initialState = {
  error: undefined as Optional<Error>,
  filter: '',
  filteredStreams: undefined as Optional<FilterableStream[]>,
  filterableStreams: undefined as Optional<FilterableStream[]>,
  prevPropsStreamsSortOrder: StreamsSortOrder.ViewersDesc,
  streams: undefined as Optional<Streams>,
}
type State = Readonly<typeof initialState>

/**
 * StreamList Component.
 */
class StreamList extends React.Component<Props, State> {
  /**
   * Lifecycle: getDerivedStateFromProps.
   * @param  nextProps - The next props.
   * @param  prevState - The previous state
   * @return An object to update the state or `null` to update nothing.
   */
  public static getDerivedStateFromProps(
    { streamsSortOrder }: Props,
    { filter, streams, prevPropsStreamsSortOrder }: State
  ) {
    if (!_.isNil(streams) && streamsSortOrder !== prevPropsStreamsSortOrder) {
      const sortedStreams = StreamList.getSortedStreams(streams, streamsSortOrder)

      return {
        filteredStreams: StreamList.getFilteredStreams(sortedStreams, filter),
        filterableStreams: sortedStreams,
        prevPropsStreamsSortOrder: streamsSortOrder,
      }
    }

    return null
  }

  /**
   * Returns the sorted streams.
   * @param  streams - The streams to sort.
   * @param  sortOrder- The sort order.
   * @param  hideOffline - Defines if offline channels should be included or not.
   * @return The sorted streams.
   */
  private static getSortedStreams({ online, own }: Streams, sortOrder: StreamsSortOrder) {
    const isSortingByViewers = this.isSortingByViewers(sortOrder)
    const isSortingDesc = this.isSortingDesc(sortOrder)

    const type = isSortingByViewers ? 'viewer_count' : 'started_at'
    const direction = isSortingByViewers ? (isSortingDesc ? 'desc' : 'asc') : isSortingDesc ? 'asc' : 'desc'

    const streams = _.orderBy(online, [type], [direction])

    let allStreams: RawStream[] = !_.isNil(own) ? [own, ...streams] : [...streams]

    return _.map(allStreams, (stream) => ({
      ...stream,
      content: `${stream.user_name.toLowerCase()} ${stream.title.toLowerCase()} ${stream.game_name.toLowerCase()}`,
    }))
  }

  /**
   * Returns the filtered streams.
   * @param  streams - The streams to filter.
   * @param  filter- The filter to use.
   * @return The filtered streams.
   */
  private static getFilteredStreams(streams: Optional<FilterableStream[]>, filter: string) {
    let filteredStreams: Optional<FilterableStream[]>

    if (!_.isNil(streams) && filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredStreams = _.filter(streams, (stream) => stream.content.includes(sanitizedFilter))
    }

    return filteredStreams
  }

  /**
   * Checks if currently sorting by viewers.
   * @param  sortOrder - The current sort order.
   * @return `true` when sorting by viewers.
   */
  private static isSortingByViewers(sortOrder: StreamsSortOrder) {
    return sortOrder === StreamsSortOrder.ViewersAsc || sortOrder === StreamsSortOrder.ViewersDesc
  }

  /**
   * Checks if currently sorting in descending order.
   * @param  sortOrder - The current sort order.
   * @return `true` when sorting in descending order.
   */
  private static isSortingDesc(sortOrder: StreamsSortOrder) {
    return sortOrder === StreamsSortOrder.ViewersDesc || sortOrder === StreamsSortOrder.UptimeDesc
  }

  public state: State = initialState
  private search: HTMLInputElement | null = null

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { streamsSortOrder } = this.props

      const streams = await Twitch.fetchStreams()

      this.setState(
        () => ({ filterableStreams: StreamList.getSortedStreams(streams, streamsSortOrder), streams }),
        () => {
          this.focusFilterInput()
        }
      )
    } catch (error) {
      this.setState(() => ({ error }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { error, filter, filteredStreams, filterableStreams } = this.state
    const { streamsSortOrder } = this.props

    if (!_.isNil(error)) {
      throw error
    }

    if (_.isNil(filterableStreams)) {
      return <Spinner large />
    }

    if (filterableStreams.length === 0) {
      return (
        <NonIdealState
          title="Looks like you're alone!"
          details={
            <>
              Maybe try to find streamers you like on <a href="https://twitch.tv">Twitch</a>.
            </>
          }
        />
      )
    }

    const streamsToRender = filter.length > 0 && !_.isNil(filteredStreams) ? filteredStreams : filterableStreams

    return (
      <>
        <Toolbar>
          <FlexContent>
            <Search
              placeholder="Filter…"
              type="search"
              leftIcon="search"
              value={filter}
              onChange={this.onChangeFilter}
              inputRef={this.setSearchElementRef}
            />
          </FlexContent>
          {this.renderContols()}
        </Toolbar>
        <Wrapper>
          {streamsToRender.length > 0 ? (
            <Flipper flipKey={`${filter}-${streamsSortOrder}`} spring="veryGentle">
              <Grid>
                {_.map(streamsToRender, (stream) => (
                  <Stream key={stream.id} stream={stream} goToChannel={this.goToChannel} />
                ))}
              </Grid>
            </Flipper>
          ) : (
            <NonIdealState details="Maybe try other options." title="No results!" />
          )}
        </Wrapper>
      </>
    )
  }

  /**
   * Renders the controls.
   * @return Element to render.
   */
  private renderContols() {
    const { streamsSortOrder } = this.props

    const byViewers = StreamList.isSortingByViewers(streamsSortOrder)
    const byDesc = StreamList.isSortingDesc(streamsSortOrder)

    const byViewersIcon = byViewers ? (byDesc ? 'sort-desc' : 'sort-asc') : 'sort-desc'
    const byUptimeIcon = !byViewers ? (byDesc ? 'sort-desc' : 'sort-asc') : 'sort-desc'

    return (
      <FlexLayout>
        <SortGroup>
          <Tooltip content="Sort by viewers" position={Position.BOTTOM}>
            <Button icon="people" rightIcon={byViewersIcon} active={byViewers} onClick={this.onClickSortByViewers} />
          </Tooltip>
          <Tooltip content="Sort by uptime" position={Position.BOTTOM}>
            <Button icon="time" rightIcon={byUptimeIcon} active={!byViewers} onClick={this.onClickSortByUptime} />
          </Tooltip>
        </SortGroup>
      </FlexLayout>
    )
  }

  /**
   * Triggered when the sort by viewers button is clicked.
   */
  private onClickSortByViewers = () => {
    this.sortBy(SortType.Viewers)
  }

  /**
   * Triggered when the sort by uptime button is clicked.
   */
  private onClickSortByUptime = () => {
    this.sortBy(SortType.Uptime)
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    this.setState(({ filterableStreams }) => ({
      filter,
      filteredStreams: StreamList.getFilteredStreams(filterableStreams, filter),
    }))
  }

  /**
   * Focuses the filter input.
   */
  private focusFilterInput() {
    if (!_.isNil(this.search)) {
      this.search.focus()
    }
  }

  /**
   * Go to a specific channel.
   */
  private goToChannel = (channel: string) => {
    this.props.history.push(`/${channel}`)
  }

  /**
   * Updates the sort order.
   * @param type - The new sort type.
   */
  private sortBy(type: SortType) {
    const { streamsSortOrder } = this.props

    let sortOrder: StreamsSortOrder

    if (StreamList.isSortingByViewers(streamsSortOrder)) {
      if (type === SortType.Viewers) {
        sortOrder =
          streamsSortOrder === StreamsSortOrder.ViewersDesc ? StreamsSortOrder.ViewersAsc : StreamsSortOrder.ViewersDesc
      } else {
        sortOrder = StreamsSortOrder.UptimeDesc
      }
    } else {
      if (type === SortType.Viewers) {
        sortOrder = StreamsSortOrder.ViewersDesc
      } else {
        sortOrder =
          streamsSortOrder === StreamsSortOrder.UptimeDesc ? StreamsSortOrder.UptimeAsc : StreamsSortOrder.UptimeDesc
      }
    }

    this.props.setStreamsSortOrder(sortOrder)

    this.focusFilterInput()
  }

  /**
   * Sets the search input ref.
   * @param ref - The reference to the inner input element.
   */
  private setSearchElementRef = (ref: HTMLInputElement | null) => {
    this.search = ref
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, {}>(
  connect<StateProps, DispatchProps, {}, ApplicationState>(
    (state) => ({
      streamsSortOrder: getStreamsSortOrder(state),
    }),
    { setStreamsSortOrder }
  ),
  withRouter
)

export default enhance(StreamList)

/**
 * React Props.
 */
interface StateProps {
  streamsSortOrder: ReturnType<typeof getStreamsSortOrder>
}

/**
 * React Props.
 */
interface DispatchProps {
  setStreamsSortOrder: typeof setStreamsSortOrder
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & RouteComponentProps<{}>

/**
 * Stream optimized for filtering by computing ahead of time filterable content.
 */
type FilterableStream = RawStream & { content: string }
