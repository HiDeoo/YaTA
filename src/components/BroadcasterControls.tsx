import { Button, Intent, Menu, Popover, Position } from '@blueprintjs/core'
import * as React from 'react'

import BroadcasterSection from 'Components/BroadcasterSection'
import { BroadcasterSectionProps } from 'Containers/BroadcasterOverlay'
import Toaster from 'Libs/Toaster'
import Twitch, { CommercialDuration } from 'Libs/Twitch'

/**
 * React State.
 */
const initialState = { isStartingCommercial: false }
type State = Readonly<typeof initialState>

/**
 * BroadcasterControls Component.
 */
export default class BroadcasterControls extends React.Component<BroadcasterSectionProps, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel } = this.props

    if (!channel.partner) {
      return null
    }

    return (
      <BroadcasterSection title="Tools" ready>
        <Popover
          content={
            <Menu>
              <Menu.Item text="30s" onClick={this.onClickCommercial30S} />
              <Menu.Item text="1m" onClick={this.onClickCommercial1M} />
              <Menu.Item text="1m30" onClick={this.onClickCommercial1M30s} />
              <Menu.Item text="2m" onClick={this.onClickCommercial2M} />
              <Menu.Item text="2m30" onClick={this.onClickCommercial2M30S} />
              <Menu.Item text="3m" onClick={this.onClickCommercial3M} />
            </Menu>
          }
          position={Position.BOTTOM_RIGHT}
        >
          <Button icon="satellite" rightIcon="chevron-down" text="Run Commercial" />
        </Popover>
      </BroadcasterSection>
    )
  }

  /**
   * Starts a commercial.
   * @param duration - The commercial duration.
   */
  private startCommercial = async (duration: CommercialDuration) => {
    try {
      this.setState(() => ({ isStartingCommercial: true }))

      await Twitch.startCommercial(this.props.channelId, duration)

      Toaster.show({
        icon: 'tick',
        intent: Intent.SUCCESS,
        message: 'Commercial started!',
      })
    } catch (error) {
      Toaster.show({
        icon: 'error',
        intent: Intent.DANGER,
        message: 'Something went wrong while starting the commercial!',
      })
    } finally {
      this.setState(() => ({ isStartingCommercial: false }))
    }
  }

  /**
   * Triggered when the 30s commercial menu item is clicked.
   */
  private onClickCommercial30S = () => {
    this.startCommercial(30)
  }

  /**
   * Triggered when the 1m commercial menu item is clicked.
   */
  private onClickCommercial1M = () => {
    this.startCommercial(60)
  }

  /**
   * Triggered when the 1m30s commercial menu item is clicked.
   */
  private onClickCommercial1M30s = () => {
    this.startCommercial(90)
  }

  /**
   * Triggered when the 2m commercial menu item is clicked.
   */
  private onClickCommercial2M = () => {
    this.startCommercial(120)
  }

  /**
   * Triggered when the 2m30s commercial menu item is clicked.
   */
  private onClickCommercial2M30S = () => {
    this.startCommercial(150)
  }

  /**
   * Triggered when the 3m commercial menu item is clicked.
   */
  private onClickCommercial3M = () => {
    this.startCommercial(180)
  }
}
