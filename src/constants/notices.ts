export default {
  /**
   * Notices to ignore.
   */
  IgnoredNotices: ['ban_success', 'timeout_success'],

  /**
   * Notices indicating that a user can be marked as unbanned.
   */
  UnbanNotices: ['bad_unban_no_ban', 'unban_success', 'untimeout_success'],

  Help: {
    /**
     * Id of the help notice (/help).
     */
    Id: 'cmds_available',

    /**
     * Additions to the help notice to concatenate at the end.
     */
    Additions: ' /followed',
  },

  /**
   * Extra notices not handled natively which will be outputted as is.
   */
  Extra: ['bad_delete_message_broadcaster', 'bad_delete_message_mod'],

  Charity: {
    /**
     * Id of the charity user notice.
     */
    Id: 'charity',
  },
}
