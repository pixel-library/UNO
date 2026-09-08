import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Brand */}
        <div className="flex items-center gap-4">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-3 py-1 rounded-xl shadow-sm -rotate-6">
            <span className="font-extrabold text-xl italic text-white tracking-tighter">
              <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <span className="text-sm font-semibold text-neutral-500">
            UNO — Play. Match. Win.
          </span>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-neutral-600">
          <Link to="/" className="hover:text-uno-navy">Home</Link>
          <Link to="/play" className="hover:text-uno-navy">Play</Link>
          <Link to="/how-to-play" className="hover:text-uno-navy">How to Play</Link>
          <Link to="/rules" className="hover:text-uno-navy">Rules</Link>
          <Link to="/settings" className="hover:text-uno-navy">Settings</Link>
          <Link to="/#about" className="hover:text-uno-navy">About</Link>
        </div>

        {/* Social Icons (Visual placeholders) */}
        <div className="flex items-center gap-4 text-neutral-400">
          <span className="hover:text-neutral-700 cursor-pointer font-bold">🎮</span>
          <span className="hover:text-neutral-700 cursor-pointer font-bold">𝕏</span>
          <span className="hover:text-neutral-700 cursor-pointer font-bold">▶</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} UNO Platform. Free open-source multiplayer card game platform. No accounts or login required.
      </div>
    </footer>
  );
};
