import { Colors } from '@blueprintjs/core'

import base from 'Styled/base'

/**
 * Light theme.
 */
export default {
  ...base,
  chatInput: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.LIGHT_GRAY2,
  },
  history: {
    background: Colors.LIGHT_GRAY2,
    border: Colors.GRAY5,
  },
  notification: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.BLUE4,
  },
  whisper: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.INDIGO5,
  },
}
