import { Colors } from '@blueprintjs/core'

import base from 'Styled/base'

/**
 * Dark theme.
 */
export default {
  ...base,
  chatInput: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY5,
  },
  history: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY1,
  },
  notification: {
    background: Colors.DARK_GRAY2,
    border: Colors.BLUE4,
  },
  whisper: {
    background: Colors.DARK_GRAY2,
    border: Colors.INDIGO5,
  },
}
