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
  broadcaster: {
    border: Colors.LIGHT_GRAY1,
    color: Colors.DARK_GRAY5,
    hover: {
      background: Colors.LIGHT_GRAY4,
      color: Colors.BLUE3,
      meta: Colors.GRAY2,
    },
    meta: Colors.GRAY4,
  },
  channel: {
    background: Colors.LIGHT_GRAY5,
    border: Colors.GRAY5,
    lightBorder: Colors.LIGHT_GRAY1,
  },
  chatInput: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.LIGHT_GRAY2,
  },
  chatter: {
    details: {
      border: Colors.GRAY4,
      color: Colors.GRAY1,
      strong: Colors.DARK_GRAY1,
    },
  },
  dropOverlay: {
    background: '#e2ebf4',
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
    permanent: {
      background: 'rgba(60, 241, 73, 0.3)',
      border: Colors.GREEN3,
    },
  },
  notification: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.BLUE4,
    message: Colors.GRAY1,
  },
  permissions: {
    detail: Colors.DARK_GRAY5,
  },
  previews: {
    meta: Colors.GRAY1,
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
