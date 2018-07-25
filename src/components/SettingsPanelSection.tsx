import { Classes } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'styled-components'
import { color } from 'Utils/styled'

/**
 * Title component.
 */
const Title = styled.h1`
  &,
  .${Classes.DARK} & {
    border-top: 1px solid ${color('settings.section.border')};
    color: ${color('settings.section.color')};
    font-size: 0.9rem;
    line-height: initial;
    margin: 20px 0 20px 0;
    padding-top: 20px;
    text-transform: uppercase;

    &:first-child {
      border-top: 0;
      margin-top: 0;
      padding-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`

/**
 * SettingsPanelSection Component.
 */
export default class SettingsPanelSection extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { children, title } = this.props

    return (
      <>
        <Title>{title}</Title>
        {children}
      </>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  title: string
}
