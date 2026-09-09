import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, Users, Timer, Sparkles, Check, ArrowRight } from 'lucide-react';
import { socketService } from '@/services/socketService';

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();

  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [turnTimerSeconds, setTurnTimerSeconds] = useState<number>(30);
  const [stacking, setStacking] = useState<boolean>(true);
  const [forcePlay, setForcePlay] = useState<boolean>(true);
  const [customCards, setCustomCards] = useState<boolean>(false);
  const [allowSpectators, setAllowSpectators] = useState<boolean>(true);
  const [enableChat, setEnableChat] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    if (isSubmitting) return;
    const playerName = localStorage.getItem('uno_player_name');
    if (!playerName) {
      navigate('/enter-name');
      return;
    }

    setIsSubmitting(true);
    let handled = false;
    const timer = setTimeout(() => {
      if (!handled) {
        handled = true;
        setIsSubmitting(false);
        alert('Room creation timed out. Please try again.');
      }
    }, 4000);

    try {
      const socket = socketService.getSocket();
      socket.emit(
        'room:create',
        {
          playerName,
          settings: {
            maxPlayers,
            startingCards: 7,
            turnTimerSeconds,
            allowSpectators,
            enableChat,
            houseRules: {
              stacking,
              jumpIn: false,
              sevenZero: false,
              forcePlay,
              drawUntilPlayable: false,
              multipleCardPlay: false,
              customCards
            }
          }
        },
        (res: any) => {
          if (handled) return;
          handled = true;
          clearTimeout(timer);
          setIsSubmitting(false);
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
        setIsSubmitting(false);
        alert('An unexpected error occurred while creating room.');
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-xl space-y-8">
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-100 text-uno-blue">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-uno-navy">CREATE GAME ROOM</h1>
            <p className="text-xs font-semibold text-neutral-500">Configure your match settings and invite friends.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Max Players Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-uno-blue" /> MAX PLAYERS
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxPlayers(num)}
                  className={`py-3 rounded-xl font-extrabold text-sm border-2 transition-all ${
                    maxPlayers === num
                      ? 'border-uno-blue bg-blue-50 text-uno-blue'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {num} PLAYERS
                </button>
              ))}
            </div>
          </div>

          {/* Turn Timer Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-500" /> TURN TIMER
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'OFF', value: 0 },
                { label: '15 sec', value: 15 },
                { label: '30 sec', value: 30 },
                { label: '60 sec', value: 60 }
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTurnTimerSeconds(t.value)}
                  className={`py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                    turnTimerSeconds === t.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional House Rules */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">HOUSE RULES</span>
            
            <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div>
                <div className="font-bold text-sm text-uno-navy">Stacking (+2 / +4)</div>
                <div className="text-xs text-neutral-500">Allow stacking +2 on +2 or +4 on +4 cards.</div>
              </div>
              <input
                type="checkbox"
                checked={stacking}
                onChange={(e) => setStacking(e.target.checked)}
                className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div>
                <div className="font-bold text-sm text-uno-navy">Force Play Drawn Card</div>
                <div className="text-xs text-neutral-500">Must play drawn card immediately if it matches top discard.</div>
              </div>
              <input
                type="checkbox"
                checked={forcePlay}
                onChange={(e) => setForcePlay(e.target.checked)}
                className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div>
                <div className="font-bold text-sm text-uno-navy">Custom Action Cards</div>
                <div className="text-xs text-neutral-500">Enable Replay, Skip Wild, #, and -1 cards.</div>
              </div>
              <input
                type="checkbox"
                checked={customCards}
                onChange={(e) => setCustomCards(e.target.checked)}
                className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="w-full bg-uno-yellow hover:bg-amber-400 disabled:opacity-50 text-uno-navy font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01] active:scale-100"
          >
            {isSubmitting ? 'CREATING ROOM...' : 'CREATE ROOM'}
            <ArrowRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </div>
  );
};
