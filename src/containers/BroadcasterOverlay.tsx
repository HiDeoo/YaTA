import { Classes, Colors, Overlay } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import BroadcasterInformations from 'Components/BroadcasterInformations'
import BroadcasterLists from 'Components/BroadcasterLists'
import BroadcasterStatistics from 'Components/BroadcasterStatistics'
import Center from 'Components/Center'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { RawChannel } from 'Libs/Twitch'
import { ApplicationState } from 'Store/reducers'
import { getChannelId } from 'Store/selectors/app'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  height: 100vh;
  pointer-events: none;
  position: relative;
  width: 100vw;
`

/**
 * Content component.
 */
const Content = styled.div`
  background-color: ${Colors.WHITE};
  box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2);
  height: 100%;
  max-width: 600px;
  min-width: 450px;
  overflow-y: auto;
  pointer-events: auto;
  position: absolute;
  right: 0;
  top: 0;
  width: 40vw;

  .${Classes.DARK} & {
    background-color: ${Colors.DARK_GRAY5};
    box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.2), 0 4px 8px rgba(16, 22, 26, 0.4), 0 18px 46px 6px rgba(16, 22, 26, 0.4);
  }

  .${Classes.OVERLAY}-appear &,
  .${Classes.OVERLAY}-enter & {
    transform: translateX(100%);
  }

  .${Classes.OVERLAY}-appear-active &,
  .${Classes.OVERLAY}-enter-active & {
    transform: translateX(0);
    transition-property: transform;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.4, 1, 0.75, 0.9);
    transition-delay: 0;
  }

  .${Classes.OVERLAY}-exit & {
    transform: translateX(0);
  }

  .${Classes.OVERLAY}-exit-active & {
    transform: translateX(100%);
    transition-property: transform;
    transition-duration: 0.1s;
    transition-timing-function: cubic-bezier(0.4, 1, 0.75, 0.9);
    transition-delay: 0;
  }
`

/**
 * React State.
 */
const initialState = { channel: undefined as RawChannel | null | undefined, didFail: false, ready: false }
type State = Readonly<typeof initialState>

/**
 * BroadcasterOverlay Component.
 */
class BroadcasterOverlay extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    const { visible } = this.props

    if (prevProps.visible !== visible) {
      if (!visible) {
        this.setState(initialState)
      } else {
        try {
          const { channelId } = this.props

          if (_.isNil(channelId)) {
            throw new Error('Missing channel id.')
          }

          const channel = await Twitch.fetchChannel(channelId)

          this.setState(() => ({ channel, didFail: false, ready: true }))
        } catch (error) {
          this.setState(() => ({ didFail: true, ready: true }))
        }
      }
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props

    return (
      <Overlay isOpen={visible} onClose={this.onClose}>
        <Wrapper>
          <Content>{this.renderContent()}</Content>
        </Wrapper>
      </Overlay>
    )
  }

  /**
   * Renders the content.
   * @return Element to render.
   */
  private renderContent() {
    const { channel, didFail, ready } = this.state
    const { channelId } = this.props

    if (didFail) {
      return <NonIdealState title="Something went wrong!" details="Please try again in a few minutes." />
    }

    if (!ready || _.isNil(channel) || _.isNil(channelId)) {
      return (
        <Center>
          <Spinner large />
        </Center>
      )
    }

    return (
      <>
        <BroadcasterInformations channel={channel} channelId={channelId} />
        <BroadcasterStatistics channel={channel} channelId={channelId} />
        <BroadcasterLists channel={channel} channelId={channelId} />
      </>
    )
  }

  /**
   * Triggered when the overlay is closed.
   */
  private onClose = () => {
    this.setState(initialState)

    this.props.toggle()
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
  channelId: getChannelId(state),
}))(BroadcasterOverlay)

/**
 * React Props.
 */
type StateProps = {
  channelId: ReturnType<typeof getChannelId>
}

/**
 * React Props.
 */
type OwnProps = {
  toggle: () => void
  visible: boolean
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps
