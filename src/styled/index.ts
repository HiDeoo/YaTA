import * as _ from 'lodash'
import * as styledComponents from 'styled-components'

import ITheme from 'styled/theme'

declare module 'styled-components' {
  interface DefaultTheme extends ITheme {}
}


/**
 * Themed styled-components.
 */
const {
  default: styled,
  createGlobalStyle,
  css,
  keyframes,
  ThemeProvider,
  withTheme,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

/**
 * withTheme HOC props interface.
 */
export interface ThemeProps {
  theme: ITheme
}

/**
 * Re-exports styled-components with our theme interface.
 */
export { createGlobalStyle, css, keyframes, ThemeProvider, withTheme }
export default styled

/**
 * Returns a prop value.
 * @param  path - The path of the prop value.
 * @return The prop value getter.
 */
export function prop(path: string) {
  return <Props>(props: Props) => _.get(props, path) as any
}

/**
 * Returns a theme value.
 * The path will be prefixed with `theme.`.
 * @param  path - The path of the theme value.
 * @return The theme value getter.
 */
export function theme(path: string) {
  return <Props, Theme>(props: Props & { theme: Theme }) => _.get(props, `theme.${path}`) as string | number
}

/**
 * Returns a theme size value.
 * To pass an unit to the size, use the `path:unit` notation or it'll default to `px`.
 * The path will be prefixed with `theme.`.
 * @param  pathAndUnit - The path of the size and optionally its unit.
 * @param  [mutation] - Mutation to apply to the value.
 * @return The size value getter.
 */
export function size(pathAndUnit: string, mutation: number | 'double' = 0) {
  const [path, unit = 'px'] = pathAndUnit.split(':')

  return <Props, Theme>(props: Props & { theme: Theme }) => {
    let value = _.get(props, `theme.${path}`)

    if (mutation === 'double') {
      value *= 2
    } else {
      value += mutation
    }

    return `${value}${unit}`
  }
}

/**
 * Returns `pass` if the needle` is truthy, otherwise returns `fail`.
 * @param  needle - The needle of the prop.
 * @param  pass - The truthy return value.
 * @param  fail - The falsy return value.
 * @return The prop value getter.
 */
export function ifProp<Props extends object, Pass, Fail>(needle: string | object, pass: Pass, fail: Fail) {
  return (props: Props) => {
    const result = _.isString(needle)
      ? _.get(props, needle)
      : !_.difference(_.at(props, _.keys(needle) as Array<keyof Props>), _.values(needle)).length

    return result ? pass : fail
  }
}
