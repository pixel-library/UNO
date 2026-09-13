import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, Users, Timer, Sparkles, Check, ArrowRight, Layers, RotateCcw, Zap, Eye, MessageSquare, Layers3 } from 'lucide-react';
import { socketService } from '@/services/socketService';

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();

  const [preset, setPreset] = useState<'CLASSIC' | 'SPEED' | 'CHAOS' | 'CUSTOM'>('CLASSIC');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [startingCards, setStartingCards] = useState<number>(7);
  const [turnTimerSeconds, setTurnTimerSeconds] = useState<number>(30);
  const [stacking, setStacking] = useState<boolean>(true);
  const [sevenZero, setSevenZero] = useState<boolean>(false);
  const [jumpIn, setJumpIn] = useState<boolean>(false);
  const [forcePlay, setForcePlay] = useState<boolean>(true);
  const [customCards, setCustomCards] = useState<boolean>(false);
  const [allowSpectators, setAllowSpectators] = useState<boolean>(true);
  const [enableChat, setEnableChat] = useState<boolean>(true);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = (p: 'CLASSIC' | 'SPEED' | 'CHAOS' | 'CUSTOM') => {
    setPreset(p);
    if (p === 'CLASSIC') {
      setMaxPlayers(4);
      setStartingCards(7);
      setTurnTimerSeconds(30);
      setStacking(true);
      setSevenZero(false);
      setJumpIn(false);
      setCustomCards(false);
    } else if (p === 'SPEED') {
      setMaxPlayers(4);
      setStartingCards(5);
      setTurnTimerSeconds(15);
      setStacking(true);
      setSevenZero(false);
      setJumpIn(false);
      setCustomCards(false);
    } else if (p === 'CHAOS') {
      setMaxPlayers(4);
      setStartingCards(7);
      setTurnTimerSeconds(30);
      setStacking(true);
      setSevenZero(true);
      setJumpIn(true);
      setCustomCards(true);
    }
  };

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
            startingCards,
            turnTimerSeconds,
            allowSpectators,
            enableChat,
            isPrivate,
            houseRules: {
              stacking,
              jumpIn,
              sevenZero,
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
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-xl space-y-8">
        
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-100 text-uno-blue">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-uno-navy">CREATE GAME ROOM</h1>
              <p className="text-xs font-semibold text-neutral-500">Configure your match rules & privacy before creating.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Quick Preset Selector Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> GAME PRESETS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'CLASSIC', label: 'Classic 🎲', desc: 'Standard 7-card match' },
                { key: 'SPEED', label: 'Speed Match ⚡', desc: '5 cards, 15s timer' },
                { key: 'CHAOS', label: 'Chaos Mode 💥', desc: 'Stack + Swap + Jump-In' },
                { key: 'CUSTOM', label: 'Custom 🛠️', desc: 'Full manual rules' }
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key as any)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all ${
                    preset === p.key
                      ? 'border-uno-blue bg-blue-50/80 shadow-md ring-2 ring-uno-blue/30'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-uno-navy">{p.label}</div>
                  <div className="text-[10px] text-neutral-500 font-medium leading-tight mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Match Basics: Max Players, Starting Cards & Turn Timer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Max Players Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-uno-blue" /> MAX PLAYERS
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setMaxPlayers(num); setPreset('CUSTOM'); }}
                    className={`py-2.5 rounded-xl font-extrabold text-xs border-2 transition-all ${
                      maxPlayers === num
                        ? 'border-uno-blue bg-blue-50 text-uno-blue'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {num} P
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Cards Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers3 className="w-4 h-4 text-emerald-600" /> START CARDS
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 7, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setStartingCards(num); setPreset('CUSTOM'); }}
                    className={`py-2.5 rounded-xl font-extrabold text-xs border-2 transition-all ${
                      startingCards === num
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Timer Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-500" /> TURN TIMER
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'OFF', value: 0 },
                  { label: '15s', value: 15 },
                  { label: '30s', value: 30 },
                  { label: '60s', value: 60 }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setTurnTimerSeconds(t.value); setPreset('CUSTOM'); }}
                    className={`py-2.5 rounded-xl font-bold text-xs border-2 transition-all ${
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
          </div>

          {/* House Rules Toggles */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">HOUSE RULES</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">+2 / +4 Card Stacking</div>
                    <div className="text-xs text-neutral-500">Stack matching draw cards onto opponents.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={stacking}
                  onChange={(e) => setStacking(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">7-Zero Swap & Rotate</div>
                    <div className="text-xs text-neutral-500">7 swaps hands; 0 rotates all hands.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sevenZero}
                  onChange={(e) => setSevenZero(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">Jump-In Rule</div>
                    <div className="text-xs text-neutral-500">Play exact matching card out of turn.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={jumpIn}
                  onChange={(e) => setJumpIn(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">Force Play Drawn Card</div>
                    <div className="text-xs text-neutral-500">Must play drawn card immediately if matching.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={forcePlay}
                  onChange={(e) => setForcePlay(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Room Preferences */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">ROOM PREFERENCES</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">Allow Spectators</div>
                    <div className="text-xs text-neutral-500">Allow players to watch match in real time.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowSpectators}
                  onChange={(e) => setAllowSpectators(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-uno-navy">In-Game Chat</div>
                    <div className="text-xs text-neutral-500">Enable text chat window during match.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableChat}
                  onChange={(e) => setEnableChat(e.target.checked)}
                  className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
                />
              </label>
            </div>
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

