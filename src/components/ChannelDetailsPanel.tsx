import styled, { ifProp } from 'Styled'

/**
 * ChannelDetailsPanel component.
 */
export default styled.section<Props>`
  height: calc(100% - 30px);
  overflow-y: auto;
  padding: ${ifProp('minimal', '0', '10px')};
`

/**
 * React Props.
 */
interface Props {
  minimal?: boolean
}
