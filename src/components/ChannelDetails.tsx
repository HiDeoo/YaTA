import { IPanel, PanelStack } from '@blueprintjs/core'
import * as React from 'react'

import ChannelDetailsOverview from 'components/ChannelDetailsOverview'
import styled from 'styled'

/**
 * ChannelDetailsPanels component.
 */
const ChannelDetailsPanels = styled(PanelStack)`
  width: 300px;
  height: 365px;
`

/**
 * ChannelDetails Component.
 */
const ChannelDetails: React.FunctionComponent<ChannelDetailsProps> = ({ id, name }) => {
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
