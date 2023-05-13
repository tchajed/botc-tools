# BotC storyteller sheets

For custom scripts in Blood on the Clocktower. Generates good-looking and
useful night sheets (similar to the three base scripts).

## Setting up

Run `yarn` to get the dependencies.

## Downloading the assets

```sh
yarn ts-node fetch_assets/src/main.ts --json --img
```

Fetching the images will take about a minute.

## Running the web site

For development, run `yarn parcel`.

To build to `dist/` run `yarn parcel build`.
