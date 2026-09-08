# 🃏 Premium Online UNO Game Platform

A complete, production-ready, real-time online UNO game web application built with React, TypeScript, Express, Socket.IO, Tailwind CSS, and Prisma ORM.

Inspired by premium digital card game platforms, this application features **zero login/signup**, server-authoritative multiplayer gameplay, intelligent AI opponents, vector UNO card graphics, and house rule customizations.

---

## 🌟 Key Features

- **No Login / Signup Required**: Instant guest session identity (`guest_xxxxx`) stored in `localStorage`.
- **Reference-Faithful Visual Designs**:
  - **Home Page**: Editorial hero section, 3D fanned vector cards, mode showcases, step-by-step tutorial.
  - **Rules Page**: 2-column rule cards with vector card previews and concise explanations.
  - **Game Screen**: Royal blue game table with 4-player seats, interactive deck & discard pile, turn indicators, glowing `UNO!` button, and live chat.
- **Server-Authoritative Game Engine**:
  - Moves, card draws, action cards (Skip, Reverse, Draw Two, Wild, Wild Draw Four), and scores are 100% validated server-side.
  - Hidden hands: Opponents only receive card counts, protecting against client-side inspecting/cheating.
- **AI Bot Intelligence**: 3 difficulty levels (Easy, Medium, Hard) for VS Computer mode.
- **Web Audio API Sound Engine**: Zero external audio asset dependencies. Crisp synthesizer sounds for card plays, draws, UNO calls, and victory.
- **Custom House Rules**: Toggle Stacking (+2 / +4), Custom Action Cards (Replay, Skip Wild, #, -1), Turn Timers, and Spectator Mode.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: Prisma ORM (SQLite / PostgreSQL)
- **Game Engine**: Custom Server-Authoritative UNO Engine + AI Bot Strategy Module
- **Testing**: Vitest

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd UNO
npm install
```

### 2. Run in Development Mode

```bash
npm run dev
```

This starts both the Express Socket.IO server (port 5000) and the Vite frontend dev server (port 3000) concurrently.

Open your browser at `http://localhost:3000`.

---

## 🧪 Running Tests

Run the Vitest test suite to verify deck distribution, legal move validation, action cards, and AI logic:

```bash
npm run test
```

---

## 🏗️ Production Build

```bash
npm run build
npm start
```

---

## 📄 License

MIT License. Free and open source.
