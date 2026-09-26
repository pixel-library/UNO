import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Globe, KeyRound, Sparkles, RefreshCw, Sliders, Flame, Play as PlayIcon, Info, X, Zap, Users, Edit3, Shield } from 'lucide-react';
import { socketService } from '@/services/socketService';
import { supabaseRoomService } from '@/services/supabaseRoomService';
import { validateRoomCode } from '@shared/validation/roomValidator';
import { useScroll3D } from '@/hooks/useScroll3D';

export const Play: React.FC = () => {
  const navigate = useNavigate();
  useScroll3D();

  // Active Main Navigation Tab State ('create' | 'lobby' | 'join' | 'vs_bot')
  const [activeTab, setActiveTab] = useState<'create' | 'lobby' | 'join' | 'vs_bot'>('create');

  // Player Info State
  const [playerName, setPlayerName] = useState<string>('Player');
  const [playerAvatar, setPlayerAvatar] = useState<string>('🦊');

  useEffect(() => {
    const storedName = localStorage.getItem('uno_player_name');
    const storedAvatar = localStorage.getItem('uno_player_avatar');
    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
  }, []);

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
    const pName = localStorage.getItem('uno_player_name');
    if (!pName) {
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
          playerName: pName,
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
      // Silently ignore static host error
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
    const pName = localStorage.getItem('uno_player_name');
    if (!pName) {
      navigate('/enter-name', { state: { returnTo: `/join/${code}` } });
      return;
    }
    setIsJoining(true);
    const socket = socketService.getSocket();
    socket.emit('room:join', { roomCode: code, playerName: pName }, (res: any) => {
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
    const pName = localStorage.getItem('uno_player_name');
    if (!pName) {
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
          playerName: pName,
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

    const pName = localStorage.getItem('uno_player_name');
    if (!pName) {
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
      socket.emit('room:join', { roomCode: validation.formattedCode!, playerName: pName }, (res: any) => {
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
    <div className="w-full min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#0B4A8B] via-[#052D56] to-[#021832] text-white py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between items-center relative overflow-hidden font-sans selection:bg-none">
      
      {/* Dynamic Ambient Glow Overlays */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="w-full max-w-4xl mx-auto space-y-6 z-10 flex-1 flex flex-col justify-center">

        {/* ------------------------------------------------------------- */}
        {/* TOP PLAYER PROFILE BAR (MATCHING REFERENCE DESIGN)             */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl shadow-sm">
              {playerAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-sky-300/70 uppercase tracking-widest block">PLAYER PROFILE</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                <span>{playerName}</span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  ★ Ready
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => navigate('/enter-name')}
            className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Change Handle</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SEGMENTED TAB NAVIGATION BAR (MATCHING REFERENCE DESIGN)      */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 p-1.5 rounded-2xl flex gap-1.5 justify-center shadow-xl">
          {[
            { id: 'create', label: 'Create Room', icon: <Globe className="w-4 h-4" /> },
            { id: 'lobby', label: 'Public Lobby', icon: <Users className="w-4 h-4" />, count: publicRooms.length },
            { id: 'join', label: 'Join Code', icon: <KeyRound className="w-4 h-4" /> },
            { id: 'vs_bot', label: 'VS Computer', icon: <Bot className="w-4 h-4" /> }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-sky-200/70 hover:text-white hover:bg-sky-950/40'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-sky-500/20 text-sky-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE TAB CONTENT CARD PANEL (SINGLE PROMINENT PANEL)        */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full bg-[#062447]/90 backdrop-blur-xl border border-sky-400/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

          {/* ----------------------------------------------------------- */}
          {/* TAB 1: CREATE ROOM CONTENT                                  */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'create' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    <span>CREATE MULTIPLAYER ROOM</span>
                  </h3>
                  <p className="text-xs font-semibold text-sky-200/70 mt-0.5">
                    Configure online game rules and room access for real players.
                  </p>
                </div>
                <span className="text-xs font-extrabold bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-400/30">
                  ONLINE MATCH
                </span>
              </div>

              {/* Game Preset Modes */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">SELECT PRESET MODE:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { mode: 'Classic', title: '🎲 CLASSIC', desc: 'Standard official UNO rules' },
                    { mode: 'No Mercy', title: '🔥 NO MERCY', desc: '25-Card Limit & Extreme Stacking' },
                    { mode: 'Custom', title: '⚙️ CUSTOM', desc: 'Configure individual house rules' }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => handleModeChange(item.mode as any)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        gameMode === item.mode
                          ? 'border-amber-400 bg-amber-500/20 text-white ring-2 ring-amber-400/40 shadow-md'
                          : 'border-sky-400/20 text-sky-200/70 hover:border-sky-400/40 bg-sky-950/40'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-white">{item.title}</div>
                      <div className="text-[10px] font-semibold text-sky-200/70 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Access & Players Row (Matching Reference Image Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">ROOM ACCESS:</span>
                  <div className="bg-sky-950/60 p-1.5 rounded-2xl flex gap-1.5 border border-sky-400/20">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        !isPrivate ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-sky-200/70 hover:text-white'
                      }`}
                    >
                      🌐 Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isPrivate ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-sky-200/70 hover:text-white'
                      }`}
                    >
                      🔒 Private
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">PLAYER COUNT:</span>
                  <div className="bg-sky-950/60 p-1.5 rounded-2xl flex gap-1.5 border border-sky-400/20">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          maxPlayers === num ? 'bg-sky-400 text-slate-950 shadow-md' : 'text-sky-200/70 hover:text-white'
                        }`}
                      >
                        {num} Players
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rules Description Summary Box */}
              <div className="p-4 rounded-2xl bg-sky-950/70 border border-sky-400/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-xs text-amber-300 uppercase tracking-wide block">
                    {gameMode === 'Classic' ? '🎲 Classic Rules Active' : gameMode === 'No Mercy' ? '🔥 Show \'em No Mercy Active' : '⚙️ Custom House Rules Active'}
                  </span>
                  <p className="text-[11px] text-sky-200/80 font-medium">
                    {gameMode === 'Classic'
                      ? 'Standard official UNO rules (+2/+4 Stacking, Deflect Shield).'
                      : gameMode === 'No Mercy'
                      ? '25-Card Knockout, 7-0 Swap, Discard All, Color Roulette, Extreme Stacking.'
                      : 'Configured house rules active.'}
                  </p>
                </div>
                {gameMode === 'Custom' && (
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit Toggles</span>
                  </button>
                )}
              </div>

              {/* Create Room Button (Bottom Right Aligned like reference) */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCreateGame}
                  disabled={isCreating}
                  className="btn-3d-blue px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>{isCreating ? 'CREATING ROOM...' : 'CREATE MULTIPLAYER ROOM'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 2: PUBLIC LOBBY BROWSER CONTENT                         */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'lobby' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-400" />
                    <span>OPEN PUBLIC LOBBIES</span>
                  </h3>
                  <p className="text-xs font-semibold text-sky-200/70 mt-0.5">
                    Join open games created by other real players worldwide.
                  </p>
                </div>

                <button
                  onClick={fetchPublicRooms}
                  disabled={isLoadingRooms}
                  className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-400/30 px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {publicRooms.length === 0 ? (
                <div className="p-8 text-center space-y-3 bg-sky-950/40 rounded-2xl border border-sky-400/20">
                  <div className="text-3xl">🌐</div>
                  <h4 className="text-sm font-extrabold text-white">No open public rooms found right now.</h4>
                  <p className="text-xs font-semibold text-sky-200/60 max-w-sm mx-auto">
                    Be the first! Click "Create Room" above to start a new public game room.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="btn-3d-yellow px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 mt-2"
                  >
                    <span>Create Public Room Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publicRooms.map((room) => (
                    <div
                      key={room.code}
                      className="bg-sky-950/60 rounded-2xl p-4 border border-sky-400/20 shadow-lg hover:border-sky-400/50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm text-sky-300 bg-sky-950/80 border border-sky-400/30 px-2.5 py-1 rounded-xl tracking-wider">
                            #{room.code}
                          </span>
                          <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                            👥 {room.playerCount} / {room.maxPlayers}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] text-sky-300/60 font-semibold uppercase">Host Player</p>
                          <p className="text-sm font-black text-white tracking-tight">{room.hostName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinPublicRoom(room.code)}
                        className="w-full btn-3d-green py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>JOIN ROOM 🚀</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 3: JOIN ROOM WITH CODE CONTENT                          */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'join' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                    <span>JOIN WITH ROOM CODE</span>
                  </h3>
                  <p className="text-xs font-semibold text-sky-200/70 mt-0.5">
                    Enter the 6-character room code from your game host.
                  </p>
                </div>
                <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
                  QUICK JOIN
                </span>
              </div>

              <form onSubmit={handleJoinGame} className="space-y-6 max-w-md mx-auto py-2">
                <div className="space-y-2 text-center">
                  <label className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">
                    ENTER 6-DIGIT ROOM CODE:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setJoinError(null);
                    }}
                    placeholder="ABC123"
                    className="w-full px-4 py-3.5 rounded-2xl bg-sky-950/80 border-2 border-sky-400/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:outline-none font-mono text-center text-2xl font-black text-white uppercase tracking-widest placeholder:text-sky-300/30 shadow-inner"
                  />
                  {joinError && (
                    <p className="text-xs font-black text-red-400 mt-2">{joinError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full btn-3d-green py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <PlayIcon className="w-4 h-4 fill-current text-white" />
                  <span>{isJoining ? 'JOINING ROOM...' : 'JOIN ROOM NOW'}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={handleInviteLink}
                  className="text-xs font-bold text-sky-200 hover:text-amber-300 underline uppercase tracking-wider transition-colors cursor-pointer"
                >
                  PASTE INVITE LINK 🔗
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 4: VS COMPUTER (AI MATCH) CONTENT                       */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'vs_bot' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <span>PLAY VS COMPUTER (AI)</span>
                  </h3>
                  <p className="text-xs font-semibold text-sky-200/70 mt-0.5">
                    Practice your skills offline against smart computer AI bots.
                  </p>
                </div>
                <span className="text-xs font-extrabold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
                  OFFLINE / BOT
                </span>
              </div>

              {/* Match Size Selection: 2, 3, or 4 Players */}
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider block">SELECT MATCH SIZE:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { size: 2, label: '2 PLAYERS', desc: '1 vs 1 AI Bot' },
                    { size: 3, label: '3 PLAYERS', desc: '1 vs 2 AI Bots' },
                    { size: 4, label: '4 PLAYERS', desc: '1 vs 3 AI Bots' }
                  ].map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setBotMatchSize(item.size as 2 | 3 | 4)}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        botMatchSize === item.size
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-2 ring-amber-400/40 shadow-md font-black'
                          : 'border-sky-400/20 text-sky-200/70 hover:border-sky-400/40 bg-sky-950/40'
                      }`}
                    >
                      <div className="font-extrabold text-sm text-white">{item.label}</div>
                      <div className="text-xs font-semibold text-amber-300/80 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Roster Preview */}
              <div className="bg-sky-950/60 rounded-2xl p-4 border border-sky-400/20 space-y-2">
                <span className="text-xs font-extrabold text-sky-300/80 uppercase tracking-wider block">
                  MATCH ROSTER PREVIEW:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                    <span>👤</span>
                    <span>You ({playerName})</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                    <span>🤖</span>
                    <span>Bot 1</span>
                  </div>
                  {botMatchSize >= 3 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                      <span>🤖</span>
                      <span>Bot 2</span>
                    </div>
                  )}
                  {botMatchSize >= 4 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                      <span>🤖</span>
                      <span>Bot 3</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Start VS Computer Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleCreateVsBot()}
                  disabled={isCreatingBot}
                  className="btn-3d-yellow px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-slate-950" />
                  <span>{isCreatingBot ? 'STARTING MATCH...' : `PLAY ${botMatchSize}P VS COMPUTER`}</span>
                </button>
              </div>
            </div>
          )}

        </div>

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
