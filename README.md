# Gacha JJ

A terminal-based RNG track collection game.

## Play

```sh
npx gacha-jj
```

## Install

```sh
npm install -g gacha-jj
gacha-jj
```

## Gameplay

Spin for JJ tracks, discover rare drops, and increase your Luck. Use the arrow keys and Enter; Ctrl+C always exits safely. Saves live in your user application-data folder, never in the installed package.

Choose **Profile** in-game to automatically open a personal dashboard in your default browser. It runs only on `127.0.0.1` while the game is open, uses the same local save data, and needs no account or internet connection.

## Built-in audio

The published package includes the supplied MP3 collection, so sound works immediately after `npx gacha-jj`. The game also creates a personal `music` folder in its application-data directory; add an MP3 there with the same filename only when you want to override the bundled audio.

Pressing Continue after a gacha result stops its local playback. Discovered tracks also have a **Play** button in the local Profile dashboard.

This repository prepares the game for npm publishing; it does not claim the package is published.
