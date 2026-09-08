import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, RefreshCw, Home, Eye } from 'lucide-react';

export const GameResult: React.FC = () => {
  const navigate = useNavigate();
  const winnerName = localStorage.getItem('uno_player_name') || 'Rudra';

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-2xl space-y-8 text-center animate-card-pop">
        
        <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-500 flex items-center justify-center mx-auto shadow-lg transform rotate-3">
          <Trophy className="w-10 h-10 fill-current" />
        </div>

        <div>
          <span className="text-xs font-black text-uno-blue uppercase tracking-widest">VICTORY</span>
          <h1 className="text-3xl font-black text-uno-navy tracking-tight mt-1">YOU WIN!</h1>
          <p className="text-sm font-bold text-neutral-600 mt-2">🏆 {winnerName}</p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2 text-xs font-semibold text-neutral-600">
          <div className="flex justify-between"><span>Winner Score:</span><span className="font-bold text-uno-navy">240 pts</span></div>
          <div className="flex justify-between"><span>Total Moves:</span><span className="font-bold text-uno-navy">32 moves</span></div>
          <div className="flex justify-between"><span>UNO Calls:</span><span className="font-bold text-uno-navy">1</span></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/play')}
            className="w-full bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5" />
            PLAY AGAIN
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border border-neutral-200 hover:border-neutral-300 text-uno-navy font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            GO TO HOME
          </button>
        </div>

      </div>
    </div>
  );
};
