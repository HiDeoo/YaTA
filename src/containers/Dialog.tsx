import { Dialog as OriginalDialog, IDialogProps } from '@blueprintjs/core'
import * as React from 'react'
import { connect } from 'react-redux'

import { ApplicationState } from 'Store/reducers'
import { getDisableDialogAnimations } from 'Store/selectors/settings'

/**
 * Dialog Component.
 */
const Dialog: React.SFC<Props> = ({ disableDialogAnimations, ...restProps }) => (
  <OriginalDialog
    {...restProps}
    transitionName={disableDialogAnimations ? '' : undefined}
    transitionDuration={disableDialogAnimations ? 0 : 300}
  />
)

export default connect<StateProps, {}, IDialogProps, ApplicationState>((state) => ({
  disableDialogAnimations: getDisableDialogAnimations(state),
}))(Dialog)

/**
 * React Props.
 */
type StateProps = {
  disableDialogAnimations: ReturnType<typeof getDisableDialogAnimations>
}

/**
 * React Props.
 */
type Props = StateProps & IDialogProps
