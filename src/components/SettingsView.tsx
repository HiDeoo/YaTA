import * as React from 'react'

import FlexLayout from 'components/FlexLayout'
import styled from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  overflow-x: hidden;
  padding: 20px;
`

/**
 * SettingsView Component.
 */
const SettingsView: React.FunctionComponent<{}> = ({ children, ...restProps }) => (
  <Wrapper vertical {...restProps}>
    {children}
  </Wrapper>
)

export default SettingsView
