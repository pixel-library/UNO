import { io, Socket } from 'socket.io-client';
import { UnoGame } from '../../../server/engine/UnoGame';
import { validatePlayerName, validateRoomCode } from '../../../shared/validation/roomValidator';
import { GameSettings, MovePayload, CardColor } from '../../../shared/types/game';
import { supabaseRoomService } from './supabaseRoomService';

class SocketService {
  private socket: Socket | null = null;
  private localGames: Map<string, UnoGame> = new Map();
  private eventListeners: Map<string, Set<Function>> = new Map();
  private botIntervalId: any = null;

  public getSocket(): Socket {
    if (!this.socket) {
      const isDevPort = typeof window !== 'undefined' && (window.location.port === '3000' || window.location.port === '5173');
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || isDevPort);

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

  private getLocalGame(roomCode?: string): UnoGame | undefined {
    const code = roomCode?.trim().toUpperCase() || (typeof localStorage !== 'undefined' ? localStorage.getItem('uno_room_code') : null) || undefined;
    if (code && this.localGames.has(code)) {
      return this.localGames.get(code);
    }
    return undefined;
  }

  private startLocalBotInterval() {
    if (this.botIntervalId) return;
    this.botIntervalId = setInterval(() => {
      this.localGames.forEach((game) => {
        if (game.status === 'PLAYING') {
          const curr = game.getCurrentPlayer();
          if (curr && (curr.isBot || curr.id.startsWith('bot_'))) {
            this.executeLocalBotTurn(game);
          }
        }
      });
    }, 800);
  }

  private executeLocalBotTurn(game: UnoGame) {
    if (game.status !== 'PLAYING') return;
    const currPlayer = game.getCurrentPlayer();
    if (!currPlayer || (!currPlayer.isBot && !currPlayer.id.startsWith('bot_'))) return;

    const botId = currPlayer.id;
    let hand = game.playerHands.get(botId) || [];

    // Handle pending 7-swap or Wild swap
    if (game.pendingHandSwapPlayerId === botId) {
      const activePlayers = game.players.filter(p => !p.isSpectator && p.id !== botId);
      activePlayers.sort((a, b) => a.cardCount - b.cardCount);
      const target = activePlayers[0] || activePlayers[Math.floor(Math.random() * activePlayers.length)];
      if (target) {
        game.swapHands(botId, target.id);
      } else {
        game.pendingHandSwapPlayerId = null;
      }
      this.notifyLocalGameState(game);
      return;
    }

    // Find playable cards
    const playableCards = hand.filter(card => game.isPlayable(card));

    // Determine best color choice for Wild cards
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
      let cardToPlay = playableCards.find(c => c.value === 'WILD_DRAW_FOUR' || c.value === 'DRAW_TWO' || c.value === 'SKIP' || c.value === 'REVERSE');
      if (!cardToPlay) cardToPlay = playableCards.find(c => c.color === game.currentColor);
      if (!cardToPlay) cardToPlay = playableCards[0];

      if (hand.length === 2 && !currPlayer.hasCalledUno) {
        game.callUno(botId);
      }

      game.playCard(botId, cardToPlay.id, cardToPlay.color === 'WILD' ? bestChosenColor : undefined);
    } else {
      const drawRes = game.drawCard(botId);
      if (drawRes.success && drawRes.drawnCard && game.getCurrentPlayer()?.id === botId && game.isPlayable(drawRes.drawnCard)) {
        const updatedHand = game.playerHands.get(botId) || [];
        if (updatedHand.length === 2 && !currPlayer.hasCalledUno) {
          game.callUno(botId);
        }
        game.playCard(botId, drawRes.drawnCard.id, drawRes.drawnCard.color === 'WILD' ? bestChosenColor : undefined);
      }
    }

    this.notifyLocalGameState(game);
  }

  private notifyLocalGameState(game: UnoGame) {
    const humanPlayer = game.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || game.players[0];
    if (humanPlayer) {
      this.triggerLocalEvent('game:state', game.getPrivateState(humanPlayer.id));
    }
  }

  private handleLocalEmit(eventName: string, args: any[]) {
    const ackCallback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

    if (eventName === 'room:create') {
      const { playerName, settings } = args[0] || {};
      supabaseRoomService.createCloudRoom(playerName || 'Player', settings).then(res => {
        if (ackCallback) ackCallback(res);
        if (res.success && res.roomCode) {
          localStorage.setItem('uno_room_code', res.roomCode);
          supabaseRoomService.onStateUpdate(res.roomCode, (state) => {
            this.triggerLocalEvent('game:state', state);
          });
        }
      });
      return;
    }

    if (eventName === 'room:createVsBot') {
      const { playerName, botCount = 1, settings } = args[0] || {};
      const valName = validatePlayerName(playerName);
      const sanitizedName = valName.valid ? valName.sanitizedName! : (playerName || 'Player');

      const requestedBotCount = Math.min(3, Math.max(1, botCount));
      const maxPlayers = requestedBotCount + 1;

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let roomCode = '';
      for (let i = 0; i < 6; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const gameId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const game = new UnoGame(gameId, roomCode, { ...settings, maxPlayers, mode: 'VS_COMPUTER', enableChat: false });

      const playerId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', playerId);
      localStorage.setItem('uno_room_code', roomCode);

      game.addPlayer(playerId, sessionId, sanitizedName, true);
      for (let i = 0; i < requestedBotCount; i++) {
        game.addBot();
      }

      this.localGames.set(roomCode, game);
      game.startGame();

      this.startLocalBotInterval();

      const state = game.getPrivateState(playerId);
      if (ackCallback) {
        ackCallback({
          success: true,
          roomCode,
          gameId,
          playerId,
          sessionId,
          state
        });
      }
      this.triggerLocalEvent('game:state', state);
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
      const localGame = this.getLocalGame(roomCode);
      if (localGame) {
        const pId = playerId || localStorage.getItem('uno_player_id') || localGame.players.find(p => !p.isBot)?.id || localGame.players[0].id;
        const state = localGame.getPrivateState(pId);
        if (ackCallback) ackCallback({ success: true, state });
        this.triggerLocalEvent('game:state', state);
        return;
      }
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
      const targetRoomCode = roomCode ? String(roomCode).trim().toUpperCase() : (typeof localStorage !== 'undefined' ? localStorage.getItem('uno_room_code') : undefined);
      const game = (targetRoomCode && this.localGames.has(targetRoomCode)) ? this.localGames.get(targetRoomCode) : undefined;
      if (game) {
        game.startGame();
        const activePlayer = game.players[0];
        const state = activePlayer ? game.getPrivateState(activePlayer.id) : null;
        if (ackCallback) ackCallback({ success: true, state });
        if (state) {
          this.triggerLocalEvent('game:state', state);
        }
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
      const localGame = this.getLocalGame(payload?.roomCode);
      if (localGame && payload?.cardId) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const playerId = payload?.playerId || activePlayer?.id || localGame.getCurrentPlayer().id;
        const result = localGame.playCard(playerId, payload.cardId, payload.chosenColor, payload.cardColor, payload.cardValue);
        if (ackCallback) ackCallback(result);
        if (result.success && activePlayer) {
          const state = localGame.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      } else {
        supabaseRoomService.playCloudCard(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:drawCard') {
      const payload: any = args[0] || {};
      const localGame = this.getLocalGame(payload?.roomCode);
      if (localGame) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const playerId = payload?.playerId || activePlayer?.id || localGame.getCurrentPlayer().id;
        const result = localGame.drawCard(playerId);
        if (ackCallback) ackCallback(result);
        if (result.success && activePlayer) {
          const state = localGame.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      } else {
        supabaseRoomService.drawCloudCard(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:callUno') {
      const localGame = this.getLocalGame();
      if (localGame) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const result = localGame.callUno(activePlayer?.id || localGame.players[0].id);
        if (ackCallback) ackCallback(result);
        if (result.success && activePlayer) {
          const state = localGame.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      } else {
        supabaseRoomService.callCloudUno().then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:challengeUno') {
      const payload: any = args[0] || {};
      const localGame = this.getLocalGame(payload?.roomCode);
      if (localGame) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const challengerId = payload?.playerId || activePlayer?.id || localGame.players[0].id;
        const result = localGame.challengeUno(challengerId, payload?.targetPlayerId);
        if (ackCallback) ackCallback(result);
        if (result.success && activePlayer) {
          const state = localGame.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      } else {
        supabaseRoomService.challengeCloudUno(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:sendEmote') {
      const { emote, roomCode } = args[0] || {};
      const localGame = this.getLocalGame(roomCode);
      if (localGame && emote) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const senderId = activePlayer?.id || localGame.players[0].id;
        localGame.sendEmote(senderId, emote);
        if (activePlayer) {
          this.triggerLocalEvent('game:state', localGame.getPrivateState(activePlayer.id));
        }
      } else if (emote) {
        supabaseRoomService.sendCloudEmote(emote);
      }
      return;
    }

    if (eventName === 'chat:message') {
      const { text, roomCode, playerId, id } = args[0] || {};
      const localGame = this.getLocalGame(roomCode);
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
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        if (activePlayer) {
          this.triggerLocalEvent('game:state', localGame.getPrivateState(activePlayer.id));
        }
      } else if (text) {
        supabaseRoomService.sendCloudChat(text, roomCode, playerId, id);
      }
      return;
    }

    if (eventName === 'game:swapHand' || eventName === 'game:swapHands') {
      const payload: any = args[0] || {};
      const targetId = payload?.targetSwapPlayerId || payload?.targetPlayerId;
      const localGame = this.getLocalGame(payload?.roomCode);
      if (localGame && targetId) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const sourceId = payload?.playerId || activePlayer?.id || localGame.pendingHandSwapPlayerId;
        if (sourceId) {
          const result = localGame.swapHands(sourceId, targetId, payload?.chosenColor);
          if (ackCallback) ackCallback(result);
          if (result.success && activePlayer) {
            const state = localGame.getPrivateState(activePlayer.id);
            this.triggerLocalEvent('game:state', state);
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
      const localGame = this.getLocalGame(payload?.roomCode);
      if (localGame) {
        const activePlayer = localGame.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || localGame.players[0];
        const playerId = payload?.playerId || activePlayer?.id || localGame.getCurrentPlayer().id;
        const result = localGame.passTurn(playerId);
        if (ackCallback) ackCallback(result);
        if (result.success && activePlayer) {
          const state = localGame.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
      } else {
        supabaseRoomService.passCloudTurn(payload).then(res => {
          if (ackCallback) ackCallback(res);
        });
      }
      return;
    }

    if (eventName === 'game:rematch') {
      const game = this.getLocalGame();
      if (game) {
        game.startGame();
        if (ackCallback) ackCallback({ success: true });
        const activePlayer = game.players.find(p => !p.isBot && !p.id.startsWith('bot_')) || game.players[0];
        if (activePlayer) {
          const state = game.getPrivateState(activePlayer.id);
          this.triggerLocalEvent('game:state', state);
        }
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
