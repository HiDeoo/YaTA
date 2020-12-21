import { Classes, H1 } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import Center from 'components/Center'
import styled, { ifProp } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(Center)<SizeProps>`
  font-size: ${ifProp('small', 0.8, 1)}rem;

  & > h1.${Classes.HEADING} {
    font-size: ${ifProp('small', 1.5, 2)}em;
  }

  & > p {
    font-size: ${ifProp('small', 0.9, 1)}em;
  }
`

/**
 * Shrug component.
 */
const Shrug = styled.div<SizeProps>`
  font-size: 2em;
  margin-bottom: ${ifProp('small', 0, 10)}px;
  margin-top: ${ifProp('small', -30, 0)}px;
`

/**
 * NonIdealState Component.
 */
const NonIdealState: React.FunctionComponent<Props> = ({
  details,
  extra,
  retry = false,
  small = false,
  title = 'Something went wrong!',
  ...restProps
}: Props) => (
  <Wrapper small={small} {...restProps}>
    <Shrug small={small}>¯\_(ツ)_/¯</Shrug>
    {!_.isNil(title) && <H1>{title}</H1>}
    {retry && <p>Maybe try again in a while.</p>}
    {!retry && !_.isNil(details) && <p>{details}</p>}
    {!_.isNil(extra) && extra}
  </Wrapper>
)

export default NonIdealState

/**
 * React Props.
 */
interface Props {
  details?: string | JSX.Element
  extra?: React.ReactNode
  retry?: boolean
  small?: boolean
  title?: string
}

/**
 * React Props.
 */
interface SizeProps {
  small: boolean
}
