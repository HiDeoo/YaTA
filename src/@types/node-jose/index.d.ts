declare module 'node-jose' {
  type KeyStore = {}

  type JWSDetails = {
    payload: Uint8Array[]
  }

  interface JWS {
    createVerify(keystore: KeyStore): JWS
    verify(token: string): PromiseLike<JWSDetails>
  }

  interface JWK {
    asKeyStore(key: JsonWebKey): PromiseLike<KeyStore>
  }

  const _default: {
    JWK: JWK
    JWS: JWS
  }

  export = _default
}
