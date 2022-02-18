import { Colors, Icon, MenuItem } from '@blueprintjs/core'
import { ItemPredicate, ItemRenderer, Omnibar } from '@blueprintjs/select'
import _ from 'lodash'
import { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

import { ToggleableProps } from 'constants/toggleable'
import Twitch, { RawStream } from 'libs/Twitch'

/**
 * Omnibar for online streams.
 */
const StreamsOmnibar = Omnibar.ofType<RawStream>()

/**
 * React State.
 */
const initialState = { streams: [] as RawStream[], isReady: false }
type State = Readonly<typeof initialState>

/**
 * StreamOmnibar Component.
 */
class StreamOmnibar extends Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      try {
        const { online, own } = await Twitch.fetchStreams()

        const streams = !_.isNil(own) ? [own, ...online] : [...online]

        this.setState(() => ({ streams, isReady: true }))
      } catch {
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
      <StreamsOmnibar
        initialContent={this.renderInitialContent()}
        onItemSelect={this.onSelectStream}
        noResults={this.renderNoResults()}
        itemPredicate={this.itemPredicate}
        itemRenderer={this.itemRenderer}
        onClose={this.props.toggle}
        items={this.state.streams}
        isOpen={visible}
        resetOnSelect
      />
    )
  }

  /**
   * Renders a stream.
   * @param  stream - The stream to render.
   * @param  itemProps - The props to pass along to the stream.
   * @return Element to render.
   */
  private itemRenderer: ItemRenderer<RawStream> = (stream, { handleClick, modifiers }) => {
    const title = this.getStreamTitle(stream)
    const label = Twitch.isStream(stream) ? <Icon icon="record" color={Colors.RED3} /> : undefined

    return (
      <MenuItem
        disabled={modifiers.disabled}
        active={modifiers.active}
        onClick={handleClick}
        labelElement={label}
        key={stream.id}
        text={title}
      />
    )
  }

  /**
   * Renders the initial content.
   * @return Element to render.
   */
  private renderInitialContent() {
    return this.state.isReady ? null : <MenuItem disabled text="Loading…" />
  }

  /**
   * Renders a query without results.
   * @return Element to render.
   */
  private renderNoResults() {
    return <MenuItem disabled text="No matches found…" />
  }

  /**
   * Filters streams.
   * @param  query - The filter query.
   * @param  stream - The stream to test.
   * @return `true` when the query matches the stream.
   */
  private itemPredicate: ItemPredicate<RawStream> = (query, stream) => {
    return this.getStreamTitle(stream).toLowerCase().includes(query.toLowerCase())
  }

  /**
   * Triggered when a stream is selected.
   * @param stream - The selected stream.
   */
  private onSelectStream = (stream: RawStream) => {
    this.props.toggle()

    this.props.history.push(`/${stream.user_login}`)
  }

  /**
   * Returns the title of a stream depending on if it's a channel or a stream.
   * @param  stream - The stream.
   * @return The title.
   */
  private getStreamTitle(stream: RawStream) {
    return stream.user_name
  }
}

/**
 * React Props.
 */
type Props = RouteComponentProps<{}> & ToggleableProps

export default withRouter(StreamOmnibar)
