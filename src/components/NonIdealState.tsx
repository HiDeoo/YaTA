import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Center from 'Components/Center'
import { withSCProps } from 'Utils/react'
import { ifProp } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = withSCProps<SizeProps, HTMLDivElement>(styled(Center))`
  font-size: ${ifProp('small', 0.8, 1)}rem;

  & > h1 {
    font-size: ${ifProp('small', 1.5, 2)}em;
  }

  & > p {
    font-size: ${ifProp('small', 0.9, 1)}em;
  }
`

/**
 * Shrug component.
 */
const Shrug = withSCProps<SizeProps, HTMLDivElement>(styled.div)`
  font-size: 2em;
  margin-bottom: ${ifProp('small', 0, 10)}px;
  margin-top: ${ifProp('small', -30, 0)}px;
`

/**
 * NonIdealState Component.
 */
const NonIdealState: React.SFC<Props> = ({ details, small, title }) => (
  <Wrapper small={!!small}>
    <Shrug small={!!small}>¯\_(ツ)_/¯</Shrug>
    {!_.isNil(title) && <h1>{title}</h1>}
    {!_.isNil(details) && <p>{details}</p>}
  </Wrapper>
)

export default NonIdealState

/**
 * React Props.
 */
type Props = {
  details?: string | JSX.Element
  small?: boolean
  title?: string
}

/**
 * React Props.
 */
type SizeProps = {
  small: boolean
}
