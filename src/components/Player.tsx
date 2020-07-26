import { Classes, Overlay } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Center from 'components/Center'
import Spinner from 'components/Spinner'
import Twitch from 'libs/Twitch'
import styled from 'styled'
import base from 'styled/base'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  pointer-events: none;
  width: 100vw;
  z-index: 100;
`

/**
 * Content component.
 */
const Content = styled.div`
  background-color: black;
  height: ${base.player.height}px;
  margin-top: -70px;
  pointer-events: auto;
  width: ${base.player.width}px;

  .${Classes.OVERLAY}-appear &,
  .${Classes.OVERLAY}-enter & {
    opacity: 0;
    transform: scale(0.5);
  }

  .${Classes.OVERLAY}-appear-active &,
  .${Classes.OVERLAY}-enter-active & {
    opacity: 1;
    transform: scale(1);
    transition-property: opacity, transform;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.54, 1.12, 0.38, 1.11);
    transition-delay: 0;
  }

  .${Classes.OVERLAY}-exit & {
    opacity: 1;
    transform: scale(1);
  }

  .${Classes.OVERLAY}-exit-active & {
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.54, 1.12, 0.38, 1.11);
    transition-delay: 0;
  }
`

/**
 * React State.
 */
const initialState = { isOpened: false, url: undefined as Optional<string> }
type State = Readonly<typeof initialState>

/**
 * Player Component.
 */
export default class Player extends React.Component<{}, State> {
  /**
   * Creates and returns a new `Player` instance for the application.
   */
  public static create() {
    const containerElement = document.createElement('div')
    document.body.appendChild(containerElement)

    ReactDOM.render(<Player ref={Player.instance} />, containerElement)

    return Player.instance
  }

  private static instance = React.createRef<Player>()
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isOpened, url } = this.state

    return (
      <Overlay isOpen={!_.isNil(url)} onClose={this.onClose} onOpened={this.onOpened} onClosed={this.onClosed}>
        <Wrapper>
          <Content>
            {isOpened ? (
              <iframe
                height={base.player.height}
                width={base.player.width}
                title="Twitch Player"
                frameBorder="no"
                allowFullScreen
                scrolling="no"
                src={url}
              />
            ) : (
              <Center>
                <Spinner />
              </Center>
            )}
          </Content>
        </Wrapper>
      </Overlay>
    )
  }

  /**
   * Plays a Twitch clip.
   * @param slug - The clip slug.
   */
  public playTwitchClip(slug: string) {
    this.setState(() => ({ url: Twitch.getTwitchEmbedUrl(`https://clips.twitch.tv/embed?clip=${slug}`) }))
  }

  /**
   * Triggered when the overlay is about to be closed.
   */
  private onClose = () => {
    this.setState(() => ({ url: undefined }))
  }

  /**
   * Triggered when the overlay is opened.
   */
  private onOpened = () => {
    this.setState(() => ({ isOpened: true }))
  }

  /**
   * Triggered when the overlay is closed.
   */
  private onClosed = () => {
    this.setState(() => ({ isOpened: false }))
  }
}
