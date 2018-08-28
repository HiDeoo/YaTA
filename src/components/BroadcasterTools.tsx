import { Button, Classes, Colors, Icon, Intent, Menu, Popover, Position } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import BroadcasterSection from 'Components/BroadcasterSection'
import ExternalButton from 'Components/ExternalButton'
import { BroadcasterSectionProps } from 'Containers/BroadcasterOverlay'
import Toaster from 'Libs/Toaster'
import Twitch, { CommercialDuration, RawHost, Status } from 'Libs/Twitch'
import styled from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(2, 1fr);

  & > span.${Classes.POPOVER_WRAPPER} > span {
    width: 100%;

    & > button {
      width: 100%;
    }
  }

  & .${Classes.BUTTON} {
    display: flex;

    & > span.${Classes.BUTTON_TEXT} {
      flex: 1;
      text-align: left;
    }
  }
`

/**
 * React State.
 */
const initialState = {
  host: undefined as Optional<RawHost>,
  isStartingCommercial: false,
  status: Status.Unknown as Status,
}
type State = Readonly<typeof initialState>

/**
 * BroadcasterTools Component.
 */
export default class BroadcasterTools extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const response = await Promise.all([Twitch.fetchGlobalStatus(), Twitch.fetchHost(this.props.channelId)])

      const [status, { hosts }] = response

      let currentHost: Optional<RawHost>
      const actualHost = _.head(hosts)

      if (!_.isNil(actualHost) && _.has(actualHost, 'target_display_name')) {
        currentHost = actualHost
      }

      this.setState(() => ({ host: currentHost, status }))
    } catch {
      //
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel } = this.props
    const { host, status } = this.state

    let statusIcon: Optional<JSX.Element>

    if (status === Status.Online) {
      statusIcon = <Icon icon="dot" color={Colors.GREEN3} />
    } else if (status === Status.Disrupted) {
      statusIcon = <Icon icon="warning-sign" color={Colors.RED3} />
    }

    return (
      <BroadcasterSection title="Tools" ready>
        <Wrapper>
          <ExternalButton
            href="https://www.twitch.tv/dashboard/live"
            text="Twitch Live Dashboard"
            intent={Intent.PRIMARY}
            icon="dashboard"
          />
          <div />
          {!_.isNil(host) && (
            <Button
              text={`Unhost ${host.target_display_name}`}
              onClick={this.onClickUnhost}
              intent={Intent.WARNING}
              icon="cut"
            />
          )}
          {this.renderCommercialButton()}
          {_.isNil(host) && channel.partner && <div />}
          <ExternalButton
            href="https://devstatus.twitch.tv"
            rightIcon={statusIcon}
            icon="globe-network"
            text="Twitch Status"
          />
          <ExternalButton href="https://twitter.com/TwitchSupport" text="Twitch Support" icon="help" />
        </Wrapper>
      </BroadcasterSection>
    )
  }

  /**
   * Renders the commercial button.
   * @return Element to render.
   */
  private renderCommercialButton() {
    const { channel } = this.props

    if (!channel.partner) {
      return null
    }

    return (
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
    } catch {
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
   * Triggered when the unhost button is clicked.
   */
  private onClickUnhost = () => {
    this.props.unhost()

    this.setState(() => ({ host: undefined }))
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

/**
 * React Props.
 */
interface Props extends BroadcasterSectionProps {
  unhost: () => void
}
