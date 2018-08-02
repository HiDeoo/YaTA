import { INumericInputProps, NumericInput as OriginalNumericInput } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import FlexContent from 'Components/FlexContent'
import FlexLayout from 'Components/FlexLayout'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled(FlexLayout)`
  margin-bottom: 15px;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${color('settings.description')};
  font-size: 12px;
  margin-top: 3px;
`

/**
 * InputWrapper component.
 */
const InputWrapper = styled.div`
  align-items: center;
  margin-right: 10px;
  padding-top: 3px;
  width: 80px;
`

/**
 * NumericInput Component.
 */
export default class NumericInput extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { description, label, ...restProps } = this.props

    return (
      <Wrapper>
        <InputWrapper>
          <OriginalNumericInput {...restProps} fill selectAllOnFocus />
        </InputWrapper>
        <FlexContent>
          {label}
          <Description>{description}</Description>
        </FlexContent>
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
interface Props extends INumericInputProps {
  description: string
  label: string
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}
