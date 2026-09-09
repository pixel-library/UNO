import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Copy, Volume2, VolumeX, Settings, MessageSquare, Send, Check, Play, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';
import { CardColor, CardValue, PlayerPrivateState, Card, ChatMessage } from '@shared/types/game';
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
  const [showChat, setShowChat] = useState(false);
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

  // Sound Toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
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
      <div className="w-full h-screen bg-gradient-to-b from-[#0055A5] via-[#004282] to-[#002D5A] text-white flex flex-col items-center justify-center p-4 space-y-6">
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

  // Check if VS AI match
  const isVsAIMatch = gameId?.includes('ai') || activePlayers.some(p => p && p.id && p.id.startsWith('bot_'));

  const opponents = activePlayers.filter(p => p && p.id !== myId);
  const topOpponent = opponents[0] || activePlayers[0] || { id: 'bot_alex', name: 'Bot Alex', avatar: '🤖', cardCount: 7 };
  const leftOpponent = opponents[1] || opponents[0] || topOpponent;
  const rightOpponent = opponents[2] || opponents[0] || topOpponent;

  const currentIdx = typeof gameState?.currentPlayerIndex === 'number' ? gameState.currentPlayerIndex : 0;
  const isMyTurn = activePlayers[currentIdx]?.id === myId;
  const displayHand: Card[] = Array.isArray(gameState?.hand) ? gameState.hand : [];
  const topDiscard: Card = gameState?.topDiscardCard || { id: 'disc_1', color: 'RED', value: '7', score: 7 };

  return (
    <div className="w-full h-screen max-h-screen bg-gradient-to-b from-[#0055A5] via-[#004282] to-[#002D5A] text-white flex flex-col justify-between overflow-hidden relative selection:bg-none">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP BAR (Reference 3)                                         */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: UNO Logo + Room Badge */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate('/')}
            className="bg-[#E52521] border-2 border-[#FCD116] px-3 py-1 rounded-xl shadow-md cursor-pointer transform -rotate-3 hover:scale-105 transition-transform"
          >
            <span className="font-extrabold text-xl italic tracking-tighter">
              <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
            </span>
          </div>

          {!isVsAIMatch && (
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-xs font-bold">
              <span className="text-white/70">Room:</span>
              <span className="text-white font-mono tracking-wider">{gameState.roomCode}</span>
              <button onClick={handleCopyCode} className="hover:text-uno-yellow transition-colors">
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Center: Top Opponent Status Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs font-bold">
          <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black">
            {topOpponent?.avatar || 'P'}
          </div>
          <span>{topOpponent?.name || 'Player 2'}</span>
          <span className="text-white/60">{topOpponent?.cardCount || 7} cards</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
          </span>
        </div>

        {/* Right: Controls (Sound, Music, Settings, Chat) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-white/90"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-white/90"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Hide Chat button if VS AI match */}
          {!isVsAIMatch && (
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-2 text-xs font-bold text-white"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          )}
        </div>

      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN GAME TABLE SURFACE (Fits 100% Screen, No Scroll!)       */}
      {/* ------------------------------------------------------------- */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-between px-3 sm:px-6 py-1 sm:py-2 overflow-hidden">

        {/* ----------------------------------------------------------- */}
        {/* TOP OPPONENT                                                */}
        {/* ----------------------------------------------------------- */}
        <div className="flex flex-col items-center space-y-1 z-10 shrink-0">
          {/* Fanned Face Down Cards */}
          <div className="flex -space-x-7 sm:-space-x-9 transform scale-75 sm:scale-85">
            {Array.from({ length: Math.min(topOpponent?.cardCount || 7, 8) }).map((_, idx) => (
              <UnoCard key={idx} faceDown size="sm" />
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* MIDDLE SECTION: LEFT OPPONENT, CENTER TABLE, RIGHT OPPONENT */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex items-center justify-between px-2 sm:px-6 z-10 my-auto">
          
          {/* Left Opponent */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-xs font-bold text-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-0.5 text-[11px]">
                {leftOpponent?.avatar || 'P'}
              </div>
              <div className="text-[11px] leading-tight">{leftOpponent?.name || 'Player 3'}</div>
              <div className="text-[9px] text-white/60">{leftOpponent?.cardCount || 6} cards</div>
            </div>

            {/* Vertical Stack Cards */}
            <div className="flex flex-col -space-y-10 transform scale-70 sm:scale-80">
              {Array.from({ length: Math.min(leftOpponent?.cardCount || 6, 6) }).map((_, idx) => (
                <UnoCard key={idx} faceDown size="sm" />
              ))}
            </div>
          </div>

          {/* Center Table (Draw Pile, Discard Pile & Active Color Badge) */}
          <div className="flex items-center gap-4 sm:gap-8 relative px-6 py-4 rounded-[60px] bg-white/[0.03] border border-white/10 backdrop-blur-[2px] shadow-2xl">
            
            {/* TABLE GLOWING OVAL ACCENT (Matching Reference 3) */}
            <div className="absolute inset-0 rounded-[60px] bg-gradient-to-r from-sky-500/10 via-indigo-500/15 to-sky-500/10 border border-sky-400/20 blur-[0.5px] pointer-events-none -z-0" />

            {/* DRAW PILE */}
            <div
              onClick={isMyTurn ? handleDrawCard : undefined}
              className={`flex flex-col items-center group z-10 ${isMyTurn ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div className="relative transform transition-transform group-hover:scale-105 active:scale-95">
                <div className="absolute top-1.5 left-1.5 w-full h-full">
                  <UnoCard faceDown size="md" />
                </div>
                <div className="absolute top-0.5 left-0.5 w-full h-full">
                  <UnoCard faceDown size="md" />
                </div>
                <UnoCard faceDown size="md" />
              </div>
              
              <div className="mt-1.5 text-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/80 block">Draw Pile</span>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white">
                  {gameState.drawPileCount}
                </span>
              </div>
            </div>

            {/* DISCARD PILE */}
            <div className="flex flex-col items-center z-10">
              <div className="relative flex items-center justify-center p-1.5 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-sm shadow-xl">
                <UnoCard color={topDiscard.color} value={topDiscard.value} size="md" />
              </div>

              <div className="mt-1.5 text-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/80 block">Discard Pile</span>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white">
                  {gameState.discardPileCount}
                </span>
              </div>
            </div>

            {/* ACTIVE COLOR DIAMOND INDICATOR (Requirements 5, 6, 7, 8, 10, 23) */}
            <div className="flex flex-col items-center z-10">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl transform rotate-45 border-2 border-white/80 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                   style={{
                     backgroundColor:
                       gameState.currentColor === 'RED' ? '#E52521' :
                       gameState.currentColor === 'YELLOW' ? '#FCD116' :
                       gameState.currentColor === 'GREEN' ? '#2D963F' :
                       gameState.currentColor === 'BLUE' ? '#0082CA' : '#E52521'
                   }}>
                <span className={`transform -rotate-45 font-black text-[9px] sm:text-[11px] tracking-tight ${
                  gameState.currentColor === 'YELLOW' ? 'text-uno-navy' : 'text-white'
                }`}>
                  {gameState.currentColor}
                </span>
              </div>

              <div className="mt-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-extrabold text-white/90 uppercase tracking-widest block">Color</span>
              </div>
            </div>

          </div>

          {/* Right Opponent */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-xs font-bold text-center">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-0.5 text-[11px]">
                {rightOpponent?.avatar || 'P'}
              </div>
              <div className="text-[11px] leading-tight">{rightOpponent?.name || 'Player 4'}</div>
              <div className="text-[9px] text-white/60">{rightOpponent?.cardCount || 6} cards</div>
            </div>

            {/* Vertical Stack Cards */}
            <div className="flex flex-col -space-y-10 transform scale-70 sm:scale-80">
              {Array.from({ length: Math.min(rightOpponent?.cardCount || 6, 6) }).map((_, idx) => (
                <UnoCard key={idx} faceDown size="sm" />
              ))}
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* TURN INDICATOR STATUS BAR (Reference 3 with lines)          */}
        {/* ----------------------------------------------------------- */}
        <div className="z-10 my-0.5 shrink-0 flex items-center justify-center gap-3 w-full max-w-xs">
          <div className="h-[2px] flex-1 bg-white/20 rounded-full" />
          {isMyTurn ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-0.5 rounded-full flex items-center gap-2 font-extrabold text-xs shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Your Turn</span>
            </div>
          ) : (
            <div className="bg-white/10 border border-white/15 text-white/70 px-4 py-0.5 rounded-full font-bold text-xs">
              Waiting for player turn...
            </div>
          )}
          <div className="h-[2px] flex-1 bg-white/20 rounded-full" />
        </div>

        {/* ----------------------------------------------------------- */}
        {/* BOTTOM AREA: YOU, YOUR HAND, & RIGHT CONTROLS               */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex items-end justify-between px-2 sm:px-4 z-20 pb-1 shrink-0">
          
          {/* Bottom Left: YOU Info Pill */}
          <div className="flex flex-col space-y-1.5 w-40 sm:w-56 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-uno-blue text-white flex items-center justify-center font-bold text-xs">
                Y
              </div>
              <div>
                <div className="font-bold text-xs text-white">You</div>
                <div className="text-[10px] text-white/60">{displayHand.length} cards • Online</div>
              </div>
            </div>

            {/* Hide Chat Input Bar if VS AI match */}
            {!isVsAIMatch && (
              <form onSubmit={handleSendChat} className="relative hidden sm:block">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-uno-yellow"
                />
                <button type="submit" className="absolute right-2 top-1.5 text-white/70 hover:text-uno-yellow">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Bottom Center: Your Cards Hand (Dynamic Fan layout & auto-scaling) */}
          <div className="flex items-center justify-center max-w-[55vw] sm:max-w-[65vw] px-1 overflow-visible">
            <div
              className={`flex items-center justify-center ${
                displayHand.length > 12 ? '-space-x-7 sm:-space-x-9' :
                displayHand.length > 8 ? '-space-x-5 sm:-space-x-7' :
                '-space-x-4 sm:-space-x-6'
              } pb-1 transition-all duration-300`}
            >
              {displayHand.map((card, idx) => {
                const isSelected = selectedCardId === card.id;
                const total = displayHand.length;
                const mid = (total - 1) / 2;
                const angle = total > 1 ? (idx - mid) * Math.min(3.5, 25 / total) : 0;

                return (
                  <div
                    key={card.id || idx}
                    className="transition-transform duration-200 hover:z-40 hover:-translate-y-6 sm:hover:-translate-y-8"
                    style={{
                      transform: `rotate(${angle}deg)`
                    }}
                  >
                    <UnoCard
                      color={card.color}
                      value={card.value}
                      size={displayHand.length > 10 ? 'sm' : 'md'}
                      playable={isMyTurn}
                      selected={isSelected}
                      onClick={() => handleCardClick(card)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Right: UNO! Capsule Button & Turn Buttons */}
          <div className="flex flex-col space-y-1.5 items-end shrink-0">
            
            {/* Capsule 3D UNO Button matching Reference 3 */}
            <button
              onClick={handleCallUno}
              className="relative bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 border-2 border-white/40 text-white font-black px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-sm sm:text-base shadow-2xl flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-current text-uno-yellow" />
              <span>UNO!</span>
              <span className="w-4 h-4 rounded-full bg-white text-uno-blue text-[10px] flex items-center justify-center font-bold ml-0.5">
                1
              </span>
            </button>

            {/* Turn Buttons: Draw Card / End Turn */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDrawCard}
                disabled={!isMyTurn || isActionPending}
                className="bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] sm:text-xs flex items-center gap-1 border border-white/20 transition-all"
              >
                <Zap className="w-3 h-3" />
                Draw Card
              </button>

              <button
                onClick={handleDrawCard}
                disabled={!isMyTurn || isActionPending}
                className="bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] sm:text-xs flex items-center gap-1 border border-white/20 transition-all"
              >
                <ArrowRight className="w-3 h-3" />
                End Turn
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* WILD COLOR PICKER MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-card-pop">
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
      {/* CHAT PANEL OVERLAY (Only for Online Multiplayer)             */}
      {/* ------------------------------------------------------------- */}
      {!isVsAIMatch && showChat && (
        <div className="fixed right-4 bottom-20 w-80 bg-uno-navy/95 border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-lg z-40 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-xs text-white">Room Chat</span>
            <button onClick={() => setShowChat(false)} className="text-xs text-white/50 hover:text-white">Close</button>
          </div>

          <div className="h-48 overflow-y-auto space-y-2 text-xs pr-1">
            {chatMessages.length === 0 ? (
              <p className="text-white/40 italic text-center py-4">No messages yet. Say hi!</p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="bg-white/10 p-2 rounded-lg">
                  <span className="font-bold text-uno-yellow">{msg.senderName}: </span>
                  <span className="text-white/90">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none"
            />
            <button type="submit" className="bg-uno-yellow text-uno-navy font-bold px-3 py-1.5 rounded-lg text-xs">
              Send
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GAME OVER / VICTORY OVERLAY MODAL                             */}
      {/* ------------------------------------------------------------- */}
      {gameState.status === 'FINISHED' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-card-pop">
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
