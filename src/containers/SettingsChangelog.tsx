import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import SettingsPanel from 'Components/SettingsPanel'
import Spinner from 'Components/Spinner'
import { setShouldReadChangelog } from 'Store/ducks/app'
import { setVersion } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'

/**
 * Changelog component.
 */
const Changelog = styled.div`
  font-size: 0.8rem;
  line-height: 1.2rem;
  overflow-y: auto;

  & h1,
  & h2,
  .pt-dark & h1,
  .pt-dark & h3 {
    margin: 0;
    padding: 0;
  }

  & h1,
  .pt-dark & h1 {
    font-size: 1.2rem;
    margin-top: 20px;

    &:first-child {
      margin-top: 0;
    }

    & + h3 {
      margin-top: 15px;
    }
  }

  & h3,
  .pt-dark & h3 {
    border: 0;
    font-size: 1rem;
    margin: 20px 0 15px 0;
  }
`

/**
 * React State.
 */
const initialState = { isThemeConfirmationOpened: false, changelog: null as string | null }
type State = Readonly<typeof initialState>

/**
 * SettingsChangelog Component.
 */
class SettingsChangelog extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    if (_.isNil(this.state.changelog)) {
      // @ts-ignore
      const changelogUrl = await import('../CHANGELOG.md')
      const marked = await import('marked')

      const response = await fetch(changelogUrl)
      let changelog = await response.text()
      changelog = marked(changelog)

      this.setState(() => ({ changelog }))

      this.props.setVersion(process.env.REACT_APP_VERSION)
      this.props.setShouldReadChangelog(false)
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { changelog } = this.state

    if (_.isNil(changelog)) {
      return (
        <SettingsPanel>
          <Spinner />
        </SettingsPanel>
      )
    }

    return (
      <SettingsPanel>
        <Changelog dangerouslySetInnerHTML={{ __html: changelog }} />
      </SettingsPanel>
    )
  }
}

export default connect<{}, DispatchProps, {}, ApplicationState>(
  null,
  { setVersion, setShouldReadChangelog }
)(SettingsChangelog)

/**
 * React Props.
 */
type DispatchProps = {
  setShouldReadChangelog: typeof setShouldReadChangelog
  setVersion: typeof setVersion
}

/**
 * React Props.
 */
type Props = DispatchProps
