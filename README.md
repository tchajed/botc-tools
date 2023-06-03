# BotC storyteller tools

Tools for the storyteller in Blood on the Clocktower, for supporting in-person games.

**Role assignment:** Select roles for a script and randomize them. Helps set up
a game that will otherwise be run from a piece of paper (or an iPad).

**Night sheet:** Generate a good-looking and useful night sheet for a custom
script, with instructions for each characters, similar in style to the base 3
scripts. These print nicely, with a page for the first night and another for
other nights.

**Role sheet:** A replacement for the script tool's role sheet (for players)
that uses the new icons. Planned is to implement a two-column layout. On mobile this is already quite usable.

## Role assignment features

- After setting the number of players, gives feedback on the correct outsider /
  minion distribution.
- Understands roles that modify setup, including Drunk, Godfather, and even Riot.
- After selecting roles, click on them (one by one) to make them full screen for
  showing each player their character.
- Can be installed as a mobile app, which works offline and without the browser
  UI. On iOS, open in Safari and click on share icon > Add to home screen.
- Supports offline operation. After first load, the app should continue to work
  offline.

## Setting up

Run `yarn` to get the dependencies.

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

Use `yarn parcel` to run a development server.

To build an optimized, static version of the site to `dist/`, run `yarn build`.
