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
const ChannelDetails: React.SFC<ChannelDetailsProps> = ({ id, name }) => {
  const initialPanel: IPanel<any> = {
    component: ChannelDetailsOverview,
    props: { id, name },
    title: 'Overview',
  }

  return <ChannelDetailsPanels initialPanel={initialPanel} />
}

export default ChannelDetails

/**
 * React Props.
 */
export interface ChannelDetailsProps {
  id: string
  name: string
}
