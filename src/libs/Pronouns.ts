import _ from 'lodash'

/**
 * Pronouns base API URL.
 */
const BaseUrl = 'https://pronouns.alejo.io/api'

/**
 * Pronouns class.
 */
export default class Pronouns {
  private static pronounsByName: Record<RawPronouns[number]['name'], RawPronouns[number]['display']> | undefined =
    undefined

  /**
   * Fetches pronoun for a specific user.
   * @param  username - The user name.
   * @return The pronoun.
   */
  public static async fetchPronoun(username: string): Promise<string | undefined> {
    if (!Pronouns.pronounsByName) {
      await Pronouns.fetchPronouns()
    }

    const response = await Pronouns.fetch(`/users/${username}`)
    const pronoun: RawPronoun = (await response.json())[0]

    return _.get(Pronouns.pronounsByName, pronoun.pronoun_id)
  }

  /**
   * Fetches all pronouns.
   * @return The pronouns.
   */
  public static async fetchPronouns(): Promise<void> {
    Pronouns.pronounsByName = {}

    const response = await Pronouns.fetch('/pronouns')
    const pronouns: RawPronouns = await response.json()

    for (const pronoun of pronouns) {
      Pronouns.pronounsByName[pronoun.name] = pronoun.display
    }
  }

  /**
   * Returns the URL for a request.
   * @param  endpoint - The endpoint to fetch.
   * @return The URL.
   */
  private static getUrl(endpoint: string) {
    return BaseUrl.concat(endpoint)
  }

  /**
   * Fetches an URL.
   * @param  endpoint - The endpoint to fetch.
   * @return The response.
   */
  private static async fetch(endpoint: string) {
    const url = Pronouns.getUrl(endpoint)

    const request = new Request(url)

    return fetch(request)
  }
}

interface RawPronoun {
  id: string
  login: string
  pronoun_id: string
}

type RawPronouns = { name: string; display: string }[]
