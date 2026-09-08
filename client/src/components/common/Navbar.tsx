import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Play, Trophy, BookOpen, HelpCircle, Settings } from 'lucide-react';

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
    <nav className="w-full bg-white border-b border-neutral-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3 py-1 rounded-xl shadow-md transform -rotate-6 transition-transform group-hover:scale-105 group-hover:rotate-0">
            <span className="font-extrabold text-2xl tracking-tighter italic font-sans">
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`text-sm font-semibold transition-colors relative py-1 ${
                  active ? 'text-uno-navy font-bold' : 'text-neutral-600 hover:text-uno-navy'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-uno-yellow rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handlePlayNow}
            className="bg-uno-yellow hover:bg-amber-400 text-uno-navy font-bold px-6 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-4 h-4 fill-current" />
            PLAY NOW
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-semibold text-neutral-800 hover:text-uno-navy py-2"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              handlePlayNow();
            }}
            className="w-full bg-uno-yellow text-uno-navy font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            PLAY NOW
          </button>
        </div>
      )}
    </nav>
  );
};
