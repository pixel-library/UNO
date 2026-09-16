import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Play, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Play', path: '/play' },
    { label: 'How to Play', path: '/how-to-play' },
    { label: 'Rules', path: '/rules' },
    { label: 'Settings', path: '/settings' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false;
    return location.pathname.startsWith(path);
  };

  const handlePlayNow = () => {
    const storedName = localStorage.getItem('uno_player_name');
    if (storedName) {
      navigate('/play');
    } else {
      navigate('/enter-name');
    }
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3.5 py-1 rounded-xl shadow-md transform -rotate-6 transition-transform group-hover:scale-105 group-hover:rotate-0">
            <span className="font-extrabold text-2xl tracking-tighter italic font-sans">
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <span className="font-black text-sm tracking-wider text-slate-800 uppercase hidden sm:inline-block">ONLINE</span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-xs font-extrabold transition-all px-4 py-2 rounded-full ${
                  active 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handlePlayNow}
            className="bg-gradient-to-r from-[#FCD116] to-[#F5A623] hover:from-[#FFE033] hover:to-[#FCD116] text-slate-950 font-black px-6 py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-slate-950" />
            PLAY NOW
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-pop-scale">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-bold text-slate-800 hover:text-sky-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              handlePlayNow();
            }}
            className="w-full bg-gradient-to-r from-[#FCD116] to-[#F5A623] text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            PLAY NOW
          </button>
        </div>
      )}
    </nav>
  );
};

