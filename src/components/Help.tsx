import { Alert, Button, Classes, Colors } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Key from 'Constants/key'

/**
 * HelpButton component.
 */
const HelpButton = styled(Button)`
  &.${Classes.BUTTON}.${Classes.MINIMAL}, .${Classes.DARK} &.${Classes.BUTTON}.${Classes.MINIMAL} {
    min-height: 18px;
    min-width: 18px;
    padding: 0;

    & > svg {
      color: ${Colors.GRAY2};
    }

    &:active,
    &:hover,
    &.${Classes.ACTIVE} {
      background: initial;

      & > svg {
        color: ${Colors.LIGHT_GRAY1};
      }
    }
  }
`

/**
 * HelpAlert component.
 */
const HelpAlert = styled(Alert)`
  &.${Classes.ALERT} {
    font-size: 0.87rem;
    line-height: 1.2rem;
    max-width: 450px;
    width: 450px;

    ul {
      padding-left: 25px;
    }
  }
`

/**
 * React State.
 */
const initialState = { showHelp: false }
type State = Readonly<typeof initialState>

/**
 * Help Component.
 */
export default class Help extends React.Component<{}, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, true)
  }

  /**
   * Lifecycle: componentWillUnmount.
   */
  public componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, true)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { showHelp } = this.state

    return (
      <>
        <HelpButton icon="help" minimal title="Help" onClick={this.toggleHelp} />
        <HelpAlert confirmButtonText="Close" isOpen={showHelp} onConfirm={this.toggleHelp} icon="help">
          {this.props.children}
        </HelpAlert>
      </>
    )
  }

  /**
   * Triggered when a key is pressed down.
   * @param event - The associated event.
   */
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === Key.Escape && this.state.showHelp) {
      event.preventDefault()
      event.stopPropagation()

      this.toggleHelp()
    }
  }

  /**
   * Toggles the help alert.
   */
  private toggleHelp = () => {
    this.setState(({ showHelp }) => ({ showHelp: !showHelp }))
  }
}
