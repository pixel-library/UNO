import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Play } from 'lucide-react';
import { AIDifficulty } from '@shared/types/game';
import { socketService } from '@/services/socketService';

export const Computer: React.FC = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<AIDifficulty>('MEDIUM');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartVsAI = () => {
    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name');
      return;
    }

    setIsStarting(true);
    const socket = socketService.getSocket();

    socket.emit('room:createVsAI', { playerName, difficulty }, (res: any) => {
      setIsStarting(false);
      if (res?.success) {
        if (res.playerId) {
          localStorage.setItem('uno_player_id', res.playerId);
        }
        navigate(`/game/${res.gameId}`, { state: { initialGameState: res.state } });
      } else {
        alert(res?.error || 'Failed to start AI match');
      }
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-xl space-y-8 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-md">
          <Monitor className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-uno-navy tracking-tight">PLAY VS COMPUTER</h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">
            Challenge 3 intelligent AI opponents with custom difficulty settings.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">AI DIFFICULTY</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'EASY', label: 'EASY', desc: 'Casual bot moves' },
              { id: 'MEDIUM', label: 'MEDIUM', desc: 'Balanced strategy' },
              { id: 'HARD', label: 'HARD', desc: 'Aggressive sabotaging' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as AIDifficulty)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  difficulty === d.id
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <div className="font-extrabold text-sm">{d.label}</div>
                <div className="text-[10px] text-neutral-500 mt-1">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartVsAI}
          disabled={isStarting}
          className="w-full bg-uno-yellow hover:bg-amber-400 disabled:opacity-50 text-uno-navy font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
        >
          <Play className="w-5 h-5 fill-current" />
          {isStarting ? 'STARTING MATCH...' : 'START MATCH VS AI'}
        </button>

      </div>
    </div>
  );
};
