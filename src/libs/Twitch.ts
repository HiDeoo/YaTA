import * as _ from 'lodash'
import jose from 'node-jose'

/**
 * Twitch base auth URL.
 */
const baseAuthUrl = 'https://id.twitch.tv/oauth2'

/**
 * Twitch class.
 */
export default class Twitch {
  /**
   * Returns the Twitch authentication URL.
   * @return The auth URL.
   */
  public static getAuthURL() {
    const url = new URL(`${baseAuthUrl}/authorize`)

    const { REACT_APP_TWITCH_CLIENT_ID, REACT_APP_TWITCH_REDIRECT_URI } = process.env

    url.searchParams.set('client_id', REACT_APP_TWITCH_CLIENT_ID)
    url.searchParams.set('redirect_uri', REACT_APP_TWITCH_REDIRECT_URI)
    url.searchParams.set('response_type', 'token id_token')
    url.searchParams.set('scope', 'openid chat_login')

    return url
  }

  /**
   * Returns the auth response token.
   * @param hash - The URL hash to parse
   * @return The parsed tokens
   */
  public static getAuthTokens(hash: string) {
    const params = new URLSearchParams(hash.substring(1))

    if (!params.has('access_token') || !params.has('id_token')) {
      throw new Error('Invalid auth response.')
    }

    return {
      access: params.get('access_token') as string,
      id: params.get('id_token') as string,
    }
  }

  /**
   * Validates an ID token.
   * @param  token - The ID token received during authentication.
   * @return The verified ID token.
   */
  public static async verifyIdToken(token: string) {
    const jwk = await Twitch.fetchJWK()

    const keystore = await jose.JWK.asKeyStore(jwk)

    const jws = await jose.JWS.createVerify(keystore).verify(token)

    const idToken = JSON.parse(jws.payload.toString()) as IdToken

    if (_.get(idToken, 'aud') !== process.env.REACT_APP_TWITCH_CLIENT_ID || _.get(idToken, 'iss') !== baseAuthUrl) {
      throw new Error('Unable to verify ID token.')
    }

    return idToken
  }

  /**
   * Fetches Twitch public JWK.
   * @return The JWK.
   */
  private static async fetchJWK() {
    const jwkReponse = await fetch('https://id.twitch.tv/oauth2/keys')

    const jwk = await jwkReponse.json()

    return jwk as JsonWebKey
  }
}

/**
 * ID token.
 */
export type IdToken = {
  aud: string
  azp: string
  exp: number
  iat: number
  iss: string
  preferred_username: string
  sub: string
}
