import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Users, Zap, BookOpen, ShieldCheck, ArrowRight, Layers, Sparkles, Trophy, Gamepad2 } from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';
import { useScroll3D } from '@/hooks/useScroll3D';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  useScroll3D();

  const handleStartGame = () => {
    const storedName = localStorage.getItem('uno_player_name');
    if (!storedName) {
      navigate('/enter-name');
    } else {
      navigate('/play');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-[#FCD116] selection:text-slate-950">
      
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center scroll-3d-reveal">
        
        {/* Dynamic Background Glowing Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Left Hero Content */}
        <div className="lg:col-span-6 space-y-7 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-uno-blue font-black text-xs tracking-widest uppercase shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            REAL-TIME MULTIPLAYER CARD GAME
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
            PLAY UNO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D20] via-[#FCD116] to-[#0095FF]">
              ONLINE
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Create private rooms or join public lobbies to play UNO with your friends in real time. Zero login required — pick a nickname and deal cards!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="bg-[#FCD116] hover:bg-[#f3c807] active:bg-[#e2b700] text-slate-950 font-black px-6 py-3 rounded-xl text-sm tracking-wider flex items-center justify-center gap-2 uppercase transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current text-slate-950" />
              PLAY NOW
            </button>

            <button
              onClick={handleStartGame}
              className="bg-[#E52521] hover:bg-[#d41c18] active:bg-[#c21411] text-white font-black px-6 py-3 rounded-xl text-sm tracking-wider flex items-center justify-center gap-2 uppercase transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              PLAY VS COMPUTER 🤖
            </button>

            <div className="flex items-center gap-1 pl-2">
              <Link
                to="/how-to-play"
                className="text-slate-600 hover:text-uno-blue font-bold text-sm px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-uno-blue" />
                How to Play
              </Link>

              <span className="text-slate-300">•</span>

              <Link
                to="/rules"
                className="text-slate-600 hover:text-emerald-600 font-bold text-sm px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                Rules
              </Link>
            </div>
          </div>


          {/* Feature Badges */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> No Accounts
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Real-Time Sockets
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Smart AI Bots
            </div>
          </div>
        </div>

        {/* Right Hero Interactive Cards Fan */}
        <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0 z-10">
          
          <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[440px] flex items-center justify-center scale-95 sm:scale-100">
            
            {/* Card 1: Red Draw Two */}
            <div className="absolute transform -rotate-[22deg] -translate-x-32 sm:-translate-x-40 -translate-y-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
              <UnoCard color="RED" value="DRAW_TWO" size="md" />
            </div>

            {/* Card 2: Blue Reverse */}
            <div className="absolute transform -rotate-[11deg] -translate-x-16 sm:-translate-x-20 -translate-y-8 shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
              <UnoCard color="BLUE" value="REVERSE" size="md" />
            </div>

            {/* Card 3: Yellow 7 */}
            <div className="absolute transform rotate-[0deg] translate-y-[-44px] shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
              <UnoCard color="YELLOW" value="7" size="md" />
            </div>

            {/* Card 4: Green Skip */}
            <div className="absolute transform rotate-[11deg] translate-x-16 sm:translate-x-20 -translate-y-8 shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
              <UnoCard color="GREEN" value="SKIP" size="md" />
            </div>

            {/* Card 5: Wild Draw Four */}
            <div className="absolute transform rotate-[22deg] translate-x-32 sm:translate-x-40 -translate-y-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:z-30 cursor-pointer">
              <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
            </div>

            {/* Foreground UNO Face Down Card */}
            <div className="absolute transform rotate-[-6deg] translate-y-12 translate-x-2 shadow-2xl z-20 transition-all duration-300 hover:scale-110 cursor-pointer">
              <UnoCard faceDown size="md" />
            </div>

          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* PLAY YOUR WAY SECTION                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-100/80 py-20 border-y border-slate-200/80 scroll-3d-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-black text-uno-blue uppercase tracking-widest">MULTIPLE MODES</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">PLAY YOUR WAY</h2>
          <p className="text-slate-600 font-medium max-w-lg mx-auto text-sm sm:text-base">
            Challenge smart AI computer bots, configure custom house rules, or jump into public multiplayer lobbies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12 text-left">
            
            {/* Card 1: VS Computer */}
            <div
              onClick={handleStartGame}
              className="glass-white-card p-8 rounded-3xl border border-white hover:border-amber-400 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between scroll-3d-card"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">VS COMPUTER 🤖</h3>
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  Instant offline matches vs AI bots! Choose 2 Players (1v1), 3 Players (1v2 AI), or 4 Players (1v3 AI).
                </p>
              </div>
              <div className="mt-8 flex items-center text-xs font-black text-amber-600 group-hover:translate-x-2 transition-transform uppercase tracking-wider">
                PLAY VS BOTS <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>

            {/* Card 2: Create Game */}
            <div
              onClick={handleStartGame}
              className="glass-white-card p-8 rounded-3xl border border-white hover:border-uno-blue/50 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between scroll-3d-card"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-uno-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">CREATE MULTIPLAYER</h3>
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  Set player capacity, enable custom house rules (+2/+4 stacking, 7-Zero, Jump-In), and share invite links.
                </p>
              </div>
              <div className="mt-8 flex items-center text-xs font-black text-uno-blue group-hover:translate-x-2 transition-transform uppercase tracking-wider">
                CREATE ROOM <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>

            {/* Card 3: Join Game */}
            <div
              onClick={handleStartGame}
              className="glass-white-card p-8 rounded-3xl border border-white hover:border-emerald-500/50 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between scroll-3d-card"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">JOIN A GAME</h3>
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  Enter a 6-character room code or browse active public lobbies to join matches instantly.
                </p>
              </div>
              <div className="mt-8 flex items-center text-xs font-black text-emerald-600 group-hover:translate-x-2 transition-transform uppercase tracking-wider">
                JOIN LOBBY <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* POWERFUL UNO CARDS GALLERY                                    */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-3d-reveal">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest">DECK MECHANICS</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">POWERFUL UNO CARDS</h2>
          <p className="text-slate-600 font-medium max-w-md mx-auto text-sm">
            Each card brings tactical depth, penalty stacks, or sudden direction flips!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="RED" value="7" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Number Card</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Match number or color to discard.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="YELLOW" value="SKIP" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Skip Card</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Next player skips their turn.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="BLUE" value="REVERSE" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Reverse Card</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Reverse the order of play.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="GREEN" value="DRAW_TWO" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Draw Two (+2)</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Forces next player to draw 2 cards.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="WILD" value="WILD" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Wild Card</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Choose active active game color.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
            <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
            <h4 className="font-extrabold text-sm text-slate-900 mt-4">Wild Draw Four (+4)</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Choose color & make next draw +4.</p>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CTA SECTION                                             */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display">READY TO MATCH CARDS?</h2>
          <p className="text-sky-100 max-w-md mt-3 font-medium text-sm sm:text-base">
            Gather your friends, create a game room, and show off your UNO skills!
          </p>

          <button
            onClick={handleStartGame}
            className="mt-6 bg-[#FCD116] hover:bg-[#f3c807] active:scale-95 text-slate-950 font-black px-6 py-3 rounded-xl text-sm tracking-wider flex items-center gap-2 uppercase transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap border border-amber-400/50"
          >
            <Play className="w-4 h-4 fill-current text-slate-950" />
            START MULTIPLAYER MATCH
          </button>
        </div>
      </section>

    </div>
  );
};

