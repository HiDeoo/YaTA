import * as React from 'react'
import { match } from 'react-router'
import styled from 'styled-components'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100%;
`

/**
 * Channel Component.
 */
export default class Channel extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return <Wrapper>Channel {this.props.match.params.channel}</Wrapper>
  }
}

/**
 * React Props.
 */
type Props = {
  match: match<{
    channel: string
  }>
}
