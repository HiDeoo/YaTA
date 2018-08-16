import { Button, Classes, Position, Tooltip } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { ChannelDetailsPanel, ChannelDetailsType } from 'Components/ChannelDetailsOverview'
import { color } from 'Utils/styled'

/**
 * PanelTooltip component.
 */
const PanelTooltip = styled(Tooltip)`
  border-right: 1px solid ${color('channel.lightBorder')};
  flex: 1;

  &:last-child {
    border-right: 0;
  }

  & > .${Classes.POPOVER_TARGET} {
    width: 100%;

    & > button.${Classes.BUTTON} {
      border-radius: 0;
      width: 100%;
    }
  }
`

/**
 * ChannelDetailsPanelButton Component.
 */
export default class ChannelDetailsPanelButton extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { panel, type } = this.props

    return (
      <PanelTooltip key={type} content={type} position={Position.TOP}>
        <Button icon={panel.icon} onClick={this.onClick} />
      </PanelTooltip>
    )
  }

  /**
   * Triggered when the button is clicked.
   */
  private onClick = () => {
    const { onClick, type } = this.props

    onClick(type)
  }
}

/**
 * React Props.
 */
interface Props {
  onClick: (type: ChannelDetailsType) => void
  panel: ChannelDetailsPanel
  type: ChannelDetailsType
}
