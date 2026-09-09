import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, Users, Zap, RotateCcw, Ban, Sparkles, Trophy, ArrowLeft, Play, Lightbulb } from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';

export const HowToPlay: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-white pb-20">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO                                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 border-b border-neutral-100">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-uno-navy transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-uno-blue uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> OFFICIAL GAME GUIDE
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-uno-navy tracking-tight leading-tight">
              HOW TO PLAY <span className="text-uno-red">UNO</span>
            </h1>
            <p className="text-base text-neutral-600 font-medium max-w-xl">
              Learn the rules, card actions, and strategies to win matches against friends or AI opponents. No login required!
            </p>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/play"
                className="bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                START PLAYING NOW
              </Link>
              <Link
                to="/rules"
                className="bg-neutral-100 hover:bg-neutral-200 text-uno-navy font-bold px-6 py-3 rounded-full text-sm flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4" />
                CARD RULES REFERENCE
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center overflow-hidden py-4 sm:py-0">
            <div className="flex -space-x-8 transform -rotate-3 scale-75 sm:scale-100">
              <UnoCard color="RED" value="7" size="md" />
              <UnoCard color="BLUE" value="REVERSE" size="md" />
              <UnoCard color="YELLOW" value="SKIP" size="md" />
              <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* GAME OBJECTIVE & SETUP                                        */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        
        {/* Step 1: Objective */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-neutral-50 p-5 sm:p-8 rounded-3xl border border-neutral-200/80">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl sm:text-3xl font-black">
              🎯
            </div>
          </div>
          <div className="md:col-span-9 space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">THE OBJECTIVE</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-uno-navy">Be the First to Empty Your Hand</h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              The goal of UNO is to get rid of all your cards before any of your opponents do. Match cards by color or value, execute strategic action cards, call UNO when you have 1 card left, and win the match!
            </p>
          </div>
        </div>

        {/* Step 2: Setup & Dealing */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-neutral-50 p-5 sm:p-8 rounded-3xl border border-neutral-200/80">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-100 text-uno-blue flex items-center justify-center text-2xl sm:text-3xl font-black">
              🎴
            </div>
          </div>
          <div className="md:col-span-9 space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-uno-blue uppercase tracking-widest">GAME SETUP</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-uno-navy">Dealing 7 Cards Each</h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              Every player (2 to 4 players, human or AI) is dealt 7 face-down cards. The top card of the remaining deck is placed face-up to form the Discard Pile. The active turn direction starts Clockwise (CW).
            </p>
          </div>
        </div>

        {/* Step 3: Turn Flow & Matching Rules */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-neutral-50 p-5 sm:p-8 rounded-3xl border border-neutral-200/80">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100 text-uno-green flex items-center justify-center text-2xl sm:text-3xl font-black">
              🔄
            </div>
          </div>
          <div className="md:col-span-9 space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-uno-green uppercase tracking-widest">MATCHING CARDS</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-uno-navy">Matching Color, Number, or Symbol</h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              On your turn, you must play a card from your hand that matches the top discard card by:
            </p>
            <ul className="list-disc list-inside text-xs text-neutral-600 font-semibold space-y-1 pt-1 text-left">
              <li><strong>Matching Color</strong> (e.g. Red on Red)</li>
              <li><strong>Matching Number or Symbol</strong> (e.g. Yellow 7 on Blue 7, or Green Skip on Blue Skip)</li>
              <li><strong>Playing a Wild Card</strong> (Wild or Wild Draw Four can be played on any card!)</li>
            </ul>
          </div>
        </div>

        {/* Step 4: Drawing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-neutral-50 p-5 sm:p-8 rounded-3xl border border-neutral-200/80">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl sm:text-3xl font-black">
              📥
            </div>
          </div>
          <div className="md:col-span-9 space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">DRAWING CARDS</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-uno-navy">When You Cannot (or Choose Not to) Play</h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              If you don't have a matching card on your turn, click the <strong>Draw Card</strong> button to draw 1 card from the deck. If the drawn card is playable, you can play it immediately or end your turn.
            </p>
          </div>
        </div>

        {/* Step 5: Calling UNO & Winning */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center bg-neutral-50 p-5 sm:p-8 rounded-3xl border border-neutral-200/80">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-100 text-uno-red flex items-center justify-center text-2xl sm:text-3xl font-black">
              ⚡
            </div>
          </div>
          <div className="md:col-span-9 space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-uno-red uppercase tracking-widest">UNO CALL & WINNING</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-uno-navy">Calling UNO at 1 Card Remaining</h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              When you play your second-to-last card and have only <strong>1 card remaining</strong>, press the prominent <strong>UNO!</strong> button immediately. The first player to reach 0 cards wins the match!
            </p>
          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CTA                                                    */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-3xl p-10 shadow-xl space-y-4">
          <h2 className="text-3xl font-extrabold">READY TO PLAY?</h2>
          <p className="text-blue-100 text-sm font-medium">Test your skills in single player vs AI or jump into an online room!</p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/play"
              className="bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black px-8 py-3.5 rounded-full text-base flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              PLAY NOW
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
