import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Copy, Volume2, VolumeX, Settings, MessageSquare, Send, Check, Play, Zap, ArrowRight, Music } from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';
import { CardColor, PlayerPrivateState, Card, ChatMessage } from '@shared/types/game';
import { audioService } from '@/services/audioService';
import { socketService } from '@/services/socketService';

export const GameScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [gameState, setGameState] = useState<PlayerPrivateState | null>(
    location.state?.initialGameState || null
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [pendingWildCardId, setPendingWildCardId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Action pending state for race condition protection
  const [isActionPending, setIsActionPending] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Connect to Socket.IO and listen for game state updates
  useEffect(() => {
    const socket = socketService.getSocket();
    const myId = localStorage.getItem('uno_player_id');

    let syncTimer: any;

    const handleSync = () => {
      socket.emit('game:sync', { playerId: myId, gameId }, (res: any) => {
        if (res?.success && res?.state) {
          setGameState(res.state);
          setSyncError(null);
        } else {
          if (!gameState) {
            setSyncError(res?.error || 'Could not synchronize with game room.');
          }
        }
      });
    };

    socket.on('game:state', (newState: PlayerPrivateState) => {
      setGameState(newState);
      setIsActionPending(false);
      setSyncError(null);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('connect', handleSync);

    // Initial sync
    handleSync();

    syncTimer = setTimeout(() => {
      if (!gameState) {
        handleSync();
      }
    }, 2500);

    return () => {
      clearTimeout(syncTimer);
      socket.off('game:state');
      socket.off('chat:message');
      socket.off('connect', handleSync);
    };
  }, [gameId]);

  // Copy Room Code
  const handleCopyCode = () => {
    const codeToCopy = (gameState?.roomCode || '').trim().toUpperCase();
    if (!codeToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }).catch(() => {
        fallbackCopyText(codeToCopy);
      });
    } else {
      fallbackCopyText(codeToCopy);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Sound & Music Toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  // Card Play Handler
  const handleCardClick = (card: Card) => {
    if (!gameState || isActionPending) return;

    const activePlayers = gameState.players.filter(p => !p.isSpectator);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];
    const myId = localStorage.getItem('uno_player_id');

    if (currentPlayer?.id !== myId) return;

    setSelectedCardId(card.id);
    audioService.playButtonClick();

    if (card.color === 'WILD') {
      setPendingWildCardId(card.id);
      setShowColorPicker(true);
      return;
    }

    setIsActionPending(true);
    const socket = socketService.getSocket();
    socket.emit('game:playCard', { cardId: card.id }, (res: any) => {
      if (res?.success) {
        audioService.playCardSound();
        setSelectedCardId(null);
      } else {
        setIsActionPending(false);
      }
    });
  };

  // Color Pick Handler
  const handleSelectColor = (color: CardColor) => {
    if (!pendingWildCardId || isActionPending) return;

    setIsActionPending(true);
    const socket = socketService.getSocket();
    socket.emit('game:playCard', { cardId: pendingWildCardId, chosenColor: color }, (res: any) => {
      if (res?.success) {
        audioService.playCardSound();
        setShowColorPicker(false);
        setPendingWildCardId(null);
        setSelectedCardId(null);
      } else {
        setIsActionPending(false);
      }
    });
  };

  // Draw Card Handler
  const handleDrawCard = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    audioService.playDrawSound();
    const socket = socketService.getSocket();
    socket.emit('game:drawCard', {}, (res: any) => {
      if (!res?.success) {
        setIsActionPending(false);
      }
    });
  };

  // Call UNO Handler
  const handleCallUno = () => {
    audioService.playUnoSound();
    const socket = socketService.getSocket();
    socket.emit('game:callUno');
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const socket = socketService.getSocket();
    socket.emit('chat:message', { text: chatInput });
    setChatInput('');
  };

  // Rematch Handler
  const handleRematch = () => {
    audioService.playButtonClick();
    const socket = socketService.getSocket();
    socket.emit('game:rematch');
  };

  // Loading / Retry Screen if game state not ready
  if (!gameState) {
    return (
      <div className="w-full h-screen bg-[#081F3E] text-white flex flex-col items-center justify-center p-4 space-y-6">
        <div className="bg-[#E52521] border-2 border-[#FCD116] px-5 py-2 rounded-2xl shadow-2xl transform -rotate-3">
          <span className="font-black text-3xl italic tracking-tighter">
            <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
          </span>
        </div>

        {syncError ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-xl">
            <h2 className="text-lg font-extrabold text-red-300">Unable to Start Match</h2>
            <p className="text-xs text-white/80">{syncError}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSyncError(null);
                  const socket = socketService.getSocket();
                  const myId = localStorage.getItem('uno_player_id');
                  socket.emit('game:sync', { playerId: myId, gameId }, (res: any) => {
                    if (res?.success && res?.state) setGameState(res.state);
                    else setSyncError(res?.error || 'Game not found.');
                  });
                }}
                className="flex-1 bg-uno-yellow text-uno-navy font-bold py-2.5 rounded-xl text-xs hover:bg-amber-400 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/play')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-uno-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <h2 className="text-xl font-bold tracking-wide">Connecting to Game Table...</h2>
            <p className="text-xs text-white/60">Dealing cards and establishing server synchronization</p>
          </div>
        )}
      </div>
    );
  }

  const myId = localStorage.getItem('uno_player_id') || '';
  const activePlayers = (gameState?.players || []).filter(p => p && !p.isSpectator);

  // Compute relative seating order starting from local player
  const myIdx = activePlayers.findIndex(p => p.id === myId);
  const validMyIdx = myIdx >= 0 ? myIdx : 0;

  const relativeOpponents: typeof activePlayers = [];
  if (activePlayers.length > 1) {
    for (let i = 1; i < activePlayers.length; i++) {
      relativeOpponents.push(activePlayers[(validMyIdx + i) % activePlayers.length]);
    }
  }

  // Seating breakdown based on active player count:
  // 2 Players: You (Bottom), Opponent 1 (Top)
  // 3 Players: You (Bottom), Opponent 1 (Left), Opponent 2 (Right)
  // 4 Players: You (Bottom), Opponent 1 (Left), Opponent 2 (Top), Opponent 3 (Right)
  let topOpponent: typeof activePlayers[0] | null = null;
  let leftOpponent: typeof activePlayers[0] | null = null;
  let rightOpponent: typeof activePlayers[0] | null = null;

  if (activePlayers.length === 2) {
    topOpponent = relativeOpponents[0] || null;
  } else if (activePlayers.length === 3) {
    leftOpponent = relativeOpponents[0] || null;
    rightOpponent = relativeOpponents[1] || null;
  } else if (activePlayers.length >= 4) {
    leftOpponent = relativeOpponents[0] || null;
    topOpponent = relativeOpponents[1] || null;
    rightOpponent = relativeOpponents[2] || null;
  }

  const currentIdx = typeof gameState?.currentPlayerIndex === 'number' ? gameState.currentPlayerIndex : 0;
  const currentTurnPlayerId = activePlayers[currentIdx]?.id;
  const isMyTurn = currentTurnPlayerId === myId;
  const displayHand: Card[] = Array.isArray(gameState?.hand) ? gameState.hand : [];
  const topDiscard: Card = gameState?.topDiscardCard || { id: 'disc_1', color: 'GREEN', value: '2', score: 2 };

  // Discard pile glow color based on active game color
  const discardGlowClass =
    gameState.currentColor === 'RED' ? 'ring-4 ring-red-500 shadow-[0_0_25px_rgba(229,37,33,0.8)]' :
    gameState.currentColor === 'YELLOW' ? 'ring-4 ring-yellow-400 shadow-[0_0_25px_rgba(252,209,22,0.8)]' :
    gameState.currentColor === 'GREEN' ? 'ring-4 ring-emerald-500 shadow-[0_0_25px_rgba(45,150,63,0.8)]' :
    gameState.currentColor === 'BLUE' ? 'ring-4 ring-sky-500 shadow-[0_0_25px_rgba(0,130,202,0.8)]' :
    'ring-4 ring-emerald-500 shadow-[0_0_25px_rgba(45,150,63,0.8)]';

  return (
    <div className="w-full h-screen max-h-screen bg-[#081F3E] text-white flex flex-col justify-between overflow-hidden relative selection:bg-none font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER BAR (Matching Image 1)                             */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: UNO ONLINE Logo + Room Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="bg-[#E52521] border border-[#FCD116] px-2.5 py-0.5 rounded-lg shadow-md transform -rotate-3">
              <span className="font-extrabold text-lg italic tracking-tighter">
                <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
              </span>
            </div>
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">ONLINE</span>
          </div>

          <div className="bg-[#0e2c56]/80 px-3 py-1 rounded-xl border border-sky-500/20 flex items-center gap-2 text-xs font-bold shadow-sm">
            <span className="text-white/70">Room:</span>
            <span className="text-white font-mono tracking-wider">{gameState.roomCode}</span>
            <button onClick={handleCopyCode} className="hover:text-uno-yellow transition-colors ml-0.5">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
            </button>
          </div>
        </div>

        {/* Top Center: Top Opponent Status Pill (Rendered when top opponent exists) */}
        <div className="flex flex-col items-center z-20">
          {topOpponent ? (
            <div className={`bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl border transition-all flex items-center gap-3 shadow-lg ${
              currentTurnPlayerId === topOpponent.id
                ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                : 'border-white/20'
            }`}>
              <div className="w-7 h-7 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-xs font-bold border border-sky-300/40">
                {topOpponent.avatar || '👤'}
              </div>
              <div className="text-left leading-tight">
                <div className="font-bold text-xs text-white uppercase tracking-wider">{topOpponent.name}</div>
                <div className="text-[10px] text-white/70">{topOpponent.cardCount} cards</div>
              </div>
              <span className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] text-emerald-300 font-bold border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {topOpponent.isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          ) : (
            <div className="text-xs font-extrabold tracking-widest text-sky-300/60 uppercase">UNO ARENA</div>
          )}
        </div>

        {/* Top Right: Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            <span>Sound</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5 ${
              musicEnabled ? 'text-white' : 'text-white/50'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
              showChat ? 'bg-sky-500/30 border-sky-400 text-sky-200' : 'bg-white/10 border-white/15 text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>

      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN GAME TABLE OVAL SURFACE                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-between px-4 py-1 overflow-hidden">

        {/* Top Opponent Angled Hand Resting Above Table */}
        <div className="z-10 mt-2 min-h-[5rem] flex items-center justify-center">
          {topOpponent && (
            <div className="flex -space-x-8 transform scale-90">
              {Array.from({ length: Math.min(topOpponent.cardCount || 7, 10) }).map((_, idx, arr) => {
                const total = arr.length;
                const mid = (total - 1) / 2;
                const arcAngle = (idx - mid) * 4;
                return (
                  <div
                    key={idx}
                    className="transition-transform duration-200 hover:scale-110"
                    style={{ transform: `rotate(${arcAngle}deg) rotate(180deg)` }}
                  >
                    <UnoCard faceDown size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CENTRAL TABLE SURFACE & SIDE OPPONENTS                      */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex items-center justify-between px-2 sm:px-6 z-10 my-auto">
          
          {/* Left Opponent */}
          <div className="flex items-center gap-3 shrink-0 min-w-[120px]">
            {leftOpponent ? (
              <>
                {/* Left Player Angled Card Fan (Inward 90° rotation) */}
                <div className="relative flex flex-col items-center justify-center min-w-[70px]">
                  <div className="flex -space-x-8 transform rotate-90 scale-90 origin-center py-4">
                    {Array.from({ length: Math.min(leftOpponent.cardCount || 7, 8) }).map((_, idx, arr) => {
                      const total = arr.length;
                      const mid = (total - 1) / 2;
                      const arcAngle = (idx - mid) * 4;
                      return (
                        <div
                          key={idx}
                          className="transition-transform duration-200"
                          style={{ transform: `rotate(${arcAngle}deg)` }}
                        >
                          <UnoCard faceDown size="sm" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Left Status Badge */}
                <div className="flex flex-col items-start space-y-1">
                  <div className={`bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2 ${
                    currentTurnPlayerId === leftOpponent.id
                      ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                      : 'border-white/20'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
                      {leftOpponent.avatar || '👤'}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{leftOpponent.name}</div>
                      <div className="text-[9px] text-white/70">{leftOpponent.cardCount} cards</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {leftOpponent.isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-12 shrink-0 pointer-events-none" />
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* CENTER TABLE AREA (Clean floating cards, no big border)   */}
          {/* --------------------------------------------------------- */}
          <div className="relative px-6 py-4 flex flex-col items-center justify-center">
            
            {/* Piles Container: DRAW PILE on Left, DISCARD PILE on Right */}
            <div className="flex items-center gap-10 sm:gap-14 z-10">
              
              {/* DRAW PILE */}
              <div
                onClick={isMyTurn ? handleDrawCard : undefined}
                className={`flex flex-col items-center group ${isMyTurn ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className="relative transform transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute top-1 left-1 w-full h-full">
                    <UnoCard faceDown size="md" />
                  </div>
                  <UnoCard faceDown size="md" />
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase block">DRAW PILE</span>
                  <span className="text-sm font-black text-white">{gameState.drawPileCount || 73}</span>
                </div>
              </div>

              {/* DISCARD PILE with Color Glowing Aura Ring */}
              <div className="flex flex-col items-center">
                <div className={`rounded-2xl p-1 transition-all ${discardGlowClass}`}>
                  <UnoCard color={topDiscard.color} value={topDiscard.value} size="md" />
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold tracking-wider text-white/90 uppercase block">DISCARD PILE</span>
                  <span className="text-sm font-black text-white">{gameState.discardPileCount || 1}</span>
                </div>
              </div>

            </div>

            {/* YOUR TURN INDICATOR */}
            <div className="mt-6 z-10 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-emerald-400 animate-ping' : 'bg-white/40'}`} />
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-white uppercase">
                {isMyTurn ? 'YOUR TURN' : 'WAITING FOR TURN'}
              </span>
            </div>

          </div>

          {/* Right Opponent */}
          <div className="flex items-center gap-3 shrink-0 min-w-[120px] justify-end">
            {rightOpponent ? (
              <>
                {/* Right Status Badge */}
                <div className="flex flex-col items-end space-y-1">
                  <div className={`bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2 ${
                    currentTurnPlayerId === rightOpponent.id
                      ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                      : 'border-white/20'
                  }`}>
                    <div>
                      <div className="text-[11px] font-bold">{rightOpponent.name}</div>
                      <div className="text-[9px] text-white/70">{rightOpponent.cardCount} cards</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                      {rightOpponent.avatar || '👤'}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {rightOpponent.isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Right Player Angled Card Fan (Inward -90° rotation) */}
                <div className="relative flex flex-col items-center justify-center min-w-[70px]">
                  <div className="flex -space-x-8 transform -rotate-90 scale-90 origin-center py-4">
                    {Array.from({ length: Math.min(rightOpponent.cardCount || 7, 8) }).map((_, idx, arr) => {
                      const total = arr.length;
                      const mid = (total - 1) / 2;
                      const arcAngle = (idx - mid) * 4;
                      return (
                        <div
                          key={idx}
                          className="transition-transform duration-200"
                          style={{ transform: `rotate(${arcAngle}deg)` }}
                        >
                          <UnoCard faceDown size="sm" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-12 shrink-0 pointer-events-none" />
            )}
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* BOTTOM AREA: CHAT WIDGET, PLAYER HAND, & ACTION BUTTONS     */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex items-end justify-between px-2 sm:px-4 z-20 pb-2 shrink-0">
          
          {/* BOTTOM LEFT: Integrated Chat Box Widget */}
          <div className="w-64 sm:w-72 bg-[#092248]/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl flex flex-col space-y-2 shrink-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-xs text-white">Chat</span>
              <button className="text-white/60 hover:text-white text-xs font-mono">•••</button>
            </div>

            {/* Chat Messages Window */}
            <div className="h-20 overflow-y-auto space-y-1.5 text-[11px] pr-1">
              {chatMessages.length === 0 ? (
                <p className="text-white/40 italic text-center py-2 text-[10px]">Type a message below...</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-white/5 px-2 py-1 rounded-lg">
                    <span className="font-bold text-sky-300">{msg.senderName}: </span>
                    <span className="text-white/90">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Input: Type a message..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400"
              />
              <button type="submit" className="absolute right-2 top-2 text-white/70 hover:text-sky-300">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* BOTTOM CENTER: Fanned Player Hand & Player Status Pill */}
          <div className="flex flex-col items-center max-w-[55vw] sm:max-w-[65vw] z-30">
            
            {/* Player Hand with Green Highlight & Hover Zoom */}
            <div className="w-full flex items-center justify-center overflow-x-auto overflow-y-visible pt-10 pb-4 px-4 scrollbar-none">
              <div
                className="flex items-center justify-center transition-all duration-300 py-2 px-2"
                style={{
                  minWidth: 'max-content'
                }}
              >
                {displayHand.map((card, idx) => {
                  const isSelected = selectedCardId === card.id;
                  const total = displayHand.length;
                  const mid = (total - 1) / 2;
                  
                  // Smooth fan angle calculation
                  const angle = total > 1 ? (idx - mid) * Math.min(3.5, 30 / total) : 0;
                  
                  // Calculate dynamic negative spacing so cards overlap neatly
                  const overlapMargin = total <= 5 ? '-ml-2 sm:-ml-3' :
                                        total <= 10 ? '-ml-6 sm:-ml-8' :
                                        total <= 15 ? '-ml-10 sm:-ml-12' :
                                        '-ml-12 sm:-ml-14';

                  // Check if card is playable
                  const isPlayable = isMyTurn && (
                    card.color === 'WILD' ||
                    card.color === gameState.currentColor ||
                    card.value === topDiscard.value
                  );

                  return (
                    <div
                      key={card.id || idx}
                      className={`group relative transition-all duration-200 ease-out ${idx > 0 ? overlapMargin : ''} hover:z-50 hover:-translate-y-12 hover:scale-125 hover:rotate-0`}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        zIndex: isSelected ? 40 : idx + 1
                      }}
                    >
                      <UnoCard
                        color={card.color}
                        value={card.value}
                        size="md"
                        playable={isPlayable}
                        selected={isSelected}
                        onClick={() => handleCardClick(card)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player Pill below hand */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 flex items-center gap-2.5 text-xs font-bold z-10 -mt-1">
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">👤</div>
              <span>Player: You</span>
              <span className="text-white/60">{displayHand.length} Cards</span>
              <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </span>
            </div>

          </div>

          {/* BOTTOM RIGHT: 3D UNO! Capsule Button + DRAW CARD & END TURN Pills */}
          <div className="flex flex-col space-y-2 items-end shrink-0">
            
            {/* Glowing 3D Capsule UNO! Button (Matching Image 1) */}
            <button
              onClick={handleCallUno}
              className="relative bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 hover:from-sky-500 hover:to-blue-600 border-2 border-sky-300 text-white font-black px-8 py-2.5 rounded-full text-lg shadow-[0_0_25px_rgba(56,189,248,0.6)] flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 transition-all tracking-wider"
            >
              <span>UNO!</span>
              <span className="text-sky-200 text-xs">✨</span>
            </button>

            {/* Side-by-Side Pills: DRAW CARD & END TURN (Matching Image 1) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDrawCard}
                disabled={!isMyTurn || isActionPending}
                className="bg-[#0b2750] hover:bg-sky-900 border border-sky-400/40 text-sky-200 disabled:opacity-50 font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md active:scale-95"
              >
                DRAW CARD
              </button>

              <button
                onClick={handleDrawCard}
                disabled={!isMyTurn || isActionPending}
                className="bg-[#0b2750] hover:bg-sky-900 border border-sky-400/40 text-sky-200 disabled:opacity-50 font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md active:scale-95"
              >
                END TURN
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* WILD COLOR PICKER MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 border border-neutral-200 shadow-2xl">
            <h3 className="text-2xl font-black text-uno-navy tracking-tight">CHOOSE COLOR</h3>
            <p className="text-xs font-semibold text-neutral-500">
              Select the active color for the next turns:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectColor('RED')}
                className="h-20 rounded-2xl bg-[#E52521] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md"
              >
                RED
              </button>
              <button
                onClick={() => handleSelectColor('YELLOW')}
                className="h-20 rounded-2xl bg-[#FCD116] hover:scale-105 transition-transform text-uno-navy font-extrabold text-lg shadow-md"
              >
                YELLOW
              </button>
              <button
                onClick={() => handleSelectColor('GREEN')}
                className="h-20 rounded-2xl bg-[#2D963F] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md"
              >
                GREEN
              </button>
              <button
                onClick={() => handleSelectColor('BLUE')}
                className="h-20 rounded-2xl bg-[#0082CA] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md"
              >
                BLUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GAME OVER / VICTORY OVERLAY MODAL                             */}
      {/* ------------------------------------------------------------- */}
      {gameState.status === 'FINISHED' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white text-uno-navy rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl border border-neutral-200">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-500 flex items-center justify-center mx-auto shadow-lg transform rotate-3">
              <span className="text-4xl">🏆</span>
            </div>

            <div>
              <span className="text-xs font-black text-uno-blue uppercase tracking-widest">MATCH FINISHED</span>
              <h2 className="text-3xl font-black text-uno-navy tracking-tight mt-1">
                {gameState.winner?.id === myId ? 'YOU WIN!' : `${gameState.winner?.name || 'Player'} WINS!`}
              </h2>
              <p className="text-sm font-bold text-neutral-500 mt-2">
                Winner Score: {gameState.winner?.score || 0} pts
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleRematch}
                className="w-full bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Play className="w-5 h-5 fill-current" />
                PLAY AGAIN
              </button>

              <button
                onClick={() => navigate('/play')}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-uno-navy font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                RETURN TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
