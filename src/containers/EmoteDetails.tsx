import { Card, Classes, H2 } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import ProgressiveImage from 'react-progressive-image'

import Dialog from 'containers/Dialog'
import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import EmotesProvider from 'libs/EmotesProvider'
import Resources from 'libs/Resources'
import styled, { ifProp } from 'styled'

/**
 * Content component.
 */
const Content = styled.div`
  margin: 20px 20px 0 20px;
`

/**
 * Preview component.
 */
const Preview = styled(Card)`
  &.${Classes.CARD}, .${Classes.DARK} &.${Classes.CARD} {
    align-items: center;
    display: flex;
    justify-content: center;
    margin-right: 18px;
    max-width: 50%;
    min-height: 112px;
    min-width: 112px;
    overflow: hidden;
    padding: 0;

    & > img {
      display: block;
      max-width: 100%;
    }
  }
`

/**
 * Infos component.
 */
const Infos = styled(FlexContent)`
  align-items: ${ifProp('loading', 'center', 'left')};
  display: flex;
  flex-direction: column;
  justify-content: center;
`

/**
 * EmoteDetails Component.
 */
export default class EmoteDetails extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { emote } = this.props

    if (_.isNil(emote)) {
      return null
    }

    return (
      <Dialog isOpen={!_.isNil(emote)} onClose={this.onClose} title={emote.name}>
        <Content>{this.renderDetails()}</Content>
      </Dialog>
    )
  }

  /**
   * Renders the details.
   * @return Element to render.
   */
  private renderDetails() {
    const { emote } = this.props

    if (_.isNil(emote) || !EmotesProvider.isValidPrefix(emote.provider)) {
      return null
    }

    const emotesProvider = Resources.manager().getEmotesProvider(emote.provider)

    if (_.isNil(emotesProvider)) {
      throw new Error('Unknown emote provider.')
    }

    const tagUrls = emotesProvider.getEmoteTagUrls(emote.id)
    const title = _.upperFirst(emote.provider)

    return (
      <div>
        <FlexLayout>
          <Preview>
            {_.isNil(tagUrls['4x']) ? (
              <img alt={emote.name} src={tagUrls['1x']} />
            ) : (
              <ProgressiveImage src={tagUrls['4x']} placeholder={tagUrls['1x']}>
                {(src: string) => <img alt={emote.name} src={src} />}
              </ProgressiveImage>
            )}
          </Preview>
          <Infos>
            <H2>{title}</H2>
          </Infos>
        </FlexLayout>
      </div>
    )
  }

  /**
   * Triggered when the dialog should be closed.
   */
  private onClose = () => {
    this.props.unfocus()
  }
}

/**
 * React Props.
 */
interface Props {
  emote?: FocusedEmote
  unfocus: () => void
}

/**
 * A focused emote details.
 */
export type FocusedEmote = {
  id: string
  name: string
  provider: string
}
