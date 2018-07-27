import * as pluralize from 'pluralize'

import RequestMethod from 'Constants/requestMethod'
import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'Libs/PreviewProvider'

/**
 * Github base API URL.
 */
const BaseUrl = 'https://api.github.com'

/**
 * RegExp used to identify a repository link.
 */
const RepoRegExp = /https:\/\/(?:www\.)?github\.com\/(\w+\/\w+)/g

const PreviewGithub: PreviewProvider = class {
  /**
   * Returns the preview provider id.
   * @return The provider id.
   */
  public static getProviderId() {
    return 'previewGithub'
  }

  /**
   * Parses a message for potential previews.
   * @param  message - The message to parse.
   * @return The previews.
   */
  public static parse(message: string) {
    const previews: Previews = {}

    let match

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = RepoRegExp.exec(message)) != null) {
      previews[match[1]] = { id: match[1], provider: PreviewGithub.getProviderId(), resolved: false }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    const headers = new Headers({
      Accept: 'application/vnd.github.v3+json',
    })

    const request = new Request(`${BaseUrl}/repos/${preview.id}`, { method: RequestMethod.Get, headers })
    const response = await fetch(request)
    const repo = (await response.json()) as Repository

    let title = repo.name

    if (repo.description.length > 0) {
      title = title.concat(` - ${repo.description}`)
    }

    const meta = `${pluralize('Issue', repo.open_issues_count)}: ${repo.open_issues_count} - ${pluralize(
      'Star',
      repo.stargazers_count
    )}: ${repo.stargazers_count} - Last update: ${new Date(repo.updated_at).toLocaleDateString()} - Owner: ${
      repo.owner.login
    }`

    return {
      ...preview,
      icon: 'git-pull',
      meta,
      resolved: true,
      title,
      url: `https://github.com/${preview.id}`,
    }
  }
}

export default PreviewGithub

/**
 * Github repository.
 */
type Repository = {
  description: string
  forks_count: number
  id: number
  license: {
    key: string
    name: string
    spdx_id: string
    url: string
    node_id: string
  }
  name: string
  open_issues_count: number
  owner: {
    id: number
    login: string
  }
  stargazers_count: number
  updated_at: string
  watchers_count: number
}
