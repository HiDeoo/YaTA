import { Text } from '@blueprintjs/core'
import _ from 'lodash'
import pluralize from 'pluralize'
import * as React from 'react'
import TimeAgo, { Formatter } from 'react-timeago'

import BroadcasterSection from 'components/BroadcasterSection'
import ExternalLink from 'components/ExternalLink'
import NonIdealState from 'components/NonIdealState'
import { BroadcasterSectionProps } from 'containers/BroadcasterOverlay'
import Twitch, { ClipPeriod } from 'libs/Twitch'
import styled, { theme } from 'styled'

/**
 * Stats component.
 */
const Stats = styled.div`
  border-left: 1px solid ${theme('broadcaster.border')};
  border-top: 1px solid ${theme('broadcaster.border')};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`

/**
 * Stat component.
 */
const Stat = styled.div`
  border-bottom: 1px solid ${theme('broadcaster.border')};
  border-right: 1px solid ${theme('broadcaster.border')};
  padding: 8px 4px;
  text-align: center;

  &:hover {
    background-color: ${theme('resource.hover.background')};

    & > div {
      color: ${theme('resource.hover.color')};

      & + div {
        color: ${theme('resource.hover.meta')};
      }
    }
  }
`

/**
 * Name component.
 */
const Name = styled.div`
  color: ${theme('broadcaster.meta')};
  font-size: 0.78rem;
`

/**
 * Value component.
 */
const Value = styled(Text).attrs({
  ellipsize: true,
})`
  color: ${theme('broadcaster.color')};
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
`

/**
 * Links component.
 */
const Links = styled.div`
  color: ${theme('broadcaster.meta')};
  font-size: 12px;
  margin-top: 12px;
  text-align: center;

  & > a {
    margin-left: 3px;
  }
`

/**
 * React State.
 */
const initialState = {
  didFail: false,
  isReady: false,
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
      statistics: [
        { name: 'Follower', value: channel.followers },
        { name: 'View', value: channel.views },
      ],
    }
  }

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { channel, channelId } = this.props

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
          isReady: true,
          statistics: newStatistics,
        }
      })
    } catch {
      this.setState(() => ({ didFail: true, isReady: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, isReady, statistics } = this.state
    const { channel } = this.props

    if (didFail) {
      return <NonIdealState retry />
    }

    return (
      <BroadcasterSection title="Statistics" ready={isReady}>
        <Stats>
          {_.map(statistics, ({ name, value }) => (
            <Stat key={name}>
              <Value>{_.isNumber(value) ? value.toLocaleString() : value}</Value>
              <Name>{_.isNumber(value) ? pluralize(name, value) : name}</Name>
            </Stat>
          ))}
        </Stats>
        <Links>
          <ExternalLink href="https://www.twitch.tv/dashboard/stream-summary">Stream Summary</ExternalLink> -
          <ExternalLink href="https://www.twitch.tv/dashboard/channel-analytics">Channel Analytics</ExternalLink> -
          <ExternalLink href={`https://twinge.tv/channels/${channel.name}`}>Twinge</ExternalLink> -
          <ExternalLink href={`https://sullygnome.com/channel/${channel.name}`}>SullyGnome</ExternalLink>
        </Links>
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
