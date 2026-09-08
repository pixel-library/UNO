# Implementation Plan - Premium Online UNO Game Platform

Build a complete, production-ready, real-time online UNO game web application with a high-end visual design matching the provided reference images. The application features zero-login instant play, server-authoritative Socket.IO multiplayer, intelligent AI opponents, custom house rules, animated vector UNO cards, session history, replay system, leaderboard, and interactive sound effects.

## User Review Required

> [!IMPORTANT]
> **No Authentication Required**: Strictly zero login, zero signup, zero auth endpoints. Player identity is stored in `localStorage` as a temporary guest session (`guest_xxxxx`).
>
> **Database Configuration**: We will configure Prisma ORM with SQLite for seamless local execution while retaining full compatibility with PostgreSQL.
>
> **Web Audio API Sound Engine**: To guarantee 100% reliable sound effects without broken external asset links, we will implement a lightweight Web Audio API sound synthesizer paired with fallback HTML5 audio for crisp card deal, shuffle, draw, play, skip, reverse, wild, and UNO sounds.

## Proposed Architecture & Tech Stack

```
uno-platform/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── shared/
│   ├── types/               # Game state, card types, move types, socket payload types
│   ├── constants/           # Colors, card values, default rules
│   └── validation/          # Room code & player name validators
├── server/
│   ├── index.ts             # Express & Socket.IO server setup
│   ├── engine/
│   │   ├── UnoGame.ts       # Server-authoritative UNO game engine logic
│   │   ├── Deck.ts          # Deck creation, shuffling, dealing, drawing
│   │   ├── AIPlayer.ts      # Bot decisions (Easy, Medium, Hard)
│   │   └── RulesManager.ts  # Standard + Custom House Rules (Stacking, 7-0, Jump-In)
│   ├── socket/
│   │   ├── roomHandler.ts   # Room creation, joining, listing, ready states
│   │   └── gameHandler.ts   # Game state sync, move processing, turn timers, chat
│   └── database/
│       ├── schema.prisma    # Prisma schema for session games, statistics, replay logs
│       └── db.ts            # Prisma client instance
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── common/      # Navbar, Footer, Modal, Toast, Button, Badge
    │   │   ├── card/        # UnoCard (SVG/CSS vector card component), CardHand, CardDeck
    │   │   ├── game/        # GameTable, PlayerSeat, TurnIndicator, UnoButton, ColorPicker, ChatPanel
    │   │   └── rules/       # RuleCard, RuleSection
    │   ├── pages/           # Home, EnterName, Play, CreateGame, JoinGame, WaitingRoom, Game, GameResult, Rules, Computer, GamesHistory, Replay, Watch, Tournaments, Leaderboard, Settings
    │   ├── hooks/           # useGame, useSocket, useSession, useSettings, useAudio
    │   ├── services/        # AudioService, StorageService, SocketService
    │   └── styles/          # Tailwind setup, custom card depth, animations, gradients
```

---

## Proposed Changes

### 1. Shared Data Models & Game Types

#### [NEW] [types/game.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/shared/types/game.ts)
- `CardColor`: `'RED' | 'YELLOW' | 'GREEN' | 'BLUE' | 'WILD'`
- `CardValue`: `'0'..'9' | 'SKIP' | 'REVERSE' | 'DRAW_TWO' | 'WILD' | 'WILD_DRAW_FOUR' | 'REPLAY' | 'SKIP_WILD' | 'HASH' | 'HASH_WILD' | 'MINUS_ONE' | 'MINUS_TWO_WILD'`
- `Card`: `{ id: string; color: CardColor; value: CardValue; score: number }`
- `GameState`: Full server game state with masked hands sent to clients (`publicState`).
- `HouseRules`: Settings for Stacking, Jump-In, Seven-O, Force Play, Draw Until Playable, Multiple Card Play.

---

### 2. Core Game Engine (Server-Authoritative)

#### [NEW] [server/engine/UnoGame.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/engine/UnoGame.ts)
- `createDeck()`: Builds 108 standard UNO cards (or extra cards if house rules enabled).
- `shuffleDeck()`: Fisher-Yates deck shuffle.
- `dealCards(playerIds, cardCount = 7)`: Deals initial hands.
- `isPlayable(card, topCard, currentColor)`: Validates color, number, or wild match.
- `playCard(playerId, cardId, chosenColor?)`: Validates turn, executes action (Skip, Reverse, Draw 2/4), advances turn.
- `drawCard(playerId)`: Draws top card, handles deck depletion by reshuffling discard pile.
- `callUno(playerId)`: Toggles UNO status, enforces draw penalties if uncaught.
- `getMaskedStateForPlayer(playerId)`: Strips hand cards of opponents to prevent client-side inspecting/cheating.

#### [NEW] [server/engine/AIPlayer.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/engine/AIPlayer.ts)
- AI strategy modes: `EASY` (random valid move), `MEDIUM` (matches colors/numbers, calls UNO), `HARD` (saves wild cards, targets leader, counts cards).

---

### 3. Server Setup & Realtime Socket System

#### [NEW] [server/index.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/index.ts)
- Express app with HTTP server and Socket.IO server.
- Serves static Vite build in production.

#### [NEW] [server/socket/roomHandler.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/socket/roomHandler.ts)
- Handle room creation (`room:create`), joining (`room:join`), spectator join (`room:watch`), player ready state, disconnect grace period (reconnection handling).

#### [NEW] [server/socket/gameHandler.ts](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/socket/gameHandler.ts)
- Socket events: `game:move`, `game:draw`, `game:uno`, `game:color`, `game:endTurn`, `chat:message`.
- Turn timer enforcement with server `setInterval` / timers.

---

### 4. Database Schema (Prisma)

#### [NEW] [server/database/schema.prisma](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/server/database/schema.prisma)
- Prisma schema containing `Game`, `GamePlayer`, `GameMove` (for replay recording), `GameSession` (guest session stats), `Tournament`.

---

### 5. Frontend Visual Design & Vector UnoCard Component

#### [NEW] [client/src/components/card/UnoCard.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/components/card/UnoCard.tsx)
- Pixel-perfect vector implementation matching reference cards:
  - Outer thick white border with rounded corners (`rounded-xl` or `rounded-2xl`).
  - Vivid UNO background colors (Red `#E52521`, Yellow `#FCD116`, Green `#2D963F`, Blue `#0082CA`, Dark `#1E1E1E` for Wild).
  - Center white tilted oval shape with crisp drop shadow.
  - Large center number or action icon (Skip circle-slash, Reverse arrows, +2 badge, +4 rainbow badge).
  - Corner mini values (top-left & bottom-right rotated).
  - Face-down card rendering with iconic 3D styled red badge with yellow "UNO" logo on dark background.
  - Playable glow animation, selected lift state, and hover scale effects.

---

### 6. Reusable Components & Layouts

#### [NEW] [client/src/components/common/Navbar.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/components/common/Navbar.tsx)
- Recreates Reference 1 header: UNO logo on left, center links (Home, Play, How to Play, Rules, Leaderboard, Settings), right bright yellow `[ PLAY NOW ]` CTA button.
- Mobile responsive hamburger menu. Active link yellow underline indicator. Zero login links.

#### [NEW] [client/src/components/common/Footer.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/components/common/Footer.tsx)
- Sleek white footer matching Reference 1 with brand slogan "UNO — Play. Match. Win.", site links, and social icons.

---

### 7. Core Pages Implementation

#### [NEW] [client/src/pages/Home.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/pages/Home.tsx)
- Recreates Reference 1 in full fidelity:
  - Hero section with bold "PLAY UNO ONLINE" navy/red typography, primary buttons (`▶ PLAY ONLINE` yellow, `▣ PLAY VS COMPUTER` outline), secondary links (`HOW TO PLAY`, `RULES`).
  - 3D perspective fan of vector `UnoCard` components on the right hero section.
  - "PLAY YOUR WAY" 4 mode cards (Online Multiplayer, Vs Computer, Private Rooms, Quick Play).
  - "THE CLASSIC GAME, REIMAGINED" light-blue container with feature badges (Fast Gameplay, Colorful Cards, Action Cards, Real-time Multiplayer).
  - "GAME MODES" grid.
  - "POWERFUL UNO CARDS" interactive showcase with `UnoCard` components and descriptions.
  - "HOW TO PLAY" 4-step card layout.
  - "RULES PREVIEW" grid with direct link to `/rules`.
  - "READY TO PLAY?" light-blue CTA section.

#### [NEW] [client/src/pages/Rules.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/pages/Rules.tsx)
- Recreates Reference 2 in full fidelity:
  - Hero card deck title area.
  - 2-Column responsive grid with soft rounded containers, color-coded header badges, rendered vector `UnoCard` components, and concise explanations (Basic Cards, Reverse, Skip, Skip Wild, Replay, Wild, #, # Wild, -1, -2 Wild).
  - "REMEMBER" light blue tip container at the bottom.

#### [NEW] [client/src/pages/GameScreen.tsx](file:///run/media/rudra/534a134c-69cb-49e5-9a9c-284e9ad8ee1b/UNO/client/src/pages/GameScreen.tsx)
- Recreates Reference 3 in full fidelity:
  - Deep royal blue game table canvas with subtle radial illumination.
  - Top bar: UNO badge, Room code badge with click-to-copy, top opponent info, right control icons (Sound, Music, Settings modal trigger, Chat panel toggle).
  - 4-Player seat positioning (Top, Left, Right, Bottom-YOU).
  - Opponents' hands rendered with overlapping face-down cards and live card count counters.
  - Center table: Draw Pile (3D stacked card deck with counter), Discard Pile (top active card with current color ring), Special Mode diamond indicator, directional turn indicators.
  - `Your Turn` glowing green pulse status bar.
  - Bottom area: Player's interactive hand in overlapping fan layout. Card lift on hover/select.
  - Prominent 3D `[ ⚡ UNO! ]` action button, `[ 📥 Draw Card ]`, and `[ ➔ End Turn ]` buttons.
  - Interactive chat panel overlay / sidebar.
  - Color Picker modal when Wild card is played.

#### [NEW] Pages for Complete Navigation Flow:
- `EnterName.tsx`: Temporary session name prompt with input validation (`/enter-name`).
- `Play.tsx`: Mode selector (`/play`).
- `CreateGame.tsx`: Custom rules, player count (2, 3, 4), turn timer selector (`/create-game`).
- `JoinGame.tsx`: Room code input and validation (`/join-game`).
- `WaitingRoom.tsx`: Lobby with player slot indicators, ready status, copy invite link (`/room/:roomCode`).
- `Computer.tsx`: Single-player vs AI setup (Easy, Medium, Hard) (`/computer`).
- `GameResult.tsx`: Winner celebration screen, score summary, rematch trigger (`/game/:gameId/result`).
- `GamesHistory.tsx`: Session match history (`/games`).
- `Replay.tsx`: Move-by-move match player (`/replay/:gameId`).
- `Watch.tsx`: Public live games spectator list & viewer (`/watch`).
- `Tournaments.tsx`: Bracket tournament viewer (`/tournaments`).
- `Leaderboard.tsx`: Temporary session rankings (`/leaderboard`).
- `Settings.tsx`: Audio volume, card animation speed, reduced motion toggles (`/settings`).

---

## Verification Plan

### Automated Tests
1. **Unit Tests (Vitest)**:
   - `Deck.test.ts`: Verify deck generation (108 cards), shuffling distribution, card draw mechanics, deck empty reshuffle.
   - `UnoGame.test.ts`: Verify legal card matching rules (color, number, symbol, wild), action card side effects (Skip, Reverse, Draw Two, Wild Draw Four), 2-player Reverse behavior, winner determination, penalty enforcement for uncaught UNO.
   - `AIPlayer.test.ts`: Verify AI selects optimal playable cards according to difficulty tier.
2. **Execution command**: `npm run test` or `npx vitest run`.

### Manual & UI Verification
1. Launch full application (`npm run dev` or production node server).
2. Verify all pages match visual reference designs (Home Page, Rules Page, Game Screen).
3. Test single-player mode vs 3 AI bots from start to finish.
4. Open multiple browser tabs (or incognito windows) to test real-time Socket.IO 4-player multiplayer, chat, UNO button, turn timers, and victory screen.
5. Test responsive layout across Desktop (1920x1080), Tablet (768x1024), and Mobile (375x812) viewports.
