import { Colors } from '@blueprintjs/core'

/**
 * Base theme.
 */
export default {
  chatters: [
    Colors.BLUE4,
    Colors.BLUE5,
    Colors.GREEN3,
    Colors.GREEN5,
    Colors.ORANGE3,
    Colors.ORANGE5,
    Colors.RED3,
    Colors.RED5,
    Colors.VERMILION4,
    Colors.ROSE4,
    Colors.VIOLET5,
    Colors.INDIGO5,
    Colors.COBALT4,
    Colors.COBALT5,
    Colors.TURQUOISE4,
    Colors.FOREST3,
    Colors.FOREST5,
    Colors.LIME3,
    Colors.LIME5,
    Colors.GOLD4,
    Colors.SEPIA5,
  ],
  chattersList: {
    height: 24,
    typeColor: Colors.GRAY3,
  },
  emotePicker: {
    cellGutter: 0,
    cellSize: 38,
    height: 300,
    maxSize: 28,
    padding: 10,
    width: 306,
  },
  follows: {
    height: 68,
    margin: 10,
    width: 350,
  },
  log: {
    hPadding: 10,
    highlight: {
      background: Colors.GOLD5,
      color: Colors.DARK_GRAY1,
    },
    minHeight: 28,
  },
  message: {
    time: {
      color: Colors.GRAY2,
    },
  },
  notice: {
    color: Colors.GRAY2,
  },
  settings: {
    height: 500,
  },
  tooltip: {
    background: Colors.DARK_GRAY1,
  },
  twitchState: {
    gap: 6,
    size: 12,
  },
}

/**
 * Twitch username colors default mapping.
 */
export const TwitchUserColorMap = {
  '#0000FF': '#4966da',
  '#008000': '#128212',
  '#00FF7F': '#0ede76',
  '#1E90FF': '#2986e0',
  '#8A2BE2': '#ac52ff',
  '#9ACD32': '#8ab13b',
  '#B22222': '#bf3434',
  '#FF0000': '#ff2138',
  '#FF4500': '#dc3c00',
}
