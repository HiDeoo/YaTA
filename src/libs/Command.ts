import * as _ from 'lodash'

import { CommandDescriptor, CommandName, Commands } from 'Constants/command'
import Notice from 'Libs/Notice'
import { SerializedRoomState } from 'Libs/RoomState'
import Twitch from 'Libs/Twitch'
import { Log } from 'Store/ducks/logs'

/**
 * Command class.
 */
export default class Command {
  /**
   * Checks if a message is a command (starting by a `/` or a `.`).
   * @param message A message potentially containing a command.
   */
  public static isCommand(message: string) {
    const firstCharacter = message.charAt(0)

    return firstCharacter === '/' || firstCharacter === '.'
  }

  /**
   * Checks if a message is a whisper reply command (`/r`).
   * @param message A message potentially containing a whisper reply command.
   */
  public static isWhisperReplyCommand(message: string) {
    return /^[\/|\.]r /i.test(message)
  }

  /**
   * Checks if a message is a marker command (`/marker`).
   * @param message A message potentially containing a marker command.
   */
  public static isMarkerCommand(message: string) {
    return /^[\/|.]marker(?:$|\s)/i.test(message)
  }

  /**
   * Parses a message as a whisper command (/w user message).
   * @return The whisper details.
   */
  public static parseWhisper(message: string) {
    const matches = message.match(/^[\/|\.]w (\S+) (.+)/i)

    const details = { username: undefined as Optional<string>, whisper: undefined as Optional<string> }

    if (!_.isNil(matches)) {
      details.username = matches[1]
      details.whisper = matches[2]
    }

    return details
  }

  /**
   * Parses a message as a shrug command (/shrug).
   * @return The new message with the inserted shrug if the message contained a shrug command..
   */
  public static parseShrug(message: string) {
    const matches = message.match(/(^|.* )[\/|\.]shrug($| .*)/i)

    const result = { isShrug: false, message }

    if (!_.isNil(matches)) {
      const before = matches[1]
      const after = matches[2]

      result.isShrug = true
      result.message = `${before}¯\\_(ツ)_/¯ ${after}`
    }

    return result
  }

  /**
   * Returns the descriptor of the command.
   * @return The descriptor.
   */
  private static getDescriptor(commandName: string | CommandName): EnhancedCommandDescriptor {
    const name: CommandName = CommandName[_.upperFirst(commandName)]

    return { ...Commands[name], name }
  }

  private command: string
  private arguments: string[]

  /**
   * Creates a new instance of the class.
   * @class
   * @param message A message containing a command validated by
   * `Command.isCommand()`.
   */
  constructor(private message: string, private delegate: CommandDelegate) {
    const [command, ...args] = message.slice(1).split(' ')

    this.command = command.toLowerCase()
    this.arguments = args
  }

  /**
   * Handles the command.
   */
  public async handle() {
    if (!_.includes(CommandName, this.command)) {
      this.delegate.say(this.message)
    } else {
      const descriptor = Command.getDescriptor(this.command)
      const handler = this.getHandler(descriptor)

      if (_.isNil(handler)) {
        await this.delegate.say(this.message)
      } else {
        await handler()

        if (!descriptor.ignoreHistory) {
          this.delegate.addToHistory(this.message)
        }
      }
    }
  }

  /**
   * Returns the handler of a command.
   * @param  description - The command descriptor.
   * @return The handler.
   */
  private getHandler(descriptor: EnhancedCommandDescriptor) {
    return this.commandHandlers[descriptor.name]
  }

  /**
   * Returns the usage of the command.
   * @return The usage string.
   */
  private getUsage() {
    const descriptor = Command.getDescriptor(this.command)

    const args = _.map(descriptor.arguments, (argument) => {
      if (argument.optional) {
        return `[${argument.name}]`
      }

      return `<${argument.name}>`
    })

    return `Usage: "/${this.command} ${args.join(' ')}" - ${descriptor.description}`
  }

  /**
   * Handles the /followed command.
   */
  private handleCommandFollowed = async () => {
    const channelId = this.delegate.getChannelId()

    if (!_.isNil(channelId)) {
      const relationship = await Twitch.fetchRelationship(channelId)

      const notice = new Notice(
        _.isNil(relationship)
          ? 'Channel not followed.'
          : `Followed since ${new Date(relationship.followed_at).toLocaleDateString()}.`,
        null
      )

      this.delegate.addLog(notice.serialize())
    }
  }

  /**
   * Handles the /block & /unblock commands.
   */
  private handleCommandBlockUnblock = async () => {
    let noticeStr

    const [username] = this.arguments

    if (_.isEmpty(username)) {
      noticeStr = this.getUsage()
    } else {
      try {
        const user = await Twitch.fetchUserByName(username)

        if (_.isNil(user)) {
          throw new Error(`Invalid user name provided for the ${this.command} command.`)
        }

        const blockFn = this.command === 'block' ? Twitch.blockUser : Twitch.unblockUser
        await blockFn(user.id)

        noticeStr = `${username} is now ${this.command}ed.`
      } catch (error) {
        noticeStr = `Something went wrong while trying to ${this.command} ${username}.`
      }
    }

    const notice = new Notice(noticeStr, null)
    this.delegate.addLog(notice.serialize())
  }

  /**
   * Handles the /purge command.
   */
  private handleCommandPurge = () => {
    const [username] = this.arguments

    if (_.isEmpty(username)) {
      const notice = new Notice(this.getUsage(), null)
      this.delegate.addLog(notice.serialize())
    } else {
      this.delegate.timeout(username, 1)
    }
  }

  /**
   * Handles the /w command.
   */
  private handleCommandWhisper = () => {
    const [username, ...fragments] = this.arguments
    const whisper = fragments.join(' ')

    if (!_.isEmpty(username) && !_.isEmpty(whisper)) {
      this.delegate.whisper(username, whisper, this.message)
    } else {
      const notice = new Notice(this.getUsage(), null)
      this.delegate.addLog(notice.serialize())
    }
  }

  /**
   * List of commands with special handlers.
   */
  // tslint:disable-next-line:member-ordering
  private commandHandlers: { [key in CommandName]?: () => void } = {
    [CommandName.Block]: this.handleCommandBlockUnblock,
    [CommandName.Followed]: this.handleCommandFollowed,
    [CommandName.Purge]: this.handleCommandPurge,
    [CommandName.Unblock]: this.handleCommandBlockUnblock,
    [CommandName.W]: this.handleCommandWhisper,
  }
}

/**
 * An enhanced command descriptor including the command name.
 */
type EnhancedCommandDescriptor = CommandDescriptor & { name: CommandName }

/**
 * The interface that a command delegate should implement.
 */
export interface CommandDelegate {
  addToHistory(message: string): void
  addLog(log: Log): void
  getChannelId(): SerializedRoomState['roomId'] | undefined
  say(message: string): void
  timeout(username: string, duration: number): void
  whisper(username: string, whisper: string, command?: string): void
}