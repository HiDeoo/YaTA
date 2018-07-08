import { ISpinnerProps, Spinner as OriginalSpinner } from '@blueprintjs/core'
import * as React from 'react'

import Center from 'Components/Center'

/**
 * Spinner Component.
 */
const Spinner: React.SFC<ISpinnerProps> = (props) => (
  <Center>
    <OriginalSpinner {...props} />
  </Center>
)

export default Spinner
