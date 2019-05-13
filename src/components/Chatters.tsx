import { InputGroup } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer'
import { List, ListRowRenderer } from 'react-virtualized/dist/es/List'

import ExternalLink from 'Components/ExternalLink'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import { ToggleableProps } from 'Constants/toggleable'
import Dialog from 'Containers/Dialog'
import Twitch, { RawChatters } from 'Libs/Twitch'
import styled, { theme, ThemeProps, withTheme } from 'Styled'

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
const Group = styled.div`
  color: ${theme('chattersList.typeColor')};
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
 * Row types.
 */
enum RowType {
  Chatter,
  Group,
  Separator,
}

/**
 * Group order used when rendering chatters.
 */
const GroupOrder: Array<keyof RawChatters> = [
  'broadcaster',
  'staff',
  'global_mods',
  'admins',
  'moderators',
  'vips',
  'viewers',
]

/**
 * React State.
 */
const initialState = {
  chatters: undefined as Optional<ChattersRows>,
  count: undefined as Optional<number>,
  didFail: false,
  filter: '',
  filteredChatters: undefined as Optional<ChattersRows>,
}
type State = Readonly<typeof initialState>

/**
 * Chatters Component.
 */
class Chatters extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public async componentDidUpdate(prevProps: Props) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        try {
          const response = await Twitch.fetchChatters(this.props.channel)

          const chatters = this.parseChatters(response.chatters)

          this.setState(() => ({ didFail: false, count: response.chatter_count, chatters }))
        } catch {
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
      content = <NonIdealState retry />
    } else if (!_.isNil(count) && count === 0) {
      content = <NonIdealState title="Looks like you're alone!" retry />
    } else if (!_.isNil(count)) {
      content = this.renderList()
    } else {
      content = <Spinner />
    }

    const title = `Chatters List${!_.isNil(count) ? ` - ${count.toLocaleString()}` : ''}`

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
    const { filter } = this.state

    const rows = this.getRowsToRender()

    return (
      <>
        <Search placeholder="Filter…" type="search" leftIcon="search" value={filter} onChange={this.onChangeFilter} />
        <AutoSizer>
          {({ height, width }) => (
            <List
              rowHeight={this.props.theme.chattersList.height}
              noRowsRenderer={this.noRowsRenderer}
              rowRenderer={this.rowRenderer}
              rowCount={rows.length}
              overscanRowCount={5}
              height={height}
              width={width}
            />
          )}
        </AutoSizer>
      </>
    )
  }

  /**
   * Render a row.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private rowRenderer: ListRowRenderer = ({ index, key, style }) => {
    const rows = this.getRowsToRender()

    const chatter = rows[index]
    const props = { key, style }

    if (chatter.type === RowType.Chatter) {
      return (
        <Chatter {...props}>
          <ExternalLink href={`https://www.twitch.tv/${chatter.name}`}>{chatter.name}</ExternalLink>
        </Chatter>
      )
    } else if (chatter.type === RowType.Separator) {
      return <div {...props} />
    }

    return <Group {...props}>{chatter.name}</Group>
  }

  /**
   * Renders an empty filtered list.
   * @return Element to render.
   */
  private noRowsRenderer = () => <NonIdealState title="No result!" details="Please try again with a new query." />

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    let filteredChatters: Optional<ChattersRows>

    const { chatters } = this.state

    if (!_.isNil(chatters) && filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredChatters = _.filter(chatters, (chatter) => {
        return chatter.type === RowType.Chatter && chatter.name.includes(sanitizedFilter)
      })

      if (filteredChatters.length > 0) {
        filteredChatters.unshift(this.createRow(RowType.Separator))
      }
    }

    this.setState(() => ({ filter, filteredChatters }))
  }

  /**
   * Returns the rows to render based on if we're filtering or not the results.
   * @return The rows to render.
   */
  private getRowsToRender() {
    const { chatters, filter, filteredChatters } = this.state

    return filter.length > 0 && !_.isNil(filteredChatters) ? filteredChatters : chatters || []
  }

  /**
   * Parses chatters into actual rows to render.
   * @param  chatters - The chatters
   * @return The rows to render.
   */
  private parseChatters(chatters: RawChatters) {
    let rows: ChattersRows = []

    _.forEach(GroupOrder, (group) => {
      const groupChatters = chatters[group]

      if (groupChatters.length > 0) {
        rows.push(this.createRow(RowType.Separator))
        rows.push(this.createRow(RowType.Group, this.sanitizeGroup(group)))

        rows = _.concat(rows, _.map(groupChatters, (chatter) => this.createRow(RowType.Chatter, chatter)))
      }
    })

    return rows
  }

  /**
   * Creates a row based on its type.
   * @param  type - The type of the row.
   * @param  [name] - The name of the row if needed.
   * @return The row.
   */
  private createRow(type: RowType.Separator): SeparatorRow
  private createRow(type: RowType.Group, name: string): GroupRow
  private createRow(type: RowType.Chatter, name: string): ChatterRow
  private createRow(type: RowType, name?: string) {
    if (type === RowType.Separator) {
      return { type: RowType.Separator }
    }

    return { type, name }
  }

  /**
   * Sanitizes a chatter group.
   * @param  group - The group to sanitize.
   * @return The sanitized group.
   */
  private sanitizeGroup(group: string) {
    return _.replace(group, '_', ' ').toUpperCase()
  }
}

export default withTheme(Chatters)

/**
 * React Props.
 */
interface Props extends ToggleableProps, ThemeProps {
  channel: string
}

/**
 * Chatters, groups & separators.
 */
type ChatterRow = { type: RowType.Chatter; name: string }
type GroupRow = { type: RowType.Group; name: string }
type SeparatorRow = { type: RowType.Separator }
type ChattersRows = Array<ChatterRow | GroupRow | SeparatorRow>
