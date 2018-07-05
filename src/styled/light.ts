import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'

import base from 'Styled/base'

/**
 * Light theme.
 */
const light = {
  chatInput: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.LIGHT_GRAY2,
  },
  clips: {
    meta: Colors.GRAY1,
  },
  follow: {
    meta: Colors.GRAY1,
    strong: Colors.DARK_GRAY5,
  },
  history: {
    background: Colors.LIGHT_GRAY2,
    border: Colors.GRAY5,
  },
  log: {
    mention: {
      color: Colors.LIGHT_GRAY2,
      self: {
        background: 'rgba(241, 99, 99, 0.3)',
        color: Colors.RED3,
      },
    },
  },
  notification: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.BLUE4,
  },
  settings: {
    table: {
      background: Colors.LIGHT_GRAY2,
      border: Colors.GRAY5,
    },
  },
  whisper: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.INDIGO5,
  },
}

export default _.merge(_.cloneDeep(base), light)
