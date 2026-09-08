import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import { validateRoomCode } from '@shared/validation/roomValidator';
import { socketService } from '@/services/socketService';

export const JoinGame: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlCode } = useParams<{ roomCode: string }>();
  const [code, setCode] = useState(urlCode ? urlCode.trim().toUpperCase() : '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const validation = validateRoomCode(cleanCode);

    if (!validation.valid) {
      setError(validation.error || 'Invalid room code');
      return;
    }

    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name', { state: { returnTo: `/join/${validation.formattedCode}` } });
      return;
    }

    setIsSubmitting(true);
    const socket = socketService.getSocket();

    socket.emit('room:join', { roomCode: validation.formattedCode!, playerName }, (res: any) => {
      setIsSubmitting(false);
      if (res?.success) {
        if (res.playerId) {
          localStorage.setItem('uno_player_id', res.playerId);
        }
        navigate(`/room/${res.roomCode}`);
      } else {
        setError(res?.error || 'Could not join room');
      }
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-xl space-y-8 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uno-navy tracking-tight">JOIN GAME ROOM</h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">Enter the 6-character room code from the host.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">ROOM CODE</label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="e.g. ABC123"
              className="w-full px-5 py-4 rounded-xl border-2 border-neutral-200 focus:border-uno-blue focus:outline-none font-mono tracking-widest text-2xl font-black text-center text-uno-navy uppercase placeholder:text-neutral-300"
              autoFocus
            />
            {error && <p className="text-xs font-bold text-uno-red mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-uno-yellow hover:bg-amber-400 disabled:opacity-50 text-uno-navy font-black py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
          >
            {isSubmitting ? 'JOINING...' : 'JOIN GAME'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
