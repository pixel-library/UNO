import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo (Clicking goes to Home Page '/') */}
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer perspective-500">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3.5 py-1 rounded-2xl shadow-[0_4px_12px_rgba(229,37,33,0.35)] transform -rotate-6 transition-all duration-200 group-hover:scale-105 group-hover:rotate-0 card-3d-tilt flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FCD116] animate-pulse" />
            <span className="font-black text-xl sm:text-2xl tracking-tighter italic font-sans drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-800 uppercase font-sans">
            ONLINE
          </span>
        </Link>

        {/* Right: Settings Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-extrabold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-700" />
            <span>SETTINGS</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

