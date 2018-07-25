import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'

import base from 'Styled/base'

/**
 * Light theme.
 */
const light = {
  about: {
    description: Colors.GRAY1,
  },
  chatInput: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.LIGHT_GRAY2,
  },
  clips: {
    meta: Colors.GRAY1,
  },
  emotePicker: {
    background: Colors.LIGHT_GRAY5,
    border: Colors.LIGHT_GRAY1,
  },
  follow: {
    meta: Colors.GRAY1,
    strong: Colors.DARK_GRAY5,
  },
  follows: {
    border: Colors.LIGHT_GRAY1,
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
    message: Colors.GRAY1,
  },
  permissions: {
    color: Colors.GRAY1,
    detail: Colors.GRAY3,
  },
  settings: {
    description: Colors.GRAY1,
    section: {
      border: Colors.GRAY5,
      color: Colors.GRAY1,
    },
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
