import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Play, Users, Crown, Shield } from 'lucide-react';
import { socketService } from '@/services/socketService';
import { GamePublicState, PlayerPublic } from '@shared/types/game';

export const WaitingRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GamePublicState | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formattedRoomCode = roomCode ? roomCode.trim().toUpperCase() : '';
  const myId = localStorage.getItem('uno_player_id');
  const playerName = localStorage.getItem('uno_player_name');

  useEffect(() => {
    if (!formattedRoomCode) {
      navigate('/play');
      return;
    }

    if (!playerName) {
      // Redirect to join route with roomCode pre-filled to set nickname
      navigate(`/join/${formattedRoomCode}`);
      return;
    }

    const socket = socketService.getSocket();

    const handleGameState = (newState: GamePublicState) => {
      if (newState.roomCode === formattedRoomCode) {
        setGameState(newState);
        setLoading(false);
        if (newState.status === 'PLAYING') {
          navigate(`/game/${newState.id}`, { state: { initialGameState: newState } });
        }
      }
    };

    socket.on('game:state', handleGameState);

    // Initial Sync
    socket.emit('game:sync', { roomCode: formattedRoomCode, playerId: myId }, (res: any) => {
      if (res?.success && res?.state) {
        const state: GamePublicState = res.state;
        setGameState(state);
        setLoading(false);

        // Check if current user is in player list
        const inRoom = myId && state.players.some(p => p.id === myId);
        if (!inRoom) {
          // Player is not in the room yet - auto emit room:join
          socket.emit('room:join', { roomCode: formattedRoomCode, playerName }, (joinRes: any) => {
            if (joinRes?.success) {
              if (joinRes.playerId) {
                localStorage.setItem('uno_player_id', joinRes.playerId);
              }
              if (joinRes.state) {
                setGameState(joinRes.state);
              }
            } else {
              setError(joinRes?.error || 'Failed to join room.');
            }
          });
        }

        if (state.status === 'PLAYING') {
          navigate(`/game/${state.id}`, { state: { initialGameState: state } });
        }
      } else {
        // Room sync failed - try auto-joining via room:join
        socket.emit('room:join', { roomCode: formattedRoomCode, playerName }, (joinRes: any) => {
          setLoading(false);
          if (joinRes?.success) {
            if (joinRes.playerId) {
              localStorage.setItem('uno_player_id', joinRes.playerId);
            }
            if (joinRes.state) {
              setGameState(joinRes.state);
            }
          } else {
            setError(joinRes?.error || 'Room not found. Check your room code.');
          }
        });
      }
    });

    return () => {
      socket.off('game:state', handleGameState);
    };
  }, [formattedRoomCode, navigate, myId, playerName]);

  const handleCopyCode = () => {
    const codeToCopy = formattedRoomCode || gameState?.roomCode || '';
    if (!codeToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = () => {
    if (isStarting) return;
    setIsStarting(true);
    const socket = socketService.getSocket();
    socket.emit('game:start', { roomCode: formattedRoomCode || gameState?.roomCode }, (res: any) => {
      setIsStarting(false);
      if (res?.success) {
        navigate(`/game/${gameState?.id || res?.state?.id || 'game_active'}`, {
          state: { initialGameState: res?.state }
        });
      } else {
        alert(res?.error || 'Could not start game');
      }
    });
  };

  if (error) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-uno-red flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-uno-navy">CANNOT JOIN ROOM</h1>
            <p className="text-sm font-bold text-uno-red mt-2">{error}</p>
          </div>
          <button
            onClick={() => navigate('/play')}
            className="w-full bg-uno-navy hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            RETURN TO GAME MENU
          </button>
        </div>
      </div>
    );
  }

  if (loading && !gameState) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-uno-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-uno-navy">CONNECTING TO ROOM {formattedRoomCode}...</p>
        </div>
      </div>
    );
  }

  const players = gameState?.players || [];
  const currentMyId = localStorage.getItem('uno_player_id');
  const hostPlayer = players.find(p => p.isHost);
  const isHost = hostPlayer ? hostPlayer.id === currentMyId : false;
  const maxPlayers = gameState?.settings.maxPlayers || 4;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-uno-blue uppercase tracking-widest">WAITING LOBBY</span>
            <h1 className="text-3xl font-black text-uno-navy tracking-tight mt-1">ROOM {formattedRoomCode}</h1>
            <p className="text-xs font-semibold text-neutral-500 mt-1">
              Share code with friends to join the match.
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-uno-navy font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'CODE COPIED!' : 'COPY ROOM CODE'}
          </button>
        </div>

        {/* Player Slots */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h2 className="font-extrabold text-lg text-uno-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-uno-blue" />
              PLAYERS ({players.length}/{maxPlayers})
            </h2>
            <span className="text-xs font-bold text-neutral-400">Need min 2 players</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl flex items-center justify-between border ${
                  p.id === currentMyId ? 'bg-blue-50/50 border-uno-blue/40' : 'bg-neutral-50 border-neutral-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-uno-blue flex items-center justify-center font-bold text-lg">
                    {p.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy flex items-center gap-1.5">
                      {p.name} {p.id === currentMyId && <span className="text-[10px] text-uno-blue font-extrabold">(YOU)</span>}
                      {p.isHost && <Crown className="w-4 h-4 text-amber-500 fill-current" />}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600">● Connected</div>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                  READY
                </span>
              </div>
            ))}

            {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, idx) => (
              <div
                key={idx}
                className="border-2 border-dashed border-neutral-200 p-4 rounded-2xl flex items-center justify-center text-neutral-400 font-bold text-xs"
              >
                Waiting for player...
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={players.length < 2 || isStarting}
                className="w-full sm:w-auto bg-uno-yellow hover:bg-amber-400 disabled:opacity-50 text-uno-navy font-black px-10 py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-100"
              >
                <Play className="w-5 h-5 fill-current" />
                {isStarting ? 'STARTING MATCH...' : players.length < 2 ? 'WAITING FOR PLAYERS...' : 'START GAME'}
              </button>
            ) : (
              <div className="w-full text-center py-3 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-500">
                WAITING FOR HOST TO START GAME...
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
