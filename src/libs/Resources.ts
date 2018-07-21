import * as _ from 'lodash'

import EmotesProvider, { Emote, EmoteProviderPrefix } from 'Libs/EmotesProvider'
import { RawBadges, RawCheermote } from 'Libs/Twitch'
import { Highlights } from 'Store/ducks/settings'

/**
 * Manager for various resources used mostly during messages parsing like badges, emotes, cheermotes, etc.
 */
export default class Resources {
  /**
   * Returns the manager instance.
   * @class
   */
  public static manager() {
    if (_.isNil(Resources.instance)) {
      Resources.instance = new Resources()
    }

    return Resources.instance
  }

  private static instance: Resources

  private badges: RawBadges = {}
  private bots: Set<string> = new Set(['moobot'])
  private cheermotes: RawCheermote[] = []
  private emotesProviders: Map<EmoteProviderPrefix, EmotesProvider<Emote>> = new Map()
  private highlights: Highlights = {}
  private highlightsIgnoredUsers: string[] = []

  /**
   * Creates a new instance of the class.
   * @class
   */
  private constructor() {}

  /**
   * Sets the badges.
   * @param badges - The badges.
   */
  public setBadges(badges: RawBadges) {
    this.badges = badges
  }

  /**
   * Gets the badges.
   * @return The badges.
   */
  public getBadges() {
    return this.badges
  }

  /**
   * Sets the cheermotes.
   * @param cheermotes - The cheermotes.
   */
  public setCheermotes(cheermotes: RawCheermote[]) {
    this.cheermotes = cheermotes
  }

  /**
   * Gets the cheermotes.
   * @return The cheermotes.
   */
  public getCheermotes() {
    return this.cheermotes
  }

  /**
   * Sets the highlights and highlights ignored users.
   * @param highlights - The highlights.
   * @param ignoredUsers - The highlights ignored users.
   */
  public setHighlights(highlights: Highlights, ignoredUsers: string[]) {
    this.highlights = highlights
    this.highlightsIgnoredUsers = ignoredUsers
  }

  /**
   * Gets the highlights.
   * @return The highlights.
   */
  public getHighlights() {
    return this.highlights
  }

  /**
   * Adds an emotes provider.
   * @param provider - The provider.
   */
  public addEmotesProvider(provider: EmotesProvider<Emote>) {
    this.emotesProviders.set(provider.prefix, provider)
  }

  /**
   * Gets all emotes provider.
   * @return The emotes providers.
   */
  public getEmotesProviders() {
    return this.emotesProviders
  }

  /**
   * Gets a specific emotes provider.
   * @param prefix - The provider prefix.
   * @return The emotes provider.
   */
  public getEmotesProvider(prefix: EmoteProviderPrefix) {
    return this.emotesProviders.get(prefix)
  }

  /**
   * Adds known bots.
   * @param bots - The bots.
   */
  public addBots(bots: string[]) {
    for (const bot of bots) {
      this.bots.add(bot)
    }
  }

  /**
   * Check if highlights from a specific user should be ignored.
   * @param  username - The username.
   * @return `true` when ignored.
   */
  public shouldIgnoreHighlights(username: string) {
    return _.includes(this.highlightsIgnoredUsers, username)
  }

  /**
   * Defines if a user is a known bot.
   * @param  username - The username.
   * @return `true` if the user is a known bot.
   */
  public isBot(username: string) {
    return this.bots.has(username)
  }
}
