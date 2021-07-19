import { H6, Tag } from '@blueprintjs/core'
import _ from 'lodash'
import { Component, Fragment } from 'react'

import { ChannelDetailsProps } from 'components/ChannelDetails'
import ChannelDetailsPanel from 'components/ChannelDetailsPanel'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import Twitch, { RawSchedule } from 'libs/Twitch'
import styled, { ThemeProps, withTheme } from 'styled'
import { isSameDay, isSameWeek } from 'utils/date'

/**
 * Wrapper component.
 */
const Wrapper = styled(ChannelDetailsPanel)`
  padding: 10px;
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
class ChannelDetailsSchedule extends Component<ChannelDetailsProps & ThemeProps, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { id } = this.props

    try {
      const schedule = await Twitch.fetchSchedule(id)

      console.log('schedule ', schedule)

      this.setState(() => ({ didFail: false, schedule }))
    } catch (error) {
      if (error instanceof Error && error.message === 'schedule was not found') {
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
          const showDate = _.isNil(lastDate) || !isSameDay(lastDate, startDate)
          const isCurrentWeek = isSameWeek(now, startDate)

          if (!isCurrentWeek) {
            return null
          }

          lastDate = startDate

          return (
            <Fragment key={segment.id}>
              {showDate && <H6>{startDate.toLocaleDateString('en-US', { weekday: 'long' })}</H6>}
              <Segment fill interactive multiline>
                {segment.title}
              </Segment>
            </Fragment>
          )
        })}
      </Wrapper>
    )
  }
}

export default withTheme(ChannelDetailsSchedule)
