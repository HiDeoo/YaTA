import { Card, Classes, H2, Spinner, Text } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import ProgressiveImage from 'react-progressive-image'
import ReactTooltip from 'react-tooltip'

import Dialog from 'containers/Dialog'
import ExternalLink from 'components/ExternalLink'
import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import EmotesProvider, { Emote } from 'libs/EmotesProvider'
import Resources from 'libs/Resources'
import Ivr, { IvrEmoteDetails, IvrEmoteSetData } from 'libs/Ivr'
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
const Infos: React.FC<InfosProps> = styled(({ loading, ...props }: InfosProps) => <FlexContent {...props} />)`
  align-items: ${ifProp('loading', 'center', 'left')};
  display: flex;
  flex-direction: column;
  justify-content: center;
`

/**
 * Emotes component.
 */
const Emotes = styled(Card)`
  margin-top: 20px;

  &.${Classes.CARD}, .${Classes.DARK} &.${Classes.CARD} {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
    padding: 10px;
    & img {
      display: block;
      min-height: 28px;
      min-width: 28px;
    }
  }
`

/**
 * React State.
 */
const initialState = {
  details: undefined as Optional<IvrEmoteDetails>,
  error: undefined as Optional<Error>,
}
type State = Readonly<typeof initialState>

/**
 * EmoteDetails Component.
 */
export default class EmoteDetails extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    const { emote } = this.props

    if (!_.isNil(emote) && prevProps.emote !== emote && EmotesProvider.isTwitchPrefix(emote.provider)) {
      try {
        const details = await Ivr.fetchEmoteDetails(emote.id)

        this.setState(() => ({ details }))

        ReactTooltip.rebuild()
      } catch (error) {
        this.setState(() => ({ error }))
      }
    } else if (_.isNil(emote) && prevProps.emote !== emote) {
      this.setState(initialState)
    }
  }

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
    const { details, error } = this.state

    if (_.isNil(emote) || !EmotesProvider.isValidPrefix(emote.provider)) {
      return null
    }

    const emotesProvider = Resources.manager().getEmotesProvider(emote.provider)

    if (_.isNil(emotesProvider)) {
      throw new Error('Unknown emote provider.')
    }

    const isTwitchPrefix = EmotesProvider.isTwitchPrefix(emote.provider)
    const didError = !_.isNil(error)
    const isLoading = isTwitchPrefix && _.isNil(details) && !didError
    const tagUrls = emotesProvider.getEmoteTagUrls(emote.id)
    const isTwitchGlobalEmote = details && _.isNil(details.emote.channel)

    const title =
      isTwitchPrefix && !isTwitchGlobalEmote && !didError ? (
        <ExternalLink href={`https://twitch.tv/${details?.emote.channellogin}`}>
          <Text ellipsize>{details?.emote.channel}</Text>
        </ExternalLink>
      ) : (
        _.upperFirst(emote.provider)
      )

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
          <Infos loading={isLoading}>{isLoading ? <Spinner /> : <H2>{title}</H2>}</Infos>
        </FlexLayout>
        {isTwitchPrefix && !isTwitchGlobalEmote && details && this.renderEmoteSet(details.emoteSet, emotesProvider)}
      </div>
    )
  }

  /**
   * Renders the emotes set.
   * @param  emoteSet - The emote set to render.
   * @param  provider - The associated emotes provider.
   * @return Element to render.
   */
  private renderEmoteSet(emoteSet: IvrEmoteSetData, provider: EmotesProvider<Emote>) {
    const { emote: currentEmote } = this.props

    if (_.isNil(currentEmote) || emoteSet.emotes.length <= 1) {
      return null
    }

    return (
      <Emotes>
        {_.map(emoteSet.emotes, (emote) => {
          const emoteTagUrls = provider.getEmoteTagUrls(emote.id.toString())

          return (
            <img
              srcSet={emoteTagUrls.srcset}
              src={emoteTagUrls.src}
              data-tip={emote.token}
              className="emote"
              key={emote.token}
              alt={emote.token}
            />
          )
        })}
      </Emotes>
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
 * React Props.
 */
interface InfosProps {
  loading: boolean
}

/**
 * A focused emote details.
 */
export type FocusedEmote = {
  id: string
  name: string
  provider: string
}
