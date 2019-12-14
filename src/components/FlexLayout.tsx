import styled, { ifProp } from 'styled'

/**
 * FlexLayout component.
 */
export default styled.section<Props>`
  display: flex;
  flex-direction: ${ifProp('vertical', 'column', 'row')};
  height: ${ifProp('vertical', '100%', 'auto')};
`

/**
 * React Props.
 */
interface Props {
  vertical?: boolean
}
