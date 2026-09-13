import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  RotateCcw,
  Ban,
  Sparkles,
  RefreshCw,
  Hash,
  Minus,
  Zap,
  ArrowLeft,
  Trophy,
  HelpCircle,
  Flame,
  Shield,
  Shuffle,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';

export const Rules: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'standard' | 'action' | 'special' | 'scoring'>('all');

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans selection:bg-uno-yellow selection:text-slate-950">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO                                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-10 pb-16 border-b border-slate-800">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-uno-blue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-uno-red/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uno-blue/10 border border-uno-blue/30 text-sky-400 text-xs font-black uppercase tracking-widest">
                <Layers className="w-4 h-4" /> OFFICIAL & HOUSE RULES REFERENCE MANUAL
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
                UNO CARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green">RULES</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
                Explore every card's exact mechanics, total deck breakdown, +2 / +4 stacking rules, deflect shields, and end-of-game scoring!
              </p>
            </div>

            {/* Visual Fanned Deck */}
            <div className="lg:col-span-5 flex justify-center py-4">
              <div className="flex -space-x-10 transform rotate-3 scale-90 sm:scale-100">
                <UnoCard color="RED" value="7" size="md" />
                <UnoCard color="BLUE" value="REVERSE" size="md" />
                <UnoCard color="GREEN" value="SKIP" size="md" />
                <UnoCard color="YELLOW" value="DRAW_TWO" size="md" />
                <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FILTER BUTTONS & DECK STATS BADGES                            */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
            <span className="text-2xl font-black text-amber-400">108</span>
            <span className="block text-xs font-bold text-slate-400">Cards in Standard Deck</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
            <span className="text-2xl font-black text-sky-400">4</span>
            <span className="block text-xs font-bold text-slate-400">Colors (Red, Blue, Green, Yellow)</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
            <span className="text-2xl font-black text-purple-400">2 - 4</span>
            <span className="block text-xs font-bold text-slate-400">Players Allowed</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
            <span className="text-2xl font-black text-emerald-400">500</span>
            <span className="block text-xs font-bold text-slate-400">Points to Win Tournament</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start border-b border-slate-800 pb-4">
          {(
            [
              { id: 'all', label: 'All Cards & Rules', icon: Layers },
              { id: 'standard', label: 'Standard Cards', icon: CheckCircle2 },
              { id: 'action', label: 'Action Cards (+2/Skip/Reverse)', icon: Flame },
              { id: 'special', label: 'Wild & House Rules', icon: Sparkles },
              { id: 'scoring', label: 'Scoring System', icon: Trophy },
            ] as const
          ).map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  filterCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARDS GRID DISPLAY                                            */}
        {/* ------------------------------------------------------------- */}
        {filterCategory !== 'scoring' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Basic Number Cards */}
            {(filterCategory === 'all' || filterCategory === 'standard') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-sky-400 text-xs font-extrabold border border-blue-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> STANDARD CARDS (0-9)
                  </div>
                  <h3 className="text-lg font-extrabold text-white">Number Cards</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Standard number cards range from 0 to 9 in each of the 4 colors (Red, Blue, Green, Yellow). Match the color or number to discard.
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 py-2 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <UnoCard color="RED" value="1" size="sm" />
                  <UnoCard color="YELLOW" value="5" size="sm" />
                  <UnoCard color="GREEN" value="8" size="sm" />
                  <UnoCard color="BLUE" value="3" size="sm" />
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 76 cards</span>
                  <span className="text-amber-400">Score: Face Value</span>
                </div>
              </div>
            )}

            {/* 2. Skip Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold border border-amber-500/20">
                    <Ban className="w-3.5 h-3.5" /> ACTION CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">SKIP Card</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    When played, the next player loses their turn immediately. Can be played on a matching color or on another Skip card.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="YELLOW" value="SKIP" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white block">Skip Next Turn</span>
                    <span className="text-slate-400 text-[11px] block">Also used in Deflect Shield rule!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-400">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 3. Reverse Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-extrabold border border-purple-500/20">
                    <RotateCcw className="w-3.5 h-3.5" /> ACTION CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">REVERSE Card</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Reverses the turn order (Clockwise ➔ Counter-Clockwise). In a 2-player match, Reverse acts identically to a Skip card!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="RED" value="REVERSE" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white block">Reverse Turn Direction</span>
                    <span className="text-slate-400 text-[11px] block">Swaps turn rotation order</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-400">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 4. Draw Two (+2) Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/20">
                    <Flame className="w-3.5 h-3.5" /> STACKING ACTION
                  </div>
                  <h3 className="text-lg font-extrabold text-white">DRAW TWO (+2) Card</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Forces the next player to draw 2 cards. If <strong className="text-amber-400">Stacking</strong> is enabled, the next player can counter-stack another +2 or +4 to pass an accumulated penalty!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="BLUE" value="DRAW_TWO" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-rose-400 block">+2 Penalty Attack</span>
                    <span className="text-slate-400 text-[11px] block">Stacks up to +4, +6, +8!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-400">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 5. Wild Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-uno-yellow text-xs font-extrabold border border-yellow-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> WILD CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">WILD Card</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Can be played on any turn regardless of top discard card color. Allows the player to select the active color (Red, Blue, Green, Yellow).
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-uno-yellow block">Choose Active Color</span>
                    <span className="text-slate-400 text-[11px] block">Playable on any card!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 4 cards</span>
                  <span className="text-amber-400">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 6. Wild Draw Four (+4) Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5" /> ULTIMATE WILD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">WILD DRAW FOUR (+4)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Choose the active color AND forces the next player to draw 4 cards! Can be stacked with +2 cards if Stacking mode is active.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-400 block">+4 Penalty & Color Choice</span>
                    <span className="text-slate-400 text-[11px] block">Most powerful card in game!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>Count in Deck: 4 cards</span>
                  <span className="text-amber-400">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 7. Discard All Color */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> HOUSE RULE CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">DISCARD ALL COLOR</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Immediately discards every single card of that matching color from your hand in one giant move!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="RED" value="DISCARD_ALL" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-rose-400 block">Clear Entire Color Hand</span>
                    <span className="text-slate-400 text-[11px] block">Great for fast hand emptying!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>House Rule Toggle</span>
                  <span className="text-amber-400">Score: 30 Points</span>
                </div>
              </div>
            )}

            {/* 8. Wild Swap Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-extrabold border border-indigo-500/20">
                    <Shuffle className="w-3.5 h-3.5" /> HOUSE RULE CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">WILD SWAP</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Choose active game color and select any opponent to swap your entire hand of cards with!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD_SWAP" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-indigo-400 block">Swap Hand with Player</span>
                    <span className="text-slate-400 text-[11px] block">Steal the leader's small hand!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>House Rule Toggle</span>
                  <span className="text-amber-400">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 9. Wild Shuffle Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/20">
                    <RotateCcw className="w-3.5 h-3.5" /> HOUSE RULE CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-white">WILD SHUFFLE</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Collect all active player hands into one pile, shuffle them, and redistribute cards evenly among players!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD_SHUFFLE" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block">Reshuffle All Hands</span>
                    <span className="text-slate-400 text-[11px] block">Completely resets card advantage!</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-semibold flex justify-between">
                  <span>House Rule Toggle</span>
                  <span className="text-amber-400">Score: 50 Points</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCORING BREAKDOWN SECTION                                     */}
        {/* ------------------------------------------------------------- */}
        {(filterCategory === 'all' || filterCategory === 'scoring') && (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 mt-12">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">End-of-Match Scoring System</h3>
                <p className="text-xs text-slate-400">Points earned when a player wins a round by emptying their hand</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Category 1 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                  NUMBER CARDS (0-9)
                </span>
                <div className="text-2xl font-black text-white pt-1">Face Value</div>
                <p className="text-xs text-slate-400">
                  Card 7 = 7 points, Card 3 = 3 points. Totaled from opponents' remaining hands.
                </p>
              </div>

              {/* Score Category 2 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                  ACTION CARDS
                </span>
                <div className="text-2xl font-black text-amber-400 pt-1">20 Points Each</div>
                <p className="text-xs text-slate-400">
                  Draw Two (+2), Skip, and Reverse cards are worth 20 points each.
                </p>
              </div>

              {/* Score Category 3 */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">
                  WILD & HOUSE CARDS
                </span>
                <div className="text-2xl font-black text-yellow-400 pt-1">50 Points Each</div>
                <p className="text-xs text-slate-400">
                  Wild, Wild Draw Four (+4), Wild Swap, Wild Shuffle, and Discard All cards are worth 50 points!
                </p>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM REMEMBER TIP CONTAINER                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base uppercase tracking-wider">KEY RULE TO REMEMBER</h3>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed max-w-2xl">
                Always hit the <strong className="text-uno-yellow font-black uppercase">UNO!</strong> button when playing down to your final card. If an opponent catches you before you call it, they can force you to draw +2 penalty cards!
              </p>
            </div>
          </div>
          <Link
            to="/how-to-play"
            className="bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors border border-slate-700 shrink-0"
          >
            Visual Game Guide ➔
          </Link>
        </div>
      </section>

    </div>
  );
};
