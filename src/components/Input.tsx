import { Classes, Intent, IToastOptions, Position, Toast, Toaster } from '@blueprintjs/core'
import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import Key from 'Constants/key'
import Message from 'Constants/message'
import EmotePicker from 'Containers//EmotePicker'
import { Emote } from 'Libs/EmotesProvider'
import Twitch from 'Libs/Twitch'
import { endWithWhiteSpace, getWordAtPosition, startWithWhiteSpace } from 'Utils/string'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  background-color: ${color('chatInput.background')};
  border-top: 1px solid ${color('chatInput.border')};
  padding: 10px;
  position: relative;
`

/**
 * Toast component.
 */
const InputToast = styled(Toast)`
  &.${Classes.TOAST} {
    margin-bottom: 60px;
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
 * React State.
 */
const initialState = { toasts: [] as IToastOptions[], intent: '', lastKnownCursor: null as CursorPosition | null }
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
    const toasts: IToastOptions[] = []
    let intent = ''

    const { value } = nextProps
    const whisper = Twitch.parseWhisperCommand(value)

    if (!_.isNil(whisper)) {
      if (!_.isNil(nextProps.username) && nextProps.username === whisper.username.toLowerCase()) {
        toasts.push({
          icon: 'inbox',
          intent: Intent.DANGER,
          message: 'You cannot whisper yourself.',
        })

        intent = Classes.INTENT_DANGER
      } else {
        toasts.push({
          icon: 'inbox',
          intent: Intent.SUCCESS,
          message: "You're about to send a whisper.",
        })

        intent = Classes.INTENT_SUCCESS
      }
    } else if (Twitch.isMarkerCommand(value)) {
      toasts.push({
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: 'Markers can only be used on the Twitch website.',
      })

      intent = Classes.INTENT_DANGER
    } else if (value.length > Message.Max) {
      toasts.push({
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: 'Your message exceed the 500 characters limit.',
      })

      intent = Classes.INTENT_DANGER
    } else if (value.length > Message.Warning) {
      toasts.push({
        icon: 'hand',
        intent: Intent.WARNING,
        message: 'Your message exceed 400 characters. Try to avoid long messages.',
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
    const { disabled, value } = this.props
    const { intent, toasts } = this.state

    const classes = classnames(Classes.INPUT, Classes.FILL, Classes.LARGE, intent)

    return (
      <Wrapper>
        <Toaster position={Position.BOTTOM}>
          {_.map(toasts, (toast, index) => <InputToast key={index} {...toast} />)}
        </Toaster>
        <TextArea
          dir="auto"
          value={value}
          disabled={disabled}
          className={classes}
          innerRef={this.input}
          onBlur={this.onBlurInput}
          onChange={this.onChangeInputValue}
          onKeyDown={this.onKeyDownInputValue}
        />
        <EmotePicker onPick={this.onPickEmote} onCancel={this.onCancelEmote} />
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
      newValue = `${newValue}${!endWithWhiteSpace(newValue) && newValue.length !== 0 ? ' ' : ''}${emote.code} `

      this.newCursor = newValue.length + 1
    } else {
      const { selectionStart, selectionEnd } = lastKnownCursor

      const before = newValue.substring(0, selectionStart)
      const after = newValue.substring(selectionEnd)

      newValue = `${before}${!endWithWhiteSpace(before) && before.length !== 0 ? ' ' : ''}${emote.code}${
        !startWithWhiteSpace(after) ? ' ' : ''
      }${after}`

      this.newCursor = selectionStart + emote.code.length + 1

      const newSelectionStart = this.newCursor
      const newSelectionEnd = selectionEnd + emote.code.length + 1

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

          this.completions = this.props.getCompletions(word, previousCharacter === '@')
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
    } else if (event.key === Key.Escape && !_.isNil(this.splittedValueBeforeCompletion)) {
      // Restore the value as it was before auto-completing.
      this.props.onChange(this.splittedValueBeforeCompletion.join(''))
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
      const entry = this.props.getHistory(event.key === Key.Up)

      if (!_.isNil(entry)) {
        this.newCursor = entry.length

        this.props.onChange(entry)
      }
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

    return value.length > 0 && _.trim(value).length > 0 && value.length <= Message.Max && !Twitch.isMarkerCommand(value)
  }
}

/**
 * React Props.
 */
type Props = {
  disabled: boolean
  getCompletions: (word: string, excludeEmotes: boolean) => string[]
  getHistory: (previous?: boolean) => string | null
  onChange: (value: string) => void
  onSubmit: () => void
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
