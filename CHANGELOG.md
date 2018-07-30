# Unreleased

### 🚀 New Feature

- Add a tool to quickly create a [Straw Poll](https://www.strawpoll.me/) (can be disabled in the settings).
- Improve chatter details dialog UI:
  - Rework details to be readable without the need to hover them or their associated icons.
  - A ban reason can now be provided when banning a user from this screen.
  - Badges are now displayed in this dialog.
- Add a button & context menu item to unban previously banned users.
- Add a button to unblock previously blocked users.

### 🐛 Bug Fix

- Fix a line break issue when copying multiple messages.
- Improve Github previews and add support for issues & pull requests too.
- The home button can now be middle-clicked or `ctrl` / `cmd` clicked to open the homepage in a new tab / window.
- Fix an issue with the `/mods` command not displaying its result.
- Fix a context menu issue for moderators only always opening the timeout submenu by default.
- Fix an auto-completion related issue that could lead to the first character being at the end ([#1](https://github.com/HiDeoo/YaTA/issues/1)).

# 0.5.0

### 🚀 New Feature

- Add message previews for Twitch clips, Twitch vods, Straw Poll, Youtube videos, Github repos (previews are disabled for bots).
- All user colors should now be readable according to the [WCAG 2.0 guidelines for contrast accessibility](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) (this take your theme choice into account).
- Add a new setting (disabled by default) to highlight all mentions (`@notYou`) vs only highlighting yourself.
- Add a new setting (disabled by default) to prioritize usernames when auto-completing.

### 🐛 Bug Fix

- Basic emoticons (`:)`, `:/`, etc.) in your own messages are now properly displayed _(this respects your custom emoticons set if you have a Twitch Prime subscription)_.
- Preserve initial casing when rendering a mention.
- Fix an issue when unpausing the auto-scroll which could fail in very fast moving chats.
- Show localized username in context menus when needed.
- Improve emotes rendering.

# 0.4.0

### 🚀 New Feature

- Make the highlight color selection UI more user-friendly.
- Even if they've not talked in chat, new subscriber, re-subscriber, sub gifter, sub giftee, hoster, raider and people performing a ritual can now be auto-completed.
- Add a new setting (disabled by default) to disable dialog animations.
- Improve auto-scrolling behavior when closing a context menu:
  - If auto-scrolling is paused when opening, closing will persist the pause.
  - If auto-scrolling is enabled when opening, closing will scroll to the newest message.

### 🐛 Bug Fix

- Improve selection handling when copying a message using double click.
- Fix an issue with various commands (`/me`, `/w`, `/r`, _etc._) that could be sent as plain text.
- Fix various issues with other people mentions (`@notYou`) highlighting.

### ⚙️ Internal

- Upgrade to Blueprint 3.0.

# 0.3.0

### 🚀 New Feature

- Highlight colors can now be configured per highlight.
- Add profile picture to the chatter dialog.
- Pause auto-scrolling temporarily when opening a context menu.
- If enabled, messages from the user's chat history can be copied on double click.
- If enabled, whispers can be copied on double click.
- Add a new setting (enabled by default) to automatically focus the input field when focusing the application.
- Add new indicators when auto-scrolling is disabled.
- Display the username in a context menu to easily identify the targeted user.
- Add a new setting (disabled by default) to always show the viewer count.

### 🐛 Bug Fix

- Improve chatter dialog UI to avoid flashes when done loading details.
- Fix an UI issue with clips having a very long title.
- Fix an issue with dead keys.
- Prevent isolated @ characters to be identified as mentions.
- Prevent highlighting of your username in URLs.
- Fix an issue prevent mentions & highlights to work when followed by punctuations marks.

# 0.2.1

### 🚀 New Feature

- Clicking the "Auto scrolling disabled" button now scrolls down to the latest message.
- Add a proper warning when trying to whisper yourself.

### 🐛 Bug Fix

- Fix a scrollbar issue when running with zoom enabled.
- Remove duplicated tooltips in the header.
- Fix an issue with long words & URLs not properly wrapping.

# 0.2.0

### 🚀 New Feature

- Add tooltips in the chatter details view.
- Add permissions overview on the login page.
- Add About panel.

### 🐛 Bug Fix

- Fix various scrollbars related issues.
- Improve copy on double click behavior.
- Tweak slightly emote rendering mechanism to fix various issues.
- Improve room state layout when only 1 room mode is enabled.

# 0.1.2

### 🐛 Bug Fix

- Fix an issue preventing messages to display when purging old ones.
- Show proper message when successfully creating a clip.
- Fix an issue when copying messages with emotes.
- Disable content tooltips in history.

# 0.1.1

### 🐛 Bug Fix

- Mark Moobot as a known bot.
- Fix an issue with some BetterTTV emotes.
- Improve error handling for unavailable channels.

### ⚙️ Internal

- Remove service worker cache.

# 0.1.0

### 🎉 Initial release
