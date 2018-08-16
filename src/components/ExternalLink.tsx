import * as React from 'react'

/**
 * ExternalLink Component.
 */
const ExternalLink: React.SFC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, ...restProps }) => (
  <a target="_blank" {...restProps}>
    {children}
  </a>
)

export default ExternalLink
