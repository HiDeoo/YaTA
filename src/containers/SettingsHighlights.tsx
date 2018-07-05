import { InputGroup, Intent } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import * as shortid from 'shortid'
import styled from 'styled-components'

import Center from 'Components/Center'
import Highlight from 'Components/Highlight'
import SettingsPanel from 'Components/SettingsPanel'
import Shrug from 'Components/Shrug'
import Key from 'Constants/key'
import { addHighlight, removeHighlight, updateHighlight } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getHighlights } from 'Store/selectors/settings'
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
  height: calc(100% - 90px);
  overflow-y: scroll;
  margin-top: 20px;
`

/**
 * RegExp used to identify a valid highlight pattern.
 */
const PatternRegExp = /^[\w\-]+$/

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
    const { highlights } = this.props

    return (
      <SettingsPanel>
        <Notice>Case-insensitive & username included by default.</Notice>
        <InputGroup
          intent={newHighlightIntent}
          placeholder="Add a new highlight…"
          value={newHighlight}
          onChange={this.onChangeNewHighlight}
          onKeyDown={this.onKeyDownNewHighlight}
          autoCorrect="off"
          spellCheck={false}
        />
        <Highlights>
          {_.size(highlights) > 0
            ? _.map(highlights, (highlight) => (
                <Highlight
                  key={highlight.id}
                  highlight={highlight}
                  validate={this.validatePattern}
                  update={this.props.updateHighlight}
                  remove={this.props.removeHighlight}
                />
              ))
            : this.renderNoHighlight()}
        </Highlights>
      </SettingsPanel>
    )
  }

  private renderNoHighlight() {
    return (
      <Center>
        <Shrug />
        <p>No highlight yet!</p>
      </Center>
    )
  }

  /**
   * Triggered when the new highlight value is modified.
   */
  private onChangeNewHighlight = (event: React.FormEvent<HTMLInputElement>) => {
    const newHighlight = event.currentTarget.value

    let newHighlightIntent = Intent.DANGER

    if (newHighlight.length === 0) {
      newHighlightIntent = Intent.NONE
    } else if (this.validatePattern(newHighlight)) {
      newHighlightIntent = Intent.SUCCESS
    }

    this.setState(() => ({ newHighlight, newHighlightIntent }))
  }

  /**
   * Triggered when a key is pressed down in the new highlight input.
   */
  private onKeyDownNewHighlight = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      event.preventDefault()

      const { newHighlight } = this.state

      if (this.validatePattern(newHighlight)) {
        this.props.addHighlight({ id: shortid.generate(), pattern: newHighlight })

        this.setState(initialState)
      }
    }
  }

  /**
   * Validates a highlight pattern.
   * @param pattern - The pattern to validate.
   * @return `true` when the pattern is valid.
   */
  private validatePattern = (pattern: string) => {
    return PatternRegExp.test(pattern) && !_.includes(_.map(this.props.highlights, 'pattern'), pattern)
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    highlights: getHighlights(state),
  }),
  { addHighlight, removeHighlight, updateHighlight }
)(SettingsHighlights)

/**
 * React Props.
 */
type StateProps = {
  highlights: ReturnType<typeof getHighlights>
}

/**
 * React Props.
 */
type DispatchProps = {
  addHighlight: typeof addHighlight
  removeHighlight: typeof removeHighlight
  updateHighlight: typeof updateHighlight
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
