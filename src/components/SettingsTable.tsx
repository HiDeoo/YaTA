import styled, { theme } from 'Styled'

/**
 * SettingsTable component.
 */
export default styled.div`
  background-color: ${theme('settings.table.background')};
  border: 1px solid ${theme('settings.table.border')};
  overflow-y: auto;
  margin: 20px 0;
`
