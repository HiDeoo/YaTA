import { Classes, Colors, InputGroup } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer'
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized/dist/es/CellMeasurer'
import { List, ListRowRenderer } from 'react-virtualized/dist/es/List'

import NonIdealState from 'components/NonIdealState'
import { CommandName, CommandNames } from 'constants/command'
import { ToggleableProps } from 'constants/toggleable'
import Dialog from 'containers/Dialog'
import Command from 'libs/Command'
import styled, { ThemeProps, withTheme } from 'styled'

/**
 * Content component.
 */
const Content = styled.div`
  height: 50vh;
  margin-bottom: 33px;
`

/**
 * Search component.
 */
const Search = styled(InputGroup)`
  margin: 10px;
  margin-bottom: 12px;
  width: calc(100% - 20px);
`

/**
 * CommandWrapper component.
 */
const Wrapper = styled.div`
  border-bottom: 1px solid ${Colors.LIGHT_GRAY2};
  font-size: 0.85rem;
  padding: 9px 14px;

  .${Classes.DARK} & {
    border-color: ${Colors.DARK_GRAY2};
  }

  &:first-of-type {
    padding-top: 0;
  }

  &:last-of-type {
    border-bottom: none;
  }
`

/**
 * Usage component.
 */
const Usage = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
`

/**
 * Description component.
 */
const Description = styled.div`
  color: ${Colors.DARK_GRAY3};
  font-size: 0.82rem;
  line-height: 1.2rem;

  .${Classes.DARK} & {
    color: ${Colors.LIGHT_GRAY1};
  }
`

/**
 * React State.
 */
const initialState = { filter: '', filteredCommands: undefined as Optional<CommandName[]> }
type State = Readonly<typeof initialState>

/**
 * CommandsHelp Component.
 */
class CommandsHelp extends React.Component<Props, State> {
  public state: State = initialState
  private commandMeasureCache: CellMeasurerCache

  /**
   * Creates a new instance of the component.
   * @class
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.commandMeasureCache = new CellMeasurerCache({
      defaultHeight: props.theme.log.minHeight,
      fixedWidth: true,
      keyMapper: (index) => this.getRowsToRender()[index],
      minHeight: props.theme.log.minHeight,
    })
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props

    return (
      <Dialog isOpen={visible} onClose={this.toggle} icon="console" title="Commands">
        <Content>
          <Search
            onChange={this.onChangeFilter}
            value={this.state.filter}
            placeholder="Filter…"
            leftIcon="search"
            type="search"
            autoFocus
          />
          <AutoSizer onResize={this.onResize}>
            {({ height, width }) => (
              <List
                rowHeight={this.commandMeasureCache.rowHeight}
                rowCount={_.size(this.getRowsToRender())}
                noRowsRenderer={this.noRowsRenderer}
                rowRenderer={this.rowRenderer}
                filter={this.state.filter}
                overscanRowCount={10}
                height={height}
                width={width}
              />
            )}
          </AutoSizer>
        </Content>
      </Dialog>
    )
  }

  /**
   * Render a command.
   * @param  listRowProps - The props to add to the row being rendered.
   * @return Element to render.
   */
  private rowRenderer: ListRowRenderer = ({ index, key, parent, style }) => {
    const rows = this.getRowsToRender()
    const descriptor = Command.getDescriptor(rows[index])

    return (
      <CellMeasurer cache={this.commandMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        <Wrapper style={style}>
          <Usage>{Command.getUsage(descriptor)}</Usage>
          <Description>{descriptor.description}</Description>
        </Wrapper>
      </CellMeasurer>
    )
  }

  /**
   * Renders an empty filtered list.
   * @return Element to render.
   */
  private noRowsRenderer = () => <NonIdealState title="No result!" details="Please try again with a new query." />

  /**
   * Triggered when toggling the modal.
   */
  private toggle = () => {
    this.setState(initialState)

    this.props.toggle()
  }

  /**
   * Clears the measures cache when resizing the window.
   */
  private onResize = () => {
    this.commandMeasureCache.clearAll()
  }

  /**
   * Returns the rows to render based on if we're filtering or not the results.
   * @return The rows to render.
   */
  private getRowsToRender() {
    const { filter, filteredCommands } = this.state

    return filter.length > 0 && !_.isNil(filteredCommands) ? filteredCommands : CommandNames
  }

  /**
   * Triggered when the filter input is modified.
   * @param event - The associated event.
   */
  private onChangeFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const filter = event.currentTarget.value

    let filteredCommands: Optional<CommandName[]>

    if (filter.length > 0) {
      const sanitizedFilter = filter.toLowerCase()

      filteredCommands = _.filter(CommandNames, (commandName) => {
        const descriptor = Command.getDescriptor(commandName)

        return (
          descriptor.name.includes(sanitizedFilter) ||
          descriptor.description.toLowerCase().includes(sanitizedFilter) ||
          _.size(_.filter(descriptor.arguments, (argument) => argument.name.toLowerCase().includes(sanitizedFilter))) >
            0
        )
      }) as CommandName[]
    }

    this.commandMeasureCache.clearAll()
    this.setState(() => ({ filter, filteredCommands }))
  }
}

/**
 * React Props.
 */
interface Props extends ThemeProps, ToggleableProps {}

export default withTheme(CommandsHelp)
