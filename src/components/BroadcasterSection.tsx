import { Classes, H3 } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import Spinner from 'Components/Spinner'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  padding: 20px 20px 25px 20px;
`

/**
 * Title component.
 */
const Title = styled(H3)`
  &.${Classes.HEADING} {
    margin-bottom: 15px;
  }
`

/**
 * Loading component.
 */
const Loading = styled(Spinner)`
  margin: 20px 0;
`

/**
 * Divider component.
 */
const Divider = styled.hr`
  background-image: linear-gradient(90deg, rgba(16, 22, 26, 0.15) 70%, rgba(16, 22, 26, 0) 100%);
  border: 0;
  height: 1px;
  margin: 0;
  padding: 0;

  .${Classes.DARK} & {
    background-image: linear-gradient(90deg, rgba(16, 22, 26, 0.4) 70%, rgba(16, 22, 26, 0) 100%);
  }

  &:last-of-type {
    display: none;
  }
`

/**
 * BroadcasterSection Component.
 */
const BroadcasterSection: React.SFC<Props> = ({ children, ready, title }) => (
  <>
    <Wrapper>
      <Title>{title}</Title>
      <div>
        {ready ? (
          children
        ) : (
          <Center>
            <Loading />
          </Center>
        )}
      </div>
    </Wrapper>
    <Divider />
  </>
)

export default BroadcasterSection

/**
 * React Props.
 */
type Props = {
  ready: boolean
  title: string
}
