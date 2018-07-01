import { Dialog, InputGroup, Spinner } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer, List, ListRowRenderer } from 'react-virtualized'
import styled from 'styled-components'

import Center from 'Components/Center'
import Shrug from 'Components/Shrug'
import Twitch, { Chatters } from 'Libs/Twitch'
import base from 'Styled/base'
import { color } from 'Utils/styled'

/**
 * Content component.
 */
const Content = styled.div`
  height: 80vh;
  margin-bottom: 30px;
`

/**
 * Chatter component.
 */
const Chatter = styled.div`
  font-size: 0.8rem;
  padding-left: 15px;
`

/**
 * Type component.
 */
const Type = styled.div`
  color: ${color('chattersList.typeColor')};
  font-weight: bold;
  padding-left: 15px;
`

/**
 * Search component.
 */
const Search = styled(InputGroup)`
  margin: 10px;
  width: calc(100% - 20px);
`

/**
 * Type order used when rendering chatters.
 */
const TypeOrder: Array<keyof Chatters> = ['staff', 'global_mods', 'admins', 'moderators', 'viewers']

/**
 * React State.
 */
const initialState = {
  chatters: null as TypesAndChatters | null,
  count: null as number | null,
  didFail: false,
  filter: '',
  filteredChatters: null as TypesAndChatters | null,
}
type State = Readonly<typeof initialState>

/**
 * ChattersList Component.
 */
export default class ChattersList extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   * @param prevState - The previous state.
   */
  public async componentDidUpdate(prevProps: Props) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        try {
          const response = await Twitch.fetchChatters(this.props.channel)

          let chatters: TypesAndChatters = []

          _.forEach(TypeOrder, (type) => {
            const typeChatters = response.chatters[type]

            if (typeChatters.length > 0) {
              chatters.push('')
              chatters.push({ type: this.sanitizeType(type) })
              chatters = _.concat(chatters, typeChatters)
            }
          })

          this.setState(() => ({ didFail: false, count: response.chatter_count, chatters }))
        } catch (error) {
          this.setState(() => ({ didFail: true }))
        }
      } else {
        this.setState(initialState)
      }
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { toggle, visible } = this.props
    const { count, didFail } = this.state

    let content: JSX.Element

    if (didFail) {
      content = this.renderError()
    } else if (!_.isNil(count) && count === 0) {
      content = this.renderEmpty()
    } else if (!_.isNil(count)) {
      content = this.renderList()
    } else {
      content = this.renderFetching()
    }

    const title = `Chatters List${!_.isNil(count) ? ` - ${count}` : ''}`

    return (
      <Dialog isOpen={visible} onClose={toggle} icon="people" title={title}>
        <Content>{content}</Content>
      </Dialog>
    )
  }

  /**
   * Renders the chatters list.
   * @return Element to render.
   */
  private renderList() {
    const { chatters, filter, filteredChatters } = this.state

    const rows = filter.length > 0 ? filteredChatters : chatters

    return (
      <>
        <Search placeholder="Filter…" type="search" leftIcon="search" value={filter} onChange={this.onChangeFilter} />
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              noRowsRenderer={this.noRowRender}
              overscanRowCount={5}
              rowCount={rows!.length}
              rowHeight={base.chattersList.height}
              rowRenderer={this.chatterRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </>
    )
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    let filteredChatters: TypesAndChatters | null = null

    const { chatters } = this.state

    if (!_.isNil(chatters) && filter.length > 0) {
      filteredChatters = _.filter(chatters, (chatter) => {
        return _.isString(chatter) && chatter.length > 0 && chatter.includes(filter)
      })

      if (filteredChatters.length > 0) {
        filteredChatters.unshift('')
      }
    }

    this.setState(() => ({ filter, filteredChatters }))
  }

  /**
   * Render a chatter.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private chatterRenderer: ListRowRenderer = ({ index, key, style }) => {
    const { chatters, filter, filteredChatters } = this.state

    const rows = filter.length > 0 ? filteredChatters : chatters

    const chatter = rows![index]

    if (_.isString(chatter)) {
      return (
        <Chatter key={key} style={style}>
          <a href={`https://www.twitch.tv/${chatter}`} target="_blank">
            {chatter}
          </a>
        </Chatter>
      )
    }

    return (
      <Type key={key} style={style}>
        {chatter.type}
      </Type>
    )
  }

  /**
   * Renders an empty filtered list.
   * @return Element to render.
   */
  private noRowRender = () => {
    return (
      <Center>
        <Shrug />
        <h1>No result!</h1>
        <p>Please try again with a new query.</p>
      </Center>
    )
  }

  /**
   * Renders an error when fetching the chatters list.
   * @return Element to render.
   */
  private renderError() {
    return (
      <Center>
        <Shrug />
        <h1>Something went wrong!</h1>
        <p>Please try again in a few minutes.</p>
      </Center>
    )
  }

  /**
   * Renders an empty chatters list.
   * @return Element to render.
   */
  private renderEmpty() {
    return (
      <Center>
        <Shrug />
        <h1>Looks like you're alone!</h1>
        <p>Maybe try again in a few minutes.</p>
      </Center>
    )
  }

  /**
   * Renders loading the chatters list.
   * @return Element to render.
   */
  private renderFetching() {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  /**
   * Sanitizes a user type.
   * @param  type - The type to sanitize.
   * @return The sanitized type.
   */
  private sanitizeType(type: string) {
    return _.replace(type, '_', ' ').toUpperCase()
  }
}

/**
 * React Props.
 */
type Props = {
  channel: string
  toggle: () => void
  visible: boolean
}

/**
 * Types and chatters.
 */
type TypesAndChatters = Array<string | { type: string }>
