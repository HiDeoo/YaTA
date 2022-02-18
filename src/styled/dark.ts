import { Colors } from '@blueprintjs/core'
import _ from 'lodash'

import base from 'styled/base'
import ITheme from 'styled/theme'

/**
 * Dark theme.
 */
const dark = {
  about: {
    description: Colors.GRAY4,
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
  history: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY1,
  },
  log: {
    alternate: Colors.DARK_GRAY5,
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
  login: {
    feature: {
      background: Colors.DARK_GRAY4,
      meta: Colors.GRAY3,
      shadow: '0 0 0 1px rgba(16, 22, 26, 0.1), 0 2px 4px rgba(16, 22, 26, 0.3), 0 9px 24px 3px rgba(16, 22, 26, 0.3)',
      title: Colors.WHITE,
    },
    features: {
      color: Colors.DARK_GRAY5,
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
  rejectedMessage: {
    background: Colors.DARK_GRAY2,
    border: Colors.RED3,
    message: Colors.GRAY4,
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
    viewButton: {
      hover: {
        icon: Colors.GRAY3,
        text: Colors.WHITE,
      },
      border: 'rgba(32, 43, 51, 0.7)',
      icon: Colors.GRAY1,
      text: Colors.GRAY5,
    },
  },
  streams: {
    background: Colors.DARK_GRAY4,
    border: Colors.DARK_GRAY1,
    details: Colors.LIGHT_GRAY1,
    hover: {
      details: Colors.WHITE,
      meta: Colors.GRAY3,
      shadow1: Colors.BLUE3,
      shadow2: 'rgba(78, 147, 208, 0.2)',
      title: Colors.BLUE5,
    },
    liveBackground: Colors.DARK_GRAY3,
    meta: Colors.GRAY2,
    shadow: Colors.DARK_GRAY2,
    thumbnail: Colors.DARK_GRAY5,
    titleChannel: Colors.LIGHT_GRAY1,
    titleStream: Colors.WHITE,
  },
  twitchState: {
    color: 'rgba(191, 204, 214, 0.8)',
  },
  whisper: {
    background: Colors.DARK_GRAY2,
    border: Colors.INDIGO5,
  },
}

export default _.merge(_.cloneDeep(base), dark) as ITheme
