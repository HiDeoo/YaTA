import * as _ from 'lodash'
import pluralize from 'pluralize'

import RequestMethod from 'constants/requestMethod'
import { Preview, PreviewProvider, Previews, UnresolvedPreview } from 'libs/PreviewProvider'

/**
 * Preview types.
 */
enum GithubPreviewType {
  Repo,
  IssueOrPR,
}

/**
 * Github base API URL.
 */
const BaseUrl = 'https://api.github.com'

/**
 * RegExp used to identify a repository link.
 */
const RepoRegExp = /https:\/\/(?:www\.)?github\.com\/([\w-]+\/[\w\.-]+)(?:[^\s]+)?/g

/**
 * RegExp used to identify an issue or PR link.
 */
const IssueOrPRRegExp = /https:\/\/(?:www\.)?github\.com\/([\w-]+\/[\w\.-]+)\/(?:issues|pull)\/(\d+)(?:[^\s]+)?/g

/**
 * Github preview provider.
 */
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
      previews[match[1]] = {
        extra: { initialLink: match[0] },
        id: match[1],
        provider: PreviewGithub.getProviderId(),
        resolved: false,
        type: GithubPreviewType.Repo,
      }
    }

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = IssueOrPRRegExp.exec(message)) != null) {
      previews[match[1]] = {
        extra: { initialLink: match[0], issueId: match[2] },
        id: match[1],
        provider: PreviewGithub.getProviderId(),
        resolved: false,
        type: GithubPreviewType.IssueOrPR,
      }
    }

    return previews
  }

  /**
   * Resolves a preview.
   * @param  preview - The preview to resolve.
   * @return The resolved preview.
   */
  public static async resolve(preview: UnresolvedPreview): Promise<Preview> {
    if (_.isNil(preview.type)) {
      throw new Error('Missing preview type.')
    }

    const headers = new Headers({
      Accept: 'application/vnd.github.v3+json',
    })

    if (preview.type === GithubPreviewType.Repo) {
      const request = new Request(`${BaseUrl}/repos/${preview.id}`, { method: RequestMethod.Get, headers })
      const response = await fetch(request)
      const repo = (await response.json()) as Repository

      let title = repo.name

      if (repo.description.length > 0) {
        title = title.concat(` - ${repo.description}`)
      }

      const meta = `${pluralize(
        'Issue',
        repo.open_issues_count
      )}: ${repo.open_issues_count.toLocaleString()} - ${pluralize(
        'Star',
        repo.stargazers_count
      )}: ${repo.stargazers_count.toLocaleString()} - Last update: ${new Date(
        repo.updated_at
      ).toLocaleDateString()} - Owner: ${repo.owner.login}`

      return {
        ...preview,
        icon: 'git-commit',
        meta,
        resolved: true,
        title,
        url: `https://github.com/${preview.id}`,
      }
    } else if (
      preview.type === GithubPreviewType.IssueOrPR &&
      !_.isNil(preview.extra) &&
      !_.isNil(preview.extra.issueId)
    ) {
      const request = new Request(`${BaseUrl}/repos/${preview.id}/issues/${preview.extra.issueId}`, {
        headers,
        method: RequestMethod.Get,
      })
      const response = await fetch(request)
      const issueOrPR = (await response.json()) as IssueOrPR

      const isIssue = _.isNil(issueOrPR.pull_request)

      const meta = `${isIssue ? 'Issue' : 'Pull request'} created on ${new Date(
        issueOrPR.created_at
      ).toLocaleDateString()} - Status: ${issueOrPR.state} - ${pluralize(
        'Comment',
        issueOrPR.comments
      )}: ${issueOrPR.comments.toLocaleString()}`

      return {
        ...preview,
        icon: isIssue ? 'issue' : 'git-pull',
        meta,
        resolved: true,
        title: issueOrPR.title,
        url: issueOrPR.html_url,
      }
    }

    throw new Error('Invalid preview type.')
  }
}

export default PreviewGithub

/**
 * Github user.
 */
type GithubUser = {
  id: number
  login: string
}

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
  owner: GithubUser
  stargazers_count: number
  updated_at: string
  watchers_count: number
}

/**
 * Github issue or PR.
 */
type IssueOrPR = {
  body: string
  closed_at: string
  comments: number
  created_at: string
  id: number
  html_url: string
  pull_request?: {
    diff_url: string
    html_url: string
    parth_url: string
    url: string
  }
  repository_url: string
  state: string
  title: string
  updated_at: string
  user: GithubUser
}
