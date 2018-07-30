import {
  Button,
  Checkbox,
  Classes,
  Colors,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  TextArea,
} from '@blueprintjs/core'
import * as copy from 'copy-to-clipboard'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import FlexLayout from 'Components/FlexLayout'
import Key from 'Constants/key'
import StrawPoll, { StrawPollDuplicationStrategy } from 'Libs/StrawPoll'
import Toaster from 'Libs/Toaster'

/**
 * Options component.
 */
const Options = styled(TextArea)`
  resize: none;
  width: 100%;

  &.${Classes.INPUT} {
    height: 200px;
  }
`

/**
 * PollCheckbox component.
 */
const PollCheckbox = styled(Checkbox)`
  flex-shrink: 0;
  margin-right: 20px;
  margin-top: 6px;
`

/**
 * Select component.
 */
const Select = styled(HTMLSelect)`
  flex-grow: 1;
`

/**
 * Error component.
 */
const Error = styled.span`
  color: ${Colors.RED3};
  font-size: 0.8rem;
  font-weight: bold;
  line-height: 16px;
`

/**
 * Shortcut component.
 */
const Shortcut = styled.div`
  color: ${Colors.GRAY3};
  font-size: 12px;
  padding-top: 4px;
`

/**
 * Controls component.
 */
const Controls = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  & > button {
    margin-left: 10px;
  }
`

/**
 * RegExp used to identify options.
 */
const OptionsRegExp = /\r?\n/g

/**
 * Form state.
 */
enum FormState {
  Done,
  Invalid,
  Processing,
  Valid,
}

/**
 * Straw Poll duplication check strategies mapping.
 */
export const DuplicationStrategyMap = {
  'Cookie Duplication check': StrawPollDuplicationStrategy.Cookie,
  'IP duplication check': StrawPollDuplicationStrategy.Ip,
  'No duplication check': StrawPollDuplicationStrategy.None,
}

/**
 * React State.
 */
const initialState = {
  captcha: false,
  duplication: StrawPollDuplicationStrategy.Ip as StrawPollDuplicationStrategy,
  formState: FormState.Invalid as FormState,
  multipleAnswers: false,
  options: '',
  optionsError: null as string | null,
  optionsIntent: Intent.NONE as Intent,
  question: '',
  questionIntent: Intent.NONE as Intent,
  url: null as string | null,
}
type State = Readonly<typeof initialState>

/**
 * PollEditor Component.
 */
export default class PollEditor extends React.Component<Props, State> {
  public state: State = initialState
  private question: HTMLInputElement | null = null

  /**
   * Lifecycle: componentDidUpdate.
   * @param prevProps - The previous props.
   * @param prevState - The previous state.
   */
  public componentDidUpdate(prevProps: Props) {
    requestAnimationFrame(() => {
      if (!prevProps.visible && this.props.visible && !_.isNil(this.question)) {
        this.question.focus()
      }
    })
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { disableDialogAnimations, visible } = this.props
    const {
      captcha,
      duplication,
      formState,
      multipleAnswers,
      options,
      optionsError,
      optionsIntent,
      question,
      questionIntent,
    } = this.state

    const questionLabelInfo = (
      <>
        (required){!_.isNil(optionsError) && (
          <>
            {' '}
            - <Error>{optionsError}</Error>
          </>
        )}
      </>
    )

    const isDone = formState === FormState.Done
    const isProcessing = formState === FormState.Processing
    const inputDisabled = isProcessing || isDone

    return (
      <Dialog
        isOpen={visible}
        onClose={this.toggle}
        icon="horizontal-bar-chart"
        title="New Straw Poll"
        transitionName={disableDialogAnimations ? '' : undefined}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Question" labelFor="question-input" labelInfo="(required)" disabled={inputDisabled}>
            <InputGroup
              placeholder="Type your question here…"
              inputRef={this.setQuestionElementRef}
              onKeyDown={this.onKeyDownQuestion}
              onChange={this.onChangeQuestion}
              disabled={inputDisabled}
              intent={questionIntent}
              id="question-input"
              value={question}
            />
          </FormGroup>
          <FormGroup label="Options" labelFor="options-input" labelInfo={questionLabelInfo} disabled={inputDisabled}>
            <Options
              placeholder="Type your options here with each line being an option…"
              onKeyDown={this.onKeyDownOptions}
              onChange={this.onChangeOptions}
              disabled={inputDisabled}
              intent={optionsIntent}
              id="options-input"
              value={options}
            />
          </FormGroup>
          <FlexLayout>
            <PollCheckbox
              onChange={this.onChangeMultipleAnswers}
              checked={multipleAnswers}
              disabled={inputDisabled}
              label="Multiple answers"
            />
            <PollCheckbox onChange={this.onChangeCaptcha} disabled={inputDisabled} checked={captcha} label="Captcha" />
            <Select
              options={_.keys(DuplicationStrategyMap)}
              onChange={this.onChangeDuplication}
              disabled={inputDisabled}
              value={_.head(
                _.filter(_.keys(DuplicationStrategyMap), (key) => DuplicationStrategyMap[key] === duplication)
              )}
              fill
            />
          </FlexLayout>
        </div>
        <Controls className={Classes.DIALOG_FOOTER}>
          {!isDone && <Shortcut>Alt + ⏎</Shortcut>}
          <Button text="Close" disabled={isProcessing} onClick={this.toggle} />
          <Button
            text={isDone ? 'Copy URL & Close' : 'Create'}
            rightIcon={isDone ? 'clipboard' : 'plus'}
            intent={isDone ? Intent.SUCCESS : Intent.PRIMARY}
            onClick={this.createOrCopy}
            disabled={formState !== FormState.Valid && formState !== FormState.Done}
            loading={isProcessing}
          />
        </Controls>
      </Dialog>
    )
  }

  /**
   * Triggered when the create or copy button is pressed.
   */
  private createOrCopy = async () => {
    const { formState, url } = this.state

    if (formState === FormState.Done && !_.isNil(url)) {
      copy(url)

      this.toggle()
    } else if (formState === FormState.Valid) {
      this.setState(() => ({ formState: FormState.Processing }))

      const { captcha, duplication, multipleAnswers, options, question } = this.state

      try {
        const poll = await StrawPoll.createPoll(
          question,
          this.getOptionsValues(options),
          multipleAnswers,
          duplication,
          captcha
        )

        this.setState(() => ({ formState: FormState.Done, url: `https://strawpoll.me/${poll.id}` }))

        Toaster.show({
          action: { onClick: this.createOrCopy, text: 'Copy & Close' },
          icon: 'tick',
          intent: Intent.SUCCESS,
          message: 'Poll created!',
        })
      } catch (error) {
        this.setState(() => ({ formState: FormState.Valid }))

        Toaster.show({
          icon: 'error',
          intent: Intent.DANGER,
          message: 'Something went wrong while creating the poll!',
        })
      }
    }
  }

  /**
   * Triggered when toggling the modal.
   */
  private toggle = () => {
    if (this.state.formState === FormState.Done) {
      this.setState(initialState)

      Toaster.clear()
    }

    this.props.toggle()
  }

  /**
   * Triggered when a key is pressed down in the question input.
   * @param event - The associated event.
   */
  private onKeyDownQuestion = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter && event.altKey) {
      this.createOrCopy()
    }
  }

  /**
   * Triggered when a key is pressed down in the options textarea.
   * @param event - The associated event.
   */
  private onKeyDownOptions = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === Key.Enter && event.altKey) {
      this.createOrCopy()
    }
  }

  /**
   * Triggered when the question is modified.
   * @param event - The associated event.
   */
  private onChangeQuestion = (event: React.FormEvent<HTMLInputElement>) => {
    const question = event.currentTarget.value

    this.setState(({ options }) => ({ question, ...this.getValidationState(question, options) }))
  }

  /**
   * Triggered when the options are modified.
   * @param event - The associated event.
   */
  private onChangeOptions = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const options = event.currentTarget.value

    this.setState(({ question }) => ({ options, ...this.getValidationState(question, options) }))
  }

  /**
   * Triggered when the multiple answers checkbox is modified.
   * @param event - The associated event.
   */
  private onChangeMultipleAnswers = (event: React.FormEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked

    this.setState(() => ({ multipleAnswers: checked }))
  }

  /**
   * Triggered when the captcha checkbox is modified.
   * @param event - The associated event.
   */
  private onChangeCaptcha = (event: React.FormEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked

    this.setState(() => ({ captcha: checked }))
  }

  /**
   * Triggered when the duplication method is modified.
   * @param event - The associated event.
   */
  private onChangeDuplication = (event: React.FormEvent<HTMLSelectElement>) => {
    const duplication = event.currentTarget.value

    this.setState(() => ({ duplication: DuplicationStrategyMap[duplication] }))
  }

  /**
   * Returns the validation state.
   * @param  question - The question to validate.
   * @param  options - The options to validate.
   * @return The validation state.
   */
  private getValidationState(question: string, options: string) {
    let optionsError = null
    let optionsIntent: Intent = Intent.NONE
    const questionIntent = question.length > 0 ? Intent.SUCCESS : Intent.NONE
    let formState: FormState = FormState.Invalid

    const values = this.getOptionsValues(options)

    if (options.length > 0) {
      if (values.length < 2) {
        optionsIntent = Intent.DANGER
        optionsError = 'You need at least 2 options.'
      } else if (values.length > 30) {
        optionsIntent = Intent.DANGER
        optionsError = 'You need at most 30 options.'
      } else {
        optionsIntent = Intent.SUCCESS
      }
    }

    if (optionsIntent === Intent.SUCCESS && question.length > 0) {
      formState = FormState.Valid
    }

    return { optionsError, optionsIntent, questionIntent, formState }
  }

  /**
   * Sets the question input ref.
   * @param ref - The reference to the inner input element.
   */
  private setQuestionElementRef = (ref: HTMLInputElement | null) => {
    this.question = ref
  }

  /**
   * Returns the options values.
   * @param  options - The options.
   * @return The options values.
   */
  private getOptionsValues(options: string) {
    return _.filter(_.map(options.split(OptionsRegExp), (value) => value.trim()), (value) => value.length > 0)
  }
}

/**
 * React Props.
 */
type Props = {
  disableDialogAnimations: boolean
  toggle: () => void
  visible: boolean
}
