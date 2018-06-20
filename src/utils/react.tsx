import * as React from 'react'
import { StyledFunction } from 'styled-components'

/**
 * Sets the props types of a styled-component.
 * @param  styledFunction - The function used to create the styled-component.
 * @return The properly typed function.
 */
export function withSCProps<SCP extends object, E extends HTMLElement = HTMLElement>(
  styledFunction: StyledFunction<React.HTMLProps<E>>
): StyledFunction<SCP & React.HTMLProps<E>> {
  return styledFunction as StyledFunction<SCP & React.HTMLProps<E>>
}
