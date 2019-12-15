import { Button, Classes, Colors, Intent } from '@blueprintjs/core'
import copy from 'copy-to-clipboard'
import * as FileSaver from 'file-saver'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import LogsExporterCheckbox from 'components/LogsExporterCheckbox'
import Logs from 'constants/logs'
import { ToggleableProps } from 'constants/toggleable'
import Dialog from 'containers/Dialog'
import Toaster from 'libs/Toaster'
import { isMarker, isMessage, isNotice, isNotification, isWhisper } from 'store/ducks/logs'
import { ApplicationState } from 'store/reducers'
import { getChannel } from 'store/selectors/app'
import { getLogs } from 'store/selectors/logs'
import styled, { ifProp } from 'styled'
import {
  convertMarkerToString,
  convertMessagesToString,
  convertNoticeToString,
  convertNotificationToString,
  convertWhisperToString,
} from 'utils/logs'

/**
 * Label component.
 */
const Label = styled.div<LabelProps>`
  cursor: ${ifProp('disabled', 'not-allowed', 'pointer')};
  margin-bottom: 8px;
  opacity: ${ifProp('disabled', 0.4, 1)};
  user-select: none;

  & em {
    color: ${Colors.GRAY1};
    font-style: normal;
  }

  .${Classes.DARK} & em {
    color: ${Colors.GRAY5};
  }
`

/**
 * Controls component.
 */
const Controls = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  & > button {
    margin-left: 10px;
  }
`

/**
 * RotationWarning component.
 */
const RotationWarning = styled.div`
  margin-top: 15px;
  font-weight: bold;
`

/**
 * Form state.
 */
enum FormState {
  Idle,
  Invalid,
  ProcessingCopy,
  ProcessingDownload,
}

/**
 * React State.
 */
const initialState = {
  formState: FormState.Idle as FormState,
  includeMarker: true,
  includeMessage: true,
  includeNotice: false,
  includeNotification: false,
  includePurged: false,
  includeWhisper: false,
}
type State = Readonly<typeof initialState>

/**
 * LogsExporter Component.
 */
class LogsExporter extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { allLogs, visible } = this.props
    const {
      formState,
      includeMarker,
      includeMessage,
      includeNotice,
      includeNotification,
      includePurged,
      includeWhisper,
    } = this.state

    const isProcessing = this.isProcessing()
    const canProcess = formState === FormState.Idle && allLogs.logs.length > 0
    const showRotationWarning = allLogs.logs.length >= Logs.Max

    return (
      <Dialog isOpen={visible} onClose={this.toggle} icon="book" title="Export logs">
        <div className={Classes.DIALOG_BODY}>
          <Label onClick={this.onClickContentLabel} disabled={isProcessing}>
            Content <em>(at least 1 required)</em>
          </Label>
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includeMessage}
            disabled={isProcessing}
            id="includeMessage"
            label="Messages"
          />
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includeMarker}
            disabled={isProcessing}
            id="includeMarker"
            label="Markers"
          />
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includeWhisper}
            disabled={isProcessing}
            id="includeWhisper"
            label="Whispers"
          />
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includePurged}
            disabled={isProcessing}
            label="Purged messages"
            id="includePurged"
          />
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includeNotification}
            disabled={isProcessing}
            id="includeNotification"
            label={
              <>
                Notifications <em>(subs, resubs, gifts, etc…)</em>
              </>
            }
          />
          <LogsExporterCheckbox
            onChange={this.onChangeInclude}
            checked={includeNotice}
            disabled={isProcessing}
            id="includeNotice"
            label={
              <>
                Notices <em>(bans, timeouts, slow mode, etc…)</em>
              </>
            }
          />
          {showRotationWarning && (
            <RotationWarning>
              Due to the amount of entries, only the last {allLogs.logs.length} will be exported.
            </RotationWarning>
          )}
        </div>
        <Controls className={Classes.DIALOG_FOOTER}>
          <Button text="Close" disabled={isProcessing} onClick={this.toggle} />
          <Button
            loading={formState === FormState.ProcessingCopy}
            onClick={this.onClickCopy}
            text="Copy to clipboard"
            intent={Intent.PRIMARY}
            disabled={!canProcess}
            rightIcon="clipboard"
          />
          <Button
            loading={formState === FormState.ProcessingDownload}
            onClick={this.onClickDownload}
            intent={Intent.PRIMARY}
            disabled={!canProcess}
            rightIcon="download"
            text="Download"
          />
        </Controls>
      </Dialog>
    )
  }

  /**
   * Triggered when an include checkbox is modified.
   * @param id - The include type.
   * @param checked - `true` when checked.
   */
  private onChangeInclude = (id: IncludedLogId, checked: boolean) => {
    this.setState((prevState) => ({
      [id]: checked,
      ...this.getValidationState(id, checked, prevState),
    }))
  }

  /**
   * Returns if currently processing or not.
   * @return `true` when processing.
   */
  private isProcessing() {
    const { formState } = this.state

    return formState === FormState.ProcessingCopy || formState === FormState.ProcessingDownload
  }

  /**
   * Triggered when the content label is clicked.
   */
  private onClickContentLabel = () => {
    const { formState, ...otherProperties } = this.state

    if (this.isProcessing()) {
      return
    }

    const allEnabled = _.every(otherProperties, (prop) => prop === true)
    const newEnabled = !allEnabled

    this.setState(() => ({
      formState: newEnabled ? FormState.Idle : FormState.Invalid,
      includeMarker: newEnabled,
      includeMessage: newEnabled,
      includeNotice: newEnabled,
      includeNotification: newEnabled,
      includePurged: newEnabled,
      includeWhisper: newEnabled,
    }))
  }

  /**
   * Triggered when the copy button is clicked.
   */
  private onClickCopy = () => {
    this.markAsProcessing(FormState.ProcessingCopy)

    copy(this.getExportableLogs())

    Toaster.show({ message: 'Copied!', intent: Intent.SUCCESS, icon: 'clipboard', timeout: 1000 })

    this.markAsProcessing()
  }

  /**
   * Triggered when the download button is clicked.
   */
  private onClickDownload = () => {
    this.markAsProcessing(FormState.ProcessingDownload)

    const blob = new Blob([this.getExportableLogs()], {
      type: 'text/plain;charset=utf-8;',
    })

    const now = new Date()

    FileSaver.saveAs(blob, `${this.props.channel}-${now.toLocaleDateString()}-${now.toLocaleTimeString()}.log`)

    this.markAsProcessing()
  }

  /**
   * Returns the header of logs.
   * @return The header.
   */
  private getLogsHeader() {
    const now = new Date()

    return `/**
 * Chat logs from #${this.props.channel} (${now.toLocaleDateString()} - ${now.toLocaleTimeString()}).
 */


`
  }

  /**
   * Returns the processed logs ready to be exported.
   * @return The exportable logs.
   */
  private getExportableLogs() {
    const { logs } = this.props.allLogs
    const {
      includeMarker,
      includeMessage,
      includeNotice,
      includeNotification,
      includePurged,
      includeWhisper,
    } = this.state

    let exportableLogs = this.getLogsHeader()

    _.forEach(logs, (log) => {
      if (isMessage(log) && ((includeMessage && !log.purged) || (includePurged && log.purged))) {
        exportableLogs = exportableLogs.concat(`${convertMessagesToString(log)}\n`)
      } else if (isWhisper(log) && includeWhisper) {
        exportableLogs = exportableLogs.concat(`${convertWhisperToString(log)}\n`)
      } else if (isMarker(log) && includeMarker) {
        exportableLogs = exportableLogs.concat(`${convertMarkerToString(log)}\n`)
      } else if (isNotice(log) && includeNotice) {
        exportableLogs = exportableLogs.concat(`${convertNoticeToString(log)}\n`)
      } else if (isNotification(log) && includeNotification) {
        exportableLogs = exportableLogs.concat(`${convertNotificationToString(log)}\n`)
      }
    })

    return exportableLogs
  }

  /**
   * Marks the form as processing or not.
   * @param [type] - Type of processing or undefined to mark as not processing.
   */
  private markAsProcessing(
    processingFormState: FormState.ProcessingCopy | FormState.ProcessingDownload | FormState.Idle = FormState.Idle
  ) {
    this.setState(() => ({ formState: processingFormState }))
  }

  /**
   * Returns the validation state.
   * @param  id - The id of the current property being modified.
   * @param  checked - Defines if the modified property is now checked or not.
   * @param  state - The current state.
   * @return The validation state.
   */
  private getValidationState(id: IncludedLogId, checked: boolean, state: State) {
    const { formState, [id]: modifiedProperty, ...otherProperties } = state

    const newFormState: FormState =
      _.every(otherProperties, (prop) => prop === false) && !checked ? FormState.Invalid : FormState.Idle

    return { formState: newFormState }
  }

  /**
   * Triggered when toggling the modal.
   */
  private toggle = () => {
    if (this.state.formState === FormState.Idle) {
      this.setState(initialState)

      Toaster.clear()
    }

    this.props.toggle()
  }
}

export default connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
  allLogs: getLogs(state),
  channel: getChannel(state),
}))(LogsExporter)

/**
 * React Props.
 */
interface StateProps {
  allLogs: ReturnType<typeof getLogs>
  channel: ReturnType<typeof getChannel>
}

/**
 * React Props.
 */
type OwnProps = ToggleableProps

/**
 * React Props.
 */
type Props = StateProps & OwnProps

/**
 * React Props.
 */
interface LabelProps {
  disabled: boolean
}

/**
 * IDs of the possible included log types.
 */
export type IncludedLogId =
  | 'includeMarker'
  | 'includeMessage'
  | 'includeNotice'
  | 'includeNotification'
  | 'includePurged'
  | 'includeWhisper'
