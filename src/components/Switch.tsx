import { Classes, ISwitchProps, Switch as OriginalSwitch } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import SoundNotification from 'Constants/soundNotification'
import Sound from 'Libs/Sound'
import styled, { theme } from 'Styled'

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
    const { checkSoundNotification, description, onChange, ...restProps } = this.props

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
    const { checked, checkSoundNotification, onChange } = this.props

    if (!_.isNil(checkSoundNotification) && !checked) {
      Sound.manager().playSoundNotification(checkSoundNotification)
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
  checkSoundNotification?: SoundNotification
}
