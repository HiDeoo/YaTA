import _ from 'lodash'
import * as React from 'react'

import { SettingsViews } from 'components/Settings'
import SettingsViewButton from 'components/SettingsViewButton'
import { IViewProps } from 'components/ViewStack'
import styled from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 102px;
  height: 100%;
`

/**
 * SettingsViewPicker Component.
 */
const SettingsViewPicker: React.FunctionComponent<IViewProps> = ({ pushView }) => (
  <Wrapper>
    {_.map(SettingsViews, (view) => (
      <SettingsViewButton key={view.name} settingsView={view} push={pushView} />
    ))}
  </Wrapper>
)

export default SettingsViewPicker
