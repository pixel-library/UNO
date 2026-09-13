import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Volume2, VolumeX, Music, Settings, MessageSquare, 
  Send, Copy, Check, Play, Layers, ArrowRight, X, AlertTriangle, Smile
} from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';
import { CardColor, PlayerPrivateState, Card, ChatMessage } from '@shared/types/game';
import { audioService } from '@/services/audioService';
import { socketService } from '@/services/socketService';

const EMOTE_OPTIONS = ['🔥', '😂', '😱', '🎉', '💩', '⚡'];

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
  const [showEmotePicker, setShowEmotePicker] = useState(false);
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
      if (newState.targetPlayerId && myId && newState.targetPlayerId !== myId) {
        return;
      }

      // Check for audio triggers based on new state events
      if (newState.lastActionEvent?.type) {
        switch (newState.lastActionEvent.type) {
          case 'SKIP':
          case 'REVERSE':
            audioService.playWhooshSound();
            break;
          case 'UNO_CALL':
          case 'UNO_CHALLENGE':
            audioService.playExplosionSound();
            break;
          case 'STACK':
            audioService.playDrawSound();
            break;
        }
      }

      if (newState.activeEmote) {
        audioService.playEmoteSound();
      }

      if (newState.status === 'FINISHED' && gameState?.status !== 'FINISHED') {
        audioService.playWinSound();
      }

      setGameState(newState);
      if (newState.chatMessages && newState.chatMessages.length > 0) {
        setChatMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          prev.forEach(m => map.set(m.id, m));
          newState.chatMessages!.forEach(m => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
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
  }, [gameId, gameState?.status]);

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
    const pendingTimer = setTimeout(() => setIsActionPending(false), 1200);

    const socket = socketService.getSocket();
    socket.emit('game:playCard', { cardId: card.id }, (res: any) => {
      clearTimeout(pendingTimer);
      setIsActionPending(false);
      if (res?.success) {
        audioService.playCardSound();
        setSelectedCardId(null);
      }
    });
  };

  // Color Pick Handler
  const handleSelectColor = (color: CardColor) => {
    if (!pendingWildCardId || isActionPending) return;

    setIsActionPending(true);
    const pendingTimer = setTimeout(() => setIsActionPending(false), 1200);

    const socket = socketService.getSocket();
    socket.emit('game:playCard', { cardId: pendingWildCardId, chosenColor: color }, (res: any) => {
      clearTimeout(pendingTimer);
      setIsActionPending(false);
      if (res?.success) {
        audioService.playCardSound();
        setShowColorPicker(false);
        setPendingWildCardId(null);
        setSelectedCardId(null);
      }
    });
  };

  // 7-Zero Hand Swap Handler
  const handleSwapHandTarget = (targetPlayerId: string) => {
    if (isActionPending) return;
    setIsActionPending(true);

    const socket = socketService.getSocket();
    socket.emit('game:swapHand', { targetSwapPlayerId: targetPlayerId }, (res: any) => {
      setIsActionPending(false);
      if (res?.success) {
        audioService.playWhooshSound();
      }
    });
  };

  // Challenge Uncaught UNO Handler
  const handleChallengeUno = (targetPlayerId: string) => {
    audioService.playExplosionSound();
    const socket = socketService.getSocket();
    socket.emit('game:challengeUno', { targetPlayerId }, (res: any) => {
      if (res?.error) alert(res.error);
    });
  };

  // Send Emote Handler
  const handleSendEmote = (emote: string) => {
    audioService.playEmoteSound();
    setShowEmotePicker(false);
    const socket = socketService.getSocket();
    socket.emit('game:sendEmote', { emote });
  };

  // Draw Card Handler
  const handleDrawCard = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    audioService.playDrawSound();

    const pendingTimer = setTimeout(() => setIsActionPending(false), 1200);

    const socket = socketService.getSocket();
    const myId = localStorage.getItem('uno_player_id');
    socket.emit('game:drawCard', { roomCode: gameState?.roomCode, playerId: myId }, (res: any) => {
      clearTimeout(pendingTimer);
      setIsActionPending(false);
    });
  };

  // Pass / End Turn Handler
  const handlePassTurn = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    audioService.playButtonClick();

    const pendingTimer = setTimeout(() => setIsActionPending(false), 1200);

    const socket = socketService.getSocket();
    const myId = localStorage.getItem('uno_player_id');
    socket.emit('game:passTurn', { roomCode: gameState?.roomCode, playerId: myId }, (res: any) => {
      clearTimeout(pendingTimer);
      setIsActionPending(false);
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

  // Loading / Error Screen
  if (!gameState) {
    return (
      <div className="uno-game flex flex-col items-center justify-center p-4">
        {syncError ? (
          <div className="game-modal text-center space-y-4">
            <h2>UNABLE TO START MATCH</h2>
            <p className="text-sm font-bold text-neutral-700 font-sans">{syncError}</p>
            <div className="flex gap-4 justify-center">
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
                className="modal-button"
              >
                RETRY
              </button>
              <button
                onClick={() => navigate('/play')}
                className="modal-button"
                style={{ background: '#3A4454' }}
              >
                RETURN HOME
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center font-comic space-y-2">
            <div className="w-12 h-12 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <h2 className="text-4xl font-black tracking-wide text-yellow-300 drop-shadow-[2px_2px_0px_#000]">CONNECTING TO ROOM...</h2>
            <p className="text-sm text-white/90 font-sans">Synchronizing game board state</p>
          </div>
        )}
      </div>
    );
  }

  const myId = localStorage.getItem('uno_player_id') || '';
  const activePlayers = (gameState?.players || []).filter(p => p && !p.isSpectator);

  // Seating breakdown starting from local player
  const myIdx = activePlayers.findIndex(p => p.id === myId);
  const validMyIdx = myIdx >= 0 ? myIdx : 0;
  const myPlayer = activePlayers[validMyIdx] || activePlayers[0];

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
  const displayHand: Card[] = (Array.isArray(gameState?.hand) ? gameState.hand : [])
    .filter(c => c && c.id && c.color && c.value);
  const topDiscard: Card = gameState?.topDiscardCard || { id: 'disc_1', color: 'GREEN', value: '2', score: 2 };

  // Failsafe avatar image renderer
  const renderAvatarImg = (name: string, avatarUrl?: string) => {
    const finalUrl = avatarUrl && avatarUrl.length > 5 
      ? avatarUrl 
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Player')}`;
    return (
      <img
        src={finalUrl}
        alt={`${name} avatar`}
        onError={(e) => {
          e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
        }}
      />
    );
  };

  return (
    <div className="uno-game">

      {/* =====================================================
           BACKGROUND / DECORATION & COMIC ACTION POPUPS
           ===================================================== */}
      <div className="graffiti m1">M</div>
      <div className="graffiti m2">+</div>
      <div className="graffiti m3">×</div>

      {/* Floating Action Event Popup */}
      {gameState.lastActionEvent && (Date.now() - gameState.lastActionEvent.timestamp < 3000) && (
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div className="bg-yellow-300 text-black border-4 border-black px-6 py-2 rounded-2xl shadow-[5px_5px_0px_#000] font-comic font-black text-2xl -rotate-2">
            {gameState.lastActionEvent.title} ({gameState.lastActionEvent.playerName})
          </div>
        </div>
      )}

      {/* =====================================================
           TOP LEFT: UNO LOGO + ROOM
           ===================================================== */}
      <div className="uno-brand-area">
        <div className="uno-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="UNO Home">
          <span>UNO</span>
        </div>

        <div className="room-ticket">
          <span>
            Room: <strong className="room-code">{(gameState.roomCode || '').toUpperCase()}</strong>
          </span>

          <button
            className="copy-icon"
            type="button"
            aria-label="Copy room code"
            onClick={handleCopyCode}
            title="Copy room code"
          >
            {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-black" />}
          </button>
        </div>
      </div>

      {/* =====================================================
           TOP RIGHT CONTROLS & LIVE REACTION WHEEL
           ===================================================== */}
      <div className="top-controls relative">
        <button
          className="top-control"
          type="button"
          onClick={() => setShowEmotePicker(!showEmotePicker)}
          title="Send Emote"
        >
          <Smile className="w-6 h-6 text-black" />
          <span>Emote</span>
        </button>

        <button className="top-control" type="button" onClick={toggleSound} title="Sound Effects">
          {soundEnabled ? <Volume2 className="w-6 h-6 text-black" /> : <VolumeX className="w-6 h-6 text-red-600" />}
          <span>Sound</span>
        </button>

        <button className="top-control" type="button" onClick={toggleMusic} title="Music">
          <Music className={`w-6 h-6 text-black ${musicEnabled ? 'opacity-100' : 'opacity-40'}`} />
          <span>Music</span>
        </button>

        <button className="top-control" type="button" onClick={() => navigate('/settings')} title="Settings">
          <Settings className="w-6 h-6 text-black" />
          <span>Settings</span>
        </button>

        <button className="top-control" type="button" onClick={() => setShowChat(!showChat)} title="Chat">
          <MessageSquare className="w-6 h-6 text-black" />
          <span>Chat</span>
        </button>

        {/* Reaction Emote Wheel Popup */}
        {showEmotePicker && (
          <div className="absolute top-20 right-0 bg-white border-3 border-black p-2 rounded-2xl shadow-[4px_4px_0px_#000] flex gap-2 z-50 animate-in fade-in">
            {EMOTE_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => handleSendEmote(e)}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
           TOP PLAYER (PLAYER 2)
           ===================================================== */}
      {topOpponent && (
        <>
          <div className={`player-top ${currentTurnPlayerId === topOpponent.id ? 'active-player' : ''} relative`}>
            {/* Live Emote Overlay */}
            {gameState.activeEmote?.senderId === topOpponent.id && (Date.now() - gameState.activeEmote.timestamp < 3500) && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-50">
                {gameState.activeEmote.emote}
              </div>
            )}

            <div className="player-avatar">
              {renderAvatarImg(topOpponent.name, topOpponent.avatar)}
            </div>

            <div className="player-information">
              <div className="player-name">{topOpponent.name}</div>
              <div className="card-count">{topOpponent.cardCount} cards</div>
            </div>

            {/* Challenge UNO Button */}
            {topOpponent.cardCount === 1 && !topOpponent.hasCalledUno && (
              <button
                onClick={() => handleChallengeUno(topOpponent!.id)}
                className="ml-auto bg-red-600 text-white font-comic font-black text-xs px-2 py-1 rounded-lg border-2 border-black animate-pulse flex items-center gap-1"
                title="Catch Uncaught UNO!"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> CHALLENGE
              </button>
            )}

            <div className="online-status">
              {topOpponent.isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="player-hand-top">
            {Array.from({ length: Math.min(topOpponent.cardCount || 7, 8) }).map((_, idx) => (
              <div
                key={idx}
                className="uno-card card-back"
                style={{ '--i': idx + 1 } as React.CSSProperties}
              />
            ))}
          </div>
        </>
      )}

      {/* =====================================================
           LEFT PLAYER (PLAYER 3)
           ===================================================== */}
      {leftOpponent && (
        <div className="player-left">
          <div className={`side-player-info ${currentTurnPlayerId === leftOpponent.id ? 'active-player' : ''} relative`}>
            {/* Live Emote Overlay */}
            {gameState.activeEmote?.senderId === leftOpponent.id && (Date.now() - gameState.activeEmote.timestamp < 3500) && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-50">
                {gameState.activeEmote.emote}
              </div>
            )}

            <div className="side-name">{leftOpponent.name}</div>
            <div className="side-status">{leftOpponent.isConnected ? 'Online' : 'Offline'}</div>

            {/* Challenge UNO Button */}
            {leftOpponent.cardCount === 1 && !leftOpponent.hasCalledUno && (
              <button
                onClick={() => handleChallengeUno(leftOpponent!.id)}
                className="my-1 bg-red-600 text-white font-comic font-black text-[10px] px-1.5 py-0.5 rounded border border-black animate-pulse"
              >
                CHALLENGE
              </button>
            )}

            <div className="side-player-avatar">
              {renderAvatarImg(leftOpponent.name, leftOpponent.avatar)}
            </div>
          </div>

          <div className="side-card-stack">
            {Array.from({ length: Math.min(leftOpponent.cardCount || 7, 5) }).map((_, idx) => {
              const rotations = [-18, -12, -7, 2, 8];
              const offsets = [-80, -45, -10, 25, 60];
              return (
                <div
                  key={idx}
                  className="uno-card card-back"
                  style={{
                    '--rotation': `${rotations[idx % 5]}deg`,
                    '--offset': `${offsets[idx % 5]}px`
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
           RIGHT PLAYER (PLAYER 4)
           ===================================================== */}
      {rightOpponent && (
        <div className="player-right">
          <div className={`side-player-info ${currentTurnPlayerId === rightOpponent.id ? 'active-player' : ''} relative`}>
            {/* Live Emote Overlay */}
            {gameState.activeEmote?.senderId === rightOpponent.id && (Date.now() - gameState.activeEmote.timestamp < 3500) && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-50">
                {gameState.activeEmote.emote}
              </div>
            )}

            <div className="side-name">{rightOpponent.name}</div>
            <div className="side-status">{rightOpponent.isConnected ? 'Online' : 'Offline'}</div>

            {/* Challenge UNO Button */}
            {rightOpponent.cardCount === 1 && !rightOpponent.hasCalledUno && (
              <button
                onClick={() => handleChallengeUno(rightOpponent!.id)}
                className="my-1 bg-red-600 text-white font-comic font-black text-[10px] px-1.5 py-0.5 rounded border border-black animate-pulse"
              >
                CHALLENGE
              </button>
            )}

            <div className="side-player-avatar">
              {renderAvatarImg(rightOpponent.name, rightOpponent.avatar)}
            </div>
          </div>

          <div className="side-card-stack">
            {Array.from({ length: Math.min(rightOpponent.cardCount || 7, 5) }).map((_, idx) => {
              const rotations = [18, 12, 7, -2, -8];
              const offsets = [-80, -45, -10, 25, 60];
              return (
                <div
                  key={idx}
                  className="uno-card card-back"
                  style={{
                    '--rotation': `${rotations[idx % 5]}deg`,
                    '--offset': `${offsets[idx % 5]}px`
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
           CENTER GAME AREA
           ===================================================== */}
      <main className="center-board">
        <div className="piles">
          {/* DRAW PILE */}
          <div
            className="pile-wrapper"
            onClick={isMyTurn ? handleDrawCard : undefined}
            style={{ cursor: isMyTurn ? 'pointer' : 'not-allowed' }}
            title={isMyTurn ? "Click to Draw Card" : "Wait for your turn"}
          >
            <div className="pile draw-pile">
              <div className="pile-card" />
            </div>
            <div className="pile-label">DRAW PILE</div>
            <div className="pile-count">{gameState.drawPileCount || 73}</div>
          </div>

          {/* DISCARD PILE */}
          <div className="pile-wrapper">
            <div className="pile discard-pile">
              <UnoCard
                color={topDiscard.color}
                value={topDiscard.value}
                size="md"
                className="pile-card"
              />
            </div>
            <div className="pile-label">DISCARD PILE</div>
            <div className="pile-count">{gameState.discardPileCount || 1}</div>
          </div>
        </div>

        {/* TURN INDICATOR */}
        <div className="turn-indicator">
          <span
            className="turn-dot"
            style={{ background: isMyTurn ? '#19aa4b' : '#ffb321' }}
          />
          <span>
            {isMyTurn
              ? 'YOUR TURN'
              : `${(activePlayers[currentIdx]?.name || 'PLAYER').toUpperCase()}'S TURN`}
          </span>
        </div>
      </main>

      {/* =====================================================
           CHAT PANEL
           ===================================================== */}
      {showChat && (
        <section className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <MessageSquare className="w-5 h-5 text-black" />
              <span>Chat</span>
            </div>
            <span className="text-black font-bold">•••</span>
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <p className="text-neutral-400 italic text-center py-4 text-xs font-sans">No messages yet...</p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="chat-message font-sans">
                  <strong className="text-[#1688e8]">{msg.senderName}: </strong>
                  <span className="text-neutral-800">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChat} className="chat-input-area">
            <input
              className="chat-input font-sans"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="chat-send" type="submit" title="Send message">
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </section>
      )}

      {/* =====================================================
           CURRENT PLAYER HAND
           ===================================================== */}
      <section className="my-hand-area">
        <div className="my-hand">
          {displayHand.map((card) => {
            const isPlayable = isMyTurn && (
              card.color === 'WILD' ||
              card.color === gameState.currentColor ||
              card.value === topDiscard.value
            );
            const isSelected = selectedCardId === card.id;

            return (
              <UnoCard
                key={card.id}
                color={card.color}
                value={card.value}
                playable={isPlayable}
                selected={isSelected}
                onClick={() => handleCardClick(card)}
              />
            );
          })}
        </div>

        {/* CURRENT PLAYER INFO */}
        <div className={`my-player-info ${isMyTurn ? 'active-player' : ''} relative`}>
          {/* Live Emote Overlay */}
          {gameState.activeEmote?.senderId === myPlayer?.id && (Date.now() - gameState.activeEmote.timestamp < 3500) && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce z-50">
              {gameState.activeEmote.emote}
            </div>
          )}

          <div className="player-avatar">
            {renderAvatarImg(myPlayer?.name || 'PLAYER 1', myPlayer?.avatar)}
          </div>

          <div className="player-information">
            <div className="player-name">{myPlayer?.name || 'PLAYER 1'}</div>
            <div className="card-count">{displayHand.length} cards</div>
          </div>

          <div className="online-status">
            Online
          </div>
        </div>
      </section>

      {/* =====================================================
           RIGHT ACTION AREA
           ===================================================== */}
      <section className="action-area">
        <button className="uno-button" type="button" onClick={handleCallUno} title="Call UNO!">
          <span>UNO!</span>
        </button>

        <div className="action-buttons">
          <button
            className="game-action draw-button"
            type="button"
            onClick={handleDrawCard}
            disabled={!isMyTurn || isActionPending}
          >
            <Layers className="w-6 h-6 text-white shrink-0" />
            <span>DRAW CARD</span>
          </button>

          <button
            className="game-action end-turn-button"
            type="button"
            onClick={handlePassTurn}
            disabled={!isMyTurn || isActionPending}
          >
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
            <span>END TURN</span>
          </button>
        </div>
      </section>

      {/* =====================================================
           7-ZERO HAND SWAP SELECTION MODAL
           ===================================================== */}
      {gameState.pendingHandSwapPlayerId === myId && (
        <div className="game-modal-overlay">
          <div className="game-modal text-center space-y-4">
            <h2>SWAP HAND (7-RULE)</h2>
            <p className="font-bold text-neutral-800 font-sans">Select a player to swap hands with:</p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {activePlayers.filter(p => p.id !== myId).map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleSwapHandTarget(target.id)}
                  className="modal-button flex items-center justify-between px-6"
                  style={{ background: '#0082CA' }}
                >
                  <span>{target.name}</span>
                  <span className="text-sm font-sans">{target.cardCount} cards</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
           WILD COLOR PICKER MODAL
           ===================================================== */}
      {showColorPicker && (
        <div className="game-modal-overlay">
          <div className="game-modal text-center">
            <h2>CHOOSE COLOR</h2>
            <p className="mb-6 font-bold text-neutral-700 font-sans">Select active color for next turns:</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSelectColor('RED')}
                className="modal-button"
                style={{ background: '#ed1c24' }}
              >
                RED
              </button>

              <button
                type="button"
                onClick={() => handleSelectColor('YELLOW')}
                className="modal-button"
                style={{ background: '#ffd21f', color: '#000' }}
              >
                YELLOW
              </button>

              <button
                type="button"
                onClick={() => handleSelectColor('GREEN')}
                className="modal-button"
                style={{ background: '#23a83d' }}
              >
                GREEN
              </button>

              <button
                type="button"
                onClick={() => handleSelectColor('BLUE')}
                className="modal-button"
                style={{ background: '#1688e8' }}
              >
                BLUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
           GAME OVER / VICTORY MODAL
           ===================================================== */}
      {gameState.status === 'FINISHED' && (
        <div className="game-modal-overlay">
          <div className="game-modal text-center space-y-4">
            <h2>
              {gameState.winner?.id === myId ? 'YOU WIN!' : `${(gameState.winner?.name || 'Player').toUpperCase()} WINS!`}
            </h2>

            <p className="font-bold text-lg text-neutral-800 font-sans">
              Winner Score: {gameState.winner?.score || 0} pts
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleRematch}
                className="modal-button"
                style={{ background: '#ffd21f', color: '#000' }}
              >
                PLAY AGAIN
              </button>

              <button
                type="button"
                onClick={() => navigate('/play')}
                className="modal-button"
                style={{ background: '#d9d9d2', color: '#000' }}
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
