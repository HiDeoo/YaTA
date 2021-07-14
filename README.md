<p align="center">
  <img alt="YaTA" src="https://i.imgur.com/tai1mEA.png" width="128">
  <h1 align="center">YaTA - Yet another Twitch App</h1>
</p>

<p align="center">
  <a href="https://github.com/HiDeoo/YaTA/actions?query=workflow%3Aintegration"><img alt="Integration Status" src="https://github.com/HiDeoo/YaTA/workflows/integration/badge.svg"></a>
  <a href="https://github.com/HiDeoo/YaTA/blob/master/LICENSE"><img alt="License" src="https://badgen.net/badge/license/MIT/blue"></a>
  <br /><br />
</p>

**YaTA is a very opinionated [Twitch](https://www.twitch.tv) chat client.**

## Features

- 💬 Whispers.
- 🙃 Twitch & third party emotes.
- 💰 Cheermotes.
- 📖 User logs.
- 🔨 Moderation tools.
- 🔍 Custom highlights.
- 🔫 Custom actions.
- 🎬 Clips, Youtube, Straw Poll, Github previews.
- 🗳️ Straw Poll creator.
- 🔍 Search.
- 🚀 And a lot more…

## Usage

**[Go to the website!](https://yata.now.sh)**

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo) & [clone](https://help.github.com/articles/cloning-a-repository) this repository.
2. Install all the dependencies using [Yarn](https://yarnpkg.com): `yarn install`.
3. Set up the development environment:

   - Create a Twitch app [here](https://dev.twitch.tv/console/apps).
   - Set the OAuth Redirect URL of the app to `http://localhost:3000/auth`.
   - Copy the Client-ID of the newly created Twitch app.
   - Make a copy of the `.env` file named `.env.development.local` and fill it with your Client-ID and redirect URL:

     ```env
      REACT_APP_TWITCH_CLIENT_ID=your-client-id-here
      REACT_APP_TWITCH_REDIRECT_URI=http://localhost:3000/auth
     ```

     The `REACT_APP_YOUTUBE_API_KEY` & `REACT_APP_IMGUR_CLIENT_ID` variables are not required and only used when interacting with these APIs.

4. Build & run the development version: `yarn run start`.

## Motivations

I don't really use the Twitch website as I watch streams in VLC using [streamlink](https://github.com/streamlink/streamlink) so I only used most of the time the Twitch popout chat. With the removal of the legacy popout chat and the new popout chat lacking very important features (like whisper support), I started looking for chat client alternatives providing most features included in the official chat and also some new ones.

As I couldn't find any proper alternative including all my requirements, I decided to build my own.

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/YaTA/blob/master/LICENSE) for more information.
