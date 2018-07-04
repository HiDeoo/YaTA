import { InputGroup, Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'

import Center from 'Components/Center'
import FollowedChannel from 'Components/FollowedChannel'
import FollowedStream from 'Components/FollowedStream'
import Shrug from 'Components/Shrug'
import Twitch, { RawChannel, RawStream } from 'Libs/Twitch'
import { size } from 'Utils/styled'

/**
 * Tet component.
 */
const Wrapper = styled.div`
  height: calc(100% - 50px);
  overflow-y: scroll;
`

/**
 * Grid component.
 */
const Grid = styled.div`
  display: grid;
  grid-auto-rows: ${size('follows.height')}px;
  grid-column-gap: ${size('follows.margin')}px;
  grid-row-gap: ${size('follows.margin')}px;
  grid-template-columns: repeat(auto-fit, minmax(${size('follows.width')}px, 1fr));
  padding: ${size('follows.margin')}px;
`

/**
 * Search component.
 */
const Search = styled(InputGroup)`
  margin: 10px;
`

/**
 * React State.
 */
const initialState = {
  didFail: false,
  filter: '',
  filteredFollows: null as Array<RawChannel | RawStream> | null,
  follows: null as Array<RawChannel | RawStream> | null,
}
type State = Readonly<typeof initialState>

/**
 * Follows Component.
 */
class Follows extends React.Component<RouteComponentProps<{}>, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const allFollow = await Twitch.fetchAuthenticatedUserFollows()
      const { streams } = await Twitch.fetchAuthenticatedUserStreams()

      const follows = _.map(allFollow.follows, 'channel')

      const onlineStreams = _.map(streams, 'channel.name')
      const offlineFollows = _.filter(follows, (follow) => !_.includes(onlineStreams, follow.name))

      this.setState(() => ({ follows: [...streams, ...offlineFollows], didFail: false }))
    } catch (error) {
      this.setState(() => ({ didFail: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, follows } = this.state

    if (didFail) {
      throw new Error('Unable to fetch follows.')
    }

    if (_.isNil(follows)) {
      return (
        <Center>
          <Spinner large />
        </Center>
      )
    }

    if (follows.length === 0) {
      return (
        <Center>
          <Shrug />
          <h1>Looks like you're alone!</h1>
          <p>
            Maybe try to find streamers you like on <a href="https://twitch.tv">Twitch</a>.
          </p>
        </Center>
      )
    }

    const { filter, filteredFollows } = this.state

    const followsToRender = filter.length > 0 && !_.isNil(filteredFollows) ? filteredFollows : follows

    return (
      <>
        <Search placeholder="Filter…" type="search" leftIcon="search" value={filter} onChange={this.onChangeFilter} />
        <Wrapper>
          <Grid>
            {_.map(
              followsToRender,
              (follow) =>
                Twitch.isStream(follow) ? (
                  <FollowedStream key={follow._id} stream={follow} goToChannel={this.goToChannel} />
                ) : (
                  <FollowedChannel key={follow._id} channel={follow} goToChannel={this.goToChannel} />
                )
            )}
          </Grid>
        </Wrapper>
      </>
    )
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    let filteredFollows: Array<RawChannel | RawStream> | null = null

    const { follows } = this.state

    if (!_.isNil(follows) && filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredFollows = _.filter(follows, (follow) => {
        const name = Twitch.isStream(follow) ? follow.channel.name : follow.name

        return name.includes(sanitizedFilter)
      })
    }

    this.setState(() => ({ filter, filteredFollows }))
  }

  /**
   * Go to a specific channel.
   */
  private goToChannel = (channel: string) => {
    this.props.history.push(`/${channel}`)
  }
}

export default withRouter(Follows)
