# BotC storyteller tools

[![build](https://github.com/tchajed/botc-tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/tchajed/botc-tools/actions/workflows/deploy.yml)
[![refresh](https://github.com/tchajed/botc-tools/actions/workflows/refresh.yml/badge.svg)](https://github.com/tchajed/botc-tools/actions/workflows/refresh.yml)

Tools for the storyteller in Blood on the Clocktower, for supporting in-person games.

**Role assignment:** Select roles for a script and randomize them. Helps set up
a game that will otherwise be run from a piece of paper (or an iPad).

**Night sheet:** Generate a good-looking and useful night sheet for a custom
script, with instructions for each characters, similar in style to the base 3
scripts. These print nicely, with a page for the first night and another for
other nights.

**Role sheet:** A replacement for the script tool's character sheet (for players)
that is useful to the storyteller, and a useful replacement for existing
options on mobile.

## Role assignment features

The highlights are that the tool helps you pick characters and distribute them
to players, and it all works offline. See this [detailed list of
features](FEATURES.md) for more, as well as some screenshots.

## Setting up

Run `yarn` to get the dependencies.

We provide scripts `yarn lint` for linting (using eslint), `yarn fmt` for
formatting (using prettier), and `yarn typecheck` to run TypeScript.

## Downloading the assets

```sh
yarn fetch-assets
```

Running this multiple times won't re-download images and scripts (which take
some time). If you want to re-fetch, delete the downloaded assets:

```sh
yarn fetch-assets --clean
```

## Running the web site

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

## Acknowledgements and Copyrights

- [Blood on the Clocktower](https://bloodontheclocktower.com/) is a trademark of
  Steven Medway and The Pandemonium Institute
- Night reminders and other auxiliary text written by Ben Finney
- Iconography by [Font Awesome](https://fontawesome.com/)
- All other images and icons are copyright their respective owners

This project and its website are provided free of charge and are not affiliated
with The Pandemonium Institute in any way.
