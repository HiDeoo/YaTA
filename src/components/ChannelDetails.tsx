import { IPanel, PanelStack } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import ChannelDetailsOverview from 'Components/ChannelDetailsOverview'

/**
 * ChannelDetailsPanels component.
 */
const ChannelDetailsPanels = styled(PanelStack)`
  width: 300px;
  height: 360px;
`

/**
 * ChannelDetails Component.
 */
export default class ChannelDetails extends React.Component<ChannelDetailsProps> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { channel, id } = this.props

    const initialPanel: IPanel<any> = {
      component: ChannelDetailsOverview,
      props: { channel, id },
      title: 'Overview',
    }

    return <ChannelDetailsPanels initialPanel={initialPanel} />
  }
}

/**
 * React Props.
 */
export type ChannelDetailsProps = {
  channel: string | null
  id?: string
}
