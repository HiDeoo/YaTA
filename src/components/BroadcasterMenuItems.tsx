import { Icon, Intent, Menu } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import Toaster from 'libs/Toaster'
import Twitch, { CommercialDuration } from 'libs/Twitch'
import { ApplicationState } from 'store/reducers'
import { getChannelId } from 'store/selectors/app'

/**
 * Supported commercial durations and their human readable equivalents.
 */
const CommercialDurations: Record<CommercialDuration, string> = {
  30: '30s',
  60: '1m',
  90: '1m30',
  120: '2m',
  150: '2m30',
  180: '3m',
}

/**
 * BroadcasterMenuItems Component.
 */
class BroadcasterMenuItems extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <>
        <Menu.Divider title="Broadcaster Tools" />
        <Menu.Item icon="satellite" text="Run commercial">
          <Menu.Divider
            title={
              <>
                <Icon icon="time" /> &nbsp;Duration
              </>
            }
          />
          {_.map(CommercialDurations, (label: string, duration: CommercialDuration) => (
            <Menu.Item
              onClick={(event: React.MouseEvent) => this.onClickCommercial(event, duration)}
              key={duration}
              text={label}
            />
          ))}
        </Menu.Item>
        <Menu.Item onClick={this.openRewardsQueue} icon="stopwatch" text="Rewards queue" />
      </>
    )
  }

  /**
   * Opens the Twitch rewards queue.
   */
  private openRewardsQueue = () => {
    Twitch.openRewardsQueue(this.props.channel)
  }

  /**
   * Triggered when a commercial duration is clicked.
   * @param event - The associated event.
   * @param duration - The commercial duration.
   */
  private onClickCommercial = async (_event: React.MouseEvent, duration: CommercialDuration) => {
    const { channelId } = this.props

    try {
      if (!channelId) {
        throw new Error('Missing channel ID.')
      }

      await Twitch.startCommercial(channelId, duration)

      Toaster.show({
        icon: 'tick',
        intent: Intent.SUCCESS,
        message: 'Commercial started!',
      })
    } catch {
      Toaster.show({
        icon: 'error',
        intent: Intent.DANGER,
        message: 'Something went wrong while starting the commercial!',
      })
    }
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
  channelId: getChannelId(state),
}))(BroadcasterMenuItems)

/**
 * React Props.
 */
interface StateProps {
  channelId: ReturnType<typeof getChannelId>
}

/**
 * React Props.
 */
interface OwnProps {
  channel: string
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps
