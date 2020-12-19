import { Classes } from '@blueprintjs/core'
import { Component } from 'react'

import { IView } from 'components/ViewStack'

/**
 * View Component.
 * @see ViewStack
 */
export default class View extends Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { onPush, view } = this.props

    return (
      <div className={Classes.PANEL_STACK_VIEW}>
        <view.component pushView={onPush} popView={this.onPop} {...view.props} />
      </div>
    )
  }

  /**
   * Triggered when the current view is popped.
   */
  private onPop = () => this.props.onPop(this.props.view)
}

/**
 * React Props.
 */
interface Props {
  onPop: (view: IView) => void
  onPush: <P>(view: IView<P>) => void
  view: IView
  previousView?: IView
}
