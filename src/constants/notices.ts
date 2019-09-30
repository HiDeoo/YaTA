export default {
  /**
   * Notices to ignore.
   */
  IgnoredNotices: ['ban_success', 'timeout_success'],

  /**
   * Notices indicating that a user can be marked as unbanned.
   */
  UnbanNotices: ['bad_unban_no_ban', 'unban_success', 'untimeout_success'],

  /**
   * Extra notices not handled natively which will be outputted as is.
   */
  Extra: ['bad_delete_message_broadcaster', 'bad_delete_message_mod', 'no_vips', 'vips_success'],

  /**
   * Extra user notices not handled natively.
   */
  ExtraUser: {
    AnonGiftPaidUpgrade: 'anongiftpaidupgrade',
    AnonSubGift: 'anonsubgift',
    AnonSubMysteryGift: 'anonsubmysterygift',
    BitsBadgeTier: 'bitsbadgetier',
    Charity: 'charity',
    GiftPaidUpgrade: 'giftpaidupgrade',
    PrimePaidUpgrade: 'primepaidupgrade',
    RewardGift: 'rewardgift',
    SubMysteryGift: 'submysterygift',
  },
}
