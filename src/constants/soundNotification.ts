import { Sounds } from 'Libs/Sound'

/**
 * Sound notifications.
 */
enum SoundNotification {
  Message,
  Mention,
  Whisper,
}

/**
 * Sound notification to audio sound mapping.
 */
export const SoundNotificationAudioMap = {
  [SoundNotification.Mention]: Sounds.Notification,
  [SoundNotification.Message]: Sounds.Message,
  [SoundNotification.Whisper]: Sounds.Notification,
}

export default SoundNotification
