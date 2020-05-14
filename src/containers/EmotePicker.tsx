import { Classes, Colors, Icon, InputGroup, Popover, Position } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Grid, GridCellRenderer } from 'react-virtualized/dist/es/Grid'
import { compose } from 'recompose'

import EmotePickerEmote from 'components/EmotePickerEmote'
import EmotePickerProvider from 'components/EmotePickerProvider'
import FlexContent from 'components/FlexContent'
import FlexLayout from 'components/FlexLayout'
import NonIdealState from 'components/NonIdealState'
import { Emote, EmoteProviderPrefix } from 'libs/EmotesProvider'
import Resources from 'libs/Resources'
import { ApplicationState } from 'store/reducers'
import { getEmotesSets } from 'store/selectors/app'
import styled, { ifProp, size, theme, ThemeProps, withTheme } from 'styled'

/**
 * EmotePickerButton component.
 */
const EmotePickerButton = styled.button<EmotePickerButtonProps>`
  background-color: initial;
  border: none;
  cursor: ${ifProp('disabled', 'not-allowed', 'pointer')};
  filter: ${ifProp('disabled', 'grayscale(100%)', ifProp('isOpen', 'none', 'grayscale(100%)'))};
  opacity: ${ifProp('disabled', 0.5, 1)};
  position: absolute;
  right: 12px;
  top: 20px;

  &:hover {
    filter: ${ifProp('disabled', 'grayscale(100%)', 'none')};
  }
`

/**
 * Header component.
 */
const Header = styled(FlexLayout)`
  padding: ${size('emotePicker.padding')};
`

/**
 * Emotes component.
 */
const Emotes = styled(FlexContent)`
  border-bottom: 1px solid ${theme('emotePicker.border')};
  border-top: 1px solid ${theme('emotePicker.border')};
  background-color: ${theme('emotePicker.background')};

  & > div::-webkit-scrollbar {
    display: none;
  }
`

/**
 * Preview component.
 */
const Preview = styled(FlexLayout)`
  align-items: center;
  height: ${(props) => props.theme.emotePicker.cellSize * 2 + props.theme.emotePicker.padding * 2}px;
  padding: ${size('emotePicker.padding')};

  img {
    max-height: ${size('emotePicker.maxSize', 'double')};
    max-width: 100%;
  }
`

/**
 * PreviewImage component.
 */
const PreviewImage = styled(FlexLayout)`
  align-items: center;
  height: ${size('emotePicker.cellSize', 'double')};
  justify-content: center;
  margin-right: 10px;
  width: ${size('emotePicker.cellSize', 'double')};
`

/**
 * Notice component.
 */
const Notice = styled.div`
  color: ${Colors.GRAY4};
  font-size: 0.7rem;
  margin: 7px 0;
`

/**
 * Emote provider icon mapping.
 */
const EmoteProviderIconMap: Record<EmoteProviderPrefix, string | string[]> = {
  [EmoteProviderPrefix.Twitch]: ['115847', '28087', '64138', '68856', '123171', '30259', '4339', '114836', '425618'],
  [EmoteProviderPrefix.Bttv]: '56e9f494fff3cc5c35e5287e',
  [EmoteProviderPrefix.Ffz]: '28136',
}

/**
 * React State.
 */
const initialState = {
  buttonIcon: undefined as Optional<string>,
  filter: '',
  filteredSet: [] as Emote[],
  hovered: undefined as Optional<Emote>,
  prefix: EmoteProviderPrefix.Twitch,
  visible: false,
}
type State = Readonly<typeof initialState>

/**
 * EmotePicker Component.
 */
class EmotePicker extends React.Component<Props, State> {
  public state: State = initialState
  private search: HTMLInputElement | null = null
  private columnCount: number
  private columnWidth: number
  private rowHeight: number

  /**
   * Creates a new instance of the component.
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.columnCount = _.floor(
      props.theme.emotePicker.width / (props.theme.emotePicker.cellSize + props.theme.emotePicker.cellGutter)
    )
    this.columnWidth = props.theme.emotePicker.cellSize + props.theme.emotePicker.cellGutter
    this.rowHeight = props.theme.emotePicker.cellSize + props.theme.emotePicker.cellGutter
  }

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   * @param prevState - The previous state.
   */
  public componentDidUpdate(_prevProps: Props, prevState: State) {
    if (_.isNil(prevState.buttonIcon)) {
      this.updateButtonIcon()
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { buttonIcon, visible } = this.state

    if (_.isNil(buttonIcon)) {
      return null
    }

    return (
      <Popover
        isOpen={visible}
        content={this.renderPicker()}
        onInteraction={this.toggleVisibility}
        position={Position.LEFT_BOTTOM}
        popoverClassName="emotePickerPopover"
        minimal
      >
        <EmotePickerButton
          isOpen={visible}
          title="Emote Picker"
          disabled={this.props.disabled}
          onMouseEnter={this.onMouseEnterButton}
        >
          <img src={buttonIcon} alt="Emote Picker" />
        </EmotePickerButton>
      </Popover>
    )
  }

  /**
   * Renders the emotes picker.
   * @return Element to render.
   */
  private renderPicker = () => {
    const { filter, prefix } = this.state
    const { sets } = this.props

    return (
      <FlexLayout vertical>
        <Header>
          {_.map(_.keys(sets), (providerPrefix: EmoteProviderPrefix) => {
            const icon = this.getProviderIcon(providerPrefix)

            if (_.isNil(icon)) {
              return null
            }

            return (
              <EmotePickerProvider
                selected={providerPrefix === prefix}
                onClick={this.onClickProvider}
                prefix={providerPrefix}
                key={providerPrefix}
                icon={icon}
              />
            )
          })}
          <InputGroup
            inputRef={this.setSearchElementRef}
            onChange={this.onChangeFilter}
            className={Classes.FILL}
            placeholder="Filter…"
            leftIcon="search"
            value={filter}
            type="search"
          />
        </Header>
        <Emotes>
          <Grid
            rowCount={_.ceil(_.size(this.getEmotesSet()) / this.columnCount)}
            height={this.props.theme.emotePicker.height}
            width={this.props.theme.emotePicker.width}
            noContentRenderer={this.noEmoteRenderer}
            cellRenderer={this.emoteRenderer}
            columnCount={this.columnCount}
            columnWidth={this.columnWidth}
            rowHeight={this.rowHeight}
            filter={filter}
            prefix={prefix}
          />
        </Emotes>
        {this.renderPreview()}
      </FlexLayout>
    )
  }

  /**
   * Renders the emotes preview.
   * @return Element to render.
   */
  private renderPreview() {
    const { hovered } = this.state

    if (_.isNil(hovered)) {
      return (
        <Preview>
          <PreviewImage>
            <Icon iconSize={40} icon="hand-up" />
          </PreviewImage>
          <div>
            Pick your emote!
            <Notice>Shift to pick more than one.</Notice>
          </div>
        </Preview>
      )
    }

    const provider = this.getProvider()

    if (_.isNil(provider)) {
      return <Preview />
    }

    return (
      <Preview>
        <PreviewImage>
          <img src={provider.getEmoteUrlWithSize(hovered.id, '2x')} alt={hovered.code} />
        </PreviewImage>
        {hovered.code}
      </Preview>
    )
  }

  /**
   * Renders either empty sets of emotes or no result for the current search.
   * @return Element to render.
   */
  private noEmoteRenderer = () => {
    const details = this.isFiltering() ? 'Try another search.' : 'Try in a few seconds.'

    return <NonIdealState small title="No emote!" details={details} />
  }

  /**
   * Renders an emote.
   * @return Element to render.
   */
  private emoteRenderer: GridCellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const emote = _.get(this.getEmotesSet(), this.columnCount * rowIndex + columnIndex)
    const provider = this.getProvider()

    if (_.isNil(emote) || _.isNil(provider)) {
      return null
    }

    return (
      <EmotePickerEmote
        key={key}
        style={style}
        emote={emote}
        urls={provider.getEmoteTagUrls(emote.id)}
        onMouseEnter={this.onMouseEnterEmote}
        onMouseLeave={this.onMouseLeaveEmote}
        onClick={this.onPickEmote}
      />
    )
  }

  /**
   * Updates the emote provider button icon.
   */
  private updateButtonIcon() {
    const buttonIcon = this.getProviderIcon(EmoteProviderPrefix.Twitch, true)

    if (!_.isNil(buttonIcon)) {
      if (this.state.buttonIcon !== buttonIcon) {
        this.setState(() => ({ buttonIcon }))
      } else {
        this.updateButtonIcon()
      }
    }
  }

  /**
   * Returns the current emote provider.
   * @return The provider.
   */
  private getProvider() {
    return Resources.manager().getEmotesProvider(this.state.prefix)
  }

  /**
   * Returns the emote provider icon if possible.
   * @param  prefix - The emote provider prefix.
   * @param  [random=false] - Defines if the icon should be randomized if possible.
   * @return The emote provider icon.
   */
  private getProviderIcon(prefix: EmoteProviderPrefix, random = false): string | null {
    const provider = Resources.manager().getEmotesProvider(prefix)

    if (_.isNil(provider)) {
      return null
    }

    const ids = EmoteProviderIconMap[prefix]
    let id: string

    if (_.isString(ids)) {
      id = ids
    } else {
      id = random ? (_.sample(EmoteProviderIconMap[prefix]) as string) : EmoteProviderIconMap[prefix][0]
    }

    return provider.getEmoteTagUrls(id)['1x']
  }

  /**
   * Returns the emotes set to display.
   * @return The emotes set.
   */
  private getEmotesSet() {
    const { filteredSet, prefix } = this.state

    return this.isFiltering() ? filteredSet : this.props.sets[prefix]
  }

  /**
   * Defines if the emotes set is currently filtered or not.
   * @return `true` when filtering.
   */
  private isFiltering() {
    return this.state.filter.length > 0
  }

  /**
   * Returns the filtered emotes set.
   * @param filter - The filter.
   * @return The emotes set.
   */
  private getFilteredEmotesSet(set: Emote[], filter: string) {
    const sanitizedFilter = filter.toLowerCase()

    return _.filter(set, (emote) => emote.code.toLowerCase().includes(sanitizedFilter))
  }

  /**
   * Triggered when the mouse enters the emote picker button.
   */
  private onMouseEnterButton = () => {
    if (!this.props.disabled && !this.state.visible) {
      this.updateButtonIcon()
    }
  }

  /**
   * Triggered when an emote is picked.
   * @param emote - The picked emote.
   * @param withShiftKey - `true` if the Shift key was pressed when picking the emote.
   */
  private onPickEmote = (emote: Emote, withShiftKey: boolean) => {
    if (!withShiftKey) {
      this.setState(() => ({ visible: false }))
    }

    this.props.onPick(emote, withShiftKey)
  }

  /**
   * Triggered when an emote is hovered.
   * @param emote - The emote hovered.
   */
  private onMouseEnterEmote = (emote: Emote) => {
    this.setState(() => ({ hovered: emote }))
  }

  /**
   * Triggered when an emote is no longer hovered.
   * @param emote - The emote.
   */
  private onMouseLeaveEmote = (emote: Emote) => {
    this.setState(({ hovered }) => ({
      hovered: !_.isNil(hovered) && hovered.code === emote.code ? undefined : hovered,
    }))
  }

  /**
   * Triggered when a provider is clicked.
   * @param prefix - The clicked emote provider prefix.
   */
  private onClickProvider = (prefix: EmoteProviderPrefix) => {
    const { filter } = this.state

    this.setState(({ filteredSet }) => ({
      filteredSet: this.isFiltering() ? this.getFilteredEmotesSet(this.props.sets[prefix], filter) : filteredSet,
      hovered: undefined,
      prefix,
    }))
  }

  /**
   * Triggered when the filter is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    this.setState(({ prefix }) => ({
      filter,
      filteredSet: this.getFilteredEmotesSet(this.props.sets[prefix], filter),
      hovered: undefined,
    }))
  }

  /**
   * Toggles the vibility of the picker.
   */
  private toggleVisibility = (nextOpenState: boolean) => {
    if (nextOpenState && this.props.disabled) {
      return
    }

    this.setState(
      () => ({ visible: nextOpenState, filter: '', filteredSet: [] }),
      () => {
        if (nextOpenState && !_.isNil(this.search)) {
          this.search.focus()
        } else if (!nextOpenState) {
          this.props.onCancel()
        }
      }
    )
  }

  /**
   * Sets the search input ref.
   * @param ref - The reference to the inner input element.
   */
  private setSearchElementRef = (ref: HTMLInputElement | null) => {
    this.search = ref
  }
}

/**
 * Component enhancer.
 */
const enhance = compose<Props, OwnProps>(
  connect<StateProps, {}, OwnProps, ApplicationState>((state) => ({
    sets: getEmotesSets(state),
  })),
  withTheme
)

export default enhance(EmotePicker)

/**
 * React Props.
 */
interface StateProps {
  sets: ReturnType<typeof getEmotesSets>
}

/**
 * React Props.
 */
interface OwnProps {
  disabled: boolean
  onCancel: () => void
  onPick: (emote: Emote, withShiftKey: boolean) => void
}

/**
 * React Props.
 */
type Props = StateProps & OwnProps & ThemeProps

/**
 * React Props.
 */
interface EmotePickerButtonProps {
  disabled: boolean
  isOpen: boolean
}
