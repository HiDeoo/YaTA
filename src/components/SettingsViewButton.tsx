import { Icon } from '@blueprintjs/core'
import { Component } from 'react'

import { SettingsView } from 'components/Settings'
import { IView } from 'components/ViewStack'
import styled, { theme } from 'styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 165px;
  justify-content: center;
  width: 100%;
`

/**
 * Content component.
 */
const Content = styled.div`
  color: ${theme('settings.viewButton.text')};
  padding: 10px;
  text-align: center;
  transition-property: color;
  transition-duration: 0.25s;
  transition-timing-function: cubic-bezier(0.4, 1, 0.75, 0.9);
  transition-delay: 0;

  ${/* sc-selector */ Wrapper}:hover & {
    color: ${theme('settings.viewButton.hover.text')};
  }
`

/**
 * ButtonIcon component.
 */
const ButtonIcon = styled(Icon)`
  color: ${theme('settings.viewButton.icon')};
  opacity: 0.6;
  transition-property: color, opacity;
  transition-duration: 0.25s;
  transition-timing-function: cubic-bezier(0.4, 1, 0.75, 0.9);
  transition-delay: 0;

  ${/* sc-selector */ Wrapper}:hover & {
    color: ${theme('settings.viewButton.hover.icon')};
    opacity: 1;
  }
`

/**
 * Name component.
 */
const Name = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  margin-top: 20px;
`

/**
 * SettingsViewButton Component.
 */
export default class SettingsViewButton extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { icon, name } = this.props.settingsView

    return (
      <Wrapper onClick={this.onClick}>
        <Content>
          <ButtonIcon icon={icon} iconSize={40} />
          <Name>{name}</Name>
        </Content>
      </Wrapper>
    )
  }

  /**
   * Triggered when the button is pressed.
   */
  private onClick = () => {
    const { push, settingsView } = this.props

    const view: IView<any> = {
      component: settingsView.component,
      icon: settingsView.icon,
      title: settingsView.name,
    }

    push(view)
  }
}

/**
 * React Props.
 */
interface Props {
  push: (view: IView) => void
  settingsView: SettingsView
}
