import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { UnoGame } from './engine/UnoGame';
import { AIPlayer } from './engine/AIPlayer';
import { validatePlayerName, validateRoomCode } from '../shared/validation/roomValidator';
import { GameSettings, MovePayload } from '../shared/types/game';

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

// Helper: Broadcast game state to room with masked private hands
function broadcastGameState(game: UnoGame) {
  const publicState = game.getPublicState();
  
  // Send masked private state to each connected player
  game.players.forEach((player) => {
    const playerSockets = Array.from(socketPlayerMap.entries())
      .filter(([_, data]) => data.roomCode === game.roomCode && data.playerId === player.id)
      .map(([sId, _]) => sId);

    const privateState = game.getPrivateState(player.id);
    if (playerSockets.length > 0) {
      playerSockets.forEach((sId) => {
        io.to(sId).emit('game:state', privateState);
      });
    } else {
      // Fallback: broadcast private state to room channel if socket ID mapping was reconnected
      io.to(`room_${game.roomCode}`).emit('game:state', privateState);
    }
  });

  // Also broadcast public state to room roomCode channel for spectators
  io.to(`room_${game.roomCode}`).emit('game:publicState', publicState);
}

// Helper: Trigger AI move if current player is an AI bot
function checkAndExecuteAIMove(game: UnoGame) {
  if (game.status !== 'PLAYING') return;

  const currentPlayer = game.getCurrentPlayer();
  if (currentPlayer && currentPlayer.id.startsWith('bot_')) {
    setTimeout(() => {
      const hand = game.playerHands.get(currentPlayer.id) || [];
      const move = AIPlayer.selectMove(hand, game.getPublicState(), 'MEDIUM');

      if (move && move.cardId) {
        game.playCard(currentPlayer.id, move.cardId, move.chosenColor);
      } else {
        game.drawCard(currentPlayer.id);
      }

      broadcastGameState(game);

      // Check if next turn is also an AI bot
      if (game.status === 'PLAYING' && game.getCurrentPlayer().id.startsWith('bot_')) {
        checkAndExecuteAIMove(game);
      }
    }, 1200);
  }
}

// -----------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeGames: activeGames.size });
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
    mode: 'CLASSIC'
  });
});

// -----------------------------------------------------------------
// SOCKET.IO EVENT HANDLERS
// -----------------------------------------------------------------
io.on('connection', (socket) => {
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
    socketPlayerMap.set(socket.id, { roomCode, playerId, sessionId });

    console.log(`[ROOM CREATE] Generated roomCode: "${roomCode}"`);
    console.log(`[ROOM CREATE] Stored room key: "${roomCode}" for host "${valName.sanitizedName}" (socket ${socket.id})`);
    console.log(`[ROOM CREATE] Current active room keys: [${Array.from(activeGames.keys()).join(', ')}]`);

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
  });

  // 1b. Create Room VS AI
  socket.on('room:createVsAI', ({ playerName }: { playerName: string }, callback) => {
    const valName = validatePlayerName(playerName);
    if (!valName.valid) {
      if (callback) callback({ success: false, error: valName.error });
      return;
    }

    const roomCode = generateRoomCode();
    const gameId = `game_ai_${Date.now()}`;
    const game = new UnoGame(gameId, roomCode, { maxPlayers: 4 });

    const humanId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;

    // Add Human player
    game.addPlayer(humanId, sessionId, valName.sanitizedName!, true);

    // Add 3 AI bot players
    const bots = [
      { id: 'bot_alex', name: 'Bot Alex (AI)', avatar: '🤖' },
      { id: 'bot_sam', name: 'Bot Sam (AI)', avatar: '👾' },
      { id: 'bot_morgan', name: 'Bot Morgan (AI)', avatar: '🧠' }
    ];

    bots.forEach(b => {
      game.addPlayer(b.id, `sess_${b.id}`, b.name, false);
    });

    activeGames.set(roomCode, game);

    socket.join(`room_${roomCode}`);
    socketPlayerMap.set(socket.id, { roomCode, playerId: humanId, sessionId });

    console.log(`[ROOM] Created VS AI room ${roomCode} for player ${valName.sanitizedName}`);

    // Start game immediately
    game.startGame();

    if (callback) {
      callback({
        success: true,
        roomCode,
        gameId,
        playerId: humanId,
        sessionId,
        state: game.getPrivateState(humanId)
      });
    }

    broadcastGameState(game);
    checkAndExecuteAIMove(game);
  });

  // 2. Join Room
  socket.on('room:join', ({ roomCode, playerName }: { roomCode: string; playerName: string }, callback) => {
    console.log(`[ROOM JOIN] Received roomCode: "${roomCode}" from player: "${playerName}"`);
    const valCode = validateRoomCode(roomCode);
    const valName = validatePlayerName(playerName);

    if (!valCode.valid || !valName.valid) {
      const err = valCode.error || valName.error;
      console.log(`[ROOM JOIN] Validation failed for code "${roomCode}": ${err}`);
      if (callback) callback({ success: false, error: err });
      return;
    }

    const formattedCode = valCode.formattedCode!;
    console.log(`[ROOM JOIN] Normalized roomCode: "${formattedCode}"`);
    console.log(`[ROOM JOIN] Available server room keys: [${Array.from(activeGames.keys()).join(', ')}]`);

    const game = activeGames.get(formattedCode);
    console.log(`[ROOM JOIN] Found room:`, !!game);

    if (!game) {
      console.log(`[ROOM JOIN] FAIL: Room not found for code: "${formattedCode}"`);
      if (callback) callback({ success: false, error: 'Room not found. Check your room code.' });
      return;
    }

    if (game.status === 'PLAYING') {
      console.log(`[ROOM] Room "${formattedCode}" is already playing.`);
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
        console.log(`[ROOM] Room "${formattedCode}" is full (${game.players.length}/${game.settings.maxPlayers}).`);
        if (callback) callback({ success: false, error: 'Room is full.' });
        return;
      }
    }

    socket.join(`room_${formattedCode}`);
    socketPlayerMap.set(socket.id, { roomCode: formattedCode, playerId, sessionId });

    console.log(`[ROOM] Player ${valName.sanitizedName} (${playerId}) joined room ${formattedCode}. Players: ${game.players.length}/${game.settings.maxPlayers}`);

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

  // 3. Start Game
  socket.on('game:start', (_, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const player = game.players.find(p => p.id === playerInfo.playerId);
    if (!player || !player.isHost) {
      if (callback) callback({ success: false, error: 'Only the host can start the game.' });
      return;
    }

    const started = game.startGame();
    if (!started) {
      if (callback) callback({ success: false, error: 'Need at least 2 players to start.' });
      return;
    }

    console.log(`[ROOM] Game started in room ${game.roomCode}`);

    if (callback) {
      callback({
        success: true,
        state: game.getPrivateState(player.id)
      });
    }
    broadcastGameState(game);
    checkAndExecuteAIMove(game);
  });

  // 4. Play Card
  socket.on('game:playCard', (payload: MovePayload, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game || !payload.cardId) return;

    const result = game.playCard(playerInfo.playerId, payload.cardId, payload.chosenColor);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
      checkAndExecuteAIMove(game);
    }
  });

  // 5. Draw Card
  socket.on('game:drawCard', (_, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const result = game.drawCard(playerInfo.playerId);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
      checkAndExecuteAIMove(game);
    }
  });

  // 6. Call UNO
  socket.on('game:callUno', (_, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const result = game.callUno(playerInfo.playerId);
    if (callback) callback(result);

    if (result.success) {
      broadcastGameState(game);
    }
  });

  // 6b. Sync Game State
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
      console.log(`[ROOM] game:sync failed for roomCode="${roomCode}", gameId="${gameId}", playerId="${playerId}"`);
      if (callback) callback({ success: false, error: 'Game not found' });
      return;
    }

    const pId = playerId || playerInfo?.playerId || game.players.find(p => !p.id.startsWith('bot_'))?.id || game.players[0]?.id;

    // Bind socket.id to socketPlayerMap and join socket room for state broadcasts
    if (pId) {
      const targetPlayer = game.players.find(p => p.id === pId);
      if (targetPlayer) {
        targetPlayer.isConnected = true;
        socketPlayerMap.set(socket.id, { roomCode: game.roomCode, playerId: pId, sessionId: targetPlayer.sessionId });
        socket.join(`room_${game.roomCode}`);
      }
    }

    console.log(`[ROOM] game:sync success for room ${game.roomCode}, player ${pId}`);
    const privateState = game.getPrivateState(pId);
    if (callback) callback({ success: true, state: privateState });
  });

  // 6c. Rematch Game
  socket.on('game:rematch', (_, callback) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    game.startGame();
    if (callback) callback({ success: true });

    broadcastGameState(game);
    checkAndExecuteAIMove(game);
  });

  // 7. Chat Message
  socket.on('chat:message', ({ text }: { text: string }) => {
    const playerInfo = socketPlayerMap.get(socket.id);
    if (!playerInfo || !text.trim()) return;

    const game = activeGames.get(playerInfo.roomCode);
    if (!game) return;

    const sender = game.players.find(p => p.id === playerInfo.playerId);
    if (!sender) return;

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      senderId: sender.id,
      senderName: sender.name,
      text: text.trim().substring(0, 100),
      timestamp: Date.now()
    };

    game.chatMessages.push(msg);
    io.to(`room_${game.roomCode}`).emit('chat:message', msg);
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

// Serve frontend build in production
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
