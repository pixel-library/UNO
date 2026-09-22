import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Sparkles, Play, BookOpen, Layers, UserCheck, Edit3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerAvatar, setPlayerAvatar] = useState<string>('🦊');

  useEffect(() => {
    const storedName = localStorage.getItem('uno_player_name');
    const storedAvatar = localStorage.getItem('uno_player_avatar');
    setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="bg-[#E52521] border border-[#FCD116] px-2.5 py-0.5 rounded-xl shadow-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FCD116] animate-pulse" />
            <span className="font-black text-lg sm:text-xl tracking-tighter italic font-display text-white">
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-xs tracking-widest text-slate-900 uppercase">
              ONLINE
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              MULTIPLAYER
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          <Link
            to="/play"
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              isActive('/play')
                ? 'bg-white text-uno-blue shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            PLAY
          </Link>

          <Link
            to="/how-to-play"
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              isActive('/how-to-play')
                ? 'bg-white text-uno-blue shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            HOW TO PLAY
          </Link>

          <Link
            to="/rules"
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              isActive('/rules')
                ? 'bg-white text-uno-blue shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            RULES
          </Link>
        </div>

        {/* Right Actions: Player Change Name Badge & Settings */}
        <div className="flex items-center gap-2">
          {/* Change Name Badge */}
          <button
            onClick={() => navigate('/enter-name')}
            className="bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Click to Change Name"
          >
            <span className="text-base">{playerAvatar}</span>
            <span className="max-w-[70px] sm:max-w-[110px] truncate font-black text-slate-900 text-xs">
              {playerName || 'Set Name'}
            </span>
            <Edit3 className="w-3 h-3 text-amber-600 shrink-0" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </nav>
  );
};



