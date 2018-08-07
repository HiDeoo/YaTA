import styled from 'styled-components'

import { ifProp } from 'Utils/styled'

/**
 * ChannelDetailsPanel component.
 */
const ChannelDetailsPanel = styled.section<Props>`
  height: calc(100% - 30px);
  overflow-y: auto;
  padding: ${ifProp('minimal', '0', '10px')};
`

export default ChannelDetailsPanel

/**
 * React Props.
 */
type Props = {
  minimal?: boolean
}
