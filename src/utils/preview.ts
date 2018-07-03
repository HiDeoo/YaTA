/**
 * Sanitizes a URL for preview.
 * @param  url - The URL to sanitize.
 * @return The sanitized URL.
 */
export function sanitizeUrlForPreview(urlToSanitize: string) {
  let url = urlToSanitize

  // Show the gif version of a gifv.
  if (url.endsWith('.gifv')) {
    url = url.slice(0, -1)
  }

  return url
}
