import { Text } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import TimeAgo, { Formatter } from 'react-timeago'
import styled from 'styled-components'

import BroadcasterSection from 'Components/BroadcasterSection'
import NonIdealState from 'Components/NonIdealState'
import { BroadcasterSectionProps } from 'Containers/BroadcasterOverlay'
import Twitch, { ClipPeriod } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Stats component.
 */
const Stats = styled.div`
  border-left: 1px solid ${color('broadcaster.border')};
  border-top: 1px solid ${color('broadcaster.border')};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-columns: 100px;
`

/**
 * Stat component.
 */
const Stat = styled.div`
  border-bottom: 1px solid ${color('broadcaster.border')};
  border-right: 1px solid ${color('broadcaster.border')};
  padding: 8px 4px;
  text-align: center;
  width: 136px;

  &:hover {
    background-color: ${color('broadcaster.hover.background')};

    & > div {
      color: ${color('broadcaster.hover.color')};

      & + div {
        color: ${color('broadcaster.hover.meta')};
      }
    }
  }
`

/**
 * Name component.
 */
const Name = styled.div`
  color: ${color('broadcaster.meta')};
  font-size: 0.78rem;
`

/**
 * Value component.
 */
const Value = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${color('broadcaster.color')};
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
`

/**
 * React State.
 */
const initialState = {
  didFail: false,
  ready: false,
  statistics: [] as Statistic[],
}
type State = Readonly<typeof initialState>

/**
 * BroadcasterStatistics Component.
 */
export default class BroadcasterStatistics extends React.Component<BroadcasterSectionProps, State> {
  public state: State = initialState

  /**
   * Creates a new instance of the component.
   * @class
   * @param props - The props of the component.
   */
  constructor(props: BroadcasterSectionProps) {
    super(props)

    const { channel } = props

    this.state = {
      ...initialState,
      statistics: [{ name: 'Follower', value: channel.followers }, { name: 'View', value: channel.views }],
    }
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { channel, channelId } = this.props

      if (_.isNil(channel) || _.isNil(channelId)) {
        throw new Error('Missing channel informations.')
      }

      const response = await Promise.all([
        Twitch.fetchTopClips(channel.name, ClipPeriod.Day, 100),
        Twitch.fetchStream(channelId),
      ])

      const [{ clips }, { stream }] = response

      this.setState(({ statistics }) => {
        let newStatistics = [
          ...statistics,
          { name: 'Recent Clip', value: clips.length === 100 ? '100+' : clips.length },
        ]

        if (!_.isNil(stream)) {
          newStatistics = [
            { name: 'Viewer', value: stream.viewers },
            {
              name: 'Uptime',
              value: <TimeAgo date={new Date(stream.created_at)} formatter={this.uptimeRenderer} />,
            },
            { name: 'FPS', value: `~${Math.round(stream.average_fps)}` },
            ...newStatistics,
          ]
        }

        return {
          didFail: false,
          ready: true,
          statistics: newStatistics,
        }
      })
    } catch (error) {
      this.setState(() => ({ didFail: true, ready: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, ready, statistics } = this.state

    if (didFail) {
      return <NonIdealState title="Something went wrong!" details="Please try again in a few minutes." />
    }

    return (
      <BroadcasterSection title="Statistics" ready={ready}>
        <Stats>
          {_.map(statistics, ({ name, value }) => (
            <Stat key={name}>
              <Value>{_.isNumber(value) ? value.toLocaleString() : value}</Value>
              <Name>{_.isNumber(value) ? pluralize(name, value) : name}</Name>
            </Stat>
          ))}
        </Stats>
      </BroadcasterSection>
    )
  }

  /**
   * Renders the uptime.
   * @return Element to render.
   */
  private uptimeRenderer: Formatter = (value, units) => {
    return `${value.toString()} ${_.isNil(units) ? '' : pluralize(units, value)}`
  }
}

/**
 * Statistic.
 */
type Statistic = {
  name: string
  value: string | number | JSX.Element
}
