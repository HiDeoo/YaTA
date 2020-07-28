import LogType from 'constants/logType'

/**
 * Message rejected by AutoMod.
 */
export default class RejectedMessage implements Serializable<SerializedRejectedMessage> {
  /**
   * Returns the internal ID of a rejected message based on a message ID.
   * @param  messageId - The message ID.
   * @return The rejected message ID.
   */
  public static getRejectedMessageInternalId(messageId: string) {
    return `_rejected_${messageId}`
  }

  private id: string
  private handled: boolean

  /**
   * Creates a new rejected message.
   * @class
   * @param username - The name of the sender.
   * @param messageId - The rejected message ID.
   * @param message - The rejected message.
   * @param reason - The reason of the rejection.
   */
  constructor(private username: string, private messageId: string, private message: string, private reason: string) {
    this.id = RejectedMessage.getRejectedMessageInternalId(messageId)
    this.handled = false
  }

  /**
   * Serializes a rejected message.
   * @return The serialized rejected message.
   */
  public serialize() {
    return {
      handled: this.handled,
      id: this.id,
      message: this.message,
      messageId: this.messageId,
      reason: this.reason,
      type: LogType.RejectedMessage,
      username: this.username,
    }
  }
}

/**
 * Serialized message rejected by AutoMod.
 */
export type SerializedRejectedMessage = {
  handled: boolean
  id: string
  message: string
  messageId: string
  reason: string
  type: LogType
  username: string
}
