import { supabase } from './supabaseClient';
import { UnoGame } from '../../../server/engine/UnoGame';
import { GameSettings, GamePublicState, PlayerPrivateState } from '@shared/types/game';
import { validatePlayerName, validateRoomCode } from '@shared/validation/roomValidator';

// In-memory active cloud games cache for fast local access
const cloudGameCache = new Map<string, UnoGame>();
const realTimeChannels = new Map<string, any>();

export const supabaseRoomService = {
  /**
   * Create a new online game room in Supabase DB and initialize Realtime channel
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

      // Persist to Supabase Game & GamePlayer tables
      try {
        await supabase.from('Game').upsert({
          id: gameId,
          roomCode,
          status: 'WAITING',
          mode: 'CLASSIC',
          direction: 'CW',
          currentColor: 'RED',
          activeStackCount: 0
        });

        await supabase.from('GamePlayer').upsert({
          id: hostId,
          gameId,
          sessionId,
          name: valName.sanitizedName!,
          cardCount: 0,
          score: 0,
          isHost: true,
          isSpectator: false
        });
      } catch (dbErr) {
        console.warn('[SUPABASE] Cloud DB save fallback notice:', dbErr);
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
   * Join an existing online game room by room code from Supabase DB or cache
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

      // If game not in local cache, query Supabase Game table
      if (!game) {
        const { data: gameData, error: gameErr } = await supabase
          .from('Game')
          .select('id, roomCode, status')
          .eq('roomCode', formattedCode)
          .single();

        if (gameErr || !gameData) {
          return { success: false, error: 'Room not found. Check your room code.' };
        }

        if (gameData.status === 'PLAYING') {
          return { success: false, error: 'Game already in progress.' };
        }

        // Fetch existing players from GamePlayer table
        const { data: playersData } = await supabase
          .from('GamePlayer')
          .select('id, sessionId, name, isHost, isSpectator')
          .eq('gameId', gameData.id);

        game = new UnoGame(gameData.id, formattedCode, { maxPlayers: 4 });
        if (playersData && playersData.length > 0) {
          playersData.forEach(p => {
            game!.addPlayer(p.id, p.sessionId, p.name, p.isHost, p.isSpectator);
          });
        }
        cloudGameCache.set(formattedCode, game);
        cloudGameCache.set(gameData.id, game);
      }

      if (game.status === 'PLAYING') {
        return { success: false, error: 'Game already in progress.' };
      }

      const playerId = localStorage.getItem('uno_player_id') || `player_${Math.random().toString(36).substring(2, 9)}`;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('uno_player_id', playerId);

      let existingPlayer = game.players.find(p => p.id === playerId || p.name.toLowerCase() === valName.sanitizedName!.toLowerCase());
      if (!existingPlayer) {
        const added = game.addPlayer(playerId, sessionId, valName.sanitizedName!, game.players.length === 0);
        if (!added) {
          return { success: false, error: 'Room is full.' };
        }

        // Persist new player to Supabase GamePlayer table
        try {
          await supabase.from('GamePlayer').upsert({
            id: playerId,
            gameId: game.id,
            sessionId,
            name: valName.sanitizedName!,
            cardCount: 0,
            score: 0,
            isHost: game.players.length === 1,
            isSpectator: false
          });
        } catch (dbErr) {
          console.warn('[SUPABASE] Cloud player save notice:', dbErr);
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
      // Query Supabase DB as fallback
      const joinRes = await this.joinCloudRoom(formattedCode, localStorage.getItem('uno_player_name') || 'Player');
      if (joinRes.success && joinRes.state) {
        return { success: true, state: joinRes.state };
      }
    }

    if (!game) {
      return { success: false, error: 'Game room not found.' };
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

    channel.subscribe((status: string) => {
      console.log(`[SUPABASE REALTIME] Subscribed to room_${formattedCode}: ${status}`);
    });

    realTimeChannels.set(formattedCode, channel);
    return channel;
  },

  /**
   * Broadcast state update to all connected clients in the room
   */
  broadcastState(roomCode: string, state: any) {
    const formattedCode = roomCode.trim().toUpperCase();
    const channel = realTimeChannels.get(formattedCode) || this.setupRealtimeChannel(formattedCode);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'game:state',
        payload: state
      });
    }
  },

  /**
   * Listen for state broadcasts on Supabase Realtime channel
   */
  onStateUpdate(roomCode: string, callback: (state: any) => void): () => void {
    const formattedCode = roomCode.trim().toUpperCase();
    const channel = realTimeChannels.get(formattedCode) || this.setupRealtimeChannel(formattedCode);

    const subscription = channel.on('broadcast', { event: 'game:state' }, (data: any) => {
      if (data?.payload) {
        callback(data.payload);
      }
    });

    return () => {
      channel.unsubscribe();
      realTimeChannels.delete(formattedCode);
    };
  }
};
