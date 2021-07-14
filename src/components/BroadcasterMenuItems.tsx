import { Icon, Intent, MenuDivider, MenuItem } from '@blueprintjs/core'
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
        <MenuDivider title="Broadcaster Tools" />
        <MenuItem onClick={this.openStreamInfos} icon="edit" text="Edit stream infos" />
        <MenuItem icon="satellite" text="Run commercial">
          <MenuDivider
            title={
              <>
                <Icon icon="time" /> &nbsp;Duration
              </>
            }
          />
          {_.map(CommercialDurations, (label: string, duration: CommercialDuration) => (
            <MenuItem
              onClick={(event: React.MouseEvent) => this.onClickCommercial(event, duration)}
              key={duration}
              text={label}
            />
          ))}
        </MenuItem>
        <MenuDivider title="Twitch" />
        <MenuItem onClick={this.openActivityFeed} icon="feed" text="Activity Feed" />
        <MenuItem onClick={this.openRewardsQueue} icon="stopwatch" text="Rewards Queue" />
        <MenuItem onClick={this.openStreamManager} icon="dashboard" text="Stream Manager" />
        <MenuItem onClick={this.openStreamSummary} icon="chart" text="Stream Summary" />
        <MenuDivider title="Others" />
        <MenuItem onClick={this.openTwitchStatus} icon="power" text="Twitch Status" />
        <MenuItem onClick={this.openTwitchSupport} icon="headset" text="Twitch Support" />
        <MenuItem onClick={this.openSullyGnome} icon="timeline-area-chart" text="SullyGnome Stats" />
      </>
    )
  }

  /**
   * Opens the Twitch stream infos.
   */
  private openStreamInfos = () => {
    Twitch.openStreamInfos(this.props.channel)
  }

  /**
   * Opens the Twitch activity feed.
   */
  private openActivityFeed = () => {
    Twitch.openActivityFeed(this.props.channel)
  }

  /**
   * Opens the Twitch stream manager.
   */
  private openStreamManager = () => {
    Twitch.openStreamManager(this.props.channel)
  }

  /**
   * Opens the Twitch stream summary.
   */
  private openStreamSummary = () => {
    Twitch.openStreamSummary(this.props.channel)
  }

  /**
   * Opens the Twitch status page.
   */
  private openTwitchStatus = () => {
    window.open('https://status.twitch.tv')
  }

  /**
   * Opens the Twitch support Twitter page.
   */
  private openTwitchSupport = () => {
    window.open('https://twitter.com/TwitchSupport')
  }

  /**
   * Opens the SullyGnome page.
   */
  private openSullyGnome = () => {
    window.open(`https://sullygnome.com/channel/${this.props.channel}`)
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
