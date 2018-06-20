import * as _ from 'lodash'

/**
 * Returns `pass` if the needle` is truthy, otherwise returns `fail`.
 * @param  needle - The needle of the prop.
 * @param  pass - The truthy return value.
 * @param  fail - The falsy return value.
 * @return The prop value getter.
 */
export function ifProp<T, U>(needle: string | object, pass: T, fail: U) {
  return (props: object) => {
    const result = _.isString(needle)
      ? _.get(props, needle)
      : !_.difference(_.at(props, _.keys(needle) as never[]), _.values(needle)).length

    return result ? pass : fail
  }
}
