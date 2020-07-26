import { Button, Classes, Colors, FormGroup, InputGroup, Intent, Menu } from '@blueprintjs/core'
import { ItemRenderer, Suggest } from '@blueprintjs/select'
import _ from 'lodash'
import pluralize from 'pluralize'
import * as React from 'react'

import BroadcasterSection from 'components/BroadcasterSection'
import ExternalLink from 'components/ExternalLink'
import NonIdealState from 'components/NonIdealState'
import Spinner from 'components/Spinner'
import { BroadcasterSectionProps } from 'containers/BroadcasterOverlay'
import Twitch, { RawCategory, RawNotification } from 'libs/Twitch'
import styled, { theme } from 'styled'

/**
 * Category suggest component.
 */
const CategorySuggest = Suggest.ofType<RawCategory>()

/**
 * InfoInput component.
 */
const InfoInput = styled(InputGroup)`
  .${Classes.DARK} & > .${Classes.INPUT}.${Classes.DISABLED}, .${Classes.DARK} & > .${Classes.INPUT}:disabled {
    ${theme('broadcaster.input.disabled')};
  }
`

/**
 * CategoryFormGroup component.
 */
const CategoryFormGroup = styled(FormGroup)`
  width: 100%;
`

/**
 * CategoryInput component.
 */
const CategoryInput = styled(CategorySuggest)`
  width: 100%;

  & > span {
    width: 100%;
  }

  & .${Classes.INPUT} {
    &::placeholder {
      color: ${Colors.DARK_GRAY1};
    }
  }

  .${Classes.DARK} & .${Classes.INPUT} {
    &.${Classes.DISABLED}, &:disabled {
      ${theme('broadcaster.input.disabled')};
    }

    &::placeholder {
      color: ${Colors.LIGHT_GRAY5};
    }
  }
`

/**
 * CategoryMenuItem component.
 */
const CategoryMenuItem = styled(Menu.Item)`
  &.${Classes.MENU_ITEM} {
    align-items: center;
  }

  & .${Classes.MENU_ITEM_LABEL} {
    & > img {
      max-height: 50px;
    }
  }
`

/**
 * UpdateButton component.
 */
const UpdateButton = styled(Button)`
  margin-top: 5px;
`

/**
 * Various controlled inputs.
 */
enum Input {
  Category = 'category',
  Notification = 'notification',
  Title = 'title',
}

/**
 * Various input max lengths.
 */
const InputMaxLengths = {
  [Input.Notification]: 140,
  [Input.Title]: 140,
}

/**
 * React State.
 */
const initialState = {
  didFail: false,
  categories: null as RawCategory[] | null,
  isModified: false,
  isReady: false,
  isUpdating: false,
  liveNotification: undefined as Optional<RawNotification>,
  [Input.Category]: '',
  [Input.Notification]: '',
  [Input.Title]: '',
}
type State = Readonly<typeof initialState>

/**
 * BroadcasterInformations Component.
 */
export default class BroadcasterInformations extends React.Component<BroadcasterSectionProps, State> {
  public state: State = initialState
  private lastCategoryQuery = ''
  private lastCategorySearchController: AbortController | null = null

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { channel, channelId } = this.props

      const liveNotification = await Twitch.fetchChannelLiveNotification(channelId)

      this.setState(() => ({
        didFail: false,
        isReady: true,
        liveNotification,
        [Input.Category]: channel.game || '',
        [Input.Notification]: liveNotification.message || '',
        [Input.Title]: channel.status || '',
      }))
    } catch {
      this.setState(() => ({ didFail: true, isReady: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const {
      didFail,
      categories,
      isModified,
      isUpdating,
      isReady,
      [Input.Category]: category,
      [Input.Notification]: notification,
      [Input.Title]: title,
    } = this.state
    const { channel } = this.props

    if (didFail) {
      return <NonIdealState retry />
    }

    return (
      <BroadcasterSection title="Stream Informations" ready={isReady}>
        <FormGroup label="Title" labelFor="title" labelInfo={this.getInputLabelInfo(Input.Title)} disabled={isUpdating}>
          <InfoInput
            onChange={this.onChangeTitle}
            placeholder="Enter a title…"
            disabled={isUpdating}
            value={title}
            id="title"
          />
        </FormGroup>
        <CategoryFormGroup label="Game / Category" labelFor="category" disabled={isUpdating}>
          <CategoryInput
            initialContent={<Menu.Item disabled text="Search for a new game or category…" />}
            // Note: we use the placeholder to display the previous value until the initial value can be defined.
            // @see https://github.com/palantir/blueprint/issues/2784
            inputProps={{ id: 'category', placeholder: category, disabled: isUpdating }}
            inputValueRenderer={this.categoryValueRenderer}
            onItemSelect={this.onSelectCategory}
            onQueryChange={this.onChangeCategoryQuery}
            itemRenderer={this.categoryRenderer}
            popoverProps={{ minimal: true }}
            items={categories || []}
            resetOnSelect
            openOnKeyDown
            noResults={
              _.isNil(categories) ? (
                <Menu.Item disabled text="No results." />
              ) : (
                <Menu.Item disabled text={<Spinner small />} />
              )
            }
          />
        </CategoryFormGroup>
        <FormGroup
          labelInfo={this.getInputLabelInfo(Input.Notification)}
          helperText={this.renderHelperDashoardLink()}
          label="Live Notification"
          labelFor="notification"
          disabled
        >
          <InfoInput placeholder={`${channel.name} went live!`} value={notification} id="notification" disabled />
        </FormGroup>
        <UpdateButton
          onClick={this.onClickUpdate}
          text="Update informations"
          intent={Intent.PRIMARY}
          disabled={!isModified}
          loading={isUpdating}
          icon="floppy-disk"
        />
      </BroadcasterSection>
    )
  }

  /**
   * Renders the helper link to the Twitch dashboard.
   * @return Element to render.
   */
  private renderHelperDashoardLink() {
    return (
      <>
        This can only be updated on your{' '}
        <ExternalLink href="https://www.twitch.tv/dashboard">Twitch Dasboard</ExternalLink>.
      </>
    )
  }

  /**
   * Render a category suggestion input value.
   * @return Value to render.
   */
  private categoryValueRenderer = (category: RawCategory) => {
    return category.name
  }

  /**
   * Renders a category suggestion.
   * @return Element to render.
   */
  private categoryRenderer: ItemRenderer<RawCategory> = (category, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }

    return (
      <CategoryMenuItem
        labelElement={<img src={category.box_art_url} alt={`${category.name} cover`} />}
        disabled={modifiers.disabled}
        active={modifiers.active}
        onClick={handleClick}
        text={category.name}
        key={category.id}
      />
    )
  }

  /**
   * Triggered when the category query is modified.
   * @param query - The new query.
   */
  private onChangeCategoryQuery = async (query: string) => {
    if (query === this.lastCategoryQuery) {
      return
    }

    this.lastCategoryQuery = query

    this.setState(() => ({ categories: [] }))

    if (query.length > 0) {
      try {
        if (!_.isNil(this.lastCategorySearchController)) {
          this.lastCategorySearchController.abort()
          this.lastCategorySearchController = null
        }

        this.lastCategorySearchController = new AbortController()

        const categories = await Twitch.searchCategories(query, this.lastCategorySearchController.signal)

        this.lastCategorySearchController = null

        this.setState(() => ({ categories }))
      } catch {
        //
      }
    }
  }

  /**
   * Triggered when a category is selected.
   * @param category - The selected category.
   */
  private onSelectCategory = (category: RawCategory) => {
    this.setState(({ title }) => this.getModificationsState(title, category.name))
  }

  /**
   * Triggered when the update button is clicked.
   */
  private onClickUpdate = async () => {
    const { channelId } = this.props
    const { category, title } = this.state

    if (_.isNil(channelId) || _.isNil(title) || _.isNil(category)) {
      return
    }

    try {
      this.setState(() => ({ isUpdating: true }))

      const channel = await Twitch.updateChannel(channelId, title, category)

      this.setState(() => ({
        isModified: false,
        isUpdating: false,
        [Input.Category]: channel.game || '',
        [Input.Title]: channel.status || '',
      }))
    } catch {
      this.setState(() => ({ didFail: true, isUpdating: false }))
    }
  }

  /**
   * Triggered when the title is modified.
   * @param event - The associated event.
   */
  private onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.currentTarget.value

    this.setState(({ category }) => this.getModificationsState(title, category))
  }

  /**
   * Returns the label info for a specific input.
   */
  private getInputLabelInfo(input: keyof typeof InputMaxLengths) {
    const value = this.state[input] || ''
    const characters = InputMaxLengths[input] - value.length

    return `(${characters} ${pluralize('character', characters)} remaining)`
  }

  /**
   * Returns the state after modifying values.
   * @param  title - The stream title.
   * @param  category - The stream category.
   * @return The modified state.
   */
  private getModificationsState(title: string, category: string) {
    const sanitizedTitle = title.substring(0, InputMaxLengths[Input.Title])

    const { channel } = this.props
    const isModified = (!_.isNil(channel) && channel.status !== title) || (!_.isNil(channel) && channel.game !== category)

    return { isModified, [Input.Category]: category, [Input.Title]: sanitizedTitle }
  }
}
