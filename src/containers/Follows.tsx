import { Button, ButtonGroup, Classes, InputGroup, Position, Tooltip } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { Flipper } from 'react-flip-toolkit'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'recompose'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import Follow from 'Components/Follow'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { Follower, Followers } from 'Libs/Twitch'
import { FollowsSortOrder, setFollowsSortOrder, toggleHideOfflineFollows } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getFollowsSortOrder, getHideOfflineFollows } from 'Store/selectors/settings'
import styled, { size, theme } from 'Styled'

/**
 * Toolbar component.
 */
const Toolbar = styled(FlexLayout)`
  border-bottom: 1px solid ${theme('follows.border')};
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
 * OfflineButton component.
 */
const OfflineButton = styled(Button)`
  &.${Classes.BUTTON} {
    padding: 5px 15px;
  }
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
  grid-auto-rows: ${size('follows.height')};
  grid-column-gap: ${size('follows.margin')};
  grid-row-gap: ${size('follows.margin')};
  grid-template-columns: repeat(auto-fit, minmax(${size('follows.width')}, 1fr));
  padding: ${size('follows.margin')};
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
  filteredFollows: undefined as Optional<FilterableFollower[]>,
  followers: undefined as Optional<Followers>,
  follows: undefined as Optional<FilterableFollower[]>,
  prevPropsFollowsSortOrder: FollowsSortOrder.ViewersDesc,
  prevPropsHideOfflineFollows: false,
}
type State = Readonly<typeof initialState>

/**
 * Follows Component.
 */
class Follows extends React.Component<Props, State> {
  /**
   * Lifecycle: getDerivedStateFromProps.
   * @param  nextProps - The next props.
   * @param  prevState - The previous state
   * @return An object to update the state or `null` to update nothing.
   */
  public static getDerivedStateFromProps(
    { followsSortOrder, hideOfflineFollows }: Props,
    { filter, followers, prevPropsFollowsSortOrder, prevPropsHideOfflineFollows }: State
  ) {
    if (
      !_.isNil(followers) &&
      (followsSortOrder !== prevPropsFollowsSortOrder || hideOfflineFollows !== prevPropsHideOfflineFollows)
    ) {
      const follows = Follows.getSortedFollows(followers, followsSortOrder, hideOfflineFollows)

      return {
        filteredFollows: Follows.getFilteredFollows(follows, filter),
        follows,
        prevPropsFollowsSortOrder: followsSortOrder,
        prevPropsHideOfflineFollows: hideOfflineFollows,
      }
    }

    return null
  }

  /**
   * Returns the sorted follows.
   * @param  followers - The followers to sort.
   * @param  sortOrder- The sort order.
   * @param  hideOffline - Defines if offline channels should be included or not.
   * @return The sorted follows.
   */
  private static getSortedFollows(
    { offline, online, own }: Followers,
    sortOrder: FollowsSortOrder,
    hideOffline: boolean
  ) {
    const isSortingByViewers = this.isSortingByViewers(sortOrder)
    const isSortingDesc = this.isSortingDesc(sortOrder)

    const type = isSortingByViewers ? 'viewers' : 'created_at'
    const direction = isSortingByViewers ? (isSortingDesc ? 'desc' : 'asc') : isSortingDesc ? 'asc' : 'desc'

    const streams = _.orderBy(online, [type], [direction])

    let followers: Follower[] = !_.isNil(own) ? [own, ...streams] : [...streams]
    followers = hideOffline ? followers : [...followers, ...offline]

    return _.map(followers, (follower) => {
      let name: string
      let title: string

      if (Twitch.isStream(follower)) {
        name = follower.channel.name
        title = follower.channel.status || ''
      } else {
        name = follower.name
        title = follower.status || ''
      }

      return { ...follower, content: `${name} ${title.toLowerCase()}` }
    })
  }

  /**
   * Returns the filtered follows.
   * @param  followers - The followers to filter.
   * @param  filter- The filter to use.
   * @return The filtered follows.
   */
  private static getFilteredFollows(follows: Optional<FilterableFollower[]>, filter: string) {
    let filteredFollows: Optional<FilterableFollower[]>

    if (!_.isNil(follows) && filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredFollows = _.filter(follows, (follow) => follow.content.includes(sanitizedFilter))
    }

    return filteredFollows
  }

  /**
   * Checks if currently sorting by viewers.
   * @param  sortOrder - The current sort order.
   * @return `true` when sorting by viewers.
   */
  private static isSortingByViewers(sortOrder: FollowsSortOrder) {
    return sortOrder === FollowsSortOrder.ViewersAsc || sortOrder === FollowsSortOrder.ViewersDesc
  }

  /**
   * Checks if currently sorting in descending order.
   * @param  sortOrder - The current sort order.
   * @return `true` when sorting in descending order.
   */
  private static isSortingDesc(sortOrder: FollowsSortOrder) {
    return sortOrder === FollowsSortOrder.ViewersDesc || sortOrder === FollowsSortOrder.UptimeDesc
  }

  public state: State = initialState
  private search: HTMLInputElement | null = null

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { followsSortOrder, hideOfflineFollows } = this.props

      const followers = await Twitch.fetchFollows()

      this.setState(
        () => ({ follows: Follows.getSortedFollows(followers, followsSortOrder, hideOfflineFollows), followers }),
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
    const { error, filter, filteredFollows, follows } = this.state
    const { followsSortOrder, hideOfflineFollows } = this.props

    if (!_.isNil(error)) {
      throw error
    }

    if (_.isNil(follows)) {
      return <Spinner large />
    }

    if (follows.length === 0) {
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

    const followsToRender = filter.length > 0 && !_.isNil(filteredFollows) ? filteredFollows : follows

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
          {followsToRender.length > 0 ? (
            <Flipper flipKey={`${filter}-${followsSortOrder}-${hideOfflineFollows}`} spring="veryGentle">
              <Grid>
                {_.map(followsToRender, (follow) => (
                  <Follow key={follow._id} follow={follow} goToChannel={this.goToChannel} />
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
    const { followsSortOrder, hideOfflineFollows } = this.props

    const byViewers = Follows.isSortingByViewers(followsSortOrder)
    const byDesc = Follows.isSortingDesc(followsSortOrder)

    const byViewersIcon = byViewers ? (byDesc ? 'sort-desc' : 'sort-asc') : 'sort-desc'
    const byUptimeIcon = !byViewers ? (byDesc ? 'sort-desc' : 'sort-asc') : 'sort-desc'

    const hideOfflineIcon = hideOfflineFollows ? 'eye-off' : 'eye-open'

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
        <Tooltip content="Toggle offline channels" position={Position.BOTTOM}>
          <OfflineButton
            onClick={this.onClickToggleOfflineChannels}
            active={!hideOfflineFollows}
            icon={hideOfflineIcon}
          />
        </Tooltip>
      </FlexLayout>
    )
  }

  /**
   * Triggered when the toggle offline channels button is clicked.
   */
  private onClickToggleOfflineChannels = () => {
    this.props.toggleHideOfflineFollows()

    this.focusFilterInput()
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

    this.setState(({ follows }) => ({ filter, filteredFollows: Follows.getFilteredFollows(follows, filter) }))
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
    const { followsSortOrder } = this.props

    let sortOrder: FollowsSortOrder

    if (Follows.isSortingByViewers(followsSortOrder)) {
      if (type === SortType.Viewers) {
        sortOrder =
          followsSortOrder === FollowsSortOrder.ViewersDesc ? FollowsSortOrder.ViewersAsc : FollowsSortOrder.ViewersDesc
      } else {
        sortOrder = FollowsSortOrder.UptimeDesc
      }
    } else {
      if (type === SortType.Viewers) {
        sortOrder = FollowsSortOrder.ViewersDesc
      } else {
        sortOrder =
          followsSortOrder === FollowsSortOrder.UptimeDesc ? FollowsSortOrder.UptimeAsc : FollowsSortOrder.UptimeDesc
      }
    }

    this.props.setFollowsSortOrder(sortOrder)

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
      followsSortOrder: getFollowsSortOrder(state),
      hideOfflineFollows: getHideOfflineFollows(state),
    }),
    { setFollowsSortOrder, toggleHideOfflineFollows }
  ),
  withRouter
)

export default enhance(Follows)

/**
 * React Props.
 */
interface StateProps {
  followsSortOrder: ReturnType<typeof getFollowsSortOrder>
  hideOfflineFollows: ReturnType<typeof getHideOfflineFollows>
}

/**
 * React Props.
 */
interface DispatchProps {
  setFollowsSortOrder: typeof setFollowsSortOrder
  toggleHideOfflineFollows: typeof toggleHideOfflineFollows
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps & RouteComponentProps<{}>

/**
 * Follower optimized for filtering by computing ahead of time filterable content.
 */
type FilterableFollower = Follower & { content: string }
