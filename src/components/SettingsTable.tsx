import styled from 'styled-components'

import { color } from 'Utils/styled'

/**
 * SettingsTable component.
 */
export default styled.div`
  background-color: ${color('settings.table.background')};
  border: 1px solid ${color('settings.table.border')};
  overflow-y: auto;
  margin: 20px 0;
`
