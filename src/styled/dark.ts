import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'

import base from 'Styled/base'

/**
 * Dark theme.
 */
const dark = {
  about: {
    description: Colors.GRAY4,
  },
  chatInput: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY5,
  },
  chatter: {
    details: {
      border: Colors.GRAY1,
      color: Colors.GRAY3,
      strong: Colors.WHITE,
    },
  },
  emotePicker: {
    background: Colors.DARK_GRAY3,
    border: Colors.DARK_GRAY2,
  },
  follow: {
    meta: Colors.GRAY3,
    strong: Colors.LIGHT_GRAY1,
  },
  follows: {
    border: Colors.DARK_GRAY1,
  },
  history: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY1,
  },
  log: {
    mention: {
      color: '#4d5a67',
      self: {
        background: '#613232',
        color: Colors.RED3,
      },
    },
  },
  notification: {
    background: Colors.DARK_GRAY2,
    border: Colors.BLUE4,
    message: Colors.GRAY4,
  },
  permissions: {
    detail: Colors.GRAY5,
  },
  previews: {
    meta: Colors.GRAY3,
  },
  settings: {
    description: Colors.GRAY3,
    section: {
      border: Colors.GRAY1,
      color: Colors.GRAY3,
    },
    table: {
      background: Colors.DARK_GRAY4,
      border: Colors.DARK_GRAY1,
    },
  },
  whisper: {
    background: Colors.DARK_GRAY2,
    border: Colors.INDIGO5,
  },
}

export default _.merge(_.cloneDeep(base), dark)
