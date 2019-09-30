import * as _ from 'lodash'

/**
 * A list of known command names.
 */
export enum CommandName {
  Ban = 'ban',
  Block = 'block',
  Clear = 'clear',
  Emoteonly = 'emoteonly',
  Emoteonlyoff = 'emoteonlyoff',
  Followed = 'followed',
  Followers = 'followers',
  Followersoff = 'followersoff',
  Help = 'help',
  Host = 'host',
  Me = 'me',
  Mod = 'mod',
  Mods = 'mods',
  Purge = 'purge',
  R = 'r',
  Raid = 'raid',
  Shrug = 'shrug',
  Slow = 'slow',
  Slowoff = 'slowoff',
  Subscribers = 'subscribers',
  Subscribersoff = 'subscribersoff',
  Timeout = 'timeout',
  Unban = 'unban',
  Unblock = 'unblock',
  Unhost = 'unhost',
  Uniquechat = 'uniquechat',
  Uniquechatoff = 'uniquechatoff',
  Unmod = 'unmod',
  Unraid = 'unraid',
  Untimeout = 'untimeout',
  Unvip = 'unvip',
  Vip = 'vip',
  Vips = 'vips',
  W = 'w',
}

/**
 * A list of all commands and their descriptors.
 */
export const Commands: Record<CommandName, CommandDescriptor> = {
  [CommandName.Ban]: {
    arguments: [{ name: 'username' }, { name: 'reason', optional: true }],
    description: 'Ban permanently a user from the chat.',
  },
  [CommandName.Block]: {
    arguments: [{ name: 'username' }],
    description: 'Block a user from interacting with you on Twitch.',
  },
  [CommandName.Clear]: { description: 'Clear the chat history.' },
  [CommandName.Emoteonly]: { description: 'Restrict the chat to only emotes.' },
  [CommandName.Emoteonlyoff]: { description: 'Disable the emote-only mode.' },
  [CommandName.Followed]: { description: 'Display how long you have been following the channel.' },
  [CommandName.Followers]: {
    arguments: [{ name: 'duration', optional: true }],
    description:
      'Restrict the chat to only followers based on their follow age or all followers if not specified. The age (3 months max) can specify a time unit (m, h, d, w or mo).',
  },
  [CommandName.Followersoff]: { description: 'Disable the follower-only mode.' },
  [CommandName.Help]: { description: 'Display this help.' },
  [CommandName.Host]: {
    arguments: [{ name: 'channel' }],
    description: 'Host another channel.',
  },
  [CommandName.Me]: {
    arguments: [{ name: 'message' }],
    description: 'Color your message based on your username color.',
  },
  [CommandName.Mod]: {
    arguments: [{ name: 'username' }],
    description: 'Grant the moderator status to a user.',
  },
  [CommandName.Mods]: { description: 'Display a list of all moderators.' },
  [CommandName.Purge]: {
    arguments: [{ name: 'username' }],
    description: 'Remove all existing messages of a user.',
  },
  [CommandName.R]: {
    description: 'Reply to the last whisper you received.',
  },
  [CommandName.Raid]: {
    arguments: [{ name: 'channel' }],
    description: 'Raid another channel.',
  },
  [CommandName.Shrug]: {
    description: '¯\\_(ツ)_/¯ ',
  },
  [CommandName.Slow]: {
    arguments: [{ name: 'duration', optional: true }],
    description: 'Set how frequently (30s default) users can send messages.',
  },
  [CommandName.Slowoff]: { description: 'Disable the slow mode.' },
  [CommandName.Subscribers]: { description: 'Restrict the chat to only subscribers.' },
  [CommandName.Subscribersoff]: { description: 'Disable the subscribers-only mode.' },
  [CommandName.Timeout]: {
    arguments: [{ name: 'username' }, { name: 'duration', optional: true }, { name: 'reason', optional: true }],
    description:
      'Timeout temporarily a user from chat. The duration (10min default, 2 weeks max) can specify a time unit (s, m, h, d or w).',
  },
  [CommandName.Unban]: {
    arguments: [{ name: 'username' }],
    description: 'Remove a ban (or timeout) from a user.',
  },
  [CommandName.Unblock]: {
    arguments: [{ name: 'username' }],
    description: 'Remove a user from your block list.',
  },
  [CommandName.Unhost]: { description: 'Stop the current host.' },
  [CommandName.Uniquechat]: { description: 'Restrict the chat to unique messages (old r9k).' },
  [CommandName.Uniquechatoff]: { description: 'Disable the unique messages mode (old r9k).' },
  [CommandName.Unmod]: {
    arguments: [{ name: 'username' }],
    description: 'Remove the moderator status from a user.',
  },
  [CommandName.Unraid]: { description: 'Stop the current raid.' },
  [CommandName.Untimeout]: {
    arguments: [{ name: 'username' }],
    description: 'Remove a timeout from a user.',
  },
  [CommandName.Unvip]: {
    arguments: [{ name: 'username' }],
    description: 'Remove the VIP status from a user.',
  },
  [CommandName.Vip]: {
    arguments: [{ name: 'username' }],
    description: 'Grant the VIP status to a user.',
  },
  [CommandName.Vips]: { description: 'Display a list of all VIPs.' },
  [CommandName.W]: {
    arguments: [{ name: 'username' }, { name: 'message' }],
    description: 'Sends a private message (whisper) to a user.',
    ignoreHistory: true,
  },
}

/**
 * All command names.
 */
export const CommandNames = _.values(CommandName)

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
