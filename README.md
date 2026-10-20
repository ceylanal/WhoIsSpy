# WhoIsSpy

A shared-device social deduction party game: most players see the same secret word, while the spies must blend into the conversation without knowing it.

[Play the web version](https://whoisspy-nu.vercel.app)

## How it works

1. Add **3–12 players**, choose the number of spies, a category, and the round duration.
2. Pass the device around so each player can privately reveal their role.
3. Discuss the secret word while the timer runs, then vote for a suspected spy.
4. Resolve the round with the voting and spy-guess flow.

## Features

- Random role assignment and private card reveals.
- Timed rounds, voting, and result screens.
- Turkish and English interface text, with Turkish-aware word comparison.
- Browser-local game-state persistence.
- Optional Supabase category/word storage with bundled fallback words.

This is a pass-the-device game. Game state is stored in browser local storage; it does not provide synchronized multiplayer rooms across devices.

## Stack

Next.js, React, TypeScript, Tailwind CSS, and optional Supabase.

## Run locally

```bash
git clone https://github.com/ceylanal/WhoIsSpy.git
cd WhoIsSpy
npm ci
npm run dev
```

Open `http://localhost:3000`. Supabase is optional for the bundled word/category flow.

To use your own Supabase data, create `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Review [supabase/seed.sql](supabase/seed.sql) for the category/word data setup. The admin route is intended for development and requires an access-control review before exposing writable data publicly.

## Checks and build

```bash
npm run lint
npm run build
npm start
```

## Repository map

| Path | Purpose |
| --- | --- |
| `src/app/` | Setup, reveal, play, vote, result, and admin screens |
| `src/lib/gameEngine.ts` | Game transitions and word comparison |
| `src/lib/stateManager.ts` | Browser-local persistence |
| `src/lib/translations.ts` | Interface translations |
| `src/data/fallbackWords.ts` | Bundled categories and words |

The application was bootstrapped with create-next-app. See the repository instructions when developing against its installed Next.js version.
