import { Colors, Icon, Menu } from '@blueprintjs/core'
import { ItemPredicate, ItemRenderer, Omnibar } from '@blueprintjs/select'
import * as _ from 'lodash'
import * as React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

import Twitch, { RawFollow } from 'Libs/Twitch'

/**
 * Omnibar for either online streams or offline follows.
 */
const StreamsAndFollowsOmnibar = Omnibar.ofType<RawFollow>()

/**
 * React State.
 */
const initialState = { follows: [] as RawFollow[], ready: false }
type State = Readonly<typeof initialState>

/**
 * FollowOmnibar Component.
 */
class FollowOmnibar extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      try {
        const follows = await Twitch.fetchFollows()

        this.setState(() => ({ follows, ready: true }))
      } catch (error) {
        this.props.toggle()
      }
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props

    return (
      <StreamsAndFollowsOmnibar
        initialContent={this.renderInitialContent()}
        onItemSelect={this.onSelectFollow}
        noResults={this.renderNoResults()}
        itemPredicate={this.itemPredicate}
        itemRenderer={this.itemRenderer}
        onClose={this.props.toggle}
        items={this.state.follows}
        isOpen={visible}
        resetOnSelect
      />
    )
  }

  /**
   * Renders a follow.
   * @param  follow - The follow to render.
   * @param  itemProps - The props to pass along to the follow.
   * @return Element to render.
   */
  private itemRenderer: ItemRenderer<RawFollow> = (follow, { handleClick, modifiers }) => {
    const title = this.getFollowTitle(follow)
    const label = Twitch.isStream(follow) ? <Icon icon="record" color={Colors.RED3} /> : undefined

    return (
      <Menu.Item
        disabled={modifiers.disabled}
        active={modifiers.active}
        onClick={handleClick}
        labelElement={label}
        key={follow._id}
        text={title}
      />
    )
  }

  /**
   * Renders the initial content.
   * @return Element to render.
   */
  private renderInitialContent() {
    return this.state.ready ? null : <Menu.Item disabled text="Loading…" />
  }

  /**
   * Renders a query without results.
   * @return Element to render.
   */
  private renderNoResults() {
    return <Menu.Item disabled text="No matches found…" />
  }

  /**
   * Filters follows.
   * @param  query - The filter query.
   * @param  follow - The follow to test.
   * @return `true` when the query matches the follow.
   */
  private itemPredicate: ItemPredicate<RawFollow> = (query, follow) => {
    return this.getFollowTitle(follow)
      .toLowerCase()
      .includes(query.toLowerCase())
  }

  /**
   * Triggered when a follow is selected.
   * @param follow - The selected follow.
   */
  private onSelectFollow = (follow: RawFollow) => {
    this.props.toggle()

    this.props.history.push(`/${Twitch.isStream(follow) ? follow.channel.name : follow.name}`)
  }

  /**
   * Returns the title of a follow depending on if it's a channel or a stream.
   * @param  follow - The follow.
   * @return The title.
   */
  private getFollowTitle(follow: RawFollow) {
    return Twitch.isStream(follow) ? follow.channel.display_name : follow.display_name
  }
}

/**
 * React Props.
 */
interface Props extends RouteComponentProps<{}> {
  toggle: () => void
  visible: boolean
}

export default withRouter(FollowOmnibar)
