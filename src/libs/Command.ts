import * as _ from 'lodash'

import { CommandArgument, CommandDescriptor, CommandName, Commands } from 'Constants/command'
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
   * @param message - A message potentially containing a command.
   */
  public static isCommand(message: string) {
    const firstCharacter = message.charAt(0)

    return firstCharacter === '/' || firstCharacter === '.'
  }

  /**
   * Checks if a message is a whisper reply command (`/r`).
   * @param message - A message potentially containing a whisper reply command.
   */
  public static isWhisperReplyCommand(message: string) {
    return /^[\/|\.]r /i.test(message)
  }

  /**
   * Checks if a message is a marker command (`/marker`).
   * @param message - A message potentially containing a marker command.
   */
  public static isMarkerCommand(message: string) {
    return /^[\/|.]marker(?:$|\s)/i.test(message)
  }

  /**
   * Checks if a message is a help command (`/help`).
   * @param message - A message potentially containing a help command.
   */
  public static isHelpCommand(message: string) {
    return /^[\/|.]help(?:$|\s)/i.test(message)
  }

  /**
   * Checks if the cursor in a message is associated to a command username auto-completable argument.
   * Note: at the moment, it is assumed that all commands having a username completable argument have that argument at
   * the first position.
   * @param  message - The message.
   * @param  cursor - The cursor position.
   * @return `true` when the cursor is matching a username completable argument.
   */
  public static isUsernameCompletableCommandArgument(message: string, cursor: number) {
    // Bail out if the message is not even a command.
    if (!Command.isCommand(message)) {
      return false
    }

    // Grab the command name and the first argument.
    const words = message.split(' ')
    const commandName = words[0].substr(1)
    const firstArgument = words[1]

    // If we don't have a first argument yet, bail out.
    if (_.isNil(firstArgument)) {
      return false
    }

    const firstArgumentStart = commandName.length + 2
    const firstArgumentEnd = firstArgumentStart + firstArgument.length

    // If we're not auto-completing the first agument, bail out.
    if (cursor < firstArgumentStart || cursor > firstArgumentEnd) {
      return false
    }

    // Get the descriptor for this command.
    const descriptor = Command.getDescriptor(commandName)

    // If we can't get a valid descriptor, this means the command is unknown.
    if (_.isNil(descriptor.name)) {
      return false
    }

    const firstArgumentDescriptor = _.get(descriptor, 'arguments[0]') as Optional<CommandArgument>

    // If the command doesn't accept any argument or the first argument is not a
    // username, bail out.
    if (_.isNil(firstArgumentDescriptor) || firstArgumentDescriptor.name !== 'username') {
      return false
    }

    return true
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
   * Returns a command usage.
   * @param  descriptor - The command descriptor.
   * @return The command usage.
   */
  public static getUsage(descriptor: EnhancedCommandDescriptor) {
    const args = _.map(descriptor.arguments, (argument) => {
      if (argument.optional) {
        return `[${argument.name}]`
      }

      return `<${argument.name}>`
    })

    return `/${descriptor.name} ${args.join(' ')}`
  }

  /**
   * Returns the descriptor of the command.
   * @return The descriptor.
   */
  public static getDescriptor(commandName: string | CommandName): EnhancedCommandDescriptor {
    const name: CommandName = CommandName[_.upperFirst(commandName)]

    return { ...Commands[name], name }
  }

  private command: string
  private arguments: string[]

  /**
   * Creates a new instance of the class.
   * @class
   * @param message - A message containing a command validated by
   * `Command.isCommand()`.
   */
  constructor(
    private message: string,
    private delegate: CommandDelegate,
    private delegateDataFetcher: CommandDelegateDataFetcher
  ) {
    const [command, ...args] = message.slice(1).split(' ')

    this.command = command.toLowerCase()
    this.arguments = args
  }

  /**
   * Handles the command.
   */
  public async handle() {
    if (!_.includes(CommandName, this.command)) {
      this.say(this.message)
    } else {
      const descriptor = Command.getDescriptor(this.command)
      const handler = this.getHandler(descriptor)

      if (_.isNil(handler)) {
        await this.say(this.message)
      } else {
        await handler()

        if (!descriptor.ignoreHistory) {
          this.addToHistory(this.message)
        }
      }
    }
  }

  /**
   * Sends a message.
   * @param message - The message to send.
   * @param ignoreHistory - Defines if the message should not be added to the
   * history.
   */
  private async say(message: string, ignoreHistory: boolean = false) {
    const action = ignoreHistory ? CommandDelegateAction.SayWithoutHistory : CommandDelegateAction.Say
    this.delegate(action, message)
  }

  /**
   * Adds a message to the history.
   * @param message - The message to add.
   */
  private async addToHistory(message: string) {
    this.delegate(CommandDelegateAction.AddToHistory, message)
  }

  /**
   * Adds a log entry.
   * @param log - The log entry to add.
   */
  private addLog(log: Log) {
    this.delegate(CommandDelegateAction.AddLog, log)
  }

  /**
   * Sends a whisper.
   * @param username - The recipient.
   * @param whisper - The whisper to send.
   * @param [command] - The command used to send the whisper.
   */
  private whisper(username: string, whisper: string, command?: string) {
    this.delegate(CommandDelegateAction.Whisper, username, whisper, command)
  }

  /**
   * Timeouts a user.
   * @param username - The name of the user to timeout.
   * @param duration - The duration of the timeout in seconds.
   */
  private timeout(username: string, duration: number) {
    this.delegate(CommandDelegateAction.Timeout, username, duration)
  }

  /**
   * Sends a help notice about the command.
   */
  private sendHelpNotice() {
    const descriptor = Command.getDescriptor(this.command)
    const notice = new Notice(`Usage: "${Command.getUsage(descriptor)}" - ${descriptor.description}`, null)
    this.addLog(notice.serialize())
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
   * Handles the /followed command.
   */
  private handleCommandFollowed = async () => {
    const { channelId } = this.delegateDataFetcher()

    if (!_.isNil(channelId)) {
      const relationship = await Twitch.fetchRelationship(channelId)

      const notice = new Notice(
        _.isNil(relationship)
          ? 'Channel not followed.'
          : `Followed since ${new Date(relationship.followed_at).toLocaleDateString()}.`,
        null
      )

      this.addLog(notice.serialize())
    }
  }

  /**
   * Handles the /block & /unblock commands.
   */
  private handleCommandBlockUnblock = async () => {
    const [username] = this.arguments

    if (_.isEmpty(username)) {
      this.sendHelpNotice()
    } else {
      let noticeStr

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

      const notice = new Notice(noticeStr, null)
      this.addLog(notice.serialize())
    }
  }

  /**
   * Handles the /purge command.
   */
  private handleCommandPurge = () => {
    const [username] = this.arguments

    if (_.isEmpty(username)) {
      this.sendHelpNotice()
    } else {
      this.timeout(username, 1)
    }
  }

  /**
   * Handles the /w command.
   */
  private handleCommandWhisper = () => {
    const [username, ...fragments] = this.arguments
    const whisper = fragments.join(' ')

    if (!_.isEmpty(username) && !_.isEmpty(whisper)) {
      this.whisper(username, whisper, this.message)
    } else {
      this.sendHelpNotice()
    }
  }

  /**
   * Handles the /uniquechat command.
   */
  private handleCommandUniqueChat = () => {
    this.say('/r9kbeta', true)
  }

  /**
   * Handles the /uniquechatoff command.
   */
  private handleCommandUniqueChatOff = () => {
    this.say('/r9kbetaoff', true)
  }

  /**
   * Handles the /user command.
   */
  private handleCommandUser = () => {
    const [username] = this.arguments

    if (_.isEmpty(username)) {
      this.sendHelpNotice()
    } else {
      const { channel } = this.delegateDataFetcher()

      if (!_.isNil(channel)) {
        Twitch.openViewerCard(channel, username)
      }
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
    [CommandName.Uniquechat]: this.handleCommandUniqueChat,
    [CommandName.Uniquechatoff]: this.handleCommandUniqueChatOff,
    [CommandName.User]: this.handleCommandUser,
    [CommandName.W]: this.handleCommandWhisper,
  }
}

/**
 * Actions that could arise when handling a command.
 */
export enum CommandDelegateAction {
  AddLog,
  AddToHistory,
  Say,
  SayWithoutHistory,
  Timeout,
  Whisper,
}

/**
 * Command delegate data fetcher.
 */
export type CommandDelegateDataFetcher = () => {
  channel: string | null
  channelId: SerializedRoomState['roomId'] | undefined
}

/**
 * The commande delegate signature.
 */
export interface CommandDelegate {
  (action: CommandDelegateAction.AddLog, log: Log): void
  (action: CommandDelegateAction.Timeout, username: string, duration: number): void
  (action: CommandDelegateAction.Whisper, username: string, whisper: string, command?: string): void
  (
    action: CommandDelegateAction.AddToHistory | CommandDelegateAction.Say | CommandDelegateAction.SayWithoutHistory,
    message: string
  ): void
}

/**
 * An enhanced command descriptor including the command name.
 */
type EnhancedCommandDescriptor = CommandDescriptor & { name: CommandName }
