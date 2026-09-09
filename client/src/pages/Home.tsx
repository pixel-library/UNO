import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Monitor, Users, Zap, BookOpen, ShieldCheck, Trophy, ArrowRight, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    const storedName = localStorage.getItem('uno_player_name');
    if (!storedName) {
      navigate('/enter-name');
    } else {
      navigate('/play');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Text */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-uno-blue font-bold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            THE CLASSIC CARD GAME, ONLINE
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-uno-navy tracking-tight leading-[1.08]">
            PLAY UNO <br />
            <span className="text-uno-red">ONLINE</span>
          </h1>

          <p className="text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 font-medium">
            Create or join a game room to play UNO with your friends in real time. No login required — jump straight into the action!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto bg-uno-yellow hover:bg-amber-400 text-uno-navy font-extrabold px-10 py-4 rounded-full text-base flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-5 h-5 fill-current" />
              PLAY NOW
            </button>
          </div>

          {/* Secondary Links */}
          <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <Link to="/how-to-play" className="flex items-center gap-1.5 hover:text-uno-navy">
              <BookOpen className="w-4 h-4" /> HOW TO PLAY
            </Link>
            <Link to="/rules" className="flex items-center gap-1.5 hover:text-uno-navy">
              <Layers className="w-4 h-4" /> RULES
            </Link>
          </div>
        </div>

        {/* Right Hero Cards Visual Composition */}
        <div className="lg:col-span-6 relative flex items-center justify-center pt-4 lg:pt-0 overflow-hidden sm:overflow-visible">
          
          {/* Background colorful blur strokes */}
          <div className="absolute w-72 h-72 bg-uno-yellow/20 rounded-full blur-3xl -top-10 -left-10" />
          <div className="absolute w-72 h-72 bg-uno-blue/20 rounded-full blur-3xl -bottom-10 -right-10" />
          
          {/* Decorative note */}
          <div className="absolute -top-4 right-4 hidden sm:block transform rotate-6 bg-yellow-100 text-amber-900 border border-yellow-300 font-sans font-bold px-3 py-1.5 rounded-lg text-xs shadow-md z-20">
            Same Cards. New Friends. More Fun!
          </div>

          {/* Dynamic Uno Cards Fan */}
          <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] flex items-center justify-center scale-75 sm:scale-100">
            
            {/* Card 1: Red Draw Two */}
            <div className="absolute transform -rotate-[24deg] -translate-x-24 sm:-translate-x-28 -translate-y-6 shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-30">
              <UnoCard color="RED" value="DRAW_TWO" size="lg" />
            </div>

            {/* Card 2: Blue Reverse */}
            <div className="absolute transform -rotate-[12deg] -translate-x-12 sm:-translate-x-14 -translate-y-12 shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-30">
              <UnoCard color="BLUE" value="REVERSE" size="lg" />
            </div>

            {/* Card 3: Yellow 7 */}
            <div className="absolute transform rotate-[2deg] translate-y-[-50px] shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-30">
              <UnoCard color="YELLOW" value="7" size="lg" />
            </div>

            {/* Card 4: Green Skip */}
            <div className="absolute transform rotate-[14deg] translate-x-12 sm:translate-x-14 -translate-y-12 shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-30">
              <UnoCard color="GREEN" value="SKIP" size="lg" />
            </div>

            {/* Card 5: Wild */}
            <div className="absolute transform rotate-[26deg] translate-x-24 sm:translate-x-28 -translate-y-6 shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-30">
              <UnoCard color="WILD" value="WILD" size="lg" />
            </div>

            {/* Foreground Overlapping UNO Face Down Card */}
            <div className="absolute transform rotate-[-8deg] translate-y-16 translate-x-4 shadow-2xl z-20 transition-transform duration-300 hover:scale-110">
              <UnoCard faceDown size="lg" />
            </div>

          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* PLAY YOUR WAY SECTION                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-neutral-50 py-20 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-uno-navy">PLAY YOUR WAY</h2>
          <p className="text-neutral-500 font-medium mt-2">Multiple game modes, endless fun.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            
            {/* Card 1: Create Game */}
            <div
              onClick={() => handleStartGame()}
              className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-uno-blue hover:shadow-xl transition-all text-left cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-uno-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-uno-navy">CREATE A GAME</h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Set player count, configure custom house rules, and invite your friends.
                </p>
              </div>
              <div className="mt-8 flex items-center text-xs font-bold text-uno-blue group-hover:translate-x-1 transition-transform">
                CREATE ROOM <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 2: Join Game */}
            <div
              onClick={() => handleStartGame()}
              className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-uno-navy">JOIN A GAME</h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Enter a room code or use an invite link to jump into your friend's game.
                </p>
              </div>
              <div className="mt-8 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                JOIN WITH CODE <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* THE CLASSIC GAME, REIMAGINED                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 rounded-3xl p-8 sm:p-14 border border-blue-100 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Cards Stack */}
          <div className="lg:col-span-6 flex justify-center overflow-hidden py-4 sm:py-0">
            <div className="flex -space-x-5 sm:-space-x-12 transform -rotate-3 scale-75 sm:scale-100">
              <UnoCard color="RED" value="7" size="md" />
              <UnoCard color="BLUE" value="REVERSE" size="md" />
              <UnoCard color="YELLOW" value="3" size="md" />
              <UnoCard color="GREEN" value="SKIP" size="md" />
              <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-uno-blue uppercase tracking-widest">THE CLASSIC GAME,</span>
            <h2 className="text-4xl font-extrabold text-uno-navy leading-tight">REIMAGINED</h2>
            <p className="text-neutral-600 leading-relaxed">
              Fast-paced. Colorful. Strategic. UNO brings people together with simple rules and endless excitement. Play seamlessly on desktop or mobile.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-uno-red"><Zap className="w-5 h-5" /></div>
                <span className="text-sm font-bold text-uno-navy">Fast Gameplay</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 text-amber-600"><Sparkles className="w-5 h-5" /></div>
                <span className="text-sm font-bold text-uno-navy">Colorful Cards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-uno-green"><Layers className="w-5 h-5" /></div>
                <span className="text-sm font-bold text-uno-navy">Action Cards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-uno-blue"><Users className="w-5 h-5" /></div>
                <span className="text-sm font-bold text-uno-navy">Real-time Multiplayer</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* POWERFUL UNO CARDS                                            */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-neutral-50 py-20 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-uno-navy">POWERFUL UNO CARDS</h2>
          <p className="text-neutral-500 font-medium mt-2">Each card brings a new strategy.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-12">
            
            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="RED" value="7" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Number</h4>
              <p className="text-xs text-neutral-500 mt-1">Match the number or color.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="YELLOW" value="SKIP" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Skip</h4>
              <p className="text-xs text-neutral-500 mt-1">Next player skips their turn.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="BLUE" value="REVERSE" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Reverse</h4>
              <p className="text-xs text-neutral-500 mt-1">Change the direction of play.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="RED" value="DRAW_TWO" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Draw Two</h4>
              <p className="text-xs text-neutral-500 mt-1">Next player draws 2 cards.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="WILD" value="WILD" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Wild</h4>
              <p className="text-xs text-neutral-500 mt-1">Choose the active game color.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col items-center">
              <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
              <h4 className="font-bold text-sm text-uno-navy mt-4">Wild Draw Four</h4>
              <p className="text-xs text-neutral-500 mt-1">Choose color & make next draw 4.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW TO PLAY SECTION                                           */}
      {/* ------------------------------------------------------------- */}
      <section id="how-to-play" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-uno-navy">HOW TO PLAY</h2>
          <p className="text-neutral-500 font-medium mt-2">It's simple. Just 4 steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 relative text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-full bg-blue-100 text-uno-blue font-extrabold text-sm flex items-center justify-center mb-4">01</span>
            <h3 className="font-bold text-uno-navy">Enter your name</h3>
            <p className="text-xs text-neutral-500 mt-2">No login required. Pick a nickname and start playing.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 relative text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-extrabold text-sm flex items-center justify-center mb-4">02</span>
            <h3 className="font-bold text-uno-navy">Create or join</h3>
            <p className="text-xs text-neutral-500 mt-2">Create a private game, join with code, or play vs AI.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 relative text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-full bg-emerald-100 text-uno-green font-extrabold text-sm flex items-center justify-center mb-4">03</span>
            <h3 className="font-bold text-uno-navy">Play your cards</h3>
            <p className="text-xs text-neutral-500 mt-2">Match colors, numbers, or play action & wild cards.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 relative text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-full bg-red-100 text-uno-red font-extrabold text-sm flex items-center justify-center mb-4">04</span>
            <h3 className="font-bold text-uno-navy">Reach zero cards</h3>
            <p className="text-xs text-neutral-500 mt-2">Call UNO when you have 1 card left & win the game!</p>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CTA SECTION                                             */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-sky-600 rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl relative overflow-hidden flex flex-col items-center">
          
          <h2 className="text-4xl font-extrabold tracking-tight">READY TO PLAY?</h2>
          <p className="text-blue-100 max-w-md mt-3 font-medium">Grab your friends, join a room, and let the games begin!</p>

          <button
            onClick={handleStartGame}
            className="mt-8 bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black px-10 py-4 rounded-full text-lg flex items-center gap-3 shadow-2xl transition-transform hover:scale-105 active:scale-100"
          >
            <Play className="w-6 h-6 fill-current" />
            START GAME
          </button>
        </div>
      </section>

    </div>
  );
};
