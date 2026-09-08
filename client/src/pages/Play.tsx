import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Monitor, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const Play: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-uno-navy">CHOOSE GAME MODE</h1>
          <p className="text-sm font-medium text-neutral-500">
            Play online with friends, challenge computer AI, or join an existing room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Play Online */}
          <div
            onClick={() => navigate('/create-game')}
            className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-uno-blue hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-uno-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-uno-navy">PLAY ONLINE</h2>
              <p className="text-sm text-neutral-500 mt-2">
                Create a public or private room and play UNO with real players online.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-uno-blue group-hover:translate-x-1 transition-transform">
              CREATE MULTIPLAYER ROOM <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 2: Play VS Computer */}
          <div
            onClick={() => navigate('/computer')}
            className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Monitor className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-uno-navy">PLAY VS COMPUTER</h2>
              <p className="text-sm text-neutral-500 mt-2">
                Play instant single-player UNO against intelligent AI opponents.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              PLAY VS AI <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 3: Create Private Game */}
          <div
            onClick={() => navigate('/create-game')}
            className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-uno-navy">CREATE PRIVATE GAME</h2>
              <p className="text-sm text-neutral-500 mt-2">
                Set custom house rules, select player limit, and generate an invite code.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              CONFIGURE ROOM <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 4: Join Game */}
          <div
            onClick={() => navigate('/join-game')}
            className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-uno-navy">JOIN GAME</h2>
              <p className="text-sm text-neutral-500 mt-2">
                Enter a 6-character room code from your friend to join immediately.
              </p>
            </div>
            <div className="mt-8 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              ENTER ROOM CODE <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
