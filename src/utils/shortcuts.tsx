import { Hotkey, Hotkeys } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import { ShortcutImplementations } from 'constants/shortcut'
import { getShortcuts } from 'store/selectors/settings'

/**
 * Renders shortcuts.
 * @param  all - All defined shortcuts.
 * @param  current - Shortcuts to render.
 * @param  global - Defines if the shortcuts are global or not.
 * @param  disabled - Defines if the shortcuts are disabled or not.
 * @return The shortcuts.
 */
export function renderShorcuts(
  all: ReturnType<typeof getShortcuts>,
  current: ShortcutImplementations,
  global = false,
  disabled = false
) {
  return (
    <Hotkeys>
      {_.map(current, ({ type, action }) => {
        const shortcut = all[type]

        if (_.isNil(shortcut.combo)) {
          return null
        }

        return (
          <Hotkey
            combo={shortcut.combo}
            group={shortcut.group}
            label={shortcut.name}
            disabled={disabled}
            onKeyDown={action}
            global={global}
            preventDefault
            allowInInput
            key={type}
          />
        )
      })}
    </Hotkeys>
  )
}
