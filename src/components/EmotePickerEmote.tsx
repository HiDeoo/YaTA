import * as React from 'react'
import styled from 'styled-components'

import FlexLayout from 'Components/FlexLayout'
import { Emote, EmoteTagUrls } from 'Libs/EmotesProvider'
import { size } from 'Utils/styled'

/**
 * Emote component.
 */
const Emote = styled(FlexLayout)`
  align-items: center;
  cursor: pointer;
  height: ${size('emotePicker.cellSize')};
  justify-content: center;
  width: ${size('emotePicker.cellSize')};
`

/**
 * Image component.
 */
const Image = styled.img`
  max-height: ${size('emotePicker.maxSize')};
  max-width: 100%;
`

/**
 * EmotePickerEmote Component.
 */
export default class EmotePickerEmote extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { style, urls } = this.props

    return (
      <div style={style}>
        <Emote onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onClick={this.onClick}>
          <Image src={urls.src} srcSet={urls.srcset} />
        </Emote>
      </div>
    )
  }

  /**
   * Triggered when the emote is clicked.
   */
  private onClick = (event: React.MouseEvent<HTMLElement>) => {
    const { emote, onClick } = this.props

    onClick(emote, event.shiftKey)
  }

  /**
   * Triggered when the cursor starts hovering an emote.
   */
  private onMouseEnter = () => {
    const { emote, onMouseEnter } = this.props

    onMouseEnter(emote)
  }

  /**
   * Triggered when the cursor stops hovering an emote.
   */
  private onMouseLeave = () => {
    const { emote, onMouseLeave } = this.props

    onMouseLeave(emote)
  }
}

/**
 * React Props.
 */
type Props = {
  emote: Emote
  style: React.CSSProperties
  onClick: (emote: Emote, withShiftKey: boolean) => void
  onMouseEnter: (emote: Emote) => void
  onMouseLeave: (emote: Emote) => void
  urls: EmoteTagUrls
}
