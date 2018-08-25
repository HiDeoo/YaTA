import { IconName } from '@blueprintjs/core'

/**
 * Preview provider static interface.
 */
export interface PreviewProvider {
  getProviderId(): string
  parse(message: string): Previews
  resolve(preview: UnresolvedPreview): Promise<Preview>
}

/**
 * Preview parsing results.
 */
export type Previews = Record<string, UnresolvedPreview | Preview>

/**
 * Unresolved preview.
 */
export type UnresolvedPreview = {
  id: string
  provider: string
  resolved: boolean
  type?: string | number
  extra?: Record<string, string | number>
}

/**
 * Resolved preview.
 */
export type Preview = UnresolvedPreview & {
  icon?: IconName
  image?: string
  meta: string
  title: string
  url?: string
}

/**
 * Defines if a preview is resolved or not.
 * @param  preview - The preview.
 * @return `true` when the preview is resolved.
 */
export function isResolved(preview: UnresolvedPreview | Preview): preview is Preview {
  return preview.resolved === true
}
