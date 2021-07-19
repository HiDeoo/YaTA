import { Classes, Colors, H6, Intent, Tag } from '@blueprintjs/core'
import _ from 'lodash'
import { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'

import { ChannelDetailsProps } from 'components/ChannelDetails'
import ChannelDetailsPanel from 'components/ChannelDetailsPanel'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import Twitch, { RawSchedule, RawScheduleSegment } from 'libs/Twitch'
import { ApplicationState } from 'store/reducers'
import { getChannel } from 'store/selectors/app'
import styled, { ifProp, ThemeProps, withTheme } from 'styled'
import { isSameDay, isSameWeek } from 'utils/date'

/**
 * Wrapper component.
 */
const Wrapper = styled(ChannelDetailsPanel)`
  padding: 10px;
`

/**
 * Day component.
 */
const Day = styled(H6)<DayProps>`
  &,
  .${Classes.DARK} & {
    color: ${ifProp('$highlighted', Colors.BLUE5, 'inherit')};
  }
`

/**
 * Segment component.
 */
const Segment = styled(Tag)`
  font-weight: bold;
  margin-bottom: 8px;

  & + h6 {
    margin-top: 8px;
  }
`

/**
 * React State.
 */
const initialState = { didFail: false, schedule: undefined as Optional<RawSchedule['data'] | null> }
type State = Readonly<typeof initialState>

/**
 * ChannelDetailsSchedule Component.
 */
class ChannelDetailsSchedule extends Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { id } = this.props

    try {
      const schedule = await Twitch.fetchSchedule(id)

      this.setState(() => ({ didFail: false, schedule }))
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'schedule was not found' || error.message === 'segments were not found')
      ) {
        this.setState(() => ({ didFail: false, schedule: null }))
      } else {
        this.setState(() => ({ didFail: true, schedule: undefined }))
      }
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, schedule } = this.state

    if (didFail) {
      return <NonIdealState small retry />
    }

    if (_.isUndefined(schedule)) {
      return <Spinner />
    }

    if (_.isNil(schedule) || schedule.segments.length === 0) {
      return <NonIdealState small title="No schedule yet!" />
    }

    const now = new Date()
    let lastDate: Optional<Date>

    return (
      <Wrapper minimal>
        {schedule.segments.map((segment) => {
          const startDate = new Date(Date.parse(segment.start_time))
          const endDate = new Date(Date.parse(segment.end_time))
          const showDate = _.isNil(lastDate) || !isSameDay(lastDate, startDate)
          const isToday = isSameDay(now, startDate)
          const isCurrentWeek = isSameWeek(now, startDate)
          const isLive = startDate < now && now < endDate

          if (!isCurrentWeek) {
            return null
          }

          lastDate = startDate

          return (
            <Fragment key={segment.id}>
              {showDate && (
                <Day $highlighted={isToday}>{startDate.toLocaleDateString('en-US', { weekday: 'long' })}</Day>
              )}
              <ScheduleSegment segment={segment} channel={this.props.channel} live={isLive} />
            </Fragment>
          )
        })}
      </Wrapper>
    )
  }
}

/**
 * ScheduleSegment Component.
 */
class ScheduleSegment extends Component<ScheduleSegmentProps> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { live, segment } = this.props

    return (
      <Segment fill interactive multiline onClick={this.onClick} intent={live ? Intent.PRIMARY : Intent.NONE}>
        {segment.title}
      </Segment>
    )
  }

  /**
   * Triggered when the segment is clicked.
   */
  private onClick = () => {
    window.open(`https://www.twitch.tv/${this.props.channel}/schedule`)
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, ChannelDetailsProps>(
  connect<StateProps, {}, ChannelDetailsProps, ApplicationState>((state) => ({
    channel: getChannel(state),
  })),
  withTheme
)

export default enhance(ChannelDetailsSchedule)

/**
 * React Props.
 */
interface StateProps {
  channel: ReturnType<typeof getChannel>
}

/**
 * React Props.
 */
type Props = StateProps & ChannelDetailsProps & ThemeProps

/**
 * React Props.
 */
interface ScheduleSegmentProps {
  channel: ReturnType<typeof getChannel>
  live: boolean
  segment: RawScheduleSegment
}

/**
 * React Props.
 */
interface DayProps {
  $highlighted?: boolean
}
