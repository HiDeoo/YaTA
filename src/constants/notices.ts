export default {
  /**
   * Notices to ignore.
   */
  IgnoredNotices: ['ban_success', 'timeout_success'],

  /**
   * Notices that should be ignored when connected to the Twitch PubSub.
   */
  PubSubNotices: ['unban_success'],

  /**
   * Notices indicating that a user can be marked as unbanned.
   */
  UnbanNotices: ['bad_unban_no_ban', 'unban_success', 'untimeout_success'],

  /**
   * Notice indicating that the current user is banned.
   */
  BanNotice: 'msg_banned',

  /**
   * Extra notices not handled natively which will be outputted as is.
   */
  Extra: [
    'bad_delete_message_broadcaster',
    'bad_delete_message_mod',
    'no_vips',
    'vips_success',
    'usage_raid',
    'raid_error_already_raiding',
    'raid_error_forbidden',
    'raid_error_self',
    'raid_error_too_many_viewers',
    'raid_error_unexpected',
    'raid_notice_mature',
    'unraid_error_unexpected',
    'unraid_success',
  ],

  /**
   * Extra user notices not handled natively.
   */
  ExtraUser: {
    AnonGiftPaidUpgrade: 'anongiftpaidupgrade',
    AnonSubGift: 'anonsubgift',
    AnonSubMysteryGift: 'anonsubmysterygift',
    BitsBadgeTier: 'bitsbadgetier',
    Charity: 'charity',
    ExtendedSub: 'extendsub',
    GiftPaidUpgrade: 'giftpaidupgrade',
    PrimePaidUpgrade: 'primepaidupgrade',
    RewardGift: 'rewardgift',
    SubMysteryGift: 'submysterygift',
  },
}
