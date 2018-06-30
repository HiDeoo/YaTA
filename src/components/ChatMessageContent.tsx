import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import LogType from 'Constants/logType'
import { SerializedMessage } from 'Libs/Message'
import { withSCProps } from 'Utils/react'
import { color } from 'Utils/styled'

/**
 * Message component.
 */
const Message = withSCProps<MessageProps, HTMLSpanElement>(styled.span)`
  color: ${(props) => props.color};

  .emote {
    display: inline-block;
    margin: -0.5rem 0;
    vertical-align: middle;
    width: 28px;
  }

  .mention {
    background-color: ${color('log.mention.color')};
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    &.self {
      background-color: ${color('log.mention.self.color')};
    }
  }
`

/**
 * ChatMessageContent Component.
 */
const ChatMessageContent: React.SFC<Props> = ({ message }) => {
  const isAction = message.type === LogType.Action
  const messageColor = isAction && !_.isNil(message.user.color) ? message.user.color : 'inherit'

  return <Message color={messageColor} dangerouslySetInnerHTML={{ __html: message.message }} />
}

export default ChatMessageContent

/**
 * React Props.
 */
type Props = {
  message: SerializedMessage
}

/**
 * React Props.
 */
type MessageProps = {
  color: string
}
