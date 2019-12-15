import * as _ from 'lodash'
import * as shortid from 'shortid'

import { SerializedChatter } from 'libs/Chatter'

/**
 * RegExp used to identify a valid action text.
 */
const TextRegExp = /^[\w\W]+$/

/**
 * RegExp used to identify a valid action name.
 */
const NameRegExp = /^[\w\- ]+$/

/**
 * RegExp used to identify a valid action recipient.
 */
const RecipientRegExp = /^[\w]{3,}$/

/**
 * Types of action available.
 */
export enum ActionType {
  Say = 'Say',
  Whisper = 'Whisper',
  Prepare = 'Prepare',
  Open = 'Open URL',
}

/**
 * Action class.
 */
export default class Action implements Serializable<SerializedAction> {
  /**
   * Validates an action.
   * @param  editing - Defines if we're editing or creating a new action.
   * @param  type - The current type.
   * @param  name - The name to validate.
   * @param  text - The text to validate.
   * @param  recipient - The recipient to validate.
   * @return The validation state.
   */
  public static validate(editing: boolean, type: ActionType, text: string, name: string, recipient?: string) {
    const isWhisperAction = type === ActionType.Whisper

    const textValid = Action.validateValue(editing, text, TextRegExp)
    const nameValid = Action.validateValue(editing, name, NameRegExp)
    const recipientValid =
      isWhisperAction && !_.isNil(recipient) ? Action.validateValue(editing, recipient, RecipientRegExp) : true

    const textAndNameValid = textValid && nameValid
    const valid = isWhisperAction ? textAndNameValid && recipientValid : textAndNameValid

    return { name: nameValid, recipient: recipientValid, text: textValid, valid }
  }

  /**
   * Parses an action text and replace placeholders.
   * @param  action - The action to parse.
   * @param  placeholders - Available placholders.
   * @return The parsed action text.
   */
  public static parse(action: SerializedAction, replacements: ActionReplacement) {
    const compiledTemplate = _.template(action.text)

    return compiledTemplate(replacements)
  }

  /**
   * Validates an action value.
   * @param  editing - Defines if we're editing or creating a new action.
   * @param  value - The value to validate.
   * @param  regexp - The regexp used to validate.
   * @return `true` when the value is valid.
   */
  private static validateValue(editing: boolean, value: string, regexp: RegExp) {
    const valid = regexp.test(value)

    return editing ? value.length > 0 && valid : valid
  }

  /**
   * Creates a new action instance.
   * @class
   * @param type - The action type.
   * @param name - The action name.
   * @param text - The action text.
   * @param [recipient] - The action recipient.
   * @param [id] - The action id.
   */
  constructor(
    private type: ActionType,
    private name: string,
    private text: string,
    private recipient?: string,
    private id = shortid.generate()
  ) {}

  /**
   * Serializes an action.
   * @return The serialized action.
   */
  public serialize() {
    return {
      id: this.id,
      name: this.name,
      recipient: this.type === ActionType.Whisper ? this.recipient : undefined,
      text: this.text,
      type: this.type,
    }
  }

  /**
   * Validate the current action instance.
   * @return The validation state.
   */
  public validate() {
    return Action.validate(false, this.type, this.text, this.name, this.recipient)
  }
}

/**
 * Action placeholders.
 */
export enum ActionPlaceholder {
  Username = 'username',
  Channel = 'channel',
}

/**
 * Action placeholders replacement values..
 */
type ActionReplacement = Record<ActionPlaceholder, string>

/**
 * Serialized action.
 */
export type SerializedAction = {
  id: string
  name: string
  text: string
  type: ActionType
  recipient?: string
}

/**
 * Action handler.
 */
export type ActionHandler = (action: SerializedAction, chatter: Optional<SerializedChatter>) => void
