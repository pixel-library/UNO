-- =================================================================
-- UNO Platform Database Schema for Supabase PostgreSQL
-- Run this script in your Supabase Project SQL Editor
-- =================================================================

-- 1. Game Table
CREATE TABLE IF NOT EXISTS "Game" (
  "id" TEXT PRIMARY KEY,
  "roomCode" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'WAITING',
  "mode" TEXT NOT NULL DEFAULT 'CLASSIC',
  "direction" TEXT NOT NULL DEFAULT 'CW',
  "currentColor" TEXT NOT NULL DEFAULT 'RED',
  "winnerId" TEXT,
  "activeStackCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3)
);

-- 2. GamePlayer Table
CREATE TABLE IF NOT EXISTS "GamePlayer" (
  "id" TEXT PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "sessionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cardCount" INTEGER NOT NULL DEFAULT 7,
  "score" INTEGER NOT NULL DEFAULT 0,
  "isHost" BOOLEAN NOT NULL DEFAULT false,
  "isSpectator" BOOLEAN NOT NULL DEFAULT false
);

-- 3. GameMove Table
CREATE TABLE IF NOT EXISTS "GameMove" (
  "id" TEXT PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "playerId" TEXT NOT NULL,
  "moveType" TEXT NOT NULL,
  "cardId" TEXT,
  "cardColor" TEXT,
  "cardValue" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. GameSession Table
CREATE TABLE IF NOT EXISTS "GameSession" (
  "sessionId" TEXT PRIMARY KEY,
  "playerName" TEXT NOT NULL,
  "totalGames" INTEGER NOT NULL DEFAULT 0,
  "totalWins" INTEGER NOT NULL DEFAULT 0,
  "unoCalls" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for fast lookups
CREATE INDEX IF NOT EXISTS "idx_game_roomcode" ON "Game"("roomCode");
CREATE INDEX IF NOT EXISTS "idx_gameplayer_gameid" ON "GamePlayer"("gameId");
CREATE INDEX IF NOT EXISTS "idx_gamemove_gameid" ON "GameMove"("gameId");
