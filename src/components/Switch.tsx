import { Classes, ISwitchProps, Switch as OriginalSwitch } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import Sound, { SoundId } from 'libs/Sound'
import styled, { theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  margin-bottom: 15px;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${theme('settings.description')};
  font-size: 12px;
  margin-bottom: 10px;
  margin-left: 39px;
  margin-top: -6px;

  & > code.${Classes.CODE} {
    margin: 0 2px;
  }
`

/**
 * Switch Component.
 */
export default class Switch extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { checkSound, description, onChange, ...restProps } = this.props

    return (
      <Wrapper>
        <OriginalSwitch {...restProps} onChange={this.onChange} />
        {!_.isNil(description) && <Description>{description}</Description>}
      </Wrapper>
    )
  }

  /**
   * Triggered when the switch is checked or unchecked.
   * @param event - The associated event.
   */
  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { checked, checkSound, onChange } = this.props

    if (!_.isNil(checkSound) && !checked) {
      Sound.manager().play(checkSound)
    }

    if (!_.isNil(onChange)) {
      onChange(event)
    }
  }
}

/**
 * React Props.
 */
interface Props extends ISwitchProps {
  description?: string | React.ReactNode
  checkSound?: SoundId
}
