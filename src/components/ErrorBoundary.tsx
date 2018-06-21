import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'

/**
 * Shrug component.
 */
const Shrug = styled.div`
  font-size: 2rem;
`

/**
 * React State.
 */
const initialState = { hasError: false, error: null as Error | null }
type State = Readonly<typeof initialState>

/**
 * ErrorBoundary Component.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidCatch.
   * @param error - The error.
   */
  public componentDidCatch(error: Error) {
    this.setState(() => ({ hasError: true, error }))
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { hasError } = this.state

    if (hasError) {
      return (
        <Center>
          <Shrug>¯\_(ツ)_/¯</Shrug>
          <h1>Something went wrong!</h1>
          <p>Try reloading the application.</p>
        </Center>
      )
    }

    return this.props.children
  }
}

/**
 * React Props.
 */
type Props = {
  children: React.ReactNode
}
