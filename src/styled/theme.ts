import Theme from 'constants/theme'
import { HighlightColor, HighlightColors } from 'libs/Highlight'

/**
 * Theme definition.
 */
export default interface ITheme {
  about: {
    description: string
  }
  background: {
    [Theme.Dark]: string
    [Theme.Light]: string
  }
  beta: {
    height: number
    width: number
  }
  broadcaster: {
    border: string
    color: string
    input: {
      disabled: string
    }
    meta: string
    section: string
    shadow: string
  }
  changelog: {
    background: string
    dark: string
    shadow: string
  }
  channel: {
    background: string
    border: string
    lightBorder: string
  }
  chatInput: {
    background: string
    border: string
  }
  chatter: {
    avatar: {
      margin: string
      size: number
    }
    details: {
      border: string
      color: string
      strong: string
    }
  }
  chatters: string[]
  chattersList: {
    height: number
    typeColor: string
  }
  dropOverlay: {
    background: string
  }
  emotePicker: {
    background: string
    border: string
    cellGutter: number
    cellSize: number
    height: number
    maxSize: number
    padding: number
    width: number
  }
  external: {
    thumbnail: {
      height: number
      width: number
    }
  }
  follow: {
    background: string
    border: string
    meta: string
    strong: string
  }
  follows: {
    background: string
    border: string
    details: string
    flip: number
    height: number
    hover: {
      details: string
      meta: string
      shadow1: string
      shadow2: string
      title: string
    }
    liveBackground: string
    margin: number
    meta: string
    shadow: string
    thumbnail: string
    titleChannel: string
    titleStream: string
    width: number
  }
  help: {
    minHeight: number
  }
  history: {
    background: string
    border: string
    height: number
  }
  log: {
    border: {
      bottom: number
      top: number
    }
    hPadding: number
    highlight: Record<HighlightColors, HighlightColor>
    mention: {
      color: string
      self: {
        background: string
        color: string
      }
    }
    minHeight: number
    pause: string
    permanent: {
      background: string
      border: string
    }
  }
  login: {
    feature: {
      background: string
      height: number
      meta: string
      shadow: string
      title: string
      width: number
    }
    features: {
      color: string
      height: number
    }
  }
  logo: string
  message: {
    time: {
      color: string
    }
  }
  notice: {
    color: string
  }
  notification: {
    background: string
    border: string
    message: string
  }
  permissions: {
    detail: string
  }
  player: {
    height: number
    width: number
  }
  previews: {
    meta: string
    thumbnail: {
      height: number
      width: number
    }
  }
  rejectedMessage: {
    background: string
    border: string
    button: {
      icon: number
      size: number
    }
    message: string
  }
  resource: {
    divider: string
    hover: {
      background: string
      color: string
      meta: string
    }
    meta: string
  }
  settings: {
    description: string
    height: number
    section: {
      border: string
      color: string
    }
    table: {
      background: string
      border: string
    }
  }
  tooltip: {
    background: string
  }
  twitch: {
    purple: string
  }
  twitchState: {
    gap: number
    size: number
  }
  whisper: {
    background: string
    border: string
  }
}
