import * as _ from 'lodash'
import * as React from 'react'

import { SettingsViews } from 'Components/Settings'
import SettingsViewButton from 'Components/SettingsViewButton'
import { IViewProps } from 'Components/ViewStack'
import styled from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`

/**
 * SettingsViewPicker Component.
 */
const SettingsViewPicker: React.SFC<IViewProps> = ({ pushView }) => (
  <Wrapper>
    {_.map(SettingsViews, (view) => (
      <SettingsViewButton key={view.name} settingsView={view} push={pushView} />
    ))}
  </Wrapper>
)

export default SettingsViewPicker
