import { Classes, Colors, Overlay } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import BroadcasterInformations from 'components/BroadcasterInformations'
import BroadcasterResources from 'components/BroadcasterResources'
import BroadcasterStatistics from 'components/BroadcasterStatistics'
import BroadcasterTools from 'components/BroadcasterTools'
import Center from 'components/Center'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import { ToggleableProps } from 'constants/toggleable'
import Twitch, { RawChannel } from 'libs/Twitch'
import { ApplicationState } from 'store/reducers'
import { getChannelId } from 'store/selectors/app'
import styled, { theme } from 'styled'

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
  box-shadow: ${theme('broadcaster.shadow')};
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
 * Broadcaster overlay sections.
 */
const BroadcasterOverlaySections = [
  BroadcasterInformations,
  BroadcasterTools,
  BroadcasterStatistics,
  BroadcasterResources,
]

/**
 * React State.
 */
const initialState = { channel: undefined as Optional<RawChannel>, didFail: false, isReady: false }
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

          this.setState(() => ({ channel, didFail: false, isReady: true }))
        } catch {
          this.setState(() => ({ didFail: true, isReady: true }))
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
    const { channel, didFail, isReady } = this.state
    const { channelId, unhost } = this.props

    if (didFail) {
      return <NonIdealState retry />
    }

    if (!isReady || _.isNil(channel) || _.isNil(channelId)) {
      return (
        <Center>
          <Spinner large />
        </Center>
      )
    }

    return _.map(BroadcasterOverlaySections, (Section, index) => {
      const props = {
        channel,
        channelId,
        unhost,
      }

      if (Section !== BroadcasterTools) {
        delete props.unhost
      }

      return <Section key={index} {...props} />
    })
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
interface StateProps {
  channelId: ReturnType<typeof getChannelId>
}

/**
 * React Props.
 */
interface OwnProps extends ToggleableProps {
  unhost: UnhostAction
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps

/**
 * Unhost action.
 */
type UnhostAction = () => void

/**
 * Broadcaster section props automatically provided to each section.
 */
export interface BroadcasterSectionProps {
  channel: RawChannel
  channelId: string
}
