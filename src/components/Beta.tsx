import { Classes, Dialog, H3 } from '@blueprintjs/core'
import * as React from 'react'
import Confetti from 'react-confetti'
import styled from 'styled-components'

import base from 'Styled/base'
import { size } from 'Utils/styled'

/**
 * BetaDialog component.
 */
const BetaDialog = styled(Dialog)`
  &.${Classes.DIALOG} {
    height: ${size('beta.height')};
    width: ${size('beta.width')};
  }
`

/**
 * ConfettiWrapper component.
 */
const ConfettiWrapper = styled.div`
  position: relative;
`

/**
 * Content component.
 */
const Content = styled.div`
  text-align: center;

  p {
    margin: 20px 0;
  }

  em {
    font-size: 0.8rem;
  }
`

/**
 * Beta Component.
 */
export default class Beta extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { toggle, visible } = this.props

    return (
      <BetaDialog
        isOpen={visible}
        onClose={toggle}
        icon="heart"
        title="Thanks"
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
      >
        <ConfettiWrapper>
          <Confetti width={`${base.beta.width}px`} height={`${base.beta.height - 40}px`} numberOfPieces={100} />
        </ConfettiWrapper>
        <Content className={Classes.DIALOG_BODY}>
          <H3>Thank you for participating to the YaTA beta.</H3>
          <p>Version 1.0.0 is now released but expect regular updates.</p>
          <em>As a token of appreciation, you just received 10 YaTA points.</em>
        </Content>
      </BetaDialog>
    )
  }
}

/**
 * React Props.
 */
type Props = {
  toggle: () => void
  visible: boolean
}
