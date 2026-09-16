import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Copy, Volume2, VolumeX, Settings, MessageSquare, Send, Check, Play, Zap, ArrowRight, Music, X, Smile, Trophy, Sparkles, RefreshCw } from 'lucide-react';
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
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [pendingWildCardId, setPendingWildCardId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Animated Emoji Reaction State
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [floatingEmotes, setFloatingEmotes] = useState<{ id: string; senderId: string; emote: string }[]>([]);

  // Responsive screen detection for mobile card sizing
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          if (res.state.chatMessages) {
            setChatMessages(res.state.chatMessages);
          }
          setSyncError(null);
        } else {
          if (!gameState) {
            setSyncError(res?.error || 'Could not synchronize with game room.');
          }
        }
      });
    };

    socket.on('game:state', (newState: PlayerPrivateState & { targetPlayerId?: string }) => {
      const currentLocalId = localStorage.getItem('uno_player_id');
      if (newState.targetPlayerId && currentLocalId && newState.targetPlayerId !== currentLocalId) {
        return;
      }
      
      // Trigger victory celebration confetti when game status transitions to FINISHED
      if (newState.status === 'FINISHED') {
        audioService.playWinSound();
        audioService.triggerVictoryConfetti();
      }

      setGameState(newState);
      if (newState.targetPlayerId) {
        localStorage.setItem('uno_player_id', newState.targetPlayerId);
      }
      if (newState.chatMessages && newState.chatMessages.length > 0) {
        setChatMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          prev.forEach(m => map.set(m.id, m));
          newState.chatMessages!.forEach(m => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
      if (newState.activeEmote && newState.activeEmote.timestamp) {
        const emoteId = `${newState.activeEmote.senderId}_${newState.activeEmote.timestamp}_${newState.activeEmote.emote}`;
        setFloatingEmotes((prev) => {
          if (prev.some(e => e.id === emoteId)) return prev;
          return [...prev, { id: emoteId, senderId: newState.activeEmote!.senderId, emote: newState.activeEmote!.emote }];
        });
        audioService.playEmoteSound();
        setTimeout(() => {
          setFloatingEmotes((prev) => prev.filter(e => e.id !== emoteId));
        }, 2200);
      }
      setIsActionPending(false);
      setSyncError(null);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setChatMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
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

  // Zero-Latency Optimistic Card Play Handler (<50ms)
  const handleCardClick = (card: Card) => {
    if (!gameState || isActionPending) return;

    const activePlayers = gameState.players.filter(p => !p.isSpectator);
    const safeIdx = (typeof gameState.currentPlayerIndex === 'number' ? gameState.currentPlayerIndex : 0) % (activePlayers.length || 1);
    const currentPlayer = activePlayers[safeIdx];

    if (currentPlayer?.id !== myId) return;

    setSelectedCardId(card.id);
    audioService.playCardSound();

    if (card.color === 'WILD') {
      if (card.value === 'WILD_SWAP') {
        setIsActionPending(true);
        const socket = socketService.getSocket();
        socket.emit('game:playCard', { 
          cardId: card.id, 
          playerId: myId, 
          roomCode: gameState.roomCode,
          cardColor: card.color,
          cardValue: card.value
        }, (res: any) => {
          setIsActionPending(false);
          if (res?.success) {
            setSelectedCardId(null);
          } else {
            alert(res?.error || 'Cannot play this card.');
          }
        });
        return;
      }

      setPendingWildCardId(card.id);
      setShowColorPicker(true);
      return;
    }

    // Zero-Latency Optimistic UI update on local state
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hand: prev.hand.filter(c => c.id !== card.id),
        topDiscardCard: card,
        currentColor: card.color
      };
    });

    setIsActionPending(true);
    const socket = socketService.getSocket();
    socket.emit('game:playCard', { 
      cardId: card.id, 
      playerId: myId, 
      roomCode: gameState.roomCode,
      cardColor: card.color,
      cardValue: card.value
    }, (res: any) => {
      setIsActionPending(false);
      if (res?.success) {
        setSelectedCardId(null);
      } else {
        alert(res?.error || 'Cannot play this card.');
      }
    });
  };

  // Color Pick Handler
  const handleSelectColor = (color: CardColor) => {
    if (!pendingWildCardId || isActionPending) return;

    setIsActionPending(true);
    audioService.playCardSound();

    // Optimistic color update
    setGameState((prev) => prev ? ({ ...prev, currentColor: color }) : prev);

    const socket = socketService.getSocket();
    socket.emit('game:playCard', { 
      cardId: pendingWildCardId, 
      chosenColor: color, 
      playerId: myId, 
      roomCode: gameState?.roomCode 
    }, (res: any) => {
      setIsActionPending(false);
      if (res?.success) {
        setShowColorPicker(false);
        setPendingWildCardId(null);
        setSelectedCardId(null);
      } else {
        alert(res?.error || 'Could not set wild card color.');
      }
    });
  };

  // Zero-Latency Optimistic Draw Card Handler
  const handleDrawCard = () => {
    if (!isMyTurn || isActionPending) return;
    setIsActionPending(true);
    audioService.playDrawSound();

    const socket = socketService.getSocket();
    socket.emit('game:drawCard', { roomCode: gameState?.roomCode, playerId: myId }, (res: any) => {
      setIsActionPending(false);
      if (!res?.success && res?.error) {
        alert(res.error);
      }
    });
  };

  // Pass / End Turn Handler
  const handlePassTurn = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    audioService.playButtonClick();

    const socket = socketService.getSocket();
    socket.emit('game:passTurn', { roomCode: gameState?.roomCode, playerId: myId }, (res: any) => {
      setIsActionPending(false);
    });
  };

  // Call UNO Handler
  const handleCallUno = () => {
    audioService.playUnoSound();
    const socket = socketService.getSocket();
    socket.emit('game:callUno');
  };

  // Challenge UNO Handler
  const handleChallengeUno = () => {
    audioService.playExplosionSound();
    const socket = socketService.getSocket();
    socket.emit('game:challengeUno', { roomCode: gameState?.roomCode, playerId: myId });
  };

  // Send Animated Emoji Reaction Handler
  const handleSendEmote = (emote: string) => {
    audioService.playEmoteSound();
    const socket = socketService.getSocket();
    socket.emit('game:sendEmote', { emote });
    setShowEmotePicker(false);
  };

  // Zero-Latency Optimistic Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const myId = localStorage.getItem('uno_player_id') || '';
    const myName = localStorage.getItem('uno_player_name') || 'Player';
    const textToSend = chatInput.trim();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const localMsg: ChatMessage = {
      id: msgId,
      senderId: myId,
      senderName: myName,
      text: textToSend,
      timestamp: Date.now()
    };

    setChatMessages((prev) => {
      if (prev.some(m => m.id === localMsg.id)) return prev;
      return [...prev, localMsg];
    });

    const socket = socketService.getSocket();
    socket.emit('chat:message', {
      id: msgId,
      text: textToSend,
      roomCode: gameState?.roomCode,
      playerId: myId
    });

    setChatInput('');
  };

  // Rematch Handler
  const handleRematch = () => {
    audioService.playButtonClick();
    const socket = socketService.getSocket();
    socket.emit('game:rematch');
  };

  // Hand Swap Target Selection Handler (7-Zero / Wild Swap)
  const handleSwapHands = (targetPlayerId: string, customColor?: CardColor) => {
    if (isActionPending) return;
    setIsActionPending(true);
    audioService.playButtonClick();

    const socket = socketService.getSocket();
    const colorToSet = customColor || gameState?.currentColor || 'RED';
    socket.emit('game:swapHand', { 
      targetSwapPlayerId: targetPlayerId, 
      targetPlayerId,
      chosenColor: colorToSet,
      playerId: myId,
      roomCode: gameState?.roomCode 
    }, (res: any) => {
      setIsActionPending(false);
      if (!res?.success && res?.error) {
        alert(res.error);
      }
    });
  };

  // Loading / Retry Screen if game state not ready
  if (!gameState) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-800 flex flex-col items-center justify-center p-4 space-y-6 font-sans">
        <div className="bg-[#E52521] border-2 border-[#FCD116] px-6 py-2 rounded-2xl shadow-2xl transform -rotate-3">
          <span className="font-black text-4xl italic tracking-tighter">
            <span className="text-[#FCD116]">U</span>
            <span className="text-white">N</span>
            <span className="text-[#FCD116]">O</span>
          </span>
        </div>

        {syncError ? (
          <div className="glass-white-panel p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-200">
            <h2 className="text-lg font-extrabold text-red-600">Unable to Start Match</h2>
            <p className="text-xs text-slate-600 font-medium">{syncError}</p>
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
                className="flex-1 bg-gradient-to-r from-[#FCD116] to-[#F5A623] text-slate-950 font-black py-3 rounded-xl text-xs shadow-md hover:scale-105 transition-transform"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/play')}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <h2 className="text-xl font-black tracking-tight text-slate-900">Connecting to Game Table...</h2>
            <p className="text-xs font-semibold text-slate-500">Dealing cards and establishing server synchronization</p>
          </div>
        )}
      </div>
    );
  }

  const storedPlayerId = localStorage.getItem('uno_player_id') || '';
  const myId = gameState?.targetPlayerId || (gameState?.players.find(p => p.id === storedPlayerId)?.id) || storedPlayerId || (gameState?.players[0]?.id || '');
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

  // Play Turn Chime when turn changes to local player
  const [lastTurnPlayerId, setLastTurnPlayerId] = useState<string | null>(null);
  useEffect(() => {
    if (currentTurnPlayerId && currentTurnPlayerId !== lastTurnPlayerId) {
      setLastTurnPlayerId(currentTurnPlayerId);
      if (currentTurnPlayerId === myId) {
        audioService.playTurnChime();
      }
    }
  }, [currentTurnPlayerId, myId, lastTurnPlayerId]);

  const displayHand: Card[] = (Array.isArray(gameState?.hand) ? gameState.hand : [])
    .filter(c => c && c.id && c.color && c.value);
  const topDiscard: Card = gameState?.topDiscardCard || { id: 'disc_1', color: 'GREEN', value: '2', score: 2 };

  const arenaColorGlowClass =
    gameState.currentColor === 'RED' ? 'arena-glow-red' :
    gameState.currentColor === 'YELLOW' ? 'arena-glow-yellow' :
    gameState.currentColor === 'GREEN' ? 'arena-glow-green' :
    gameState.currentColor === 'BLUE' ? 'arena-glow-blue' :
    'arena-glow-wild';

  const isClockwise = gameState.direction === 1 || gameState.direction === undefined;

  const checkCardPlayable = (card: Card): boolean => {
    if (!isMyTurn || !card) return false;
    const cardColor = String(card.color || '').trim().toUpperCase();
    const cardVal = String(card.value || '').trim().toUpperCase();

    if ((gameState?.activeStackCount || 0) > 0 && gameState?.settings?.houseRules?.stacking) {
      const isCounterCard = cardVal === 'DRAW_TWO' || cardVal === 'WILD_DRAW_FOUR' ||
        (gameState?.settings?.houseRules?.counterDeflect && (cardVal === 'SKIP' || cardVal === 'REVERSE' || cardVal === 'SKIP_WILD'));
      if (isCounterCard) return true;
    }

    if (cardColor === 'WILD') return true;
    if (cardColor === String(gameState?.currentColor || '').trim().toUpperCase()) return true;
    if (topDiscard && cardVal === String(topDiscard.value || '').trim().toUpperCase()) return true;

    return false;
  };

  return (
    <div className={`w-full h-screen max-h-screen bg-gradient-to-br from-[#0B4A8B] via-[#052D56] to-[#021832] text-white flex flex-col justify-between overflow-hidden relative selection:bg-none font-sans ${isMyTurn ? 'animate-turn-pulse' : ''}`}>
      
      {/* Dynamic Active Color Ambient Aura Glow Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-700 z-0 ${arenaColorGlowClass}`} />
      
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER BAR (BLUE GLASS ARENA HEADER)                       */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-2 sm:px-6 py-2 flex items-center justify-between z-30 shrink-0 gap-2 bg-[#062447]/80 backdrop-blur-xl border-b border-sky-400/20 shadow-md">
        
        {/* Left: UNO ONLINE Logo + Room Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="bg-[#E52521] border-2 border-[#FCD116] px-2.5 py-0.5 rounded-xl shadow-sm transform -rotate-3">
              <span className="font-extrabold text-sm sm:text-base italic tracking-tighter text-white">
                <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-white/90 uppercase tracking-wider hidden sm:inline">ONLINE</span>
          </div>

          <div className="bg-sky-950/70 px-2.5 py-1 rounded-xl border border-sky-400/30 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-white shadow-inner">
            <span className="text-white/60 hidden sm:inline uppercase">Room:</span>
            <span className="text-white font-mono tracking-wider font-extrabold">{gameState.roomCode}</span>
            <button onClick={handleCopyCode} className="hover:text-uno-yellow transition-colors ml-0.5 cursor-pointer" title="Copy Room Code">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
            </button>
          </div>
        </div>

        {/* Top Center: Top Opponent Status Pill (Desktop only to prevent mobile crowding) */}
        <div className="hidden sm:flex flex-col items-center z-20 shrink relative">
          {topOpponent ? (
            <div className={`bg-white/10 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-2xl border transition-all flex items-center gap-2 sm:gap-3 shadow-md ${
              currentTurnPlayerId === topOpponent.id
                ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                : 'border-white/20'
            }`}>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold border border-sky-300/40">
                {topOpponent.avatar || '👤'}
              </div>
              <div className="text-left leading-tight">
                <div className="font-extrabold text-[10px] sm:text-xs text-white uppercase tracking-wider truncate max-w-[70px] sm:max-w-none">{topOpponent.name}</div>
                <div className="text-[9px] font-semibold text-white/70">{topOpponent.cardCount} cards</div>
              </div>
              <span className="hidden sm:flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] text-emerald-300 font-bold border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {topOpponent.isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-sky-200/60 uppercase">UNO ARENA</div>
          )}

          {/* Floating Emotes Overlay for Top Opponent */}
          {topOpponent && floatingEmotes.filter(e => e.senderId === topOpponent!.id).map((e) => (
            <div key={e.id} className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-float-emote text-4xl sm:text-5xl select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {e.emote}
            </div>
          ))}
        </div>

        {/* Top Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={toggleSound}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            <span className="hidden sm:inline">Sound</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              musicEnabled ? 'text-white' : 'text-white/50'
            }`}
            title="Toggle Music"
          >
            <Music className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Music</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setShowMobileChat(!showMobileChat);
              } else {
                setShowChat(!showChat);
              }
            }}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              (showChat || showMobileChat) ? 'bg-sky-500/30 border-sky-400 text-sky-200 font-extrabold shadow-sm' : 'bg-white/10 border-white/15 text-white'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>

      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN GAME TABLE OVAL SURFACE (LIGHT LUXURY DESIGN)           */}
      {/* ------------------------------------------------------------- */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-between px-1 sm:px-4 py-1 overflow-hidden">

        {/* ----------------------------------------------------------- */}
        {/* MOBILE ALL OPPONENTS TOP BAR (< 640px)                       */}
        {/* ----------------------------------------------------------- */}
        <div className="flex sm:hidden w-full items-center justify-center gap-2 px-1 pt-1 pb-1 z-20 flex-wrap">
          {relativeOpponents.map((opp) => {
            const isOppTurn = currentTurnPlayerId === opp.id;
            const isOneCardLeft = opp.cardCount === 1;

            return (
              <div key={opp.id} className="relative">
                <div className={`bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
                  isOneCardLeft
                    ? 'border-red-500 ring-2 ring-red-500/80 bg-red-500/30 animate-pulse'
                    : isOppTurn
                    ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20'
                    : 'border-white/20'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-[10px] font-bold border border-sky-300/40">
                    {opp.avatar || '👤'}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="font-extrabold text-[10px] text-white uppercase tracking-wider truncate max-w-[70px] flex items-center gap-1">
                      <span>{opp.name}</span>
                      {isOneCardLeft && <span className="text-red-400 font-black text-[9px] animate-bounce">🚨 1!</span>}
                    </div>
                    <div className="text-[9px] font-semibold text-white/70 flex items-center gap-1">
                      <span>🂠 {opp.cardCount}</span>
                    </div>
                  </div>
                </div>

                {/* Floating Emotes Overlay for Opponent on Mobile */}
                {floatingEmotes.filter(e => e.senderId === opp.id).map((e) => (
                  <div key={e.id} className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-float-emote text-3xl select-none filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                    {e.emote}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* DESKTOP TOP OPPONENT HAND (>= 640px)                        */}
        {/* ----------------------------------------------------------- */}
        <div className="hidden sm:flex z-10 mt-1 min-h-[5rem] items-center justify-center">
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
        {/* CENTRAL LUXURY TABLE SURFACE & SIDE OPPONENTS               */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex items-center justify-between px-1 sm:px-6 z-10 my-auto">
          
          {/* Left Opponent (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-3 shrink-0 min-w-[90px] lg:min-w-[120px]">
            {leftOpponent && (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 shrink-0">
                <div className="relative flex flex-col items-center justify-center min-w-[60px]">
                  <div className="flex -space-x-8 transform rotate-90 scale-75 lg:scale-90 origin-center py-2 sm:py-4">
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
                <div className="flex flex-col items-start space-y-0.5 relative">
                  <div className={`bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 shadow-md ${
                    currentTurnPlayerId === leftOpponent.id
                      ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                      : 'border-white/20'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-xs font-bold border border-sky-300/40">
                      {leftOpponent.avatar || '👤'}
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-extrabold text-white">{leftOpponent.name}</div>
                      <div className="text-[9px] font-semibold text-white/70">{leftOpponent.cardCount} cards</div>
                    </div>
                  </div>

                  {/* Floating Emotes Overlay for Left Opponent */}
                  {floatingEmotes.filter(e => e.senderId === leftOpponent!.id).map((e) => (
                    <div key={e.id} className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-float-emote text-4xl select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                      {e.emote}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* CENTER CARDS AREA (BOXLESS & BORDERLESS DIRECT ARENA)       */}
          {/* --------------------------------------------------------- */}
          <div className="relative py-2 sm:py-6 px-2 flex flex-col items-center justify-center text-white mx-auto">
            
            {/* ROTATING GAME DIRECTION INDICATOR RING */}
            <div className={`absolute w-[260px] h-[160px] sm:w-[340px] sm:h-[220px] rounded-full border border-dashed border-sky-300/30 pointer-events-none ${
              isClockwise ? 'rotate-clockwise' : 'rotate-counter-clockwise'
            }`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2.5 bg-sky-950/80 text-sky-300 px-2.5 py-0.5 rounded-full text-[9px] font-black border border-sky-400/40 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <span>{isClockwise ? '↻ CLOCKWISE' : '↺ COUNTER-CLOCKWISE'}</span>
              </div>
            </div>

            {/* ACTIVE STACK PENALTY BANNER */}
            {(gameState.activeStackCount || 0) > 0 && (
              <div className="mb-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border-2 border-yellow-300 px-4 py-1.5 rounded-full text-white font-black text-[11px] sm:text-xs shadow-lg animate-pulse flex items-center gap-2 z-20">
                <span className="text-sm">⚡</span>
                <span>+{gameState.activeStackCount} PENALTY STACK ACTIVE!</span>
              </div>
            )}

            {/* Piles Container: DRAW PILE on Left, DISCARD PILE on Right */}
            <div className="flex items-center gap-6 sm:gap-12 lg:gap-16 z-10">
              
              {/* DRAW PILE */}
              <div
                onClick={isMyTurn ? handleDrawCard : undefined}
                className={`flex flex-col items-center group ${isMyTurn ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <div className="relative transform transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute top-1 left-1 w-full h-full">
                    <UnoCard faceDown size={isMobile ? 'sm' : 'md'} />
                  </div>
                  <UnoCard faceDown size={isMobile ? 'sm' : 'md'} />
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[9px] sm:text-xs font-black tracking-wider text-sky-200/90 uppercase block">DRAW</span>
                  <span className="text-xs sm:text-sm font-black text-white">{gameState.drawPileCount || 73}</span>
                </div>
              </div>

              {/* DISCARD PILE */}
              <div className="flex flex-col items-center">
                <div className="p-0.5">
                  <UnoCard color={topDiscard.color} value={topDiscard.value} size={isMobile ? 'sm' : 'md'} />
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[9px] sm:text-xs font-black tracking-wider text-sky-200/90 uppercase block">DISCARD</span>
                  <span className="text-xs sm:text-sm font-black text-white">{gameState.discardPileCount || 1}</span>
                </div>
              </div>

            </div>

            {/* YOUR TURN INDICATOR */}
            <div className="mt-3 sm:mt-6 z-10 flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-emerald-400 animate-ping' : 'bg-white/40'}`} />
              <span className="font-extrabold text-[10px] sm:text-xs tracking-widest text-white uppercase">
                {isMyTurn ? 'YOUR TURN' : 'WAITING FOR OPPONENT'}
              </span>
            </div>

          </div>

          {/* Right Opponent (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-3 shrink-0 min-w-[90px] lg:min-w-[120px] justify-end">
            {rightOpponent && (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 shrink-0">
                {/* Right Status Badge */}
                <div className="flex flex-col items-end space-y-0.5 relative">
                  <div className={`bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 shadow-md ${
                    currentTurnPlayerId === rightOpponent.id
                      ? 'border-emerald-400 ring-2 ring-emerald-400/60 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                      : 'border-white/20'
                  }`}>
                    <div className="text-right">
                      <div className="text-[11px] font-extrabold text-white">{rightOpponent.name}</div>
                      <div className="text-[9px] font-semibold text-white/70">{rightOpponent.cardCount} cards</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-xs font-bold border border-sky-300/40">
                      {rightOpponent.avatar || '👤'}
                    </div>
                  </div>

                  {/* Floating Emotes Overlay for Right Opponent */}
                  {floatingEmotes.filter(e => e.senderId === rightOpponent!.id).map((e) => (
                    <div key={e.id} className="absolute -top-12 right-1/2 translate-x-1/2 pointer-events-none z-50 animate-float-emote text-4xl select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                      {e.emote}
                    </div>
                  ))}
                </div>

                <div className="relative flex flex-col items-center justify-center min-w-[60px]">
                  <div className="flex -space-x-8 transform -rotate-90 scale-75 lg:scale-90 origin-center py-2 sm:py-4">
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
              </div>
            )}
          </div>

        </div>

        {/* ----------------------------------------------------------- */}
        {/* BOTTOM AREA: ACTION TOOLBAR, PLAYER HAND & WHITE GLASS CHAT */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full flex flex-col items-center z-20 pb-2 shrink-0 relative px-1 sm:px-4">
          
          {/* PROMINENT CENTERED ACTION TOOLBAR */}
          <div className="flex items-center gap-2 sm:gap-3 z-30 mb-1 flex-wrap justify-center">
            <button
              onClick={handleDrawCard}
              disabled={!isMyTurn || isActionPending}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span> DRAW CARD
            </button>

            {!gameState?.settings?.houseRules?.forcePlay && (
              <button
                onClick={handlePassTurn}
                disabled={!isMyTurn || isActionPending}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 disabled:opacity-40 font-extrabold px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer border border-slate-300/80"
              >
                <span>➔</span> END TURN
              </button>
            )}

            {/* EMOJI REACTION PICKER BUTTON & POPOVER */}
            <div className="relative">
              <button
                onClick={() => setShowEmotePicker(!showEmotePicker)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Send Animated Emoji Reaction"
              >
                <Smile className="w-4 h-4 text-amber-300" />
                <span>REACTION</span>
              </button>

              {showEmotePicker && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 glass-white-panel rounded-2xl p-3 shadow-none z-50 w-64 sm:w-72 animate-pop-scale border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-amber-500" /> Express Yourself
                    </span>
                    <button
                      onClick={() => setShowEmotePicker(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-2xl text-center">
                    {['🔥', '😂', '😎', '😡', '😭', '😱', '👍', '🎉', '💀', '💩', '❤️', '⚡', '💣', '🥳', '🤡', '👑'].map((emote) => (
                      <button
                        key={emote}
                        onClick={() => handleSendEmote(emote)}
                        className="p-2 rounded-xl hover:bg-slate-100 hover:scale-125 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        {emote}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CALL UNO button */}
            {displayHand.length <= 2 && (
              <button
                onClick={handleCallUno}
                className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 border-2 border-yellow-300 text-white font-black px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer animate-pulse"
              >
                <span>🔥</span> CALL UNO!
              </button>
            )}

            {/* CATCH UNO button */}
            {activePlayers.some(p => p.id !== myId && p.cardCount === 1 && !p.hasCalledUno) && (
              <button
                onClick={handleChallengeUno}
                className="bg-red-700 hover:bg-red-600 border-2 border-yellow-300 text-white font-extrabold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm shadow-lg transition-all active:scale-95 animate-bounce flex items-center gap-1 cursor-pointer"
                title="Challenge an opponent holding 1 card who forgot to call UNO!"
              >
                <span>🚨</span> CATCH UNO!
              </button>
            )}
          </div>

          <div className="w-full flex items-end justify-between gap-2">
            {/* BOTTOM LEFT: WHITE GLASSMORPHIC CHAT BOX WIDGET (DESKTOP) */}
            <div className="hidden lg:flex w-64 lg:w-72 glass-white-panel rounded-2xl p-3 shadow-none flex-col space-y-2 shrink-0 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" /> Room Chat
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
              </div>

              {/* Chat Messages Window */}
              <div className="h-24 overflow-y-auto space-y-1.5 text-[11px] pr-1 scrollbar-none">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4 text-[10px]">Type a message below...</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-white/90 px-2.5 py-1 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="font-extrabold text-sky-600">{msg.senderName}: </span>
                      <span className="text-slate-700 font-medium">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              {/* White Translucent Chat Input */}
              <form onSubmit={handleSendChat} className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full glass-white-input rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button type="submit" className="absolute right-2.5 top-2 text-sky-600 hover:text-sky-700">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* BOTTOM CENTER: FANNED PLAYER HAND & STATUS PILL */}
            <div className="flex flex-col items-center w-full lg:max-w-[70vw] z-30 flex-1 px-1">

              {/* Player Hand Container */}
              <div className="w-full flex items-center justify-center overflow-x-auto overflow-y-visible pt-2 sm:pt-6 pb-1 px-1 scrollbar-none touch-pan-x">
                {isMobile && displayHand.length > 7 ? (
                  /* Mobile Multi-Row Layout for > 7 Cards */
                  <div className="w-full flex flex-col items-center justify-center gap-1.5 py-1 px-0.5">
                    {[
                      displayHand.slice(0, Math.ceil(displayHand.length / 2)),
                      displayHand.slice(Math.ceil(displayHand.length / 2))
                    ].map((rowCards, rowIndex) => (
                      <div key={rowIndex} className="flex items-center justify-center">
                        {rowCards.map((card, idx) => {
                          const isSelected = selectedCardId === card.id;
                          const totalInRow = rowCards.length;
                          const overlapMargin = totalInRow <= 4 ? '-ml-1' : totalInRow <= 6 ? '-ml-2.5' : '-ml-4';
                          const isPlayable = checkCardPlayable(card);

                          return (
                            <div
                              key={card.id || `${rowIndex}_${idx}`}
                              className={`group relative transition-all duration-200 ease-out ${idx > 0 ? overlapMargin : ''} hover:z-50 active:scale-105`}
                              style={{ zIndex: isSelected ? 40 : idx + 1 }}
                            >
                              <UnoCard
                                color={card.color}
                                value={card.value}
                                size="sm"
                                playable={isPlayable}
                                selected={isSelected}
                                onClick={() => handleCardClick(card)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single Row Fanned Layout */
                  <div
                    className="flex items-center justify-center transition-all duration-300 py-2 px-1"
                    style={{
                      minWidth: 'max-content'
                    }}
                  >
                    {displayHand.map((card, idx) => {
                      const isSelected = selectedCardId === card.id;
                      const total = displayHand.length;
                      const mid = (total - 1) / 2;
                      
                      const angle = isMobile
                        ? (total > 1 ? (idx - mid) * Math.min(2, 16 / total) : 0)
                        : (total > 1 ? (idx - mid) * Math.min(3, 24 / total) : 0);
                      
                      const overlapMargin = isMobile
                        ? (total <= 4 ? '-ml-2' : '-ml-4')
                        : (total <= 4 ? '-ml-2 sm:-ml-3' : total <= 7 ? '-ml-4 sm:-ml-7' : total <= 11 ? '-ml-7 sm:-ml-12' : '-ml-10 sm:-ml-16');

                      const isPlayable = checkCardPlayable(card);
                      const cardSize = isMobile ? 'sm' : 'md';

                      return (
                        <div
                          key={card.id || idx}
                          className={`group relative transition-all duration-200 ease-out ${idx > 0 ? overlapMargin : ''} hover:z-50 hover:-translate-y-6 sm:hover:-translate-y-10 hover:scale-110 sm:hover:scale-125 hover:rotate-0`}
                          style={{
                            transform: `rotate(${angle}deg)`,
                            zIndex: isSelected ? 40 : idx + 1
                          }}
                        >
                          <UnoCard
                            color={card.color}
                            value={card.value}
                            size={cardSize}
                            playable={isPlayable}
                            selected={isSelected}
                            onClick={() => handleCardClick(card)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Player Status Pill */}
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 flex items-center gap-2 text-[10px] sm:text-xs font-extrabold z-10 my-0.5 relative shadow-md text-white">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-400/30 text-white flex items-center justify-center text-[9px] sm:text-[10px] border border-sky-300/40">👤</div>
                <span>You</span>
                <span className="text-white/70">({displayHand.length} Cards)</span>
                <span className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>

                {/* Floating Emotes Overlay for Me */}
                {floatingEmotes.filter(e => e.senderId === myId).map((e) => (
                  <div key={e.id} className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-float-emote text-4xl sm:text-5xl select-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                    {e.emote}
                  </div>
                ))}
              </div>

            </div>

            {/* Desktop right filler to maintain balance */}
            <div className="hidden lg:block w-64 lg:w-72 shrink-0 pointer-events-none" />

          </div>

        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE & TABLET SLIDE-UP WHITE GLASS CHAT DRAWER              */}
      {/* ------------------------------------------------------------- */}
      {showMobileChat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center p-0 lg:hidden">
          <div className="glass-white-panel border-t border-slate-200 rounded-t-3xl p-4 w-full sm:max-w-md shadow-none space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" /> Room Chat
              </span>
              <button onClick={() => setShowMobileChat(false)} className="text-slate-400 hover:text-slate-800 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-52 overflow-y-auto space-y-2 text-xs pr-1">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400 italic text-center py-6 text-xs">No messages yet. Say hello!</p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="font-extrabold text-sky-600">{msg.senderName}: </span>
                    <span className="text-slate-800 font-medium">{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendChat} className="relative pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full glass-white-input rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-3 text-sky-600 hover:text-sky-700">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WILD COLOR PICKER MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      {showColorPicker && (() => {
        const pendingWildCard = gameState?.hand?.find(c => c.id === pendingWildCardId);
        const isWildShuffle = pendingWildCard?.value === 'WILD_SHUFFLE';
        const isWildDrawFour = pendingWildCard?.value === 'WILD_DRAW_FOUR';
        const modalTitle = isWildShuffle ? '🌀 WILD SHUFFLE' : isWildDrawFour ? '⚡ WILD DRAW FOUR' : '🎨 CHOOSE COLOR';
        const modalDesc = isWildShuffle 
          ? 'Gathering & redistributing all player hands! Choose active color for next turns:' 
          : isWildDrawFour 
          ? 'Next player faces +4 penalty stack! Choose active color for next turns:' 
          : 'Select the active color for the next turns:';

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 border border-slate-200 shadow-2xl animate-pop-scale">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{modalTitle}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {modalDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectColor('RED')}
                  className="h-20 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-[#E52521] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md cursor-pointer"
                >
                  RED
                </button>
                <button
                  onClick={() => handleSelectColor('YELLOW')}
                  className="h-20 rounded-2xl bg-gradient-to-br from-[#FFE033] to-[#FCD116] hover:scale-105 transition-transform text-slate-950 font-extrabold text-lg shadow-md cursor-pointer"
                >
                  YELLOW
                </button>
                <button
                  onClick={() => handleSelectColor('GREEN')}
                  className="h-20 rounded-2xl bg-gradient-to-br from-[#34C759] to-[#2D963F] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md cursor-pointer"
                >
                  GREEN
                </button>
                <button
                  onClick={() => handleSelectColor('BLUE')}
                  className="h-20 rounded-2xl bg-gradient-to-br from-[#0095FF] to-[#0082CA] hover:scale-105 transition-transform text-white font-extrabold text-lg shadow-md cursor-pointer"
                >
                  BLUE
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* HAND SWAP SELECTION MODAL (7-Zero / Wild Swap)               */}
      {/* ------------------------------------------------------------- */}
      {gameState.pendingHandSwapPlayerId === myId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 border border-slate-200 shadow-2xl animate-pop-scale">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-md">
              🔄
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">SWAP HANDS 🔄</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Select an opponent to swap your entire hand with:
              </p>
            </div>

            <div className="space-y-3">
              {activePlayers.filter(p => p.id !== myId && p.id !== gameState.pendingHandSwapPlayerId).map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleSwapHands(target.id)}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between group shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">
                      {target.avatar || '👤'}
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-sm text-slate-800 group-hover:text-amber-700">{target.name}</div>
                      <div className="text-xs font-semibold text-slate-400">Holding {target.cardCount} cards</div>
                    </div>
                  </div>
                  <span className="bg-amber-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl uppercase tracking-wider group-hover:scale-105 transition-transform">
                    SWAP 🔄
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GAME OVER / VICTORY OVERLAY MODAL (CONFETTI CELEBRATION)      */}
      {/* ------------------------------------------------------------- */}
      {gameState.status === 'FINISHED' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl border border-slate-200 animate-pop-scale">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 text-amber-500 flex items-center justify-center mx-auto shadow-lg transform rotate-3">
              <Trophy className="w-10 h-10 text-amber-600" />
            </div>

            <div>
              <span className="text-xs font-black text-sky-600 uppercase tracking-widest">MATCH FINISHED</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {gameState.winner?.id === myId ? 'YOU WIN!' : `${gameState.winner?.name || 'Player'} WINS!`}
              </h2>
              <p className="text-sm font-bold text-slate-500 mt-2">
                Winner Score: {gameState.winner?.score || 0} pts
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleRematch}
                className="w-full bg-gradient-to-r from-[#FCD116] to-[#F5A623] hover:from-[#FFE033] hover:to-[#FCD116] text-slate-950 font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                PLAY AGAIN
              </button>

              <button
                onClick={() => navigate('/play')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer"
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
