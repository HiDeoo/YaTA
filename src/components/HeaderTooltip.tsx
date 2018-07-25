import { ITooltipProps, Position, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

/**
 * HeaderTooltip Component.
 */
const HeaderTooltip: React.SFC<ITooltipProps> = (props) => <Tooltip position={Position.BOTTOM} {...props} />

export default HeaderTooltip
