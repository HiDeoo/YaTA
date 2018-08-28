import { Button, FileInput, Intent } from '@blueprintjs/core'
import * as FileSaver from 'file-saver'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import SettingsView from 'Components/SettingsView'
import Toaster from 'Libs/Toaster'
import { restoreNotes } from 'Store/ducks/notes'
import { restoreSettings } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getNotesBackup } from 'Store/selectors/notes'
import { getSettingsBackup } from 'Store/selectors/settings'
import styled from 'Styled'
import { readTextFile } from 'Utils/html'

/**
 * Section component.
 */
const Section = styled.h3`
  margin: 20px 0;

  &:first-child {
    margin-top: 0;
  }
`

/**
 * Notice component.
 */
const Notice = styled.div`
  font-style: italic;
  margin-bottom: 20px;
`

/**
 * React State.
 */
const initialState = { importing: false }
type State = Readonly<typeof initialState>

/**
 * SettingsBackup Component.
 */
class SettingsBackup extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { importing } = this.state

    return (
      <SettingsView>
        <Section>Backup</Section>
        <div>
          <Notice>Credentials are not included.</Notice>
          <Button
            disabled={importing}
            icon="download"
            intent={Intent.SUCCESS}
            text="Export settings & notes…"
            onClick={this.onClickExport}
          />
        </div>
        <Section>Restore</Section>
        <div>
          <FileInput
            disabled={importing}
            text="Choose file..."
            onInputChange={this.onClickImport}
            inputProps={{
              accept: '.bkp',
            }}
          />
        </div>
      </SettingsView>
    )
  }

  /**
   * Triggered when the export button is clicked.
   */
  private onClickExport = () => {
    const { notes, settings } = this.props

    const blob = new Blob([JSON.stringify({ notes, settings })], {
      type: 'text/plain;charset=utf-8;',
    })

    FileSaver.saveAs(blob, 'yata.bkp')
  }

  /**
   * Triggered when the import button is clicked.
   */
  private onClickImport = async (event: React.FormEvent<HTMLInputElement>) => {
    if (_.isNil(event.currentTarget.files)) {
      return
    }

    if (event.currentTarget.files.length === 0) {
      return
    }

    this.setState(() => ({ importing: true }))

    const file = _.head(event.currentTarget.files) as File

    try {
      const content = await readTextFile(file)
      const { notes, settings } = JSON.parse(content)

      this.props.restoreSettings(settings)
      this.props.restoreNotes(notes)

      location.reload()
    } catch {
      Toaster.show({
        icon: 'error',
        intent: Intent.DANGER,
        message: 'Something went wrong! Please try again.',
      })
    } finally {
      this.setState(() => ({ importing: false }))
    }
  }
}

export default connect<StateProps, DispatchProps, {}, ApplicationState>(
  (state) => ({
    notes: getNotesBackup(state),
    settings: getSettingsBackup(state),
  }),
  { restoreNotes, restoreSettings }
)(SettingsBackup)

/**
 * React Props.
 */
interface StateProps {
  notes: ReturnType<typeof getNotesBackup>
  settings: ReturnType<typeof getSettingsBackup>
}

/**
 * React Props.
 */
interface DispatchProps {
  restoreNotes: typeof restoreNotes
  restoreSettings: typeof restoreSettings
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
