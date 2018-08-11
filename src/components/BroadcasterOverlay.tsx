import { Classes, Colors, Overlay } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import Spinner from 'Components/Spinner'
import BroadcasterSectionInfo from 'Containers/BroadcasterSectionInfo'

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
const initialState = { ready: false }
type State = Readonly<typeof initialState>

/**
 * BroadcasterOverlay Component.
 */
export default class BroadcasterOverlay extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props
    const { ready } = this.state

    return (
      <Overlay isOpen={visible} onClose={this.onClose}>
        <Wrapper>
          <Content>
            {!ready && (
              <Center>
                <Spinner large />
              </Center>
            )}
            <BroadcasterSectionInfo onReady={this.onRequiredSectionReady} />
          </Content>
        </Wrapper>
      </Overlay>
    )
  }

  /**
   * Triggered when the overlay is closed.
   */
  private onClose = () => {
    this.setState(initialState)

    this.props.toggle()
  }

  /**
   * Triggered when a required section is ready to be rendered.
   */
  private onRequiredSectionReady = () => {
    this.setState(() => ({ ready: true }))
  }
}

/**
 * React Props.
 */
type Props = {
  toggle: () => void
  visible: boolean
}

/**
 * Broadcaster Required Section Props.
 */
export type BroadcasterRequiredSectionProps = {
  onReady: () => void
}
