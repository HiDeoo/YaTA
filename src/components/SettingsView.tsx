import * as React from 'react'

import FlexLayout from 'Components/FlexLayout'
import styled from 'Styled'

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
const SettingsView: React.SFC<{}> = ({ children, ...restProps }) => (
  <Wrapper vertical {...restProps}>
    {children}
  </Wrapper>
)

export default SettingsView
