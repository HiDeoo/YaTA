import * as _ from 'lodash'

import { SerializedMessage } from 'libs/Message'
import { SerializedNotice } from 'libs/Notice'
import { SerializedNotification } from 'libs/Notification'
import { SerializedMarker } from 'store/ducks/logs'
import { replaceImgTagByAlt } from 'utils/html'

/**
 * HTMLDivElement used when converting messages to a string.
 */
const tmpConversionDiv = document.createElement('div')

/**
 * Converts messages to a string.
 * @param messages - The message(s) to convert.
 * @return The converted messages.
 */
export function convertMessagesToString(messages: SerializedMessage | SerializedMessage[]) {
  const messagesToConvert = _.isArray(messages) ? messages : [messages]

  let convertedMessages = ''

  _.forEach(messagesToConvert, (message, index) => {
    tmpConversionDiv.innerHTML = replaceImgTagByAlt(message.message)

    const convertedMessage = tmpConversionDiv.textContent || tmpConversionDiv.innerText || ''
    const messageToConvert = `[${message.time}] ${message.user.displayName}: ${convertedMessage}${
      index < messagesToConvert.length - 1 ? '\n' : ''
    }`

    convertedMessages = convertedMessages.concat(messageToConvert)
  })

  return convertedMessages
}

/**
 * Converts a marker to a string.
 * @param marker - The marker to convert.
 * @return The converted marker.
 */
export function convertMarkerToString(marker: SerializedMarker) {
  return `--[ ${marker.time} ]---------------------------------------------------------------------`
}

/**
 * Converts a notice to a string.
 * @param messages - The notice to convert.
 * @return The converted notice.
 */
export function convertNoticeToString(notice: SerializedNotice) {
  return `* ${notice.message} *`
}

/**
 * Converts a notification to a string.
 * @param messages - The notification to convert.
 * @return The converted notification.
 */
export function convertNotificationToString(notification: SerializedNotification) {
  return `~ ${notification.title}${_.get(notification, 'message', '')} ~`
}

/**
 * Converts a whisper to a string.
 * @param messages - The whisper to convert.
 * @return The converted whisper.
 */
export function convertWhisperToString(whisper: SerializedMessage) {
  return `${whisper.self ? '>' : '<'} ${convertMessagesToString(whisper)}`
}
