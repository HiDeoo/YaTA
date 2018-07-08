import { Intent, TagInput } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import NonIdealState from 'Components/NonIdealState'
import SettingsHighlight from 'Components/SettingsHighlight'
import SettingsInput from 'Components/SettingsInput'
import SettingsPanel from 'Components/SettingsPanel'
import Key from 'Constants/key'
import Highlight from 'Libs/Highlight'
import {
  addHighlight,
  addHighlightsIgnoredUsers,
  removeHighlight,
  removeHighlightsIgnoredUser,
  updateHighlight,
} from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getHighlights, getHighlightsIgnoredUsers } from 'Store/selectors/settings'
import { color } from 'Utils/styled'

/**
 * Notice component.
 */
const Notice = styled.div`
  font-style: italic;
  margin-bottom: 20px;
`

/**
 * Highlights component.
 */
const Highlights = styled.div`
  background-color: ${color('settings.table.background')};
  border: 1px solid ${color('settings.table.border')};
  height: calc(100% - 160px);
  overflow-y: scroll;
  margin: 20px 0;
`

/**
 * IgnoredUsers component.
 */
const IgnoredUsers = styled(TagInput)`
  max-height: 50px;

  &.pt-input,
  &.pt-tag-input,
  & > .pt-tag-input-values {
    max-height: 50px;
    overflow-y: hidden;
  }

  & > .pt-tag-input-values {
    overflow-y: scroll;
  }
`

/**
 * React State.
 */
const initialState = { newHighlight: '', newHighlightIntent: Intent.NONE }
type State = Readonly<typeof initialState>

/**
 * SettingsHighlights Component.
 */
class SettingsHighlights extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { newHighlight, newHighlightIntent } = this.state
    const { highlights, ignoredUsers } = this.props

    return (
      <SettingsPanel>
        <Notice>Case-insensitive & username included by default.</Notice>
        <SettingsInput
          intent={newHighlightIntent}
          placeholder="Add a new highlight…"
          value={newHighlight}
          onChange={this.onChangeNewHighlight}
          onKeyDown={this.onKeyDownNewHighlight}
        />
        <Highlights>
          {_.size(highlights) > 0 ? (
            _.map(highlights, (highlight) => (
              <SettingsHighlight
                key={highlight.id}
                highlight={highlight}
                validate={this.validate}
                update={this.props.updateHighlight}
                remove={this.props.removeHighlight}
              />
            ))
          ) : (
            <NonIdealState small title="No highlight yet!" details="Try adding some above." />
          )}
        </Highlights>
        <IgnoredUsers
          fill
          leftIcon="user"
          onAdd={this.onAddIgnoredUser}
          onRemove={this.onRemoveIgnoredUser}
          placeholder="Ignore highlights from users… (space separated list)"
          separator=" "
          inputValue=""
          values={ignoredUsers}
        />
      </SettingsPanel>
    )
  }

  /**
   * Triggered when one or more ignored user(s) are added.
   * @param usernames - The ignored usernames.
   */
  private onAddIgnoredUser = (usernames: string[]) => {
    this.props.addHighlightsIgnoredUsers(_.map(usernames, _.toLower))
  }

  /**
   * Triggered when an ignored user is removed.
   * @param username - The ignored username.
   */
  private onRemoveIgnoredUser = (username: string) => {
    this.props.removeHighlightsIgnoredUser(username)
  }

  /**
   * Triggered when the new highlight value is modified.
   * @param event - The associated event.
   */
  private onChangeNewHighlight = (event: React.FormEvent<HTMLInputElement>) => {
    const newHighlight = event.currentTarget.value

    let newHighlightIntent = Intent.DANGER

    if (newHighlight.length === 0) {
      newHighlightIntent = Intent.NONE
    } else if (this.validate(newHighlight)) {
      newHighlightIntent = Intent.SUCCESS
    }

    this.setState(() => ({ newHighlight, newHighlightIntent }))
  }

  /**
   * Triggered when a key is pressed down in the new highlight input.
   * @param event - The associated event.
   */
  private onKeyDownNewHighlight = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      event.preventDefault()

      const { newHighlight } = this.state

      if (this.validate(newHighlight)) {
        const highlight = new Highlight(newHighlight)

        this.props.addHighlight(highlight.serialize())

        this.setState(initialState)
      }
    }
  }

  /**
   * Validates a highlight.
   * @param  pattern - The highlight pattern to validate.
   * @return `true` if the highlight is valid.
   */
  private validate = (pattern: string) => {
    return Highlight.validate(pattern, this.props.highlights)
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    highlights: getHighlights(state),
    ignoredUsers: getHighlightsIgnoredUsers(state),
  }),
  { addHighlight, addHighlightsIgnoredUsers, removeHighlight, removeHighlightsIgnoredUser, updateHighlight }
)(SettingsHighlights)

/**
 * React Props.
 */
type StateProps = {
  highlights: ReturnType<typeof getHighlights>
  ignoredUsers: ReturnType<typeof getHighlightsIgnoredUsers>
}

/**
 * React Props.
 */
type DispatchProps = {
  addHighlight: typeof addHighlight
  addHighlightsIgnoredUsers: typeof addHighlightsIgnoredUsers
  removeHighlight: typeof removeHighlight
  removeHighlightsIgnoredUser: typeof removeHighlightsIgnoredUser
  updateHighlight: typeof updateHighlight
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
