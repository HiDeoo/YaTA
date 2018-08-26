import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import ComboPicker from 'Components/ComboPicker'
import FlexLayout from 'Components/FlexLayout'
import SettingsView from 'Components/SettingsView'
import SettingsViewSection from 'Components/SettingsViewSection'
import { ShortcutCombo, ShortcutType } from 'Constants/shortcut'
import { setShortcut } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getGroupedShortcuts } from 'Store/selectors/settings'
import styled from 'Styled'

/**
 * Row component.
 */
const Row = styled(FlexLayout)`
  align-items: center;
  flex-shrink: 0;
  margin-bottom: 6px;

  &:last-of-type {
    margin-bottom: 0;
  }
`

/**
 * SettingsShortcuts Component.
 */
class SettingsShortcuts extends React.Component<Props> {
  /**
   * Lifecycle: shouldComponentUpdate.
   * @param  nextProps - The next props.
   * @return A boolean to indicate if the component should update on state or props change.
   */
  public shouldComponentUpdate(nextProps: Props) {
    return !_.isEqual(this.props.shortcuts, nextProps.shortcuts)
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    return (
      <SettingsView>
        {_.map(this.props.shortcuts, (shortcuts, group) => (
          <SettingsViewSection key={group} title={group}>
            {_.map(shortcuts, (shortcut) => {
              return (
                <Row key={shortcut.name}>
                  <ComboPicker onChange={this.onChangeCombo} shortcut={shortcut} />
                </Row>
              )
            })}
          </SettingsViewSection>
        ))}
      </SettingsView>
    )
  }

  /**
   * Triggered when a combo is changed.
   */
  private onChangeCombo = (type: ShortcutType, combo: ShortcutCombo) => {
    this.props.setShortcut(type, combo)
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    shortcuts: getGroupedShortcuts(state),
  }),
  { setShortcut }
)(SettingsShortcuts)

/**
 * React Props.
 */
interface StateProps {
  shortcuts: ReturnType<typeof getGroupedShortcuts>
}

/**
 * React Props.
 */
interface DispatchProps {
  setShortcut: typeof setShortcut
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
