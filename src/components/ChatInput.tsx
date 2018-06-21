import { Colors, TextArea } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import Theme from 'Constants/theme'
import { SettingsState } from 'Store/ducks/settings'
import { withSCProps } from 'Utils/react'

/**
 * Wrapper component.
 */
const Wrapper = withSCProps<WrapperProps, HTMLDivElement>(styled.div)`
  background-color: ${(props) => (props.theme === Theme.Dark ? Colors.DARK_GRAY4 : Colors.LIGHT_GRAY3)};
  border-top: 1px solid ${(props) => (props.theme === Theme.Dark ? Colors.DARK_GRAY5 : Colors.LIGHT_GRAY2)};
  padding: 10px;
`

/**
 * Input component.
 */
const Input = styled(TextArea)`
  outline: none;
  resize: none;
`

/**
 * ChatInput Component.
 */
export default class ChatInput extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <Wrapper theme={this.props.theme}>
        <Input large fill value="" />
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  theme: SettingsState['theme']
}

/**
 * React Props.
 */
type WrapperProps = {
  theme: SettingsState['theme']
}
