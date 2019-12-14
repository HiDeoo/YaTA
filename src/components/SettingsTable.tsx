import styled, { theme } from 'styled'

/**
 * SettingsTable component.
 */
export default styled.div`
  background-color: ${theme('settings.table.background')};
  border: 1px solid ${theme('settings.table.border')};
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  margin: 20px 0;

  &:last-child {
    margin-bottom: 0;
  }
`
