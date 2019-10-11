<p align="center">
  <img alt="YaTA" src="https://i.imgur.com/tai1mEA.png" width="128">
  <h1 align="center">YaTA - Yet another Twitch App</h1>
</p>

<p align="center">
  <a href="https://circleci.com/gh/HiDeoo/YaTA"><img alt="Build Status" src="https://circleci.com/gh/HiDeoo/YaTA.png?style=shield&circle-token=3e5f415ca17efc0c2ba4ad5de222eac5d90561f4"></a>
  <a href="https://github.com/HiDeoo/YaTA/blob/master/LICENSE"><img alt="License" src="https://badgen.now.sh/badge/license/MIT/blue"></a>
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

1.  [Fork](https://help.github.com/articles/fork-a-repo) & [clone](https://help.github.com/articles/cloning-a-repository) this repository.
2.  Install all the dependencies using [Yarn](https://yarnpkg.com): `yarn install`.
3.  Build & run the development version: `yarn run start`.

## Set up development environment
1.  Create a Twitch app [here](https://dev.twitch.tv/console/apps).
2.  Set the OAuth Redirect URL to `http://localhost:3000/auth`.
3.  Get your Twitch app Client-ID by managing your newly made app.
4.  Create a file named `.env.development.local` and add the following text:
```
REACT_APP_TWITCH_CLIENT_ID="your-client-id-here"
REACT_APP_TWITCH_REDIRECT_URI="http://localhost:3000/auth"
```
5.  That is it, you are now able to run YaTA and authenticate with Twitch. Happy coding.

## Motivations

I don't really use the Twitch website as I watch streams in VLC using [streamlink](https://github.com/streamlink/streamlink) so I only used most of the time the Twitch popout chat. With the removal of the legacy popout chat and the new popout chat lacking very important features (like whisper support), I started looking for chat client alternatives providing most features included in the official chat and also some new ones.

As I couldn't find any proper alternative including all my requirements, I decided to build my own.

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/YaTA/blob/master/LICENSE) for more information.
