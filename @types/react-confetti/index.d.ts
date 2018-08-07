declare module 'react-confetti' {
  interface ConfettiProps extends React.HTMLAttributes<Confetti> {
    width?: string
    height?: string
    numberOfPieces?: number
    friction?: number
    wind?: number
    gravity?: number
    opacity?: number
    recycle?: boolean
    run?: boolean
  }

  export default class Confetti extends React.Component<ConfettiProps, any> {}
}
