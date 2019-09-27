/**
 * A list of known command names.
 */
export enum CommandName {
  Block = 'block',
  Followed = 'followed',
  Purge = 'purge',
  R = 'r',
  Shrug = 'shrug',
  Unblock = 'unblock',
  W = 'w',
}

/**
 * A list of all commands and their descriptors.
 */
export const Commands: Record<CommandName, CommandDescriptor> = {
  [CommandName.Block]: {
    arguments: [{ name: 'username' }],
    description: 'Block a user from interacting with you on Twitch.',
  },
  [CommandName.Followed]: { description: 'Display how long you have been following the channel.' },
  [CommandName.Purge]: {
    arguments: [{ name: 'username' }],
    description: 'Remove all existing messages of a user.',
  },
  [CommandName.R]: {
    description: 'Reply to the last whisper you received.',
  },
  [CommandName.Shrug]: {
    description: '¯\\_(ツ)_/¯ ',
  },
  [CommandName.Unblock]: {
    arguments: [{ name: 'username' }],
    description: 'Remove a user from your block list.',
  },
  [CommandName.W]: {
    arguments: [{ name: 'username' }, { name: 'message' }],
    description: 'Sends a private message to a user.',
    ignoreHistory: true,
  },
}

/**
 * A command descriptor.
 */
export type CommandDescriptor = {
  arguments?: CommandArgument[]
  description: string
  ignoreHistory?: boolean
}

/**
 * A command argument.
 */
type CommandArgument = {
  name: string
  optional?: boolean
}
