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

/**
 * Returns a theme color value.
 * The path will be prefixed with `theme.`.
 * @param  path - The path of the theme value.
 * @return The color value getter.
 */
export function color(path: string) {
  return (props: object) => _.get(props, `theme.${path}`) as string
}

/**
 * Returns a theme size value.
 * The path will be prefixed with `theme.`.
 * @param  path - The path of the theme value.
 * @param  [unit='px'] - The size unit which default to pixel.
 * @return The size value getter.
 */
export function size(path: string, unit: string | undefined = 'px') {
  if (_.isNil(unit)) {
    return (props: object) => _.get(props, `theme.${path}`) as number
  }

  return (props: object) => `${_.get(props, `theme.${path}`)}${unit}` as string
}
