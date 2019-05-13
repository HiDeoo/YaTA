import { Button, Classes, H4, IconName, Tooltip } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'

import SettingsViewPicker from 'Components/SettingsViewPicker'
import ViewStack, { IView } from 'Components/ViewStack'
import { ToggleableProps } from 'Constants/toggleable'
import Dialog from 'Containers/Dialog'
import styled, { size } from 'Styled'

import SettingsAbout from 'Components/SettingsAbout'
import SettingsActions from 'Containers/SettingsActions'
import SettingsBackup from 'Containers/SettingsBackup'
import SettingsChangelog from 'Containers/SettingsChangelog'
import SettingsGeneral from 'Containers/SettingsGeneral'
import SettingsHighlights from 'Containers/SettingsHighlights'
import SettingsNotifications from 'Containers/SettingsNotifications'
import SettingsShortcuts from 'Containers/SettingsShortcuts'
import SettingsStreamer from 'Containers/SettingsStreamer'

/**
 * SettingsDialog component.
 */
const SettingsDialog = styled(Dialog)`
  height: ${size('settings.height')};

  &.${Classes.DIALOG} {
    padding-bottom: 0;
  }

  .${Classes.DIALOG_HEADER} .${Classes.HEADING}:last-child {
    margin-right: 0;
  }

  .${Classes.DIALOG_HEADER} > .${Classes.ICON} {
    opacity: 0.6;
  }
`

/**
 * SettingsStack component.
 */
const SettingsStack = styled(ViewStack)`
  height: 100%;
  width: 100%;

  & .${Classes.PANEL_STACK_VIEW}, .${Classes.DARK} & .${Classes.PANEL_STACK_VIEW} {
    background-color: transparent;
  }
`

/**
 * TitleWrapper component.
 */
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`

/**
 * BackButton component.
 */
const BackButton = styled(Button)`
  .${Classes.DIALOG_HEADER} & + .${Classes.HEADING} {
    margin-right: 50px;

    &:last-child {
      margin-right: 50px;
    }
  }
`

/**
 * Title component.
 */
const Title = styled(H4)`
  text-align: center;
`

/**
 * Settings view names.
 */
export enum SettingsViewName {
  General = 'General',
  Highlights = 'Highlights',
  Actions = 'Actions',
  Shortcuts = 'Shortcuts',
  Notifications = 'Notifications',
  Streamer = 'Streamer',
  Backup = 'Backup',
  Changelog = 'Changelog',
  About = 'About',
}

/**
 * Settings views.
 */
export const SettingsViews: SettingsView[] = [
  { name: SettingsViewName.General, icon: 'application', component: SettingsGeneral },
  { name: SettingsViewName.Highlights, icon: 'highlight', component: SettingsHighlights },
  { name: SettingsViewName.Actions, icon: 'pulse', component: SettingsActions },
  { name: SettingsViewName.Shortcuts, icon: 'key-command', component: SettingsShortcuts },
  { name: SettingsViewName.Notifications, icon: 'notifications', component: SettingsNotifications },
  { name: SettingsViewName.Streamer, icon: 'shield', component: SettingsStreamer },
  { name: SettingsViewName.Backup, icon: 'floppy-disk', component: SettingsBackup },
  { name: SettingsViewName.Changelog, icon: 'layers', component: SettingsChangelog },
  { name: SettingsViewName.About, icon: 'id-number', component: SettingsAbout },
]

/**
 * React State.
 */
const initialState = { view: undefined as Optional<IView> }
type State = Readonly<typeof initialState>

/**
 * Settings Component.
 */
export default class Settings extends React.Component<Props, State> {
  public state: State = initialState
  private viewStack = React.createRef<ViewStack>()

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { visible } = this.props

    const initialView = this.getInitialView()

    return (
      <SettingsDialog
        icon={this.getDialogIcon(initialView)}
        title={this.renderTitle(initialView)}
        onClose={this.onCloseDialog}
        isCloseButtonShown={false}
        isOpen={visible}
      >
        <SettingsStack initialView={initialView} ref={this.viewStack} onPush={this.onViewPush} onPop={this.onViewPop} />
      </SettingsDialog>
    )
  }

  /**
   * Renders the dialog title.
   * @param  initialView - The intiial view of the stack.
   * @return Element to render.
   */
  private renderTitle(initialView: IView<{}>) {
    return (
      <TitleWrapper>
        {!_.isNil(this.state.view) && (
          <Tooltip content="All settings">
            <BackButton icon="chevron-left" minimal onClick={this.popCurrentView} />
          </Tooltip>
        )}
        <Title>{initialView.title}</Title>
        <Tooltip content="Report bug">
          <Button icon="issue" minimal onClick={this.props.reportBug} />
        </Tooltip>
        <Tooltip content="Close">
          <Button icon="cross" minimal onClick={this.onCloseDialog} />
        </Tooltip>
      </TitleWrapper>
    )
  }

  /**
   * Returns the initial view.
   * @return The initial view.
   */
  private getInitialView(): IView<{}> {
    const { defaultView } = this.props

    const defaultInitialView: IView<{}> = {
      component: SettingsViewPicker,
      icon: 'cog',
      title: 'Settings',
    }

    if (_.isNil(defaultView)) {
      return defaultInitialView
    }

    const view = _.find(SettingsViews, ['name', defaultView])

    if (_.isNil(view)) {
      return defaultInitialView
    }

    return {
      component: view.component,
      icon: view.icon,
      title: view.name,
    }
  }

  /**
   * Returns the dialog icon.
   * @param  initialView - The intiial view of the stack.
   * @return The icon.
   */
  private getDialogIcon(initialView: IView<{}>) {
    const { view } = this.state

    if (!_.isNil(view)) {
      return view.icon
    }

    return initialView.icon
  }

  /**
   * Pops the current view.
   */
  private popCurrentView = () => {
    const { view } = this.state

    if (!_.isNil(view) && !_.isNil(this.viewStack.current)) {
      this.viewStack.current.popView(view)
    }
  }

  /**
   * Triggered when a view is popped.
   */
  private onViewPop = () => {
    this.setState(() => ({ view: undefined }))
  }

  /**
   * Triggered when a view is pushed.
   * @param view - The new view.
   */
  private onViewPush = (view: IView) => {
    this.setState(() => ({ view }))
  }

  /**
   * Triggered when the dialog is closed.
   */
  private onCloseDialog = () => {
    this.setState(initialState)

    this.props.toggle()
  }
}

/**
 * React Props.
 */
interface Props extends ToggleableProps {
  defaultView?: SettingsViewName
  reportBug: () => void
}

/**
 * Settings view definition.
 */
export type SettingsView = {
  component: React.ComponentType<any>
  icon: IconName
  name: SettingsViewName
}
