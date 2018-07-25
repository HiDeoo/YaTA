import styled from 'styled-components'

import { ifProp } from 'Utils/styled'

/**
 * FlexLayout component.
 */
const FlexLayout = styled.section<Props>`
  display: flex;
  flex-direction: ${ifProp('vertical', 'column', 'row')};
  height: ${ifProp('vertical', '100%', 'auto')};
`

export default FlexLayout

/**
 * React Props.
 */
type Props = {
  vertical?: boolean
}
