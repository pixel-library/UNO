import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { validatePlayerName } from '@shared/validation/roomValidator';

export const EnterName: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingName = localStorage.getItem('uno_player_name');
    if (existingName) {
      setName(existingName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlayerName(name);

    if (!validation.valid) {
      setError(validation.error || 'Invalid name');
      return;
    }

    const finalName = validation.sanitizedName || name.trim();
    localStorage.setItem('uno_player_name', finalName);

    if (!localStorage.getItem('uno_player_id')) {
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('uno_player_id', guestId);
    }

    navigate('/play');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xl space-y-8 text-center">
        
        {/* Top Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-uno-yellow border-2 border-amber-300 flex items-center justify-center mx-auto transform -rotate-3 shadow-md">
          <User className="w-8 h-8 text-uno-navy" />
        </div>

        <div>
          <span className="text-xs font-bold text-uno-blue uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> GUEST SESSION
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-uno-navy tracking-tight mt-2">
            WHAT SHOULD WE CALL YOU?
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">
            Enter a nickname to identify yourself in multiplayer rooms. No login required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              YOUR NICKNAME
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Rudra"
                className="w-full px-5 py-4 rounded-xl border-2 border-neutral-200 focus:border-uno-blue focus:outline-none font-bold text-lg text-uno-navy placeholder:text-neutral-300 transition-colors"
                autoFocus
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-neutral-400">
                {name.length}/16
              </span>
            </div>
            {error && (
              <p className="text-xs font-bold text-uno-red mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-100"
          >
            CONTINUE
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-xs text-neutral-400 font-medium">
          🔒 Temporary session identity stored in your browser. No permanent accounts.
        </p>

      </div>
    </div>
  );
};
