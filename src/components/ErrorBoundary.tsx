import * as React from 'react'

import Center from 'Components/Center'
import Shrug from 'Components/Shrug'

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

    // tslint:disable-next-line:no-console
    console.error(error)
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
          <Shrug />
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
