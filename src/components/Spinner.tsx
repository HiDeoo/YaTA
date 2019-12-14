import { Classes, Intent, ISpinnerProps, Spinner as OriginalSpinner } from '@blueprintjs/core'
import * as React from 'react'

import Center from 'components/Center'

/**
 * Spinner Component.
 */
const Spinner: React.SFC<ISpinnerProps & Props> = ({ size, large = false, small = false, ...props }) => {
  let className: Optional<string>

  if (large) {
    className = Classes.LARGE
  } else if (small) {
    className = Classes.SMALL
  } else {
    className = undefined
  }

  return (
    <Center>
      <OriginalSpinner className={className} intent={Intent.PRIMARY} {...props} />
    </Center>
  )
}

export default Spinner

/**
 * React Props.
 */
interface Props {
  large?: boolean
  small?: boolean
}
