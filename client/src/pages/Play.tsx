import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Globe, KeyRound, Sparkles, RefreshCw, Sliders, Shield, Flame, Play as PlayIcon, Check, Copy, Info, X, Zap } from 'lucide-react';
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
  const [gameMode, setGameMode] = useState<'Classic' | 'No Mercy' | 'Custom'>('Classic');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  
  // Custom House Rules State
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
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handleModeChange = (mode: 'Classic' | 'No Mercy' | 'Custom') => {
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
    } else if (mode === 'No Mercy') {
      setStacking(true);
      setJumpIn(false);
      setSevenZero(true);
      setForcePlay(false);
      setDrawUntilPlayable(false);
      setDiscardAll(true);
      setCounterDeflect(true);
      setShuffleHands(false);
      setWildSwap(true);
    } else if (mode === 'Custom') {
      setShowCustomModal(true);
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
      // Silently handle offline mode
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

    const modeChoice = gameMode === 'No Mercy' ? 'NO_MERCY' : (gameMode === 'Custom' ? 'CUSTOM' : 'CLASSIC');

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
            mode: modeChoice,
            houseRules: {
              stacking,
              jumpIn,
              sevenZero,
              forcePlay,
              drawUntilPlayable,
              multipleCardPlay: false,
              customCards: modeChoice !== 'CLASSIC',
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

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0B4A8B] via-[#052D56] to-[#021832] text-white py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between items-center relative overflow-hidden font-sans selection:bg-none">
      
      {/* Dynamic Ambient Aura Glow Overlays */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER TITLE BANNER                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center space-y-2 mb-8 z-10">
        <div className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-sky-200 shadow-md backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="uppercase tracking-widest font-black">UNO ARENA GAME LOBBY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-sans uppercase drop-shadow-md">
          SELECT GAME MODE
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-sky-200/80 max-w-lg mx-auto">
          Play UNO online with friends worldwide or practice offline against smart AI bots.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN EQUAL-HEIGHT 3-CARD GRID                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 items-stretch">
        
        {/* ----------------------------------------------------------- */}
        {/* CARD 1: PLAY VS COMPUTER (OFFLINE AI MATCH)                 */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-6 group">
          
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">VS COMPUTER</h2>
                  <p className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">OFFLINE PRACTICE</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full uppercase border border-amber-400/30">
                OFFLINE
              </span>
            </div>

            <p className="text-xs text-sky-100/70 font-medium leading-relaxed">
              Sharpen your skills against smart AI bots. Choose match size and start playing instantly!
            </p>

            {/* Match Size Selection: 2, 3, or 4 Players */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">
                Select Match Size:
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 2, label: '2 PLAYERS', desc: '1 vs 1 AI' },
                  { size: 3, label: '3 PLAYERS', desc: '1 vs 2 AI' },
                  { size: 4, label: '4 PLAYERS', desc: '1 vs 3 AI' }
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setBotMatchSize(item.size as 2 | 3 | 4)}
                    className={`py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      botMatchSize === item.size
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-2 ring-amber-400/40 font-black shadow-md'
                        : 'border-sky-400/20 text-sky-200/70 hover:border-sky-400/40 bg-sky-950/40'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{item.label}</span>
                    <span className="text-[9px] font-bold mt-0.5 opacity-80">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Player Roster Preview */}
            <div className="bg-sky-950/60 rounded-2xl p-3 border border-sky-400/20 space-y-2">
              <span className="text-[10px] font-extrabold text-sky-300/70 uppercase tracking-wider block">
                Match Roster Preview:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                  <span>👤</span>
                  <span>You</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                  <span>🤖</span>
                  <span>Bot 1</span>
                </div>
                {botMatchSize >= 3 && (
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                    <span>🤖</span>
                    <span>Bot 2</span>
                  </div>
                )}
                {botMatchSize >= 4 && (
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                    <span>🤖</span>
                    <span>Bot 3</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* START VS COMPUTER BUTTON */}
          <div className="pt-3">
            <button
              onClick={() => handleCreateVsBot()}
              disabled={isCreatingBot}
              className="w-full btn-3d-yellow py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>{isCreatingBot ? 'STARTING MATCH...' : `PLAY ${botMatchSize}P VS COMPUTER`}</span>
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* CARD 2: CREATE MULTIPLAYER GAME                             */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-sky-300/50 transition-all flex flex-col justify-between space-y-6 group">
          
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">CREATE MULTIPLAYER</h2>
                  <p className="text-[10px] font-bold text-sky-300/80 uppercase tracking-wider">ONLINE ROOM</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-full uppercase border border-sky-400/30">
                REAL PLAYERS
              </span>
            </div>

            <p className="text-xs text-sky-100/70 font-medium leading-relaxed">
              Host an online match for real human players. Invite friends via code or link.
            </p>

            <div className="space-y-3.5">
              
              {/* Privacy & Player Count Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-sky-200/80 uppercase tracking-wider block">Privacy:</span>
                  <div className="bg-sky-950/60 p-1 rounded-xl flex gap-1 border border-sky-400/20">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        !isPrivate ? 'bg-emerald-500 text-slate-950 shadow-sm font-black' : 'text-sky-200/70 hover:text-white'
                      }`}
                    >
                      🌐 Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        isPrivate ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-sky-200/70 hover:text-white'
                      }`}
                    >
                      🔒 Private
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-sky-200/80 uppercase tracking-wider block">Players:</span>
                  <div className="bg-sky-950/60 p-1 rounded-xl flex gap-1 border border-sky-400/20">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          maxPlayers === num ? 'bg-sky-400 text-slate-950 shadow-sm' : 'text-sky-200/70 hover:text-white'
                        }`}
                      >
                        {num}P
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Mode Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-sky-200/80 uppercase tracking-wider">Game Mode:</span>
                  {gameMode === 'Custom' && (
                    <button
                      onClick={() => setShowCustomModal(true)}
                      className="text-[10px] font-extrabold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer underline"
                    >
                      <Sliders className="w-3 h-3" /> Edit Rules
                    </button>
                  )}
                </div>
                <div className="bg-sky-950/60 p-1 rounded-xl flex gap-1 border border-sky-400/20">
                  {(['Classic', 'No Mercy', 'Custom'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(mode)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        gameMode === mode
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                          : 'text-sky-200/70 hover:text-white'
                      }`}
                    >
                      {mode === 'No Mercy' ? '🔥 No Mercy' : mode === 'Custom' ? '⚙️ Custom' : '🎲 Classic'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Rules Info Box */}
              <div className="p-3 rounded-2xl bg-sky-950/70 border border-sky-400/20 text-left space-y-1">
                <span className="font-extrabold text-xs text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>{gameMode === 'Classic' ? 'Classic Rules' : gameMode === 'No Mercy' ? 'Show \'em No Mercy' : 'Custom Rules Active'}</span>
                </span>
                <p className="text-[10px] text-sky-200/70 font-semibold leading-relaxed">
                  {gameMode === 'Classic'
                    ? 'Standard official UNO rules (+2/+4 Stacking, Deflect Shield).'
                    : gameMode === 'No Mercy'
                    ? '25-Card Knockout, 7-0 Swap, Discard All, Color Roulette, Extreme Stacking.'
                    : 'Configured house rules active. Click Edit Rules to customize toggles.'}
                </p>
              </div>

            </div>
          </div>

          {/* CREATE GAME BUTTON */}
          <div className="pt-3">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full btn-3d-blue py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{isCreating ? 'CREATING ROOM...' : 'CREATE MULTIPLAYER ROOM'}</span>
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* CARD 3: JOIN A GAME WITH CODE                               */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-emerald-400/50 transition-all flex flex-col justify-between space-y-6 group">
          
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-sm">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">JOIN A GAME</h2>
                  <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-wider">ROOM CODE</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full uppercase border border-emerald-400/30">
                JOIN NOW
              </span>
            </div>

            <p className="text-xs text-sky-100/70 font-medium leading-relaxed">
              Enter a 6-character room code provided by your host to join an active game room.
            </p>

            <form onSubmit={handleJoinGame} className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-sky-200/80 uppercase tracking-wider block text-center">
                  ENTER 6-DIGIT ROOM CODE:
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
                    placeholder="ABC123"
                    className="w-full px-4 py-3 rounded-2xl bg-sky-950/80 border-2 border-sky-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:outline-none font-mono text-center text-xl font-black text-white uppercase tracking-widest placeholder:text-sky-300/30 shadow-inner"
                  />
                  {joinError && (
                    <p className="text-xs font-black text-red-400 mt-1.5 text-center">{joinError}</p>
                  )}
                </div>
              </div>

              {/* JOIN GAME BUTTON */}
              <button
                type="submit"
                disabled={isJoining}
                className="w-full btn-3d-green py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <PlayIcon className="w-4 h-4 fill-current text-white" />
                <span>{isJoining ? 'JOINING ROOM...' : 'JOIN ROOM'}</span>
              </button>
            </form>
          </div>

          {/* OR DIVIDER & INVITE LINK SHORTCUT */}
          <div className="space-y-3 pt-2 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] flex-1 bg-sky-400/20" />
              <span className="text-[10px] font-black text-sky-300/60 uppercase">OR</span>
              <div className="h-[1px] flex-1 bg-sky-400/20" />
            </div>

            <button
              onClick={handleInviteLink}
              className="text-xs font-bold text-sky-200 hover:text-amber-300 underline uppercase tracking-wider transition-colors cursor-pointer"
            >
              JOIN USING INVITE LINK 🔗
            </button>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* PUBLIC LOBBY BROWSER SECTION                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-6xl w-full mt-10 z-10 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
              OPEN PUBLIC LOBBIES
            </h2>
            <span className="bg-sky-500/20 text-sky-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-sky-400/30">
              {publicRooms.length} Active
            </span>
          </div>

          <button
            onClick={fetchPublicRooms}
            disabled={isLoadingRooms}
            className="text-xs font-extrabold text-sky-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {publicRooms.length === 0 ? (
          <div className="bg-[#062447]/80 backdrop-blur-xl rounded-3xl p-8 border border-sky-400/20 text-center space-y-2 shadow-xl">
            <p className="text-sm font-extrabold text-white">No open public rooms found right now.</p>
            <p className="text-xs font-semibold text-sky-200/70">Create a new game room above to start playing with friends!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <div
                key={room.code}
                className="bg-[#062447]/90 backdrop-blur-xl rounded-2xl p-5 border border-sky-400/25 shadow-xl hover:border-sky-400/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-sky-300 bg-sky-950/80 border border-sky-400/30 px-2.5 py-1 rounded-xl tracking-wider">
                      #{room.code}
                    </span>
                    <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                      👥 {room.playerCount} / {room.maxPlayers}
                    </span>
                  </div>

                  <div className="pt-1">
                    <p className="text-[10px] text-sky-300/60 font-semibold uppercase">Host</p>
                    <p className="text-sm font-black text-white tracking-tight">{room.hostName}</p>
                  </div>

                  {/* Settings tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {room.settings?.houseRules?.stacking && (
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                        Stacking +2/+4
                      </span>
                    )}
                    {room.settings?.houseRules?.jumpIn && (
                      <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md border border-purple-400/30">
                        Jump-In
                      </span>
                    )}
                    {room.settings?.houseRules?.sevenZero && (
                      <span className="text-[10px] font-extrabold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md border border-sky-400/30">
                        7-Zero
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinPublicRoom(room.code)}
                  className="w-full btn-3d-green py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>JOIN LOBBY 🚀</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CUSTOM HOUSE RULES MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-[#062447] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sky-400/30 shadow-2xl space-y-6 animate-pop-scale">
            <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white leading-tight uppercase">CUSTOM HOUSE RULES</h3>
                  <p className="text-xs text-sky-200/70 font-semibold">Toggle individual match rules</p>
                </div>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="p-1 text-sky-300 hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { label: 'Stacking (+2/+4)', desc: 'Stack Draw Two and Draw Four cards', state: stacking, setter: setStacking },
                { label: 'Jump-In Rule ⚡', desc: 'Play matching card out of turn', state: jumpIn, setter: setJumpIn },
                { label: '7-0 Hand Swap 🔄', desc: '7 swaps hand, 0 rotates all hands', state: sevenZero, setter: setSevenZero },
                { label: 'Force Play 🎯', desc: 'Must play drawn card if playable', state: forcePlay, setter: setForcePlay },
                { label: 'Draw Until Playable 📥', desc: 'Keep drawing until playable card found', state: drawUntilPlayable, setter: setDrawUntilPlayable },
                { label: 'Discard All Color 🎨', desc: 'Discard all matching color cards', state: discardAll, setter: setDiscardAll },
                { label: 'Deflect Shield 🛡️', desc: 'Deflect stack penalty with Skip/Reverse', state: counterDeflect, setter: setCounterDeflect },
                { label: 'Wild Shuffle 🌀', desc: 'Gather and redistribute all hands', state: shuffleHands, setter: setShuffleHands },
                { label: 'Wild Swap Card 🎯', desc: 'Wild card that swaps hand with chosen player', state: wildSwap, setter: setWildSwap },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-sky-950/60 border border-sky-400/20">
                  <div>
                    <span className="text-xs font-black text-white block">{rule.label}</span>
                    <span className="text-[10px] font-semibold text-sky-200/60">{rule.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => rule.setter(!rule.state)}
                    className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      rule.state ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                        rule.state ? 'translate-x-6 bg-slate-950 text-amber-400' : 'translate-x-0'
                      }`}
                    >
                      <span className="text-[8px] font-black">{rule.state ? '✓' : ''}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="w-full btn-3d-yellow py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                APPLY & SAVE CUSTOM RULES
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
