import { io, Socket } from 'socket.io-client';
import { UnoGame } from '../../../server/engine/UnoGame';
import { AIPlayer } from '../../../server/engine/AIPlayer';
import { validatePlayerName, validateRoomCode } from '../../../shared/validation/roomValidator';
import { GameSettings, MovePayload } from '../../../shared/types/game';
import { supabaseRoomService } from './supabaseRoomService';

class SocketService {
  private socket: Socket | null = null;
  private localGames: Map<string, UnoGame> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();

  public getSocket(): Socket {
    if (!this.socket) {
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      const socketUrl =
        import.meta.env.VITE_SOCKET_URL ||
        (isLocalhost ? `${window.location.protocol}//${window.location.hostname}:5000` : window.location.origin);

      const realSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 500
      });

      // Wrap socket to support client-side fallback for single player vs AI
      this.socket = new Proxy(realSocket, {
        get: (target: any, prop: string) => {
          if (prop === 'emit') {
            return (eventName: string, ...args: any[]) => {
              // If connected to server, emit via socket.io. Otherwise fallback to local engine.
              if (target.connected) {
                return target.emit(eventName, ...args);
              }
              // Offline / Local Execution Fallback when socket is disconnected or on static host
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

  public triggerLocalEvent(eventName: string, payload: any) {
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
      supabaseRoomService.createCloudRoom(playerName || 'Player', settings).then(res => {
        if (ackCallback) ackCallback(res);
        if (res.success && res.roomCode) {
          supabaseRoomService.onStateUpdate(res.roomCode, (state) => {
            this.triggerLocalEvent('game:state', state);
          });
        }
      });
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
      supabaseRoomService.joinCloudRoom(roomCode || '', playerName || 'Guest').then(res => {
        if (ackCallback) ackCallback(res);
        if (res.success && res.roomCode) {
          supabaseRoomService.onStateUpdate(res.roomCode, (state) => {
            this.triggerLocalEvent('game:state', state);
          });
        }
      });
      return;
    }

    if (eventName === 'game:sync') {
      const { roomCode, gameId, playerId } = args[0] || {};
      supabaseRoomService.syncCloudRoom(roomCode, gameId, playerId).then(res => {
        if (ackCallback) ackCallback(res);
        if (res.success && res.state?.roomCode) {
          supabaseRoomService.onStateUpdate(res.state.roomCode, (state) => {
            this.triggerLocalEvent('game:state', state);
          });
        }
      });
      return;
    }

    if (eventName === 'room:kickPlayer') {
      const { targetPlayerId } = args[0] || {};
      const res = supabaseRoomService.kickCloudPlayer(targetPlayerId);
      if (ackCallback) ackCallback(res);
      return;
    }

    if (eventName === 'room:transferHost') {
      const { newHostId } = args[0] || {};
      const res = supabaseRoomService.transferCloudHost(newHostId);
      if (ackCallback) ackCallback(res);
      return;
    }

    if (eventName === 'room:updateSettings') {
      const { settings } = args[0] || {};
      const res = supabaseRoomService.updateCloudSettings(settings);
      if (ackCallback) ackCallback(res);
      return;
    }

    if (eventName === 'game:start') {
      const { roomCode } = args[0] || {};
      const targetRoomCode = roomCode || localStorage.getItem('uno_room_code');
      const game = targetRoomCode ? this.localGames.get(targetRoomCode) : Array.from(this.localGames.values())[0];
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
        supabaseRoomService.startCloudRoom(targetRoomCode || undefined).then(res => {
          if (ackCallback) ackCallback(res);
          if (res.success && res.state) {
            this.triggerLocalEvent('game:state', res.state);
          }
        });
      }
      return;
    }

    if (eventName === 'game:playCard') {
      const payload: any = args[0] || {};
      const game = Array.from(this.localGames.values())[0];
      if (game && payload?.cardId) {
        const humanPlayer = game.players.find(p => !p.id.startsWith('bot_')) || game.players[0];
        const playerId = humanPlayer?.id || game.getCurrentPlayer().id;
        const result = game.playCard(playerId, payload.cardId, payload.chosenColor, payload.cardColor, payload.cardValue);
        if (ackCallback) ackCallback(result);
        if (result.success && humanPlayer) {
          const state = game.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
          this.checkAndExecuteLocalAIMove(game);
        }
      } else {
        supabaseRoomService.playCloudCard(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
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
      } else {
        supabaseRoomService.drawCloudCard().then(res => {
          if (ackCallback) ackCallback(res);
        });
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
      } else {
        supabaseRoomService.callCloudUno().then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'chat:message') {
      const { text, roomCode, playerId, id } = args[0] || {};
      const localGame = Array.from(this.localGames.values())[0];
      if (localGame && text) {
        const myId = playerId || localStorage.getItem('uno_player_id') || localGame.players[0]?.id;
        const sender = localGame.players.find(p => p.id === myId) || localGame.players[0];
        const msg = {
          id: id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          senderId: sender?.id || 'player',
          senderName: sender?.name || 'Player',
          text: text.trim().substring(0, 100),
          timestamp: Date.now()
        };
        if (!localGame.chatMessages.some(m => m.id === msg.id)) {
          localGame.chatMessages.push(msg);
        }
        this.triggerLocalEvent('chat:message', msg);
        const humanPlayer = localGame.players.find(p => !p.id.startsWith('bot_')) || localGame.players[0];
        if (humanPlayer) {
          this.triggerLocalEvent('game:state', localGame.getPrivateState(humanPlayer.id));
        }
      } else if (text) {
        supabaseRoomService.sendCloudChat(text, roomCode, playerId, id);
      }
      return;
    }

    if (eventName === 'game:swapHand' || eventName === 'game:swapHands') {
      const payload: any = args[0] || {};
      const targetId = payload?.targetSwapPlayerId || payload?.targetPlayerId;
      const localGame = Array.from(this.localGames.values())[0];
      if (localGame && targetId) {
        const humanPlayer = localGame.players.find(p => !p.id.startsWith('bot_')) || localGame.players[0];
        const sourceId = payload?.playerId || humanPlayer?.id || localGame.pendingHandSwapPlayerId;
        if (sourceId) {
          const result = localGame.swapHands(sourceId, targetId, payload?.chosenColor);
          if (ackCallback) ackCallback(result);
          if (result.success && humanPlayer) {
            const state = localGame.getPrivateState(humanPlayer.id);
            this.triggerLocalEvent('game:state', state);
            this.checkAndExecuteLocalAIMove(localGame);
          }
        }
      } else {
        supabaseRoomService.swapCloudHands(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:passTurn') {
      const payload: any = args[0] || {};
      const localGame = Array.from(this.localGames.values())[0];
      if (localGame) {
        const humanPlayer = localGame.players.find(p => !p.id.startsWith('bot_')) || localGame.players[0];
        const playerId = payload?.playerId || humanPlayer?.id || localGame.getCurrentPlayer().id;
        const result = localGame.passTurn(playerId);
        if (ackCallback) ackCallback(result);
        if (result.success && humanPlayer) {
          const state = localGame.getPrivateState(humanPlayer.id);
          this.triggerLocalEvent('game:state', state);
          this.checkAndExecuteLocalAIMove(localGame);
        }
      } else {
        supabaseRoomService.passCloudTurn(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
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
      } else {
        supabaseRoomService.rematchCloudRoom().then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }
  }
}

export const socketService = new SocketService();
