# BotC storyteller tools

[![build](https://github.com/tchajed/botc-tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/tchajed/botc-tools/actions/workflows/deploy.yml)
[![refresh](https://github.com/tchajed/botc-tools/actions/workflows/refresh.yml/badge.svg)](https://github.com/tchajed/botc-tools/actions/workflows/refresh.yml)

Tools for the storyteller in Blood on the Clocktower, for supporting in-person games.

**Role assignment:** Select roles for a script and randomize them. Helps set up
a game that will otherwise be run from a tablet or a piece of paper.

**Night sheet:** Generate a good-looking and useful night sheet for a custom
script, with instructions for each character, similar in style to the base 3
scripts. These print nicely, with a page for the first night and another for
other nights.

**Role sheet:** A replacement for the script tool's character sheet (for players)
that is useful to the storyteller, and a useful replacement for existing
options on mobile.

## Role assignment features

The highlights are that the tool helps you pick characters and distribute them
to players, and it all works offline. The app has all scripts from the
[unofficial script database](https://botcscripts.com). See this [detailed list
of features](FEATURES.md) for more, as well as some screenshots.

## Setting up for development

Install yarn and nvm.

```
nvm use
yarn install
yarn fetch-assets --json
yarn run check
```

Parcel does not work on Node 22.7+, so `nvm use` is there to make it easy to get 22.6.

The last command fetches the JSON assets, which are needed for the code to build.

Run `yarn run check` to run eslint, check formatting, and check types with
TypeScript. Run `yarn run fmt` to automatically fix formatting with prettier.

### Download assets

```sh
yarn fetch-assets
```

This fetches character icons, and all the scripts from
<https://botc-scripts.azurewebsites.net> - it will take a couple minutes.
Running multiple times won't re-download images and scripts. If you want to
re-fetch, delete the downloaded assets:

```sh
yarn fetch-assets --clean
```

### Running the website

Use `yarn start` to run a development server.

To build an optimized, static version of the site to `dist/`, run `yarn build`.

## Testing

There is currently no testing framework setup. This is not intentional, I just
haven't figured out how to set one up that works with Parcel. (A contribution
that sets up testing would be very useful! I think Karma + Mocha will work.)

There is infrastructure for some automated browser screenshots:

```sh
yarn test-screenshots
```

`test-screenshots` takes some options, run it with `yarn test-screenshots
--help` to see them.

## Acknowledgments and Copyrights

- [Blood on the Clocktower](https://bloodontheclocktower.com/) is a trademark of
  Steven Medway and The Pandemonium Institute
- Night reminders and other auxiliary text written by Ben Finney
- Iconography by [Font Awesome](https://fontawesome.com/)
- All other images and icons are copyright their respective owners

This project and its website are provided free of charge and are not affiliated
with The Pandemonium Institute in any way.
