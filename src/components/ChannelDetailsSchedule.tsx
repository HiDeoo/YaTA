import _ from 'lodash'
import { Component } from 'react'

import { ChannelDetailsProps } from 'components/ChannelDetails'
import ChannelDetailsPanel from 'components/ChannelDetailsPanel'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import Twitch, { RawSchedule } from 'libs/Twitch'
import { ThemeProps, withTheme } from 'styled'

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

    console.log('schedule ', schedule)

    return (
      <ChannelDetailsPanel minimal>
        {
          // TODO(HiDeoo)
        }
      </ChannelDetailsPanel>
    )
  }
}

export default withTheme(ChannelDetailsSchedule)
