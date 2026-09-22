import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gamepad2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Brand Badge */}
        <div className="flex items-center gap-4">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3.5 py-1 rounded-2xl shadow-lg -rotate-6 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FCD116]" />
            <span className="font-black text-xl italic text-white tracking-tighter font-display">
              <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white tracking-tight">
              UNO ONLINE
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Play. Match. Win. Zero login required.
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/play" className="hover:text-emerald-400 transition-colors">Play Now</Link>
          <Link to="/how-to-play" className="hover:text-sky-400 transition-colors">How to Play</Link>
          <Link to="/rules" className="hover:text-purple-400 transition-colors">Card Rules</Link>
          <Link to="/settings" className="hover:text-amber-400 transition-colors">Settings</Link>
        </div>

        {/* Color Dots */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E52521] shadow-xs" title="Red" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCD116] shadow-xs" title="Yellow" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D963F] shadow-xs" title="Green" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#0082CA] shadow-xs" title="Blue" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
        <div>
          &copy; {new Date().getFullYear()} UNO Platform. Built for real-time multiplayer fun.
        </div>
        <div className="flex items-center gap-1 text-slate-400 font-semibold">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>for card game fans worldwide</span>
        </div>
      </div>
    </footer>
  );
};

