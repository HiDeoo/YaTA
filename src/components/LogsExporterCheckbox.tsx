import { Checkbox, Classes, Colors } from '@blueprintjs/core'
import * as React from 'react'
import styled from 'Styled'

/**
 * LogsCheckbox component.
 */
const LogsCheckbox = styled(Checkbox)`
  & em {
    color: ${Colors.GRAY1};
    font-size: 0.8rem;
  }

  .${Classes.DARK} & em {
    color: ${Colors.GRAY5};
  }

  &.${Classes.DISABLED} em,
  .${Classes.DARK} &.${Classes.DISABLED} em {
    opacity: 0.4;
  }
`

/**
 * LogsExporterCheckbox Component.
 */
export default class LogsExporterCheckbox extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { checked, disabled, label } = this.props

    return <LogsCheckbox disabled={disabled} checked={checked} labelElement={label} onChange={this.onChange} />
  }

  /**
   * Triggered when the include whispers checkbox is modified.
   * @param event - The associated event.
   */
  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { id, onChange } = this.props

    onChange(id, event.currentTarget.checked)
  }
}

/**
 * React Props.
 */
interface Props {
  checked: boolean
  disabled: boolean
  id: string
  label: React.ReactNode
  onChange: (id: string, checked: boolean) => void
}
