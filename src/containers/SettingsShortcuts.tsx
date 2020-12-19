import _ from 'lodash'
import { Component } from 'react'
import { connect } from 'react-redux'

import ComboPicker from 'components/ComboPicker'
import FlexLayout from 'components/FlexLayout'
import SettingsView from 'components/SettingsView'
import SettingsViewSection from 'components/SettingsViewSection'
import { ShortcutCombo, ShortcutType } from 'constants/shortcut'
import { setShortcut } from 'store/ducks/settings'
import { ApplicationState } from 'store/reducers'
import { getGroupedShortcuts } from 'store/selectors/settings'
import styled from 'styled'

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
class SettingsShortcuts extends Component<Props> {
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
