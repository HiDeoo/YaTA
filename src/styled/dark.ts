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
  broadcaster: {
    border: Colors.GRAY2,
    color: Colors.LIGHT_GRAY1,
    input: {
      disabled: `background: rgba(16, 22, 26, 0.3);
        box-shadow: 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0), 0 0 0 0 rgba(19, 124, 189, 0),
          inset 0 0 0 1px rgba(16, 22, 26, 0.3), inset 0 1px 1px rgba(16, 22, 26, 0.4);
        color: #f5f8fa;
        opacity: 0.5`,
    },
    meta: Colors.GRAY3,
    section: 'linear-gradient(90deg, rgba(16, 22, 26, 0.4) 70%, rgba(16, 22, 26, 0) 100%)',
    shadow: '0 0 0 1px rgba(16, 22, 26, 0.2), 0 4px 8px rgba(16, 22, 26, 0.4), 0 18px 46px 6px rgba(16, 22, 26, 0.4)',
  },
  channel: {
    background: Colors.DARK_GRAY3,
    border: Colors.DARK_GRAY1,
    lightBorder: Colors.DARK_GRAY2,
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
  dropOverlay: {
    background: '#30485f',
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
    permanent: {
      background: '#244f3b',
      border: Colors.GREEN3,
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
  resource: {
    divider: `linear-gradient(
      90deg,
      rgba(116, 134, 147, 1) 0%,
      rgba(116, 134, 147, 0.4) 50%,
      rgba(116, 134, 147, 0) 100%
    )
  `,
    hover: {
      background: Colors.DARK_GRAY4,
      color: Colors.BLUE5,
      meta: Colors.LIGHT_GRAY1,
    },
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
