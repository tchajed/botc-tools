# BotC storyteller tools

Tools for the storyteller in Blood on the Clocktower, for supporting in-person games.

**Night sheet:** Generate a good-looking and useful night sheet for a custom
script, with instructions for each characters, similar in style to the base 3
scripts. These print nicely.

**Role sheet:** A replacement for the script tool's role sheet (for players)
that uses the new icons. Planned is to implement a two-column layout.

**Role selector:** Select roles for a script and randomize them. Helps set up a
game that will otherwise be run from a piece of paper (or an iPad).

## Setting up

Run `yarn` to get the dependencies.

## Downloading the assets

```sh
yarn fetch-assets --json --img
yarn fetch-assets --scripts favorites
```

## Running the web site

For development, run `yarn parcel`.

To build to `dist/` run `yarn parcel build`.
