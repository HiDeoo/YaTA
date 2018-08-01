import { ISliderProps, Slider as OriginalSlider } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'

import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin: 0 5px 15px 5px;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${color('settings.description')};
  font-size: 12px;
`

/**
 * SliderComponent component.
 */
const SliderComponent = styled(OriginalSlider)`
  margin: 10px 0;
`

/**
 * Slider Component.
 */
export default class Slider extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { description, label, ...restProps } = this.props

    return (
      <Wrapper>
        {label}
        <SliderComponent {...restProps} />
        <Description>{description}</Description>
      </Wrapper>
    )
  }
}

/**
 * React Props.
 */
interface Props extends ISliderProps {
  description: string
  label: string
}
