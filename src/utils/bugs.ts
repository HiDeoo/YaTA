import bowser from 'bowser'

/**
 * Opens the report issue page on Github.
 */
export function reportBug() {
  openReportOnGithub(`<!---
Thanks for filing an issue 😄 !
Please provide as much details as possible, including screenshots if necessary.
-->

**Describe the bug**

A clear and concise description of what the bug is.

**To Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**

A clear and concise description of what you expected to happen.

**Screenshots**

If applicable, add screenshots to help explain your problem.

${getReportEnvironment()}`)
}

/**
 * Report an error on Github.
 * @param error - The error to report.
 */
export function reportError(error: Error) {
  openReportOnGithub(`<!---
Thanks for filing an issue 😄 !
Please provide as much details as possible, including screenshots if necessary.
-->

**To Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Screenshots**

If applicable, add screenshots to help explain your problem.

**Error**

\`\`\`
${error.stack}
\`\`\`

${getReportEnvironment()}`)
}

/**
 * Opens a report on Github.
 * @param report The report to attach to the issue.
 */
function openReportOnGithub(report: string) {
  const { REACT_APP_BUGS_URL } = process.env

  window.open(`${REACT_APP_BUGS_URL}/new?body=${encodeURIComponent(report)}`)
}

/**
 * Returns the environment to include in a report.
 * @return The environement details.
 */
function getReportEnvironment() {
  const { REACT_APP_VERSION } = process.env
  const parser = bowser.getParser(window.navigator.userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()

  return `**Environment**

| Software         | Version
| ---------------- | -------
| YaTA             | ${REACT_APP_VERSION}
| Browser          | ${browser.name} ${browser.version}
| Operating System | ${os.name} ${os.version || ''}`
}
