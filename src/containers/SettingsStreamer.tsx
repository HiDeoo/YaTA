import * as React from 'react'
import { connect } from 'react-redux'

import SettingsView from 'components/SettingsView'
import Switch from 'components/Switch'
import { toggleHideWhispers, toggleIncreaseTwitchHighlight, toggleShowViewerCount } from 'store/ducks/settings'
import { ApplicationState } from 'store/reducers'
import { getHideWhispers, getIncreaseTwitchHighlight, getShowViewerCount } from 'store/selectors/settings'

/**
 * SettingsStreamer Component.
 */
class SettingsStreamer extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { hideWhispers, increaseTwitchHighlight, showViewerCount } = this.props

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
        <Switch
          label="Increase highlight for messages redeemed using Channel Points"
          onChange={this.props.toggleIncreaseTwitchHighlight}
          checked={increaseTwitchHighlight}
        />
      </SettingsView>
    )
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    hideWhispers: getHideWhispers(state),
    increaseTwitchHighlight: getIncreaseTwitchHighlight(state),
    showViewerCount: getShowViewerCount(state),
  }),
  {
    toggleHideWhispers,
    toggleIncreaseTwitchHighlight,
    toggleShowViewerCount,
  }
)(SettingsStreamer)

/**
 * React Props.
 */
interface StateProps {
  hideWhispers: ReturnType<typeof getHideWhispers>
  increaseTwitchHighlight: ReturnType<typeof getIncreaseTwitchHighlight>
  showViewerCount: ReturnType<typeof getShowViewerCount>
}

/**
 * React Props.
 */
interface DispatchProps {
  toggleHideWhispers: typeof toggleHideWhispers
  toggleIncreaseTwitchHighlight: typeof toggleIncreaseTwitchHighlight
  toggleShowViewerCount: typeof toggleShowViewerCount
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
