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

  .emoteWrapper {
    display: inline-block;
    min-width: 28px;
  }

  .emote {
    display: inline-block;
    margin-top: -3px;
    vertical-align: middle;
  }

  .mention {
    background-color: ${color('log.mention.color')};
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    &.self {
      background-color: ${color('log.mention.self.color')};
    }
  }

  span.cheer {
    font-weight: bold;
  }

  .highlight {
    background-color: ${color('log.highlight.background')};
    border-radius: 2px;
    color: ${color('log.highlight.color')};
    padding: 1px 3px 2px 3px;
  }
`

/**
 * MessageContent Component.
 */
const MessageContent: React.SFC<Props> = ({ message }) => {
  const isAction = message.type === LogType.Action
  const messageColor = isAction && !_.isNil(message.user.color) ? message.user.color : 'inherit'

  return <Message color={messageColor} dangerouslySetInnerHTML={{ __html: message.message }} />
}

export default MessageContent

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
