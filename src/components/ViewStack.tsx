import { Classes, IconName, IProps } from '@blueprintjs/core'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import View from 'Components/View'

/**
 * React State.
 */
const initialState = { direction: 'push' as 'push' | 'pop', stack: [] as IView[] }
type State = Readonly<typeof initialState>

/**
 * ViewStack Component.
 */
export default class ViewStack extends React.Component<Props, State> {
  public state: State = initialState

  /**
   * Creates a new instance of the component.
   * @class
   * @param props - The props of the component.
   */
  constructor(props: Props) {
    super(props)

    this.state = {
      ...initialState,
      stack: [props.initialView],
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const classes = classnames(
      Classes.PANEL_STACK,
      `${Classes.PANEL_STACK}-${this.state.direction}`,
      this.props.className
    )

    return (
      <TransitionGroup className={classes} component="div">
        {this.renderCurrentView()}
      </TransitionGroup>
    )
  }

  /**
   * Pops a view out of the stack.
   * @param view - The view to pop.
   */
  public popView: PopViewAction = (view) => {
    const { stack } = this.state

    if (stack[0] !== view || stack.length <= 1) {
      return
    }

    const { onPop } = this.props

    if (!_.isNil(onPop)) {
      onPop(view)
    }

    this.setState((state) => ({
      direction: 'pop',
      stack: state.stack.filter((v) => v !== view),
    }))
  }

  /**
   * Renders the current view.
   * @return Element to render.
   */
  private renderCurrentView() {
    const { stack } = this.state

    if (stack.length === 0) {
      return
    }

    const [activeView, previousView] = stack

    return (
      <CSSTransition classNames={Classes.PANEL_STACK} key={stack.length} timeout={400}>
        <View previousView={previousView} onPop={this.popView} onPush={this.pushView} view={activeView} />
      </CSSTransition>
    )
  }

  /**
   * Pushes a view to the stack.
   * @param view - The view to push.
   */
  private pushView = (view: IView<any>) => {
    const { onPush } = this.props

    if (!_.isNil(onPush)) {
      onPush(view)
    }

    this.setState((state) => ({
      direction: 'push',
      stack: [view, ...state.stack],
    }))
  }
}

/**
 * React Props.
 */
interface Props extends IProps {
  initialView: IView
  onPop?: (view: IView) => void
  onPush?: (view: IView) => void
  onReady?: PopViewAction
}

/**
 * A view part of a `ViewStack`
 */
export interface IView<P = {}> {
  component: React.ComponentType<P & IViewProps>
  icon?: IconName
  props?: P
  title?: React.ReactNode
}

/**
 * Props added to each view.
 */
export interface IViewProps {
  popView(): void
  pushView<P>(view: IView<P>): void
}

/**
 * View popping action.
 */
export type PopViewAction = (view: IView) => void
