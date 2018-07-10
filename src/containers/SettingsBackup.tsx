import { Button, FileInput, Intent } from '@blueprintjs/core'
import * as FileSaver from 'file-saver'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import SettingsPanel from 'Components/SettingsPanel'
import Toaster from 'Libs/Toaster'
import { restoreSettings } from 'Store/ducks/settings'
import { ApplicationState } from 'Store/reducers'
import { getSettingsBackup } from 'Store/selectors/settings'
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
      <SettingsPanel>
        <Section>Backup</Section>
        <div>
          <Notice>Credentials are not included.</Notice>
          <Button
            disabled={importing}
            icon="download"
            intent={Intent.SUCCESS}
            text="Export settings…"
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
      </SettingsPanel>
    )
  }

  /**
   * Triggered when the export button is clicked.
   */
  private onClickExport = () => {
    const blob = new Blob([JSON.stringify(this.props.settings)], {
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
      const json = JSON.parse(content)

      this.props.restoreSettings(json)

      location.reload()
    } catch (error) {
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
    settings: getSettingsBackup(state),
  }),
  { restoreSettings }
)(SettingsBackup)

/**
 * React Props.
 */
type StateProps = {
  settings: ReturnType<typeof getSettingsBackup>
}

/**
 * React Props.
 */
type DispatchProps = {
  restoreSettings: typeof restoreSettings
}

/**
 * React Props.
 */
type Props = StateProps & DispatchProps
