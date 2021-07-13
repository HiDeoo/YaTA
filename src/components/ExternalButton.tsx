import { AnchorButton, ButtonProps } from '@blueprintjs/core'
import * as React from 'react'

/**
 * ExternalButton Component.
 */
const ExternalButton: React.FunctionComponent<
  ButtonProps<HTMLAnchorElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>
> = (props) => <AnchorButton target="_blank" {...props} />

export default ExternalButton
