import { Button, Classes, Colors } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import { SerializedRejectedMessage } from 'libs/RejectedMessage'
import Twitch from 'libs/Twitch'
import styled, { size, theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<WrapperProps>`
  background-color: ${theme('rejectedMessage.background')};
  border-color: ${theme('rejectedMessage.border')};
  border-style: solid;
  border-width: 0 0 0 3px;
  display: flex;
  padding: 4px ${size('log.hPadding')} 4px ${size('log.hPadding', -1)};
  position: relative;
`

/**
 * Message component.
 */
const Message = styled.div`
  color: ${theme('rejectedMessage.message')};
  font-style: italic;
  margin-top: 4px;
`

/**
 * Actions component.
 */
const Actions = styled.div`
  margin-right: ${size('log.hPadding')};
`

/**
 * AllowButton component.
 */
const AllowButton = styled(Button)`
  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    display: block;
    height: ${size('rejectedMessage.button.size')};
    min-height: ${size('rejectedMessage.button.size')};
    min-width: ${size('rejectedMessage.button.size')};
    position: relative;
    width: ${size('rejectedMessage.button.size')};

    &:disabled {
      & svg {
        color: ${Colors.GRAY1};
      }
    }

    & svg {
      color: ${Colors.GREEN4};
      height: ${size('rejectedMessage.button.icon')};
      left: 3px;
      position: absolute;
      top: 3px;
      width: ${size('rejectedMessage.button.icon')};
    }
  }

  &.${Classes.BUTTON}.${Classes.LOADING} .${Classes.SPINNER} {
    & > div {
      height: ${size('rejectedMessage.button.icon')};
      left: -6px;
      position: relative;
      top: -1px;
      transform-origin: 9px 9px;
      width: ${size('rejectedMessage.button.icon')};

      & svg {
        height: ${size('rejectedMessage.button.icon')};
        left: 0;
        position: absolute;
        top: 0;
        width: ${size('rejectedMessage.button.icon')};
      }
    }
  }
`

/**
 * DenyButton component.
 */
const DenyButton = styled(AllowButton)`
  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    & svg {
      color: ${Colors.RED4};
    }
  }
`

/**
 * React State.
 */
const initialState = {
  pendingAllow: false,
  pendingDeny: false,
}
type State = Readonly<typeof initialState>

/**
 * RejectedMessage Component.
 */
export default class RejectedMessage extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @param  nextState - The next state.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { pendingAllow, pendingDeny } = this.state
    const { pendingAllow: nextPendingAllow, pendingDeny: nextPendingDeny } = nextState

    const { rejectedMessage, style } = this.props
    const { rejectedMessage: nextRejectedMessage, style: nextStyle } = nextProps

    return (
      pendingAllow !== nextPendingAllow ||
      pendingDeny !== nextPendingDeny ||
      rejectedMessage.id !== nextRejectedMessage.id ||
      rejectedMessage.handled !== nextRejectedMessage.handled ||
      !_.isEqual(style, nextStyle)
    )
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { pendingAllow, pendingDeny } = this.state
    const { rejectedMessage, style } = this.props

    const disabled = pendingAllow || pendingDeny || rejectedMessage.handled

    return (
      <Wrapper style={style} highlight={true}>
        <Actions>
          <AllowButton
            onClick={this.onClickAllow}
            loading={pendingAllow}
            title="Allow message"
            disabled={disabled}
            icon="tick"
            minimal
          />
          <DenyButton
            onClick={this.onClickDeny}
            loading={pendingDeny}
            title="Deny message"
            disabled={disabled}
            icon="cross"
            minimal
          />
        </Actions>
        <div>
          <div>
            AutoMod held a message from {rejectedMessage.username} (reason: {rejectedMessage.reason}):
          </div>
          <Message dangerouslySetInnerHTML={{ __html: `“${rejectedMessage.message}”` }} />
        </div>
      </Wrapper>
    )
  }

  /**
   * Triggered when the Allow button is clicked
   */
  private onClickAllow = async () => {
    const { markRejectedMessageAsHandled, rejectedMessage } = this.props

    try {
      this.setState(() => ({ pendingAllow: true }))

      await Twitch.allowAutoModMessage(rejectedMessage.messageId)

      markRejectedMessageAsHandled(rejectedMessage.id)
    } catch (error) {
      //
    } finally {
      this.setState(() => ({ pendingAllow: false }))
    }
  }

  /**
   * Triggered when the Deny button is clicked
   */
  private onClickDeny = async () => {
    const { markRejectedMessageAsHandled, rejectedMessage } = this.props

    try {
      this.setState(() => ({ pendingDeny: true }))

      await Twitch.denyAutoModMessage(rejectedMessage.messageId)

      markRejectedMessageAsHandled(rejectedMessage.id)
    } catch (error) {
      //
    } finally {
      this.setState(() => ({ pendingDeny: false }))
    }
  }
}

/**
 * React Props.
 */
interface Props {
  markRejectedMessageAsHandled: (id: string) => void
  rejectedMessage: SerializedRejectedMessage
  style: React.CSSProperties
}

/**
 * React Props.
 */
interface WrapperProps {
  highlight: boolean
}
