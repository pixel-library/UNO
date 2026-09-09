import { io, Socket } from 'socket.io-client';
import { UnoGame } from '../../../server/engine/UnoGame';
import { AIPlayer } from '../../../server/engine/AIPlayer';
import { validatePlayerName, validateRoomCode } from '../../../shared/validation/roomValidator';
import { GameSettings, MovePayload } from '../../../shared/types/game';

class SocketService {
  private socket: Socket | null = null;
  private localGames: Map<string, UnoGame> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  public getSocket(): Socket {
    if (!this.socket) {
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        window.location.origin;

      const realSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Wrap socket to support client-side fallback if server is unreachable
      this.socket = new Proxy(realSocket, {
        get: (target: any, prop: string) => {
          if (prop === 'emit') {
            return (eventName: string, ...args: any[]) => {
              // If connected to server, emit via socket.io
              if (target.connected) {
                return target.emit(eventName, ...args);
              }
              // Offline / Local Execution Fallback when socket is disconnected
              return this.handleLocalEmit(eventName, args);
            };
          }
          if (prop === 'on') {
            return (eventName: string, callback: Function) => {
              if (!this.eventListeners.has(eventName)) {
                this.eventListeners.set(eventName, new Set());
              }
              this.eventListeners.get(eventName)!.add(callback);
              return target.on(eventName, callback);
            };
          }
          if (prop === 'off') {
            return (eventName: string, callback?: Function) => {
              if (callback && this.eventListeners.has(eventName)) {
                this.eventListeners.get(eventName)!.delete(callback);
              }
              return target.off(eventName, callback);
            };
          }
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });
    }
    return this.socket!;
  }

  private triggerLocalEvent(eventName: string, payload: any) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(fn => fn(payload));
    }
  }

  private checkAndExecuteLocalAIMove(game: UnoGame) {
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

        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        if (humanPlayer) {
          this.triggerLocalEvent('game:state', game.getPrivateState(humanPlayer.id));
        }

        if (game.status === 'PLAYING' && game.getCurrentPlayer().id.startsWith('bot_')) {
          this.checkAndExecuteLocalAIMove(game);
        }
      }, 1000);
    }
  }

  private handleLocalEmit(eventName: string, args: any[]) {
    const ackCallback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

    if (eventName === 'room:create') {
      const { playerName, settings } = args[0] || {};
      const valName = validatePlayerName(playerName || 'Player');
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameId = `game_${Date.now()}`;
      const game = new UnoGame(gameId, roomCode, settings);
      const playerId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', playerId);

      game.addPlayer(playerId, sessionId, valName.sanitizedName || 'Player', true);
      this.localGames.set(roomCode, game);
      this.localGames.set(gameId, game);

      const state = game.getPrivateState(playerId);
      if (ackCallback) ackCallback({ success: true, roomCode, gameId, playerId, sessionId, state });
      setTimeout(() => this.triggerLocalEvent('game:state', state), 50);
      return;
    }

    if (eventName === 'room:createVsAI') {
      const { playerName } = args[0] || {};
      const valName = validatePlayerName(playerName || 'Player');
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameId = `game_ai_${Date.now()}`;
      const game = new UnoGame(gameId, roomCode, { maxPlayers: 4 });
      const humanId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', humanId);

      game.addPlayer(humanId, sessionId, valName.sanitizedName || 'Player', true);
      const bots = [
        { id: 'bot_alex', name: 'Bot Alex (AI)' },
        { id: 'bot_sam', name: 'Bot Sam (AI)' },
        { id: 'bot_morgan', name: 'Bot Morgan (AI)' }
      ];
      bots.forEach(b => game.addPlayer(b.id, `sess_${b.id}`, b.name, false));

      this.localGames.set(roomCode, game);
      this.localGames.set(gameId, game);
      game.startGame();

      const state = game.getPrivateState(humanId);
      if (ackCallback) ackCallback({ success: true, roomCode, gameId, playerId: humanId, sessionId, state });
      setTimeout(() => {
        this.triggerLocalEvent('game:state', state);
        this.checkAndExecuteLocalAIMove(game);
      }, 50);
      return;
    }

    if (eventName === 'room:join') {
      const { roomCode, playerName } = args[0] || {};
      const valCode = validateRoomCode(roomCode || '');
      const formattedCode = valCode.formattedCode || (roomCode || '').toUpperCase();
      let game = this.localGames.get(formattedCode);

      if (!game) {
        if (ackCallback) ackCallback({ success: false, error: 'Room not found. Check your room code.' });
        return;
      }

      const valName = validatePlayerName(playerName || 'Guest');
      const playerId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', playerId);

      const player = game.addPlayer(playerId, sessionId, valName.sanitizedName || 'Guest', game.players.length === 0);
      if (!player) {
        if (ackCallback) ackCallback({ success: false, error: 'Room is full.' });
        return;
      }

      const state = game.getPrivateState(playerId);
      if (ackCallback) ackCallback({ success: true, roomCode: formattedCode, gameId: game.id, playerId, sessionId, state });
      setTimeout(() => this.triggerLocalEvent('game:state', state), 50);
      return;
    }

    if (eventName === 'game:sync') {
      const { roomCode, gameId, playerId } = args[0] || {};
      let game = roomCode ? this.localGames.get(roomCode) : undefined;
      if (!game && gameId) game = this.localGames.get(gameId);
      if (!game && this.localGames.size > 0) game = Array.from(this.localGames.values())[0];

      if (!game) {
        if (ackCallback) ackCallback({ success: false, error: 'Game not found' });
        return;
      }

      const activeGame = game;
      const pId = playerId || localStorage.getItem('uno_player_id') || activeGame.players.find(p => !p.id.startsWith('bot_'))?.id || activeGame.players[0]?.id;
      const state = activeGame.getPrivateState(pId);
      if (ackCallback) ackCallback({ success: true, state });
      setTimeout(() => {
        this.triggerLocalEvent('game:state', state);
        if (game!.status === 'PLAYING' && game!.getCurrentPlayer().id.startsWith('bot_')) {
          this.checkAndExecuteLocalAIMove(game!);
        }
      }, 50);
      return;
    }

    if (eventName === 'game:start') {
      const game = Array.from(this.localGames.values())[0];
      if (game) {
        game.startGame();
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        const state = humanPlayer ? game.getPrivateState(humanPlayer.id) : null;
        if (ackCallback) ackCallback({ success: true, state });
        if (state) {
          this.triggerLocalEvent('game:state', state);
        }
        this.checkAndExecuteLocalAIMove(game);
      } else {
        if (ackCallback) ackCallback({ success: false, error: 'Game not found' });
      }
      return;
    }

    if (eventName === 'game:playCard') {
      const payload: MovePayload = args[0];
      const game = Array.from(this.localGames.values())[0];
      if (game && payload?.cardId) {
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        const playerId = humanPlayer?.id || game.getCurrentPlayer().id;
        const result = game.playCard(playerId, payload.cardId, payload.chosenColor);
        if (ackCallback) ackCallback(result);
        if (result.success && humanPlayer) {
          const state = game.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
          this.checkAndExecuteLocalAIMove(game);
        }
      }
      return;
    }

    if (eventName === 'game:drawCard') {
      const game = Array.from(this.localGames.values())[0];
      if (game) {
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        const playerId = humanPlayer?.id || game.getCurrentPlayer().id;
        const result = game.drawCard(playerId);
        if (ackCallback) ackCallback(result);
        if (result.success && humanPlayer) {
          const state = game.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
          this.checkAndExecuteLocalAIMove(game);
        }
      }
      return;
    }

    if (eventName === 'game:callUno') {
      const game = Array.from(this.localGames.values())[0];
      if (game) {
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        const result = game.callUno(humanPlayer?.id || game.players[0].id);
        if (ackCallback) ackCallback(result);
        if (result.success && humanPlayer) {
          const state = game.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      }
      return;
    }

    if (eventName === 'game:rematch') {
      const game = Array.from(this.localGames.values())[0];
      if (game) {
        game.startGame();
        if (ackCallback) ackCallback({ success: true });
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        if (humanPlayer) {
          const state = game.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
        this.checkAndExecuteLocalAIMove(game);
      }
      return;
    }
  }
}

export const socketService = new SocketService();
