import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import SettingsView from 'Components/SettingsView'
import Switch from 'Components/Switch'
import { toggleHideWhispers, toggleShowViewerCount } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getHideWhispers, getShowViewerCount } from 'Store/selectors/settings'

/**
 * SettingsStreamer Component.
 */
class SettingsStreamer extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { hideWhispers, showViewerCount } = this.props

    return (
      <SettingsView>
        <Switch
          description="You will still be able to send whispers."
          onChange={this.props.toggleHideWhispers}
          checked={hideWhispers}
          label="Hide whispers"
        />
        <Switch
          onChange={this.props.toggleShowViewerCount}
          description="Updated every 2mins."
          checked={showViewerCount}
          label="Show viewer count"
        />
      </SettingsView>
    )
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    hideWhispers: getHideWhispers(state),
    showViewerCount: getShowViewerCount(state),
  }),
  {
    toggleHideWhispers,
    toggleShowViewerCount,
  }
)(SettingsStreamer)

/**
 * React Props.
 */
interface StateProps {
  hideWhispers: ReturnType<typeof getHideWhispers>
  showViewerCount: ReturnType<typeof getShowViewerCount>
}

/**
 * React Props.
 */
interface DispatchProps {
  toggleHideWhispers: typeof toggleHideWhispers
  toggleShowViewerCount: typeof toggleShowViewerCount
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
