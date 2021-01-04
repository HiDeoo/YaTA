import { Colors, Icon } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'
import styled, { ifProp, theme } from 'styled'

import type { SerializedMessage } from 'libs/Message'

/**
 * Various string replacements used in the reply parent message body.
 */
const ReplyMessageReplacements: Record<string, string> = {
  '\\s': ' ',
  '\\:': ';',
  '\\\\': '\\',
}

/**
 * Reference component.
 */
const Reference = styled.span<IsReplyToSelfProps>`
  background-color: ${ifProp('toSelf', theme('log.mention.self.color'), theme('log.mention.color'))};
  border-radius: 2px;
  color: ${Colors.WHITE};
  display: inline-block;
  max-width: 25vw;
  overflow: hidden;
  padding: 0 3px 0 5px;
  text-overflow: ellipsis;
  vertical-align: top;
  white-space: nowrap;
`

/**
 * ReferenceIcon component.
 */
const ReferenceIcon = styled(Icon)`
  margin-right: 1px;
  opacity: 0.9;

  svg {
    height: 13px;
    width: 13px;
  }
`

/**
 * ReplyReference Component.
 */
export default class ReplyReference extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { replyReference } = this.props.message

    if (_.isNil(replyReference)) {
      return null
    }

    const parentMessage = replyReference.message.replaceAll(
      /(\\\\|\\s|\\:)/g,
      (match) => ReplyMessageReplacements[match] ?? match
    )

    return (
      <Reference
        className="replyReference"
        toSelf={replyReference.self}
        data-tip={`Replying to @${replyReference.user.displayName}: “${parentMessage}”`}
      >
        <ReferenceIcon icon="inheritance" /> @{replyReference.user.displayName}: <em>{parentMessage}</em>
      </Reference>
    )
  }
}

/**
 * React Props.
 */
interface Props {
  message: SerializedMessage
}

/**
 * React Props.
 */
interface IsReplyToSelfProps {
  toSelf: boolean
}
