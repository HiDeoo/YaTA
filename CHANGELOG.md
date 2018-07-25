# Unreleased

### 🐛 Bug Fix

- Fix an issue with various commands (`/me`, `/w`, `/r`, _etc._) that could be sent as plain text.

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
