import bowser from 'bowser'

/**
 * Automated report template filenames.
 */
enum ReportTemplate {
  Bug = '2_automated_bug_report.yml',
  Error = '3_automated_error_report.yml',
}

/**
 * Opens the report issue page on Github.
 */
export function reportBug() {
  openReportOnGithub(getReportParameters(ReportTemplate.Bug))
}

/**
 * Report an error on Github.
 * @param error - The error to report.
 */
export function reportError(error: Error) {
  openReportOnGithub([...getReportParameters(ReportTemplate.Error), `stack=${encodeURIComponent(error.stack ?? '')}`])
}

/**
 * Opens a report on Github.
 * @param params The report parameters of the issue.
 */
function openReportOnGithub(params: string[]) {
  const { REACT_APP_BUGS_URL } = process.env

  window.open(`${REACT_APP_BUGS_URL}/new?${params.join('&')}`)
}

/**
 * Returns the report parameters to include in every reports.
 * @return The report parameters.
 */
function getReportParameters(template: ReportTemplate): string[] {
  const parser = bowser.getParser(window.navigator.userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()

  const { REACT_APP_VERSION: yataVersion } = process.env
  const browserVersion = `${browser.name} ${browser.version}`
  const osVersion = `${os.name} ${os.version || ''}`

  return [
    `template=${template}`,
    `yata_version=${encodeURIComponent(yataVersion)}`,
    `browser_version=${browserVersion}`,
    `os_version=${osVersion}`,
  ]
}
