import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo (Clicking goes to Home Page '/') */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3.5 py-1 rounded-xl shadow-md transform -rotate-6 transition-transform group-hover:scale-105 group-hover:rotate-0">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tighter italic font-sans">
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <span className="font-black text-xs sm:text-sm tracking-wider text-slate-800 uppercase">ONLINE</span>
        </Link>

        {/* Right: Settings Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>SETTINGS</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

