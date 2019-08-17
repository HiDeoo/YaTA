declare module 'semver-compare' {
  function semverCompare<T>(a: T, b: T): number

  namespace semverCompare {}

  export = semverCompare
}
