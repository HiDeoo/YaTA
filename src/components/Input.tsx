import { Classes, Intent, IToastOptions, Position, ProgressBar, Toast, Toaster } from '@blueprintjs/core'
import clsx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import Key from 'constants/key'
import Message from 'constants/message'
import EmotePicker from 'containers//EmotePicker'
import Command from 'libs/Command'
import { Emote } from 'libs/EmotesProvider'
import type { SerializedMessage } from 'libs/Message'
import styled, { theme } from 'styled'
import { endWithWhiteSpace, getWordAtPosition, startWithWhiteSpace } from 'utils/string'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${theme('chatInput.background')};
  border-top: 1px solid ${theme('chatInput.border')};
  padding: 10px;
  position: relative;
`

/**
 * Toast component.
 */
const InputToast = styled(Toast)`
  &.${Classes.TOAST} {
    max-height: 40px;

    &:first-child {
      margin-bottom: 60px;
    }

    &,
    & > .${Classes.ICON}, & > .${Classes.TOAST_MESSAGE} {
      transition-duration: 75ms;
      transition-property: border-bottom-left-radius, border-bottom-right-radius, max-height, opacity, transform;
      transition-timing-function: ease-in-out;
    }

    & > .${Classes.ICON}, & > .${Classes.TOAST_MESSAGE} {
      transition-delay: 10ms;
      transition-duration: 50ms;
    }

    &.messageLengthWarning {
      max-width: unset;
      width: 565px;
    }

    &.messageLengthError {
      max-width: unset;
      width: 435px;
    }

    &.replyNotice {
      max-width: unset;

      & > .${Classes.TOAST_MESSAGE} {
        max-width: 50vw;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.hiddenToast {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      box-shadow: none;
      max-height: 4px;
      transform: translateY(9px);

      & > .${Classes.ICON}, & > .${Classes.TOAST_MESSAGE} {
        opacity: 0;
      }

      &.dismissableToast .${Classes.BUTTON_GROUP} {
        opacity: 0;
      }
    }

    &.dismissableToast .${Classes.BUTTON_GROUP} {
      display: initial;
    }
  }

  .${Classes.BUTTON_GROUP} {
    display: none;
  }
`

/**
 * TextArea component.
 */
const TextArea = styled.textarea`
  outline: none;
  resize: none;

  &.${Classes.INPUT}.${Classes.LARGE} {
    font-size: 13px;
    height: 50px;
    line-height: 20px;
    padding: 5px 42px 5px 10px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`

/**
 * UploadProgressBar component.
 */
const UploadProgressBar = styled(ProgressBar)`
  &.${Classes.PROGRESS_BAR} {
    bottom: 70px;
    left: -4px;
    position: fixed;
    width: 200vw;
  }
`

/**
 * React State.
 */
const initialState = {
  hideToasts: false,
  intent: '',
  lastKnownCursor: undefined as Optional<CursorPosition>,
  toasts: [] as ToastOptions[],
}
type State = Readonly<typeof initialState>

/**
 * Input Component.
 */
export default class Input extends React.Component<Props, State> {
  /**
   * Lifecycle: getDerivedStateFromProps.
   * @param  nextProps - The next props.
   * @return An object to update the state or `null` to update nothing.
   */
  public static getDerivedStateFromProps(nextProps: Props) {
    const toasts: ToastOptions[] = []
    let intent = ''

    const { replyReference, value } = nextProps
    const { username } = Command.parseWhisper(value)

    if (!_.isNil(username)) {
      if (!_.isNil(nextProps.username) && nextProps.username === username.toLowerCase()) {
        toasts.push({
          key: 'whisper_self',
          icon: 'inbox',
          intent: Intent.DANGER,
          message: 'You cannot whisper yourself.',
        })

        intent = Classes.INTENT_DANGER
      } else {
        toasts.push({
          key: 'whisper',
          hideable: true,
          icon: 'inbox',
          intent: Intent.SUCCESS,
          message: "You're about to send a whisper.",
        })

        intent = Classes.INTENT_SUCCESS
      }
    } else if (!_.isNil(replyReference)) {
      toasts.push({
        dismissable: true,
        key: 'reply',
        className: 'replyNotice',
        icon: 'inheritance',
        intent: Intent.SUCCESS,
        message: (
          <>
            Replying to @{replyReference.user.displayName}: <em>“{replyReference.text}”</em>
          </>
        ),
      })

      intent = Classes.INTENT_SUCCESS
    }

    if (value.length > Message.Max) {
      toasts.push({
        key: 'message_length_error',
        className: 'messageLengthError',
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: `Your message exceeds the ${Message.Max} characters limit.  (${value.length}/${Message.Max})`,
      })

      intent = Classes.INTENT_DANGER
    } else if (value.length > Message.Warning) {
      toasts.push({
        key: 'message_length_warning',
        className: 'messageLengthWarning',
        icon: 'hand',
        intent: Intent.WARNING,
        message: `Your message exceeds ${Message.Max} characters. Try to avoid long messages. (${value.length}/${Message.Max})`,
      })

      intent = Classes.INTENT_WARNING
    }

    return { intent, toasts }
  }

  public state: State = initialState
  private input = React.createRef<HTMLTextAreaElement>()
  private completions: string[] | null = null
  private completionIndex = -1
  private newCursor = null as number | null
  private splittedValueBeforeCompletion: string[] | null = null // [ 'before', 'word being auto-completed', 'after']
  private draft: string | null = null

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   */
  public componentDidUpdate(prevProps: Props) {
    requestAnimationFrame(() => {
      const { disabled: prevDisabled, value: prevValue } = prevProps
      const { disabled, value } = this.props

      if (prevDisabled !== disabled && !_.isNil(this.input.current)) {
        this.input.current.focus()
      }

      if (!_.isNil(this.newCursor) && prevValue !== value && !_.isNil(this.input.current)) {
        this.input.current.setSelectionRange(this.newCursor, this.newCursor)

        this.newCursor = null
      }
    })
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { cancelReply, disabled, isUploadingFile, value } = this.props
    const { hideToasts, intent, toasts } = this.state

    const inputDisabled = disabled || isUploadingFile

    const classes = clsx(Classes.INPUT, Classes.FILL, Classes.LARGE, intent)

    return (
      <Wrapper>
        <Toaster position={Position.BOTTOM} usePortal={false}>
          {_.map(toasts, (toast) => {
            const { className, dismissable, hideable, key, ...toastProps } = toast

            const onDismiss = key === 'reply' ? cancelReply : undefined
            const toastClasses = clsx(
              {
                hiddenToast: hideable && hideToasts,
                dismissableToast: dismissable,
              },
              className
            )

            return <InputToast key={key} {...toastProps} onDismiss={onDismiss} timeout={0} className={toastClasses} />
          })}
        </Toaster>
        {isUploadingFile && <UploadProgressBar intent={Intent.PRIMARY} />}
        <TextArea
          dir="auto"
          value={value}
          disabled={inputDisabled}
          className={classes}
          ref={this.input as any}
          onBlur={this.onBlurInput}
          onKeyUp={this.onKeyUpInputValue}
          onChange={this.onChangeInputValue}
          onKeyDown={this.onKeyDownInputValue}
        />
        <EmotePicker onPick={this.onPickEmote} onCancel={this.onCancelEmote} disabled={inputDisabled} />
      </Wrapper>
    )
  }

  /**
   * Focus the input field.
   */
  public focus() {
    if (!_.isNil(this.input.current)) {
      this.input.current.focus()
    }
  }

  /**
   * Triggered when the emote picker is closed without picking an emote.
   */
  private onCancelEmote = () => {
    this.focus()
  }

  /**
   * Triggered when an emote is picked.
   * @param emote - The picked emote.
   * @param withShiftKey - `true` if the Shift key was pressed when picking the emote.
   */
  private onPickEmote = (emote: Emote, withShiftKey: boolean) => {
    const { lastKnownCursor } = this.state
    const { value } = this.props

    let newValue = value

    if (_.isNil(lastKnownCursor)) {
      newValue = `${newValue}${!endWithWhiteSpace(newValue) && newValue.length !== 0 ? ' ' : ''}${emote.name} `

      this.newCursor = newValue.length + 1
    } else {
      const { selectionStart, selectionEnd } = lastKnownCursor

      const before = newValue.substring(0, selectionStart)
      const after = newValue.substring(selectionEnd)

      newValue = `${before}${!endWithWhiteSpace(before) && before.length !== 0 ? ' ' : ''}${emote.name}${
        !startWithWhiteSpace(after) ? ' ' : ''
      }${after}`

      this.newCursor = selectionStart + emote.name.length + 1

      const newSelectionStart = this.newCursor
      const newSelectionEnd = selectionEnd + emote.name.length + 1

      this.setState(() => ({ lastKnownCursor: { selectionStart: newSelectionStart, selectionEnd: newSelectionEnd } }))
    }

    if (!withShiftKey) {
      this.focus()
    }

    this.props.onChange(newValue)
  }

  /**
   * Triggered when the input lose focus.
   */
  private onBlurInput = () => {
    if (!_.isNil(this.input.current)) {
      const { selectionStart, selectionEnd } = this.input.current

      this.setState(() => ({ lastKnownCursor: { selectionStart, selectionEnd } }))
    }
  }

  /**
   * Triggered when a key is released in the input.
   * @param event - The associated event.
   */
  private onKeyUpInputValue = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === Key.Alt) {
      this.setState(() => ({ hideToasts: false }))
    }
  }

  /**
   * Triggered when a key is pressed down in the input.
   * @param event - The associated event.
   */
  private onKeyDownInputValue = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === Key.Tab) {
      event.preventDefault()

      if (!_.isNil(this.input.current)) {
        // Fetching completions only if needed.
        if (_.isNil(this.completions)) {
          const cursor = this.input.current.selectionStart
          const text = this.input.current.value

          const { word, end, start } = getWordAtPosition(text, cursor)

          if (word.length === 0) {
            return
          }

          this.splittedValueBeforeCompletion = [text.substring(0, start), word, text.substring(end)]

          const previousCharacter = this.splittedValueBeforeCompletion[0].slice(-1)

          this.completions = this.props.getCompletions(
            word,
            previousCharacter === '@' || Command.isUsernameCompletableCommandArgument(text, cursor),
            start === 1 && Command.isCommand(previousCharacter)
          )
        }

        // Only auto-complete if we have results.
        if (this.completions.length > 0 && !_.isNil(this.splittedValueBeforeCompletion)) {
          this.completionIndex += !event.shiftKey ? 1 : -1

          if (this.completionIndex >= this.completions.length) {
            this.completionIndex = 0
          } else if (this.completionIndex < 0) {
            this.completionIndex = this.completions.length - 1
          }

          const completion = this.completions[this.completionIndex]

          const before = this.splittedValueBeforeCompletion[0]
          let after = this.splittedValueBeforeCompletion[2]

          let cursorOffset = 0

          // Add an extra space so we can continue typing immediately after auto-completing.
          if (after.length === 0) {
            after = ' '
            cursorOffset += 1
          }

          const sentence = `${before}${completion}${after}`

          this.props.onChange(sentence)

          this.newCursor = before.length + completion.length + cursorOffset
        }
      }
    } else if (event.key === Key.Escape) {
      if (!_.isNil(this.splittedValueBeforeCompletion)) {
        // Restore the value as it was before auto-completing.
        this.props.onChange(this.splittedValueBeforeCompletion.join(''))
      } else if (!_.isNil(this.props.replyReference)) {
        this.props.cancelReply()
      }
    } else if (event.key !== Key.Shift) {
      this.completions = null
      this.completionIndex = -1
      this.splittedValueBeforeCompletion = null
    }

    if (event.key === Key.Enter && event.keyCode !== 229) {
      event.preventDefault()

      if (!this.validateInputValue()) {
        return
      }

      this.props.onSubmit()
    } else if (event.key === Key.Up || event.key === Key.Down) {
      const { atStart, entry } = this.props.getHistory(event.key === Key.Up)

      if (!_.isNil(entry)) {
        if (_.isNil(this.draft)) {
          this.draft = this.props.value
        }

        this.newCursor = entry.length

        this.props.onChange(entry)
      } else {
        if (atStart && !_.isNil(this.draft)) {
          this.newCursor = this.draft.length

          this.props.onChange(this.draft)

          this.draft = null
        }
      }
    } else if (event.key === Key.Alt) {
      this.setState(() => ({ hideToasts: true }))
    }
  }

  /**
   * Triggered when the input is modified.
   * @param event - The associated event.
   */
  private onChangeInputValue = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(event.currentTarget.value)
  }

  /**
   * Validates the input value to determine if the message can be sent or not.
   */
  private validateInputValue() {
    const { value } = this.props

    return value.length > 0 && _.trim(value).length > 0 && value.length <= Message.Max
  }
}

/**
 * React Props.
 */
interface Props {
  cancelReply: () => void
  disabled: boolean
  getCompletions: (word: string, excludeEmotes: boolean, isCommand: boolean) => string[]
  getHistory: (previous?: boolean) => { entry: string | null; atStart: boolean }
  isUploadingFile: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  replyReference?: SerializedMessage
  username?: string
  value: string
}

/**
 * Cursor position.
 */
type CursorPosition = {
  selectionEnd: number
  selectionStart: number
}

/**
 * Input toast options.
 */
type ToastOptions = IToastOptions & { hideable?: boolean; className?: string; dismissable?: boolean }
