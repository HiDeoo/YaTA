import { Colors } from '@blueprintjs/core'
import * as _ from 'lodash'

import base from 'Styled/base'
import ITheme from 'Styled/theme'

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
    input: {
      disabled: '',
    },
    meta: Colors.GRAY4,
    section: 'linear-gradient(90deg, rgba(16, 22, 26, 0.15) 70%, rgba(16, 22, 26, 0) 100%)',
    shadow: '0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2)',
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
    background: Colors.LIGHT_GRAY4,
    border: Colors.LIGHT_GRAY1,
    details: Colors.DARK_GRAY3,
    hover: {
      details: Colors.DARK_GRAY1,
      meta: Colors.GRAY1,
      shadow1: Colors.BLUE4,
      shadow2: 'rgba(78, 147, 208, 0.2)',
      title: Colors.BLUE4,
    },
    liveBackground: Colors.LIGHT_GRAY5,
    meta: Colors.GRAY2,
    shadow: Colors.GRAY4,
    thumbnail: Colors.LIGHT_GRAY5,
    titleChannel: Colors.DARK_GRAY5,
    titleStream: Colors.DARK_GRAY1,
  },
  history: {
    background: Colors.LIGHT_GRAY2,
    border: Colors.GRAY5,
  },
  log: {
    alternate: Colors.LIGHT_GRAY3,
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
  login: {
    feature: {
      background: Colors.LIGHT_GRAY3,
      meta: Colors.GRAY1,
      shadow: '0 0 0 1px rgba(16,22,26,.1), 0 2px 4px rgba(16,22,26,.2), 0 9px 24px 3px rgba(16,22,26,.2)',
      title: Colors.DARK_GRAY1,
    },
    features: {
      color: Colors.LIGHT_GRAY3,
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
  resource: {
    divider: `linear-gradient(
      90deg,
      rgba(206, 217, 224, 1) 0%,
      rgba(206, 217, 224, 0.7) 50%,
      rgba(206, 217, 224, 0) 100%
    )
  `,
    hover: {
      background: Colors.LIGHT_GRAY4,
      color: Colors.BLUE3,
      meta: Colors.GRAY2,
    },
    meta: Colors.GRAY4,
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
    viewButton: {
      hover: {
        icon: Colors.GRAY1,
        text: Colors.DARK_GRAY1,
      },
      icon: Colors.GRAY3,
      text: Colors.GRAY2,
    },
  },
  twitchState: {
    color: 'rgba(92, 112, 128, 0.8)',
  },
  whisper: {
    background: Colors.LIGHT_GRAY3,
    border: Colors.INDIGO5,
  },
}

export default _.merge(_.cloneDeep(base), light) as ITheme
