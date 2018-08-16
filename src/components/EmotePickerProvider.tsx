import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { EmoteProviderPrefix } from 'Libs/EmotesProvider'
import { ifProp } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.button<WrapperProps>`
  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-right: 7px;

  &:last-of-type {
    margin-right: 10px;
  }

  & > img {
    filter: ${ifProp('selected', 'none', 'grayscale(100%)')};
  }

  &:hover {
    & > img {
      filter: none;
    }
  }
`

/**
 * EmotePickerProvider Component.
 */
export default class EmotePickerProvider extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { icon, prefix, selected } = this.props

    const title = _.capitalize(prefix)

    return (
      <Wrapper selected={selected} onClick={this.onClick} title={title}>
        <img src={icon} alt={title} />
      </Wrapper>
    )
  }

  /**
   * Triggered when the button is clicked.
   */
  private onClick = () => {
    const { onClick, prefix } = this.props

    onClick(prefix)
  }
}

/**
 * React Props.
 */
interface Props {
  icon: string
  onClick: (prefix: EmoteProviderPrefix) => void
  prefix: EmoteProviderPrefix
  selected: boolean
}

/**
 * React Props.
 */
interface WrapperProps {
  selected: boolean
}
