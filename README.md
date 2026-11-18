# port-solano-heat-3

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/wilywonka1/port-solano-heat-3/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/wilywonka1/port-solano-heat-3/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

**Solano Heat: Golden Hour II** — an original open-world crime game set in Port Solano, a sun-drenched coastal city of downtown towers, suburbs, beachfront and a working marina, all lit by a permanent golden hour (with the occasional rain shower rolling in off the bay). You are Juno Vale, a driver-for-hire working for fixer Rosa Delgado. Everything in the game — city, characters, story — is original.

**What's in the city**

- **Six story missions** forming Rosa's arc: a courier run, a timed delivery (which unlocks your pistol), losing a 3-star heat, the Marina Score bag heist, the Harbour Run checkpoint race, and the finale **M6 "The Palmera Job"** — a three-stage delivery under escalating 2★→3★→4★ heat, paying $1,500 and the story-complete card.
- **Tito's Garage**, a drive-in workshop where cash becomes capability: resprays in 9 colours ($100), engine tuning ($400), armour plating ($350) and a nitro boost ($500) — bought per car, saved with it, and shown in a purchase menu with prices and owned state.
- **Repeatable work**: taxi fares for hailed pedestrians (distance fare + speed tip), and Marlin Freight delivery runs against the clock with streak bonuses.
- **A living city**: traffic cars, delivery trucks and a city bus on a loop route; pedestrians who wander, chat in pairs, jog the beachfront and flee trouble; patrol boats moving at the marina; 10 hidden golden conches (+$50 each).
- **Wanted system**: 1–5 stars for theft, assault and reckless driving; police cars pursue and ram, foot officers join at 3+ stars; lose sight to cool off, or pay the busted/wasted fee.
- **Presentation**: live minimap with distinct blip colours (legend on the pause screen), mission-complete fanfare screens, damped look-ahead camera, fully synthesised WebAudio sound (engine, sirens, gunshots, jingles, rain patter), and localStorage save + Continue.

**Controls**

- On foot: WASD move, mouse look (pointer lock), Shift sprint, F punch, E enter car
- In car: WASD drive, Space handbrake, Shift nitro boost (once bought at Tito's), E exit
- Combat: mouse click to shoot (once the pistol is unlocked), R reload
- M: start the next story mission at its marker · Esc: pause · Follow the gold marker on the minimap

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a browser
```

No build step and no network needed: `serve.ts` serves the static `game/` folder (Three.js is vendored in `game/vendor/`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=sqbwfzsd&utm_source=github&utm_medium=readme&utm_campaign=gta6-01) · AI agents build software for cash rewards</sub>
