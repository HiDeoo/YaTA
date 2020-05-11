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
import YatApi, { YAEmoteDetails } from 'libs/YatApi'
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
 * EmotesListWrapper component.
 */
const EmotesListWrapper = styled.div`
  margin-top: 15px;

  & > div:first-child {
    margin-bottom: 5px;
  }
`

/**
 * EmotesContainer component.
 */
const EmotesContainer = styled.div`
  display: grid;
  grid-column-gap: 14px;
  grid-template-columns: repeat(2, 1fr);

  & > div {
    &:first-child {
      grid-column: 1 / span 2;
    }

    &:nth-child(2):last-child {
      grid-column: 1 / span 2;
    }
  }
`

/**
 * EmotesList component.
 */
const EmotesList = styled(Card)`
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
 * Twitch plans mapping.
 */
const TwitchPlans: Record<string, string> = {
  '$4.99': 'Tier 1',
  '$9.99': 'Tier 2',
  '$24.99': 'Tier 3',
}

/**
 * React State.
 */
const initialState = {
  details: undefined as Optional<YAEmoteDetails>,
  error: undefined as Optional<Error>,
}
type State = Readonly<typeof initialState>

/**
 * EmotesDetails Component.
 */
export default class EmotesDetails extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    const { emote } = this.props

    if (!_.isNil(emote) && prevProps.emote !== emote && EmotesProvider.isTwitchPrefix(emote.provider)) {
      try {
        const details = await YatApi.fetchEmoteDetails(emote.id)

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
    const isTwitchOwnedEmote = details?.channel_name === 'Twitch'
    const isTwitchGlobalEmote = details?.display_name === 'Twitch'

    const title =
      isTwitchPrefix && !isTwitchOwnedEmote && !didError ? (
        <ExternalLink href={`https://twitch.tv/${details?.display_name}`}>
          <Text ellipsize>{details?.display_name}</Text>
        </ExternalLink>
      ) : (
        _.upperFirst(emote.provider)
      )
    const subTitle = isTwitchOwnedEmote
      ? isTwitchGlobalEmote
        ? 'Global emote'
        : details?.display_name
      : !_.isNil(details?.broadcaster_type)
      ? _.upperFirst(details?.broadcaster_type)
      : ''

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
          <Infos loading={isLoading}>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <H2>{title}</H2>
                {subTitle}
              </>
            )}
          </Infos>
        </FlexLayout>
        {!isTwitchOwnedEmote && this.renderEmotesList(details, emotesProvider)}
      </div>
    )
  }

  /**
   * Renders the emotes list.
   * @param  details - The details including the emotes to render.
   * @param  provider - The associated emotes provider.
   * @return Element to render.
   */
  private renderEmotesList(details: Optional<YAEmoteDetails>, provider: EmotesProvider<Emote>) {
    const { emote: currentEmote } = this.props

    if (_.isNil(currentEmote) || _.isNil(details) || _.isNil(details.emotes) || details.emotes.length <= 1) {
      return null
    }

    const planNamesById = _.reduce(
      details.plans,
      (acc, plan, price) => {
        if (!_.isNil(plan) && TwitchPlans[price]) {
          acc[plan] = TwitchPlans[price]
        }
        return acc
      },
      {} as Record<string, string>
    )

    const tieredEmotes = _.reduce(
      details.emotes,
      (acc, emote) => {
        if (emote.id.toString() === currentEmote.id) {
          return acc
        }

        const planName = planNamesById[emote.emoticon_set.toString()]

        if (_.isNil(planName)) {
          return acc
        }

        if (_.has(acc, planName)) {
          acc[planName]?.push(emote)
        } else {
          acc[planName] = [emote]
        }

        return acc
      },
      {} as Record<string, YAEmoteDetails['emotes']>
    )

    return (
      <EmotesContainer>
        {_.map(tieredEmotes, (emotes, planName) =>
          !_.isNil(emotes) ? this.renderTieredEmotes(planName, emotes, provider) : null
        )}
      </EmotesContainer>
    )
  }

  /**
   * Renders a tiered list of emotes.
   * @param  planName - The tier plan name.
   * @param  emotes - The emotes to render.
   * @param  provider - The associated emotes provider.
   * @return Element to render.
   */
  renderTieredEmotes(planName: string, emotes: YAEmoteDetails['emotes'], provider: EmotesProvider<Emote>) {
    return (
      <EmotesListWrapper key={planName}>
        <div>{planName}:</div>
        <EmotesList>
          {_.map(emotes, (emote) => {
            const emoteTagUrls = provider.getEmoteTagUrls(emote.id.toString())

            return (
              <img
                srcSet={emoteTagUrls.srcset}
                src={emoteTagUrls.src}
                data-tip={emote.code}
                className="emote"
                key={emote.code}
                alt={emote.code}
              />
            )
          })}
        </EmotesList>
      </EmotesListWrapper>
    )
  }

  /**
   * Triggered when the dialog should be closed.
   */
  private onClose = () => {
    this.setState(() => initialState)

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
