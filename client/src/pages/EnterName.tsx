import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowRight, Sparkles, Smile } from 'lucide-react';
import { validatePlayerName } from '@shared/validation/roomValidator';

const AVATARS = ['🦊', '🐯', '🚀', '👑', '⚡', '🎮', '🦄', '🎲', '🏆', '🦁', '🔮', '🌟'];

export const EnterName: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingName = localStorage.getItem('uno_player_name');
    if (existingName) {
      setName(existingName);
    }
    const existingAvatar = localStorage.getItem('uno_player_avatar');
    if (existingAvatar) {
      setAvatar(existingAvatar);
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
    localStorage.setItem('uno_player_avatar', avatar);

    if (!localStorage.getItem('uno_player_id')) {
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('uno_player_id', guestId);
    }

    const returnTo = (location.state as any)?.returnTo || '/play';
    navigate(returnTo);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex items-center justify-center px-4 py-12 font-sans selection:bg-[#FCD116]">
      <div className="max-w-md w-full glass-white-panel rounded-3xl p-8 sm:p-10 border border-white shadow-2xl space-y-8 text-center relative overflow-hidden">
        
        {/* Background Subtle Color Glows */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Selected Avatar Preview Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFE033] via-[#FCD116] to-[#D9AC00] border-4 border-white text-4xl flex items-center justify-center mx-auto shadow-xl transform -rotate-3 transition-transform duration-300 hover:rotate-0 hover:scale-105">
            {avatar}
          </div>
          <span className="absolute -bottom-2 -right-2 bg-slate-900 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700 shadow-sm uppercase tracking-wider">
            AVATAR
          </span>
        </div>

        <div>
          <span className="text-xs font-black text-uno-blue uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> PLAYER IDENTITY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            CHOOSE YOUR NICKNAME
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Select your avatar & nickname to identify yourself in multiplayer lobbies. No registration required!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* Avatar Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-500" /> PICK AN AVATAR
            </label>
            <div className="grid grid-cols-6 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-amber-400 border-2 border-slate-900 shadow-md scale-110'
                      : 'bg-white hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300 transition-colors bg-white/90"
                autoFocus
              />
              <span className="absolute right-4 top-4.5 text-xs font-bold text-slate-400">
                {name.length}/16
              </span>
            </div>
            {error && (
              <p className="text-xs font-extrabold text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Tactile 3D Continue Button */}
          <button
            type="submit"
            className="w-full btn-3d-yellow py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 tracking-wider uppercase"
          >
            CONTINUE TO GAME
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 font-medium">
          🔒 Guest identity saved locally in your browser.
        </p>

      </div>
    </div>
  );
};

