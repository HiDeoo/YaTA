import { Colors } from '@blueprintjs/core'
import _ from 'lodash'
import * as React from 'react'

import LogType from 'constants/logType'
import { WithNameColorProps } from 'libs/Chatter'
import { HighlightColors } from 'libs/Highlight'
import { SerializedMessage } from 'libs/Message'
import styled, { ifProp, prop, theme } from 'styled'
import constants from 'constants/message'

/**
 * Message component.
 */
const Message = styled.span<MessageProps>`
  color: ${prop('color')};
  word-wrap: break-word;

  .emoteWrapper {
    display: inline-block;
    min-height: 28px;
    min-width: 28px;
    text-align: center;
  }

  .emote {
    display: inline-block;
    margin-top: -3px;
    vertical-align: middle;
  }

  [class='emote'] {
    cursor: ${ifProp('withEmoteDetails', 'pointer', 'default')};
  }

  img:-moz-loading,
  img:-moz-broken {
    height: 28px;
    width: 28px;
    overflow-x: hidden;
  }

  .mention {
    background-color: ${theme('log.mention.color')};
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    &.self {
      background-color: ${theme('log.mention.self.color')};
      color: ${Colors.WHITE};
    }
  }

  span.cheer {
    font-weight: bold;
  }

  .highlight {
    border-radius: 2px;
    padding: 1px 3px 2px 3px;

    ${(props) => {
      let rules = ''

      for (const highlightColor in HighlightColors) {
        if (HighlightColors.hasOwnProperty(highlightColor)) {
          rules += `
            &.${highlightColor} {
              background-color: ${theme(`log.highlight.${highlightColor}.background`)(props)};
              color: ${theme(`log.highlight.${highlightColor}.color`)(props)};
            }
          `
        }
      }

      return rules
    }};
  }
`

/**
 * MessageContent Component.
 */
export default class MessageContent extends React.Component<Props> {
  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { message, withEmoteDetails, shouldCompress } = this.props
    const isAction = message.type === LogType.Action
    const messageColor =
      isAction && !_.isNil(message.user.color) && !message.historical ? message.user.color : 'inherit'

    const shownMessage = message.compressed && shouldCompress ? constants.CompressedTxt: message.message

    return (
      <Message
        dangerouslySetInnerHTML={{ __html: shownMessage }}
        withEmoteDetails={withEmoteDetails}
        onClick={this.onClick}
        color={messageColor}
      />
    )
  }

  /**
   * Triggered when a message content is clicked.
   */
  private onClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    const { focusEmote, onClick } = this.props

    if (!_.isNil(onClick)) onClick()

    // If we don't care about emote clicks, bail out early.
    if (_.isNil(focusEmote)) {
      return
    }

    // Ignore modified or canceled events.
    if (event.defaultPrevented) {
      return
    }

    // Ignore non-left-click-related events.
    if (event.button !== 0) {
      return
    }

    // Get the element.
    const element = event.target as Element

    // Ignore non <img /> related events.
    if (!element || element.nodeName !== 'IMG') {
      return
    }

    // At this point, we know the user clicked an image, let's ensure it was an emote.
    if (element.classList.length !== 1 || !element.classList.contains('emote')) {
      return
    }

    // At this point, we're pretty much certain you clicked an emote.
    const id = element.getAttribute('data-id')
    const name = element.getAttribute('data-tip')
    const provider = element.getAttribute('data-provider')

    if (!_.isNil(id) && !_.isNil(name) && !_.isNil(provider)) {
      // Focus the emote.
      focusEmote(id, name, provider)
    }
  }
}

/**
 * React Props.
 */
interface Props {
  focusEmote?: (id: string, name: string, provider: string) => void
  message: SerializedMessage
  withEmoteDetails?: boolean
  onClick?: () => void
  shouldCompress?: boolean
}

/**
 * React Props.
 */
interface MessageProps extends WithNameColorProps {
  withEmoteDetails?: boolean
}
