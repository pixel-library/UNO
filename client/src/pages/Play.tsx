import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '@/services/socketService';
import { supabaseRoomService } from '@/services/supabaseRoomService';
import { validateRoomCode } from '@shared/validation/roomValidator';
import { UnoCard } from '@/components/card/UnoCard';
import { useScroll3D } from '@/hooks/useScroll3D';

export const Play: React.FC = () => {
  const navigate = useNavigate();
  useScroll3D();

  // Create Game State
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [gameMode, setGameMode] = useState<'Classic' | 'Custom'>('Classic');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [stacking, setStacking] = useState<boolean>(true);
  const [jumpIn, setJumpIn] = useState<boolean>(false);
  const [sevenZero, setSevenZero] = useState<boolean>(false);
  const [forcePlay, setForcePlay] = useState<boolean>(false);
  const [drawUntilPlayable, setDrawUntilPlayable] = useState<boolean>(false);
  const [discardAll, setDiscardAll] = useState<boolean>(false);
  const [counterDeflect, setCounterDeflect] = useState<boolean>(true);
  const [shuffleHands, setShuffleHands] = useState<boolean>(false);
  const [wildSwap, setWildSwap] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleModeChange = (mode: 'Classic' | 'Custom') => {
    setGameMode(mode);
    if (mode === 'Classic') {
      setStacking(true);
      setJumpIn(false);
      setSevenZero(false);
      setForcePlay(false);
      setDrawUntilPlayable(false);
      setDiscardAll(false);
      setCounterDeflect(true);
      setShuffleHands(false);
      setWildSwap(false);
    }
  };

  // VS Computer (AI) State
  const [botMatchSize, setBotMatchSize] = useState<2 | 3 | 4>(4);
  const [isCreatingBot, setIsCreatingBot] = useState<boolean>(false);

  const handleCreateVsBot = (sizeOverride?: number) => {
    if (isCreatingBot) return;
    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name', { state: { returnTo: '/play' } });
      return;
    }

    const selectedSize = sizeOverride || botMatchSize;
    const botCount = Math.min(3, Math.max(1, selectedSize - 1));

    setIsCreatingBot(true);
    let handled = false;
    const timer = setTimeout(() => {
      if (!handled) {
        handled = true;
        setIsCreatingBot(false);
        alert('Computer match creation timed out. Please try again.');
      }
    }, 8000);

    try {
      const socket = socketService.getSocket();
      socket.emit(
        'room:createVsBot',
        {
          playerName,
          botCount,
          settings: {
            startingCards: 7,
            turnTimerSeconds: 30,
            houseRules: {
              stacking,
              jumpIn,
              sevenZero,
              forcePlay,
              drawUntilPlayable,
              discardAll,
              counterDeflect,
              shuffleHands,
              wildSwap
            }
          }
        },
        (res: any) => {
          if (handled) return;
          handled = true;
          clearTimeout(timer);
          setIsCreatingBot(false);
          if (res?.success) {
            if (res.playerId) {
              localStorage.setItem('uno_player_id', res.playerId);
            }
            navigate(`/room/${res.roomCode}`);
          } else {
            alert(res?.error || 'Failed to start Computer match');
          }
        }
      );
    } catch (err) {
      if (!handled) {
        handled = true;
        clearTimeout(timer);
        setIsCreatingBot(false);
        alert('An unexpected error occurred while starting Computer match.');
      }
    }
  };

  // Join Game State
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Public Rooms Browser State
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);

  const mergePublicRooms = (apiRooms: any[], cloudRooms: any[]) => {
    const map = new Map<string, any>();
    (apiRooms || []).forEach(r => { if (r && r.code) map.set(r.code, r); });
    (cloudRooms || []).forEach(r => { if (r && r.code && !map.has(r.code)) map.set(r.code, r); });
    return Array.from(map.values()).filter(r => r && r.settings ? !r.settings.isPrivate : true);
  };

  const fetchPublicRooms = async () => {
    setIsLoadingRooms(true);
    let serverRooms: any[] = [];
    try {
      const res = await fetch('/api/rooms/public');
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        serverRooms = data.rooms;
      }
    } catch (err) {
      // Ignore static host fetch error
    } finally {
      const cloudRooms = await supabaseRoomService.fetchPublicCloudRooms();
      setPublicRooms(mergePublicRooms(serverRooms, cloudRooms));
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(fetchPublicRooms, 3000);

    const socket = socketService.getSocket();
    const handleLobbyUpdate = (rooms?: any[]) => {
      const cloudRooms = supabaseRoomService.getPublicRooms();
      const serverRooms = Array.isArray(rooms) ? rooms : [];
      setPublicRooms(mergePublicRooms(serverRooms, cloudRooms));
    };

    socket.on('lobby:update', handleLobbyUpdate);
    socket.emit('lobby:getRooms', (res: any) => {
      if (res?.success && Array.isArray(res.rooms)) {
        handleLobbyUpdate(res.rooms);
      }
    });

    return () => {
      clearInterval(interval);
      socket.off('lobby:update', handleLobbyUpdate);
    };
  }, []);

  const handleJoinPublicRoom = (code: string) => {
    setRoomCode(code);
    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name', { state: { returnTo: `/join/${code}` } });
      return;
    }
    setIsJoining(true);
    const socket = socketService.getSocket();
    socket.emit('room:join', { roomCode: code, playerName }, (res: any) => {
      setIsJoining(false);
      if (res?.success) {
        if (res.playerId) localStorage.setItem('uno_player_id', res.playerId);
        navigate(`/room/${res.roomCode}`);
      } else {
        setJoinError(res?.error || 'Could not join public room');
      }
    });
  };

  // Handle Room Creation
  const handleCreateGame = () => {
    if (isCreating) return;
    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name');
      return;
    }

    setIsCreating(true);
    let handled = false;
    const timer = setTimeout(() => {
      if (!handled) {
        handled = true;
        setIsCreating(false);
        alert('Room creation timed out. Please try again.');
      }
    }, 4000);

    const isCustomNeeded = gameMode === 'Custom' || discardAll || shuffleHands || wildSwap || jumpIn || sevenZero;

    try {
      const socket = socketService.getSocket();
      socket.emit(
        'room:create',
        {
          playerName,
          settings: {
            maxPlayers,
            startingCards: 7,
            turnTimerSeconds: 30,
            allowSpectators: true,
            enableChat: true,
            isPrivate,
            mode: isCustomNeeded ? 'CUSTOM' : 'CLASSIC',
            houseRules: {
              stacking,
              jumpIn,
              sevenZero,
              forcePlay,
              drawUntilPlayable,
              multipleCardPlay: false,
              customCards: isCustomNeeded,
              discardAll,
              counterDeflect,
              shuffleHands,
              wildSwap
            }
          }
        },
        (res: any) => {
          if (handled) return;
          handled = true;
          clearTimeout(timer);
          setIsCreating(false);
          if (res?.success) {
            if (res.playerId) {
              localStorage.setItem('uno_player_id', res.playerId);
            }
            navigate(`/room/${res.roomCode}`);
          } else {
            alert(res?.error || 'Failed to create room');
          }
        }
      );
    } catch (err) {
      if (!handled) {
        handled = true;
        clearTimeout(timer);
        setIsCreating(false);
        alert('An unexpected error occurred while creating room.');
      }
    }
  };

  // Handle Room Join
  const handleJoinGame = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isJoining) return;

    const cleanCode = roomCode.trim().toUpperCase();
    const validation = validateRoomCode(cleanCode);

    if (!validation.valid) {
      setJoinError(validation.error || 'Invalid room code');
      return;
    }

    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name', { state: { returnTo: `/join/${validation.formattedCode}` } });
      return;
    }

    setIsJoining(true);
    let handled = false;
    const timer = setTimeout(() => {
      if (!handled) {
        handled = true;
        setIsJoining(false);
        setJoinError('Room join timed out. Please check the code and try again.');
      }
    }, 4000);

    try {
      const socket = socketService.getSocket();
      socket.emit('room:join', { roomCode: validation.formattedCode!, playerName }, (res: any) => {
        if (handled) return;
        handled = true;
        clearTimeout(timer);
        setIsJoining(false);
        if (res?.success) {
          if (res.playerId) {
            localStorage.setItem('uno_player_id', res.playerId);
          }
          navigate(`/room/${res.roomCode}`);
        } else {
          setJoinError(res?.error || 'Could not join room');
        }
      });
    } catch (err) {
      if (!handled) {
        handled = true;
        clearTimeout(timer);
        setIsJoining(false);
        setJoinError('An unexpected error occurred while joining room.');
      }
    }
  };

  const handleInviteLink = () => {
    const code = prompt('Paste Room Code or Invite Link:');
    if (code) {
      const match = code.match(/([A-Za-z0-9]{6})/);
      if (match) {
        setRoomCode(match[1].toUpperCase());
      }
    }
  };

  // 12 fanned cards data for background wheel graphic
  const wheelCards: { color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW'; value: string }[] = [
    { color: 'RED', value: '2' },
    { color: 'RED', value: '3' },
    { color: 'BLUE', value: '2' },
    { color: 'BLUE', value: '3' },
    { color: 'GREEN', value: 'REVERSE' },
    { color: 'GREEN', value: '5' },
    { color: 'YELLOW', value: 'SKIP' },
    { color: 'YELLOW', value: '5' },
    { color: 'BLUE', value: '1' },
    { color: 'BLUE', value: '3' },
    { color: 'RED', value: '1' },
    { color: 'RED', value: 'SKIP' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center selection:bg-none relative overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center space-y-1.5 mb-10 z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-sans uppercase">
          SELECT GAME MODE
        </h1>
        <p className="text-base font-normal text-neutral-500">
          Play UNO online with friends or offline vs computer AI bots.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER WITH 3 MODE CARDS                              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 items-start">
        
        {/* CENTER DECORATIVE CIRCULAR CARD FAN GRAPHIC */}
        <div className="absolute inset-0 pointer-events-none hidden lg:flex items-center justify-center -z-0">
          <div className="relative w-[420px] h-[420px] flex items-center justify-center opacity-30">
            {wheelCards.map((card, idx) => {
              const angle = (idx * 360) / wheelCards.length;
              return (
                <div
                  key={idx}
                  className="absolute transform transition-transform"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-145px) scale(0.65)`
                  }}
                >
                  <UnoCard color={card.color} value={card.value as any} size="sm" />
                </div>
              );
            })}
            {/* Middle Wild +4 Card */}
            <div className="absolute shadow-2xl z-10 transform scale-75 hover:scale-80 transition-transform">
              <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CARD 1: CREATE MULTIPLAYER GAME (REAL HUMAN PLAYERS ONLY)   */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between z-10 space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-[#111827] tracking-wide uppercase">
                🌐 CREATE MULTIPLAYER
              </h2>
              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase border border-blue-200">
                REAL PLAYERS ONLY
              </span>
            </div>

            <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-5">
              Create an online room for real human players. Invite friends using room code or link. No AI bots.
            </p>

            <div className="space-y-5">
              
              {/* Room Privacy Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Room Privacy:</span>
                <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      !isPrivate
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    🌐 Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isPrivate
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>

              {/* Players Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Players:</span>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayers(num)}
                      className={`w-10 h-9 rounded-lg font-bold text-sm border transition-all ${
                        maxPlayers === num
                          ? 'border-sky-400 bg-sky-50 text-sky-600 shadow-sm'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Game Mode:</span>
                <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 border border-neutral-200">
                  {(['Classic', 'Custom'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        gameMode === mode
                          ? 'bg-white text-neutral-800 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Rules Header */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-3">
                  Optional rules:
                </span>

                <div className="space-y-3">
                  {/* Stacking Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Stacking</span>
                    <button
                      type="button"
                      onClick={() => setStacking(!stacking)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        stacking ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          stacking ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {stacking ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Jump-In Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Jump-In</span>
                    <button
                      type="button"
                      onClick={() => { const next = !jumpIn; setJumpIn(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        jumpIn ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          jumpIn ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Seven-O Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Seven-O</span>
                    <button
                      type="button"
                      onClick={() => { const next = !sevenZero; setSevenZero(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        sevenZero ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          sevenZero ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Force Play Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Force Play</span>
                    <button
                      type="button"
                      onClick={() => setForcePlay(!forcePlay)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        forcePlay ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          forcePlay ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Draw Until Playable Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Draw Until Playable</span>
                    <button
                      type="button"
                      onClick={() => { const next = !drawUntilPlayable; setDrawUntilPlayable(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        drawUntilPlayable ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          drawUntilPlayable ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Discard All Color Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Discard All Color 🎨</span>
                    <button
                      type="button"
                      onClick={() => { const next = !discardAll; setDiscardAll(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        discardAll ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          discardAll ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {discardAll ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Deflect Shield Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Deflect Shield 🛡️</span>
                    <button
                      type="button"
                      onClick={() => setCounterDeflect(!counterDeflect)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        counterDeflect ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          counterDeflect ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {counterDeflect ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Wild Shuffle Hands Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Wild Shuffle 🌀</span>
                    <button
                      type="button"
                      onClick={() => { const next = !shuffleHands; setShuffleHands(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        shuffleHands ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          shuffleHands ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {shuffleHands ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Wild Swap Card Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Wild Swap 🎯</span>
                    <button
                      type="button"
                      onClick={() => { const next = !wildSwap; setWildSwap(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        wildSwap ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          wildSwap ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {wildSwap ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* CREATE GAME Button */}
          <div className="pt-4">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full btn-3d-blue py-3.5 rounded-2xl text-sm font-black tracking-wider uppercase disabled:opacity-50"
            >
              {isCreating ? 'CREATING ROOM...' : 'CREATE MULTIPLAYER GAME'}
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* CARD 2: CREATE MULTIPLAYER GAME                             */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between z-10 space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-[#111827] tracking-wide uppercase">
                🌐 CREATE MULTIPLAYER
              </h2>
              <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase border border-blue-200">
                REAL PLAYERS ONLY
              </span>
            </div>

            <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-5">
              Create an online room for real human players. Invite friends using room code or link. No AI bots.
            </p>

            <div className="space-y-5">
              
              {/* Room Privacy Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Room Privacy:</span>
                <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      !isPrivate
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    🌐 Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isPrivate
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>

              {/* Players Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Players:</span>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxPlayers(num)}
                      className={`w-10 h-9 rounded-lg font-bold text-sm border transition-all ${
                        maxPlayers === num
                          ? 'border-sky-400 bg-sky-50 text-sky-600 shadow-sm'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">Game Mode:</span>
                <div className="bg-neutral-100 p-1 rounded-xl flex gap-1 border border-neutral-200">
                  {(['Classic', 'Custom'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        gameMode === mode
                          ? 'bg-white text-neutral-800 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Rules Header */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-3">
                  Optional rules:
                </span>

                <div className="space-y-3">
                  {/* Stacking Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Stacking</span>
                    <button
                      type="button"
                      onClick={() => setStacking(!stacking)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        stacking ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          stacking ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {stacking ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Jump-In Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Jump-In</span>
                    <button
                      type="button"
                      onClick={() => { const next = !jumpIn; setJumpIn(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        jumpIn ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          jumpIn ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Seven-O Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Seven-O</span>
                    <button
                      type="button"
                      onClick={() => { const next = !sevenZero; setSevenZero(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        sevenZero ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          sevenZero ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Force Play Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Force Play</span>
                    <button
                      type="button"
                      onClick={() => setForcePlay(!forcePlay)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        forcePlay ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          forcePlay ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Draw Until Playable Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Draw Until Playable</span>
                    <button
                      type="button"
                      onClick={() => { const next = !drawUntilPlayable; setDrawUntilPlayable(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        drawUntilPlayable ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          drawUntilPlayable ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Discard All Color Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Discard All Color 🎨</span>
                    <button
                      type="button"
                      onClick={() => { const next = !discardAll; setDiscardAll(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        discardAll ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          discardAll ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {discardAll ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Deflect Shield Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Deflect Shield 🛡️</span>
                    <button
                      type="button"
                      onClick={() => setCounterDeflect(!counterDeflect)}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        counterDeflect ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          counterDeflect ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {counterDeflect ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Wild Shuffle Hands Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Wild Shuffle 🌀</span>
                    <button
                      type="button"
                      onClick={() => { const next = !shuffleHands; setShuffleHands(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        shuffleHands ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          shuffleHands ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {shuffleHands ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Wild Swap Card Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Wild Swap 🎯</span>
                    <button
                      type="button"
                      onClick={() => { const next = !wildSwap; setWildSwap(next); if (next) setGameMode('Custom'); }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        wildSwap ? 'bg-sky-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                          wildSwap ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <span className="text-[8px] font-black text-sky-600">
                          {wildSwap ? 'ON' : ''}
                        </span>
                      </div>
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* CREATE GAME Button */}
          <div className="pt-4">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full btn-3d-blue py-3.5 rounded-2xl text-sm font-black tracking-wider uppercase disabled:opacity-50"
            >
              {isCreating ? 'CREATING ROOM...' : 'CREATE GAME'}
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT CARD: JOIN A GAME                                     */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/90 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between z-10 space-y-6">
          
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-[#111827] tracking-wide uppercase text-center">
              JOIN A GAME
            </h2>

            <form onSubmit={handleJoinGame} className="space-y-6 pt-4">
              <div className="text-center space-y-2">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
                  Enter Room Code
                </label>
                <div className="max-w-[240px] mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setJoinError(null);
                    }}
                    placeholder="[ ABC123 ]"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-center text-lg font-black text-slate-900 uppercase tracking-widest placeholder:text-slate-300 bg-slate-50/50"
                  />
                  {joinError && (
                    <p className="text-xs font-extrabold text-red-500 mt-1.5">{joinError}</p>
                  )}
                </div>
              </div>

              {/* JOIN GAME Button */}
              <button
                type="submit"
                disabled={isJoining}
                className="w-full btn-3d-green py-3.5 rounded-2xl text-sm font-black tracking-wider uppercase disabled:opacity-50"
              >
                {isJoining ? 'JOINING ROOM...' : 'JOIN GAME'}
              </button>
            </form>
          </div>


          {/* OR Divider & Invite Link Action (Matching Image 2) */}
          <div className="space-y-6 pt-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] flex-1 bg-neutral-200" />
              <span className="text-xs font-bold text-neutral-400 uppercase">OR</span>
              <div className="h-[1px] flex-1 bg-neutral-200" />
            </div>

            <button
              onClick={handleInviteLink}
              className="text-xs font-bold text-neutral-700 hover:text-sky-600 underline uppercase tracking-wider transition-colors"
            >
              JOIN USING INVITE LINK
            </button>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* PUBLIC LOBBY BROWSER SECTION                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-5xl w-full mt-12 z-10 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <h2 className="text-lg font-extrabold text-neutral-800 tracking-wide uppercase">
              OPEN PUBLIC LOBBIES
            </h2>
            <span className="bg-sky-100 text-sky-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {publicRooms.length} Active
            </span>
          </div>

          <button
            onClick={fetchPublicRooms}
            disabled={isLoadingRooms}
            className="text-xs font-bold text-neutral-500 hover:text-sky-600 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        {publicRooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center space-y-2 shadow-sm">
            <p className="text-sm font-bold text-neutral-700">No open public rooms found right now.</p>
            <p className="text-xs text-neutral-500">Create a new game room above or configure preset rules in the Create Game menu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <div
                key={room.code}
                className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group hover:border-sky-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-lg tracking-wider">
                      #{room.code}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      👥 {room.playerCount} / {room.maxPlayers}
                    </span>
                  </div>

                  <div className="pt-1">
                    <p className="text-xs text-neutral-400 font-medium">Host</p>
                    <p className="text-sm font-extrabold text-neutral-800 tracking-tight">{room.hostName}</p>
                  </div>

                  {/* Settings tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {room.settings?.houseRules?.stacking && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                        Stacking +2/+4
                      </span>
                    )}
                    {room.settings?.houseRules?.jumpIn && (
                      <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
                        Jump-In
                      </span>
                    )}
                    {room.settings?.houseRules?.sevenZero && (
                      <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
                        7-Zero
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinPublicRoom(room.code)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm group-hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  JOIN LOBBY 🚀
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
