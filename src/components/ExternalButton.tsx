import { AnchorButton, IButtonProps } from '@blueprintjs/core'
import * as React from 'react'

/**
 * ExternalButton Component.
 */
const ExternalButton: React.FunctionComponent<IButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>> = (
  props
) => <AnchorButton target="_blank" {...props} />

export default ExternalButton
