import { toBase64Url } from 'utils/string'

/**
 * Generates a cryptographically strong random string.
 * @param  length - The string length.
 * @return The random string.
 */
export function getRandomString(length = 128): string {
  // Get cryptographically strong random values.
  const randomValues = window.crypto.getRandomValues(new Uint8Array(length))

  // Generate a random string.
  const randomString = Array.prototype.map.call(randomValues, (value) => String.fromCharCode(value)).join('')

  // Convert the random string to base64url.
  return toBase64Url(btoa(randomString)).substring(0, length)
}
