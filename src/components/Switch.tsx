import { ISwitchProps, Switch as OriginalSwitch } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin-bottom: 15px;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${color('settings.description')};
  font-size: 12px;
  margin-bottom: 10px;
  margin-left: 39px;
  margin-top: -6px;
`

/**
 * Switch Component.
 */
const Switch: React.SFC<Props> = (props) => {
  const { description, ...restProps } = props

  return (
    <Wrapper>
      <OriginalSwitch {...restProps} />
      {!_.isNil(description) && <Description>{description}</Description>}
    </Wrapper>
  )
}

export default Switch

/**
 * React Props.
 */
interface Props extends ISwitchProps {
  description?: string
}
