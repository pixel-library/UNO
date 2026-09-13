import { supabase } from './supabaseClient';
import { UnoGame } from '../../../server/engine/UnoGame';
import { GameSettings, PlayerPrivateState } from '@shared/types/game';
import { validatePlayerName, validateRoomCode } from '@shared/validation/roomValidator';
import { socketService } from './socketService';

// In-memory active cloud games cache for fast local access across browsers
const cloudGameCache = new Map<string, UnoGame>();
const realTimeChannels = new Map<string, any>();
const stateUpdateCallbacks = new Map<string, Set<(state: any) => void>>();

function getGameFromCache(roomCode?: string): UnoGame | undefined {
  const code = roomCode?.trim().toUpperCase() || localStorage.getItem('uno_room_code') || undefined;
  if (code && cloudGameCache.has(code)) {
    return cloudGameCache.get(code);
  }
  const myId = localStorage.getItem('uno_player_id');
  if (myId) {
    const found = Array.from(cloudGameCache.values()).find(g => g.players.some(p => p.id === myId));
    if (found) return found;
  }
  const all = Array.from(cloudGameCache.values());
  return all.length > 0 ? all[all.length - 1] : undefined;
}

// Global lobby channel for real-time cross-browser room discovery
let globalLobbyChannel: any = null;

function getGlobalLobbyChannel() {
  if (!globalLobbyChannel) {
    globalLobbyChannel = supabase.channel('global_lobby', {
      config: { broadcast: { self: true } }
    });

    globalLobbyChannel.on('broadcast', { event: 'room:announce' }, (data: any) => {
      const payload = data?.payload;
      if (payload?.roomCode && payload?.gameId && !cloudGameCache.has(payload.roomCode)) {
        console.log(`[GLOBAL LOBBY] Received room announcement for ${payload.roomCode}`);
        const game = new UnoGame(payload.gameId, payload.roomCode, payload.settings);
        if (Array.isArray(payload.players)) {
          payload.players.forEach((p: any) => {
            game.addPlayer(p.id, p.sessionId || `sess_${p.id}`, p.name, p.isHost, p.isSpectator);
          });
        }
        cloudGameCache.set(payload.roomCode, game);
        cloudGameCache.set(payload.gameId, game);
      }
    });

    globalLobbyChannel.on('broadcast', { event: 'room:request' }, (data: any) => {
      const payload = data?.payload;
      if (payload?.roomCode) {
        const game = cloudGameCache.get(payload.roomCode);
        const myId = localStorage.getItem('uno_player_id');
        const isHost = game?.players.some(p => p.id === myId && p.isHost);

        // Host responds with authoritative room state
        if (game && isHost) {
          if (payload.playerName && payload.playerId) {
            game.addPlayer(payload.playerId, `sess_${payload.playerId}`, payload.playerName, false);
          }
          globalLobbyChannel.send({
            type: 'broadcast',
            event: 'room:response',
            payload: {
              roomCode: game.roomCode,
              gameId: game.id,
              players: game.players,
              status: game.status,
              targetPlayerId: payload.playerId
            }
          });

          // Notify host local state and broadcast state update to all room clients
          if (myId) {
            socketService.triggerLocalEvent('game:state', game.getPrivateState(myId));
          }
          supabaseRoomService.broadcastState(game.roomCode);
        }
      }
    });

    globalLobbyChannel.on('broadcast', { event: 'chat:message' }, (data: any) => {
      const payload = data?.payload;
      const msg = payload?.msg || payload;
      if (msg && msg.text && msg.senderId) {
        const roomCode = payload?.roomCode;
        if (roomCode) {
          const game = cloudGameCache.get(roomCode);
          if (game && !game.chatMessages.some(m => m.id === msg.id)) {
            game.chatMessages.push(msg);
          }
        }
        socketService.triggerLocalEvent('chat:message', msg);
      }
    });

    globalLobbyChannel.on('broadcast', { event: 'room:start' }, (data: any) => {
      const payload = data?.payload;
      if (payload?.roomCode) {
        let game = cloudGameCache.get(payload.roomCode);
        if (!game) {
          game = new UnoGame(payload.gameId || `game_${payload.roomCode}`, payload.roomCode);
          cloudGameCache.set(payload.roomCode, game);
          cloudGameCache.set(payload.gameId, game);
        }
        game.status = 'PLAYING';
        if (Array.isArray(payload.players)) {
          game.players = payload.players;
        }

        const myId = localStorage.getItem('uno_player_id') || game.players[0]?.id;
        const privateState = game.getPrivateState(myId);
        socketService.triggerLocalEvent('game:state', privateState);

        const callbacks = stateUpdateCallbacks.get(payload.roomCode);
        if (callbacks) {
          callbacks.forEach(cb => cb(privateState));
        }
      }
    });

    globalLobbyChannel.subscribe();
  }
  return globalLobbyChannel;
}

// Initialize global lobby listener immediately on module load
getGlobalLobbyChannel();

export const supabaseRoomService = {
  /**
   * Create a new online game room in Supabase DB & Realtime channel
   */
  async createCloudRoom(
    playerName: string,
    settings?: Partial<GameSettings>
  ): Promise<{ success: boolean; roomCode?: string; gameId?: string; playerId?: string; sessionId?: string; state?: PlayerPrivateState; error?: string }> {
    try {
      const valName = validatePlayerName(playerName);
      if (!valName.valid) {
        return { success: false, error: valName.error };
      }

      // Generate 6-char uppercase code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let roomCode = '';
      for (let i = 0; i < 6; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const game = new UnoGame(gameId, roomCode, settings);
      const hostId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', hostId);

      game.addPlayer(hostId, sessionId, valName.sanitizedName!, true);
      cloudGameCache.set(roomCode, game);
      cloudGameCache.set(gameId, game);

      // Announce room on Global Realtime Lobby
      const lobby = getGlobalLobbyChannel();
      lobby.send({
        type: 'broadcast',
        event: 'room:announce',
        payload: {
          roomCode,
          gameId,
          hostName: valName.sanitizedName!,
          players: game.players,
          settings
        }
      });

      // Attempt DB save silently
      try {
        await supabase.from('Game').upsert({
          id: gameId,
          roomCode,
          status: 'WAITING',
          mode: 'CLASSIC'
        });
      } catch (dbErr) {
        console.warn('[SUPABASE DB] Save notice:', dbErr);
      }

      const state = game.getPrivateState(hostId);
      this.setupRealtimeChannel(roomCode);

      return {
        success: true,
        roomCode,
        gameId,
        playerId: hostId,
        sessionId,
        state
      };
    } catch (err: any) {
      console.error('[SUPABASE] createCloudRoom failed:', err);
      return { success: false, error: err?.message || 'Failed to create online room.' };
    }
  },

  /**
   * Join an existing online game room by room code from Realtime lobby or DB
   */
  async joinCloudRoom(
    roomCode: string,
    playerName: string
  ): Promise<{ success: boolean; roomCode?: string; gameId?: string; playerId?: string; sessionId?: string; state?: PlayerPrivateState; error?: string }> {
    try {
      const valCode = validateRoomCode(roomCode);
      const valName = validatePlayerName(playerName);

      if (!valCode.valid || !valName.valid) {
        return { success: false, error: valCode.error || valName.error };
      }

      const formattedCode = valCode.formattedCode!;
      let game = cloudGameCache.get(formattedCode);

      const playerId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', playerId);

      // If game not in local cache, send room:request on global_lobby
      if (!game) {
        const lobby = getGlobalLobbyChannel();
        let resolved = false;

        const responsePromise = new Promise<UnoGame | null>((resolve) => {
          const handler = (data: any) => {
            const payload = data?.payload;
            if (payload?.roomCode === formattedCode && payload?.targetPlayerId === playerId) {
              resolved = true;
              const g = new UnoGame(payload.gameId || `game_${formattedCode}`, formattedCode);
              if (Array.isArray(payload.players)) {
                payload.players.forEach((p: any) => {
                  g.addPlayer(p.id, p.sessionId || `sess_${p.id}`, p.name, p.isHost, p.isSpectator);
                });
              }
              cloudGameCache.set(formattedCode, g);
              cloudGameCache.set(g.id, g);
              resolve(g);
            }
          };

          lobby.on('broadcast', { event: 'room:response' }, handler);

          // Request room state from host
          lobby.send({
            type: 'broadcast',
            event: 'room:request',
            payload: { roomCode: formattedCode, playerName: valName.sanitizedName, playerId }
          });

          // Timeout after 1.5 seconds if host doesn't respond via Realtime
          setTimeout(() => {
            if (!resolved) resolve(null);
          }, 1500);
        });

        game = (await responsePromise) || undefined;
      }

      // If still not found, try DB lookup
      if (!game) {
        try {
          const { data: gameData } = await supabase
            .from('Game')
            .select('id, roomCode, status')
            .eq('roomCode', formattedCode)
            .single();

          if (gameData) {
            game = new UnoGame(gameData.id, formattedCode, { maxPlayers: 4 });
            cloudGameCache.set(formattedCode, game);
            cloudGameCache.set(gameData.id, game);
          }
        } catch (err) {
          console.warn('[SUPABASE DB] Query fallback notice:', err);
        }
      }

      if (!game) {
        return { success: false, error: 'Room not found. Check your room code.' };
      }

      if (game.status === 'PLAYING') {
        return { success: false, error: 'Game already in progress.' };
      }

      let existingPlayer = game.players.find(p => p.id === playerId || p.name.toLowerCase() === valName.sanitizedName!.toLowerCase());
      if (!existingPlayer) {
        const added = game.addPlayer(playerId, sessionId, valName.sanitizedName!, game.players.length === 0);
        if (!added) {
          return { success: false, error: 'Room is full.' };
        }
      }

      const state = game.getPrivateState(playerId);
      this.setupRealtimeChannel(formattedCode);
      this.broadcastState(formattedCode, state);

      return {
        success: true,
        roomCode: formattedCode,
        gameId: game.id,
        playerId,
        sessionId,
        state
      };
    } catch (err: any) {
      console.error('[SUPABASE] joinCloudRoom failed:', err);
      return { success: false, error: err?.message || 'Failed to join room.' };
    }
  },

  /**
   * Synchronize room state for a given player ID
   */
  async syncCloudRoom(
    roomCode?: string,
    gameId?: string,
    playerId?: string
  ): Promise<{ success: boolean; state?: PlayerPrivateState; error?: string }> {
    let formattedCode = roomCode ? roomCode.trim().toUpperCase() : undefined;
    let game = formattedCode ? cloudGameCache.get(formattedCode) : undefined;
    if (!game && gameId) game = cloudGameCache.get(gameId);

    if (!game && formattedCode) {
      const joinRes = await this.joinCloudRoom(formattedCode, localStorage.getItem('uno_player_name') || 'Player');
      if (joinRes.success && joinRes.state) {
        return { success: true, state: joinRes.state };
      }
    }

    if (!game) {
      return { success: false, error: 'Game room not found.' };
    }

    // Check DB status fallback if local game is still WAITING
    if (game.status === 'WAITING' && formattedCode) {
      try {
        const { data: dbGame } = await supabase
          .from('Game')
          .select('status')
          .eq('roomCode', formattedCode)
          .single();

        if (dbGame?.status === 'PLAYING') {
          game.status = 'PLAYING';
        }
      } catch (err) {
        // Silently ignore DB query error
      }
    }

    const pId = playerId || localStorage.getItem('uno_player_id') || game.players[0]?.id;
    const state = game.getPrivateState(pId);
    return { success: true, state };
  },

  /**
   * Set up Supabase Realtime channel for cross-browser room broadcasts
   */
  setupRealtimeChannel(roomCode: string): any {
    const formattedCode = roomCode.trim().toUpperCase();
    if (realTimeChannels.has(formattedCode)) {
      return realTimeChannels.get(formattedCode);
    }

    const channel = supabase.channel(`room_${formattedCode}`, {
      config: { broadcast: { self: true } }
    });

    channel.on('broadcast', { event: 'chat:message' }, (data: any) => {
      const payload = data?.payload;
      const msg = payload?.msg || payload;
      if (msg && msg.text && msg.senderId) {
        const game = cloudGameCache.get(formattedCode);
        if (game && !game.chatMessages.some(m => m.id === msg.id)) {
          game.chatMessages.push(msg);
        }
        socketService.triggerLocalEvent('chat:message', msg);
      }
    });

    channel.on('broadcast', { event: 'game:state' }, (data: any) => {
      const payload = data?.payload;
      if (payload) {
        let game = cloudGameCache.get(formattedCode);
        if (payload.publicState) {
          if (!game) {
            game = new UnoGame(payload.publicState.id, formattedCode, payload.publicState.settings);
            cloudGameCache.set(formattedCode, game);
            cloudGameCache.set(payload.publicState.id, game);
          }
          game.status = payload.publicState.status;
          game.players = payload.publicState.players;
          game.currentPlayerIndex = payload.publicState.currentPlayerIndex;
          game.direction = payload.publicState.direction;
          game.currentColor = payload.publicState.currentColor;
          game.winner = payload.publicState.winner;
          game.turnStartedAt = payload.publicState.turnStartedAt;
          game.lastActionMessage = payload.publicState.lastActionMessage;
          if (payload.publicState.chatMessages) {
            game.chatMessages = payload.publicState.chatMessages;
            payload.publicState.chatMessages.forEach((m: any) => {
              socketService.triggerLocalEvent('chat:message', m);
            });
          }
          if (payload.publicState.topDiscardCard) {
            game.discardPile = [payload.publicState.topDiscardCard];
          }
          if (payload.hands) {
            Object.entries(payload.hands).forEach(([pid, handArr]) => {
              game!.playerHands.set(pid, handArr as any[]);
            });
          }

          const myId = localStorage.getItem('uno_player_id') || game.players[0]?.id;
          const privateState = game.getPrivateState(myId);

          const callbacks = stateUpdateCallbacks.get(formattedCode);
          if (callbacks) {
            callbacks.forEach(cb => cb(privateState));
          }
        } else if (payload.hand) {
          const callbacks = stateUpdateCallbacks.get(formattedCode);
          if (callbacks) {
            callbacks.forEach(cb => cb(payload));
          }
        }
      }
    });

    channel.subscribe((status: string) => {
      console.log(`[SUPABASE REALTIME] Subscribed to room_${formattedCode}: ${status}`);
    });

    realTimeChannels.set(formattedCode, channel);
    return channel;
  },

  /**
   * Broadcast state update to all connected clients in the room
   */
  broadcastState(roomCode: string, customState?: any) {
    const formattedCode = roomCode.trim().toUpperCase();
    const game = cloudGameCache.get(formattedCode);
    const channel = realTimeChannels.get(formattedCode) || this.setupRealtimeChannel(formattedCode);
    if (channel && game) {
      const handsObj: Record<string, any[]> = {};
      game.playerHands.forEach((hand, pid) => {
        handsObj[pid] = hand;
      });

      const payload = {
        publicState: game.getPublicState(),
        hands: handsObj,
        customState
      };

      channel.send({
        type: 'broadcast',
        event: 'game:state',
        payload
      });
    }
  },

  /**
   * Listen for state broadcasts on Supabase Realtime channel
   */
  onStateUpdate(roomCode: string, callback: (state: any) => void): () => void {
    const formattedCode = roomCode.trim().toUpperCase();
    if (!stateUpdateCallbacks.has(formattedCode)) {
      stateUpdateCallbacks.set(formattedCode, new Set());
    }
    stateUpdateCallbacks.get(formattedCode)!.add(callback);

    this.setupRealtimeChannel(formattedCode);

    return () => {
      stateUpdateCallbacks.get(formattedCode)?.delete(callback);
    };
  },

  /**
   * Start cloud game match
   */
  async startCloudRoom(roomCode?: string): Promise<{ success: boolean; state?: PlayerPrivateState; error?: string }> {
    const game = getGameFromCache(roomCode);
    if (!game) {
      return { success: false, error: 'Need at least 2 players to start.' };
    }

    const started = game.startGame();
    if (!started) {
      return { success: false, error: 'Need at least 2 players to start.' };
    }

    // Persist status to Supabase DB
    try {
      await supabase.from('Game').upsert({
        id: game.id,
        roomCode: game.roomCode,
        status: 'PLAYING',
        mode: 'CLASSIC'
      });
    } catch (dbErr) {
      console.warn('[SUPABASE DB] Start game notice:', dbErr);
    }

    const myId = localStorage.getItem('uno_player_id') || game.players[0]?.id;
    const state = game.getPrivateState(myId);

    if (game.roomCode) {
      this.broadcastState(game.roomCode);
      if (globalLobbyChannel) {
        globalLobbyChannel.send({
          type: 'broadcast',
          event: 'room:start',
          payload: {
            roomCode: game.roomCode,
            gameId: game.id,
            players: game.players,
            publicState: game.getPublicState()
          }
        });
      }
    }
    return { success: true, state };
  },

  /**
   * Play card in cloud match
   */
  async playCloudCard(payload: any): Promise<{ success: boolean; error?: string }> {
    const game = getGameFromCache(payload?.roomCode);
    if (game && payload?.cardId) {
      const myId = payload?.playerId || localStorage.getItem('uno_player_id') || game.getCurrentPlayer().id;
      const result = game.playCard(myId, payload.cardId, payload.chosenColor, payload.cardColor, payload.cardValue);
      if (result.success && game.roomCode) {
        this.broadcastState(game.roomCode);
      }
      return result;
    }
    return { success: false, error: 'Game not found' };
  },

  /**
   * Draw card in cloud match
   */
  async drawCloudCard(): Promise<{ success: boolean; drawnCard?: any; error?: string }> {
    const game = getGameFromCache();
    if (game) {
      const myId = localStorage.getItem('uno_player_id') || game.getCurrentPlayer().id;
      const result = game.drawCard(myId);
      if (result.success && game.roomCode) {
        this.broadcastState(game.roomCode);
      }
      return result;
    }
    return { success: false, error: 'Game not found' };
  },

  /**
   * Call UNO in cloud match
   */
  async callCloudUno(): Promise<{ success: boolean; message: string }> {
    const game = getGameFromCache();
    if (game) {
      const myId = localStorage.getItem('uno_player_id') || game.players[0].id;
      const result = game.callUno(myId);
      if (result.success && game.roomCode) {
        this.broadcastState(game.roomCode);
      }
      return result;
    }
    return { success: false, message: 'Game not found' };
  },

  /**
   * Rematch cloud match
   */
  async rematchCloudRoom(): Promise<{ success: boolean; error?: string }> {
    const game = getGameFromCache();
    if (game) {
      game.startGame();
      if (game.roomCode) {
        this.broadcastState(game.roomCode);
      }
      return { success: true };
    }
    return { success: false, error: 'Game not found' };
  },

  /**
   * Send chat message in cloud match
   */
  async sendCloudChat(
    text: string,
    roomCode?: string,
    playerId?: string,
    customMsgId?: string
  ): Promise<{ success: boolean; msg?: any }> {
    let game = getGameFromCache(roomCode);
    if (!game) return { success: false };

    const myId = playerId || localStorage.getItem('uno_player_id') || game.players[0]?.id;
    const sender = game.players.find(p => p.id === myId) || game.players[0];
    if (!sender) return { success: false };

    const msg = {
      id: customMsgId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      senderId: sender.id,
      senderName: sender.name,
      text: text.trim().substring(0, 100),
      timestamp: Date.now()
    };

    if (!game.chatMessages.some(m => m.id === msg.id)) {
      game.chatMessages.push(msg);
    }

    const channel = realTimeChannels.get(game.roomCode) || this.setupRealtimeChannel(game.roomCode);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'chat:message',
        payload: msg
      });
    }

    if (globalLobbyChannel) {
      globalLobbyChannel.send({
        type: 'broadcast',
        event: 'chat:message',
        payload: { roomCode: game.roomCode, msg }
      });
    }

    socketService.triggerLocalEvent('chat:message', msg);
    this.broadcastState(game.roomCode);
    return { success: true, msg };
  },

  /**
   * Kick player in cloud match
   */
  kickCloudPlayer(targetPlayerId: string): { success: boolean } {
    const game = getGameFromCache();
    if (!game) return { success: false };
    const myId = localStorage.getItem('uno_player_id');
    if (!myId) return { success: false };
    const success = game.kickPlayer(myId, targetPlayerId);
    if (success && game.roomCode) {
      this.broadcastState(game.roomCode);
    }
    return { success };
  },

  /**
   * Transfer host in cloud match
   */
  transferCloudHost(newHostId: string): { success: boolean } {
    const game = getGameFromCache();
    if (!game) return { success: false };
    const myId = localStorage.getItem('uno_player_id');
    if (!myId) return { success: false };
    const success = game.transferHost(myId, newHostId);
    if (success && game.roomCode) {
      this.broadcastState(game.roomCode);
    }
    return { success };
  },

  /**
   * Update room settings in cloud match
   */
  updateCloudSettings(settings: Partial<GameSettings>): { success: boolean } {
    const game = getGameFromCache();
    if (!game) return { success: false };
    const myId = localStorage.getItem('uno_player_id');
    if (!myId) return { success: false };
    const success = game.updateSettings(myId, settings);
    if (success && game.roomCode) {
      this.broadcastState(game.roomCode);
    }
    return { success };
  }
};
