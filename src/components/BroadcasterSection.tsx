import { Classes, H3 } from '@blueprintjs/core'
import * as React from 'react'

import Center from 'Components/Center'
import Spinner from 'Components/Spinner'
import styled, { theme } from 'Styled'

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
  background-image: ${theme('broadcaster.section')};
  border: 0;
  height: 1px;
  margin: 0;
  padding: 0;

  &:last-of-type {
    display: none;
  }
`

/**
 * BroadcasterSection Component.
 */
const BroadcasterSection: React.SFC<Props> = ({ children, ready = true, title }) => (
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
interface Props {
  ready?: boolean
  title: string
}
