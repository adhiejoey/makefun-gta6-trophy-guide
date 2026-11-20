# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/adhiejoey/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/adhiejoey/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Referral:** try make.fun with my link — https://make.fun/r/mcpf7r82

## What this is

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation; no online trophies). Open `app/index.html` in a desktop browser with the network off and it just works — every file it loads lives under `app/`.

- **Tracker:** a checklist of every trophy with its official name, description and grade. Tick one off and it stays ticked (localStorage). Counters for the numbered trophies (250 stunts, 42 shooting-range golds, 100 WAiNK scans…) save too, and hitting a target marks the trophy earned.
- **Guides with sources:** every trophy has a guide written in my own words — what to do, where and how, and when it can be missed — with its sources named beside it (PowerPyx's launch-week trophy guide and roadmap, Exophase and PSNProfiles for the official list). Where launch-era guides still mark a trophy unknown (Bad Luck, I Guess), the guide says so instead of inventing a method.
- **Platinum roadmap:** five stages in order, built from the official descriptions and PowerPyx's roadmap — story first (60–80 hours), side-character questlines, robberies and money, activities and collectibles, then the 100% checklist and the platinum. About 200 hours in total, one playthrough.
- **Missables:** only one trophy is flagged as possibly missable — Positive Mental Attitude, whose first meditation exists only in Chapter 1 at Jason's house. The app flags it everywhere and explains why the other 54 are safe.
- **Filters:** by kind (story, missable, collectibles, activities, online), by grade, by search text, plus hide-earned.
- **Spoiler setting:** hides the names and descriptions of story trophies until you earn them.
- **Export / import:** save progress to a `.json` file and import it back on any machine.

## How to run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Or open `app/index.html` directly from any static file server with `app/` at its root. No build step, no network requests at run time.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts` (kit copy, unchanged).

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Exophase — Grand Theft Auto VI trophies (official list): https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — Grand Theft Auto VI trophies: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- GTABase — GTA 6 achievements & trophies list: https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- Sixshore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/
- EGamers — GTA 6 Trophy List: All 55 Trophies: https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/

Unofficial fan guide, not affiliated with Rockstar Games, Sony or PlayStation. No Rockstar logo, artwork or game screenshots are used. Trophy names, descriptions and grades are the official PlayStation 5 list; guide text is original writing that cites its sources.

## License

MIT — see [LICENSE](LICENSE).
