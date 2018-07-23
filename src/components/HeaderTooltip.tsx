import { ITooltipProps, Position, Tooltip } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

/**
 * CustomTooltip component.
 */
const CustomTooltip = styled(Tooltip)`
  button > svg,
  button > svg > title,
  button > svg > path {
    pointer-events: none;
  }
`

/**
 * HeaderTooltip Component.
 */
const HeaderTooltip: React.SFC<ITooltipProps> = (props) => <CustomTooltip position={Position.BOTTOM} {...props} />

export default HeaderTooltip
