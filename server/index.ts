import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { UnoGame } from './engine/UnoGame';
import { validatePlayerName, validateRoomCode } from '../shared/validation/roomValidator';
import { GameSettings, MovePayload, ChatMessage, CardColor } from '../shared/types/game';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// In-memory active games mapping (roomCode -> UnoGame)
const activeGames = new Map<string, UnoGame>();
// Socket ID -> { roomCode, playerId, sessionId }
const socketPlayerMap = new Map<string, { roomCode: string; playerId: string; sessionId: string }>();

// Generate unique 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (activeGames.has(code));
  return code;
}

function broadcastGameState(game: UnoGame) {
  const roomName = `room_${game.roomCode}`;
  const roomSockets = io.sockets.adapter.rooms.get(roomName);

  if (roomSockets) {
    for (const sId of roomSockets) {
      const clientSocket = io.sockets.sockets.get(sId);
      const playerInfo = socketPlayerMap.get(sId);
      const pId = clientSocket?.data?.playerId || playerInfo?.playerId;

      if (pId) {
        const privateState = game.getPrivateState(pId);
        io.to(sId).emit('game:state', privateState);
      } else {
        // If socket lacks playerId, send public masked state for host/first player
        const fallbackPlayer = game.players.find(p => p.isHost) || game.players[0];
        if (fallbackPlayer) {
          io.to(sId).emit('game:state', game.getPrivateState(fallbackPlayer.id));
        }
      }
    }
  } else {
    // Fallback if room socket adapter not ready
    game.players.forEach((player) => {
      const privateState = game.getPrivateState(player.id);
      io.to(roomName).emit('game:state', privateState);
    });
  }

  io.to(roomName).emit('game:publicState', game.getPublicState());
}



// -----------------------------------------------------------------
// SERVER-SIDE COMPUTER AI BOT EXECUTION & TURN TIMERS
// -----------------------------------------------------------------
function executeBotTurn(game: UnoGame) {
  if (game.status !== 'PLAYING') return;
  const currPlayer = game.getCurrentPlayer();
  if (!currPlayer || (!currPlayer.isBot && !currPlayer.id.startsWith('bot_'))) return;

  const botId = currPlayer.id;
  let hand = game.playerHands.get(botId) || [];

  // Handle pending 7-swap or Wild swap
  if (game.pendingHandSwapPlayerId === botId) {
    const activePlayers = game.players.filter(p => !p.isSpectator && !p.isEliminated && !p.isFinished && p.id !== botId);
    activePlayers.sort((a, b) => a.cardCount - b.cardCount);
    const target = activePlayers[0] || activePlayers[Math.floor(Math.random() * activePlayers.length)];
    if (target) {
      game.swapHands(botId, target.id);
    } else {
      game.pendingHandSwapPlayerId = null;
    }
    broadcastGameState(game);
    return;
  }

  // Find playable cards
  const playableCards = hand.filter(card => game.isPlayable(card));

  // Determine best color choice for Wild cards based on current hand composition
  const colorCounts: Record<CardColor, number> = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, WILD: 0 };
  hand.forEach(c => {
    if (c.color !== 'WILD') colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
  });
  let bestChosenColor: CardColor = 'RED';
  let maxCount = -1;
  (['RED', 'YELLOW', 'GREEN', 'BLUE'] as CardColor[]).forEach(col => {
    if (colorCounts[col] > maxCount) {
      maxCount = colorCounts[col];
      bestChosenColor = col;
    }
  });

  if (playableCards.length > 0) {
    // Prefer Action cards (+10, +6, +4, Reverse +4, Roulette, Skip All, +2, Skip, Reverse) or matching active color
    let cardToPlay = playableCards.find(c =>
      c.value === 'WILD_DRAW_TEN' ||
      c.value === 'WILD_DRAW_SIX' ||
      c.value === 'WILD_REVERSE_DRAW_FOUR' ||
      c.value === 'WILD_DRAW_FOUR' ||
      c.value === 'WILD_COLOR_ROULETTE' ||
      c.value === 'SKIP_EVERYONE' ||
      c.value === 'DRAW_TWO' ||
      c.value === 'SKIP' ||
      c.value === 'REVERSE'
    );
    if (!cardToPlay) cardToPlay = playableCards.find(c => c.color === game.currentColor);
    if (!cardToPlay) cardToPlay = playableCards[0];

    // Call UNO if bot will have 1 card remaining post-play
    if (hand.length === 2 && !currPlayer.hasCalledUno) {
      game.callUno(botId);
    }

    game.playCard(botId, cardToPlay.id, cardToPlay.color === 'WILD' ? bestChosenColor : undefined);
  } else {
    // Draw card
    const drawRes = game.drawCard(botId);
    if (drawRes.success && drawRes.drawnCard && game.getCurrentPlayer()?.id === botId && game.isPlayable(drawRes.drawnCard)) {
      const updatedHand = game.playerHands.get(botId) || [];
      if (updatedHand.length === 2 && !currPlayer.hasCalledUno) {
        game.callUno(botId);
      }
      game.playCard(botId, drawRes.drawnCard.id, drawRes.drawnCard.color === 'WILD' ? bestChosenColor : undefined);
    }
  }

  broadcastGameState(game);
}

// Bot Heartbeat Interval (Triggers Bot Moves every 800ms)
setInterval(() => {
  activeGames.forEach((game) => {
    if (game.status === 'PLAYING') {
      const hasConnectedHuman = game.players.some(p => !p.isBot && !p.id.startsWith('bot_') && p.isConnected);
      if (hasConnectedHuman) {
        const curr = game.getCurrentPlayer();
        if (curr && (curr.isBot || curr.id.startsWith('bot_'))) {
          executeBotTurn(game);
        }
      }
    }
  });
}, 800);

setInterval(() => {
  activeGames.forEach((game) => {
    if (game.status === 'PLAYING' && game.settings.turnTimerSeconds > 0) {
      const elapsedSeconds = (Date.now() - game.turnStartedAt) / 1000;
      if (elapsedSeconds >= game.settings.turnTimerSeconds) {
        const curr = game.getCurrentPlayer();
        console.log(`[AFK TIMER] Player ${curr.name} in room ${game.roomCode} timed out (${elapsedSeconds.toFixed(1)}s).`);
        if (game.pendingHandSwapPlayerId) {
          const activePlayers = game.players.filter(p => !p.isSpectator);
          const target = activePlayers.find(p => p.id !== game.pendingHandSwapPlayerId);
          if (target) {
            game.swapHands(game.pendingHandSwapPlayerId, target.id);
          } else {
            game.pendingHandSwapPlayerId = null;
          }
        } else {
          game.drawCard(curr.id);
        }
        game.turnStartedAt = Date.now();
        broadcastGameState(game);
      }
    }
  });
}, 1000);

// -----------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeGames: activeGames.size });
});

function getPublicRoomsList(): any[] {
  const publicRooms: any[] = [];
  activeGames.forEach((game) => {
    if (game.status === 'WAITING' && !game.settings.isPrivate) {
      publicRooms.push({
        code: game.roomCode,
        gameId: game.id,
        hostName: game.players.find(p => p.isHost)?.name || 'Host',
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        settings: game.settings
      });
    }
  });
  return publicRooms;
}

function broadcastLobbyUpdate() {
  io.emit('lobby:update', getPublicRoomsList());
}

app.get('/api/rooms/public', (req, res) => {
  res.json({ success: true, rooms: getPublicRoomsList() });
});

app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const game = activeGames.get(code);
  if (!game) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    code: game.roomCode,
    status: game.status,
    playerCount: game.players.length,
    maxPlayers: game.settings.maxPlayers,
    mode: game.settings.mode || 'CLASSIC'
  });
});

// -----------------------------------------------------------------
// SOCKET.IO EVENT HANDLERS
// -----------------------------------------------------------------
io.on('connection', (socket) => {

  // Get Lobby Public Rooms
  socket.on('lobby:getRooms', (callback) => {
    if (callback) callback({ success: true, rooms: getPublicRoomsList() });
  });

  // 1. Create Room
  socket.on('room:create', ({ playerName, settings }: { playerName: string; settings?: Partial<GameSettings> }, callback) => {
    const valName = validatePlayerName(playerName);
    if (!valName.valid) {
      if (callback) callback({ success: false, error: valName.error });
      return;
    }

    const roomCode = generateRoomCode();
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const game = new UnoGame(gameId, roomCode, settings);

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;

    game.addPlayer(playerId, sessionId, valName.sanitizedName!, true);
    activeGames.set(roomCode, game);

    socket.join(`room_${roomCode}`);
    socket.data.playerId = playerId;
    socket.data.roomCode = roomCode;
    socketPlayerMap.set(socket.id, { roomCode, playerId, sessionId });

    if (callback) {
      callback({
        success: true,
        roomCode,
        gameId,
        playerId,
        sessionId,
        state: game.getPrivateState(playerId)
      });
    }

    broadcastGameState(game);
    broadcastLobbyUpdate();
  });

  // 1b. Create VS Computer Room (2, 3, or 4 Players)
  socket.on('room:createVsBot', ({ playerName, botCount = 1, settings }: { playerName: string; botCount?: number; settings?: Partial<GameSettings> }, callback) => {
    const valName = validatePlayerName(playerName);
    if (!valName.valid) {
      if (callback) callback({ success: false, error: valName.error });
      return;
    }

    const requestedBotCount = Math.min(3, Math.max(1, botCount)); // 1, 2, or 3 bots
    const maxPlayers = requestedBotCount + 1; // 2, 3, or 4 total players

    const roomCode = generateRoomCode();
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const game = new UnoGame(gameId, roomCode, { ...settings, maxPlayers, mode: 'VS_COMPUTER', enableChat: false });

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;

    // Add Human player as host
    game.addPlayer(playerId, sessionId, valName.sanitizedName!, true);

    // Add requested AI bots
    for (let i = 0; i < requestedBotCount; i++) {
      game.addBot();
    }

    activeGames.set(roomCode, game);

    socket.join(`room_${roomCode}`);
    socket.data.playerId = playerId;
    socket.data.roomCode = roomCode;
    socketPlayerMap.set(socket.id, { roomCode, playerId, sessionId });

    // Start VS Computer match immediately
    game.startGame();

    if (callback) {
      callback({
        success: true,
        roomCode,
        gameId,
        playerId,
        sessionId,
        state: game.getPrivateState(playerId)
      });
    }

    broadcastGameState(game);
    broadcastLobbyUpdate();
  });




  // 2. Join Room
  socket.on('room:join', ({ roomCode, playerName }: { roomCode: string; playerName: string }, callback) => {
    const valCode = validateRoomCode(roomCode);
    const valName = validatePlayerName(playerName);

    if (!valCode.valid || !valName.valid) {
      const err = valCode.error || valName.error;
      if (callback) callback({ success: false, error: err });
      return;
    }

    const formattedCode = valCode.formattedCode!;
    const game = activeGames.get(formattedCode);

    if (!game) {
      if (callback) callback({ success: false, error: 'Room not found. Check your room code.' });
      return;
    }

    if (game.kickedNames.has(valName.sanitizedName!.toLowerCase())) {
      if (callback) callback({ success: false, error: 'You were removed from this room by the host.' });
      return;
    }

    if (game.status === 'PLAYING') {
      if (callback) callback({ success: false, error: 'Game already in progress.' });
      return;
    }

    let existingPlayer = game.players.find(p => p.name.toLowerCase() === valName.sanitizedName!.toLowerCase());
    let playerId: string;
    let sessionId: string;

    if (existingPlayer) {
      playerId = existingPlayer.id;
      sessionId = existingPlayer.sessionId;
      existingPlayer.isConnected = true;
    } else {
      playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
      sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      const player = game.addPlayer(playerId, sessionId, valName.sanitizedName!, false);
      if (!player) {
        if (callback) callback({ success: false, error: 'Room is full.' });
        return;
      }
    }

    socket.join(`room_${formattedCode}`);
    socket.data.playerId = playerId;
    socket.data.roomCode = formattedCode;
    socketPlayerMap.set(socket.id, { roomCode: formattedCode, playerId, sessionId });

    if (callback) {
      callback({
        success: true,
        roomCode: formattedCode,
        gameId: game.id,
        playerId,
        sessionId,
        state: game.getPrivateState(playerId)
      });
    }

    broadcastGameState(game);
  });

  // 2b. Room Host Actions
  socket.on('room:kickPlayer', ({ targetPlayerId }: { targetPlayerId: string }, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const success = game.kickPlayer(playerInfo.playerId, targetPlayerId);
    if (callback) callback({ success });
    if (success) {
      broadcastGameState(game);
      broadcastLobbyUpdate();
    }
  });

  socket.on('room:transferHost', ({ newHostId }: { newHostId: string }, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const success = game.transferHost(playerInfo.playerId, newHostId);
    if (callback) callback({ success });
    if (success) broadcastGameState(game);
  });

  socket.on('room:updateSettings', ({ settings }: { settings: Partial<GameSettings> }, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const success = game.updateSettings(playerInfo.playerId, settings);
    if (callback) callback({ success });
    if (success) {
      broadcastGameState(game);
      broadcastLobbyUpdate();
    }
  });



  // 3. Start Game
  socket.on('game:start', (payload: any, callback: any) => {
    let cb = typeof payload === 'function' ? payload : callback;
    let payloadData = typeof payload === 'object' ? payload : {};

    let roomCodeFromPayload = payloadData?.roomCode ? String(payloadData.roomCode).trim().toUpperCase() : undefined;
    let playerInfo = socketPlayerMap.get(socket.id);
    let targetRoomCode = playerInfo?.roomCode || roomCodeFromPayload;

    let game = targetRoomCode ? activeGames.get(targetRoomCode) : undefined;
    if (!game) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.isHost));
    }

    if (!game) {
      if (cb) cb({ success: false, error: 'Game not found.' });
      return;
    }

    let player = playerInfo ? game.players.find(p => p.id === playerInfo.playerId) : undefined;
    if (!player) {
      player = game.players.find(p => p.isHost);
    }
    if (!player || !player.isHost) {
      if (cb) cb({ success: false, error: 'Only the host can start the game.' });
      return;
    }

    socket.data.playerId = player.id;
    socket.data.roomCode = game.roomCode;
    socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId: player.id, sessionId: player.sessionId });
    socket.join(`room_${game.roomCode}`);

    const started = game.startGame();
    if (!started) {
      if (cb) cb({ success: false, error: 'Need at least 2 players to start.' });
      return;
    }

    if (cb) {
      cb({
        success: true,
        state: game.getPrivateState(player.id)
      });
    }
    broadcastGameState(game);
    broadcastLobbyUpdate();
  });

  // 4. Play Card
  socket.on('game:playCard', (payload: MovePayload & { playerId?: string; roomCode?: string; cardColor?: CardColor; cardValue?: any }, callback) => {
    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = payload?.playerId || playerInfo?.playerId || socket.data?.playerId;
    let roomCode = payload?.roomCode ? String(payload.roomCode).trim().toUpperCase() : (playerInfo?.roomCode || socket.data?.roomCode);

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !payload?.cardId || !playerId) {
      if (callback) callback({ success: false, error: 'Game or player session invalid' });
      return;
    }

    // Ensure socket map & room join are registered
    if (!playerInfo && game) {
      socket.data.playerId = playerId;
      socket.data.roomCode = game.roomCode;
      const targetPlayer = game.players.find(p => p.id === playerId);
      socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId, sessionId: targetPlayer?.sessionId || `sess_${playerId}` });
      socket.join(`room_${game.roomCode}`);
    }

    const result = game.playCard(playerId, payload.cardId, payload.chosenColor, payload.cardColor, payload.cardValue);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 4b. Jump-In Out of Turn Play
  socket.on('game:jumpIn', (payload: MovePayload, callback) => {
    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = playerInfo?.playerId || socket.data?.playerId;
    let roomCode = playerInfo?.roomCode || socket.data?.roomCode;

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !payload.cardId || !playerId) {
      if (callback) callback({ success: false, error: 'Jump-in invalid' });
      return;
    }

    const result = game.jumpIn(playerId, payload.cardId, payload.chosenColor);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 4c. 7-Zero & Wild Swap Hand Selection
  const handleHandSwapEvent = (data: any, callback?: Function) => {
    const targetId = data?.targetSwapPlayerId || data?.targetPlayerId;
    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = playerInfo?.playerId || socket.data?.playerId;
    let roomCode = playerInfo?.roomCode || socket.data?.roomCode;

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !playerId || !targetId) {
      if (callback) callback({ success: false, error: 'Swap target invalid' });
      return;
    }

    const result = game.swapHands(playerId, targetId, data?.chosenColor);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
    }
  };

  socket.on('game:swapHand', handleHandSwapEvent);
  socket.on('game:swapHands', handleHandSwapEvent);

  // 5. Draw Card
  socket.on('game:drawCard', (payload: any, callback: any) => {
    let cb = typeof payload === 'function' ? payload : callback;
    let payloadData = typeof payload === 'object' ? payload : {};

    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = payloadData?.playerId || playerInfo?.playerId || socket.data?.playerId;
    let roomCode = payloadData?.roomCode ? String(payloadData.roomCode).trim().toUpperCase() : (playerInfo?.roomCode || socket.data?.roomCode);

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !playerId) {
      if (cb) cb({ success: false, error: 'Game not found' });
      return;
    }

    // Ensure socket map & room join are registered
    if (!playerInfo && game) {
      socket.data.playerId = playerId;
      socket.data.roomCode = game.roomCode;
      const targetPlayer = game.players.find(p => p.id === playerId);
      socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId, sessionId: targetPlayer?.sessionId || `sess_${playerId}` });
      socket.join(`room_${game.roomCode}`);
    }

    if (game.getCurrentPlayer().id !== playerId) {
      if (cb) cb({ success: false, error: 'Not your turn' });
      return;
    }

    const result = game.drawCard(playerId);
    if (cb) cb(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 5b. Pass Turn
  socket.on('game:passTurn', (payload: any, callback: any) => {
    let cb = typeof payload === 'function' ? payload : callback;
    let payloadData = typeof payload === 'object' ? payload : {};

    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = payloadData?.playerId || playerInfo?.playerId || socket.data?.playerId;
    let roomCode = payloadData?.roomCode ? String(payloadData.roomCode).trim().toUpperCase() : (playerInfo?.roomCode || socket.data?.roomCode);

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !playerId) {
      if (cb) cb({ success: false, error: 'Game not found' });
      return;
    }

    // Ensure socket map & room join are registered
    if (!playerInfo && game) {
      socket.data.playerId = playerId;
      socket.data.roomCode = game.roomCode;
      const targetPlayer = game.players.find(p => p.id === playerId);
      socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId, sessionId: targetPlayer?.sessionId || `sess_${playerId}` });
      socket.join(`room_${game.roomCode}`);
    }

    const result = game.passTurn(playerId);
    if (cb) cb(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 6. Call UNO
  socket.on('game:callUno', (_, callback) => {
    let playerInfo = socketPlayerMap.get(socket.id);
    let playerId = playerInfo?.playerId || socket.data?.playerId;
    let roomCode = playerInfo?.roomCode || socket.data?.roomCode;

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game || !playerId) {
      if (callback) callback({ success: false, error: 'Game not found' });
      return;
    }

    const result = game.callUno(playerId);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 6b. Challenge Uncaught UNO
  socket.on('game:challengeUno', (payload: any, callback: any) => {
    let cb = typeof payload === 'function' ? payload : callback;
    let payloadData = typeof payload === 'object' ? payload : {};
    let targetPlayerId = payloadData?.targetPlayerId;

    let playerInfo = socketPlayerMap.get(socket.id);
    let challengerId = payloadData?.playerId || playerInfo?.playerId || socket.data?.playerId;
    let roomCode = payloadData?.roomCode ? String(payloadData.roomCode).trim().toUpperCase() : (playerInfo?.roomCode || socket.data?.roomCode);

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game && challengerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === challengerId));
    }

    if (!game || !challengerId) {
      if (cb) cb({ success: false, error: 'Invalid challenge' });
      return;
    }

    const result = game.challengeUno(challengerId, targetPlayerId);
    if (cb) cb(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 6c. Send Live Emote
  socket.on('game:sendEmote', ({ emote }: { emote: string }) => {
    let playerInfo = socketPlayerMap.get(socket.id);
    let senderId = playerInfo?.playerId || socket.data?.playerId;
    let roomCode = playerInfo?.roomCode || socket.data?.roomCode;

    let game = roomCode ? activeGames.get(roomCode) : undefined;
    if (!game || !senderId || !emote) return;

    const success = game.sendEmote(senderId, emote);
    if (success) {
      broadcastGameState(game);
    }
  });

  // 6d. Sync Game State
  socket.on('game:sync', ({ roomCode, playerId, gameId }: { roomCode?: string; playerId?: string; gameId?: string } = {}, callback?: (res: any) => void) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    let formattedCode = roomCode ? roomCode.trim().toUpperCase() : undefined;
    let game: UnoGame | undefined;

    if (formattedCode) {
      game = activeGames.get(formattedCode);
    }
    if (!game && gameId) {
      game = Array.from(activeGames.values()).find(g => g.id === gameId);
    }
    if (!game && playerInfo?.roomCode) {
      game = activeGames.get(playerInfo.roomCode);
    }
    if (!game && playerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === playerId));
    }

    if (!game) {
      if (callback) callback({ success: false, error: 'Game not found' });
      return;
    }

    const pId = playerId || playerInfo?.playerId || game.players.find(p => !p.id.startsWith('bot_'))?.id || game.players[0]?.id;

    if (pId) {
      const targetPlayer = game.players.find(p => p.id === pId);
      if (targetPlayer) {
        targetPlayer.isConnected = true;
        socket.data.playerId = pId;
        socket.data.roomCode = game.roomCode;
        socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId: pId, sessionId: targetPlayer.sessionId });
        socket.join(`room_${game.roomCode}`);
      }
    }

    const privateState = game.getPrivateState(pId);
    if (callback) callback({ success: true, state: privateState });
  });

  // 6e. Rematch
  socket.on('game:rematch', (_, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const player = game.players.find(p => p.id === playerInfo.playerId);
    if (!player || !player.isHost) {
      if (callback) callback({ success: false, error: 'Only the host can start a rematch.' });
      return;
    }

    const started = game.startGame();
    if (callback) callback({ success: started, error: started ? undefined : 'Need at least 2 players to start.' });

    if (started) {
      broadcastGameState(game);
    }
  });

  // 7. Chat Message
  socket.on('chat:message', ({ text, roomCode, playerId, id }: { text: string; roomCode?: string; playerId?: string; id?: string }) => {
    if (!text || !text.trim()) return;

    let playerInfo = socketPlayerMap.get(socket.id);
    let targetRoomCode = playerInfo?.roomCode || (roomCode ? roomCode.trim().toUpperCase() : undefined);
    let targetPlayerId = playerInfo?.playerId || playerId;

    let game: UnoGame | undefined;
    if (targetRoomCode) {
      game = activeGames.get(targetRoomCode);
    }
    if (!game && targetPlayerId) {
      game = Array.from(activeGames.values()).find(g => g.players.some(p => p.id === targetPlayerId));
    }

    if (!game) return;

    let sender = game.players.find(p => p.id === targetPlayerId);
    if (!sender && playerInfo) {
      sender = game.players.find(p => p.id === playerInfo.playerId);
    }
    if (!sender) {
      sender = game.players[0];
    }
    if (!sender) return;

    socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId: sender.id, sessionId: sender.sessionId });
    socket.join(`room_${game.roomCode}`);

    const msg: ChatMessage = {
      id: id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      senderId: sender.id,
      senderName: sender.name,
      text: text.trim().substring(0, 100),
      timestamp: Date.now()
    };

    if (!game.chatMessages.some(m => m.id === msg.id)) {
      game.chatMessages.push(msg);
    }

    io.to(`room_${game.roomCode}`).emit('chat:message', msg);
    broadcastGameState(game);
  });

  // 8. Disconnect
  socket.on('disconnect', () => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (playerInfo) {
      const game = activeGames.get(playerInfo.roomCode);
      if (game) {
        const player = game.players.find(p => p.id === playerInfo.playerId);
        if (player) {
          player.isConnected = false;
          broadcastGameState(game);
        }
      }
      socketPlayerMap.delete(socket.id);
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
