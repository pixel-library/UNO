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
import { useScroll3D } from '@/hooks/useScroll3D';

export const Rules: React.FC = () => {
  useScroll3D();
  const [filterCategory, setFilterCategory] = useState<'all' | 'standard' | 'action' | 'special' | 'scoring' | 'no_mercy'>('all');

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-800 pb-20 font-sans selection:bg-[#FCD116] selection:text-slate-950">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO (WHITE THEME)                                     */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white/80 backdrop-blur-md pt-10 pb-16 border-b border-slate-200/80 shadow-sm">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-black uppercase tracking-widest shadow-xs">
                <Layers className="w-4 h-4 text-sky-600" /> OFFICIAL & HOUSE RULES REFERENCE MANUAL
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
                UNO CARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600">RULES</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
                Explore every card's exact mechanics, total deck breakdown, +2 / +4 stacking rules, deflect shields, and end-of-game scoring!
              </p>
            </div>

            {/* Visual Fanned Deck (Non-Clashing Fan) */}
            <div className="lg:col-span-5 flex justify-center py-4">
              <div className="flex -space-x-3 sm:-space-x-5 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
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
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-xs">
            <span className="text-2xl font-black text-amber-600">108</span>
            <span className="block text-xs font-bold text-slate-500">Cards in Standard Deck</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-xs">
            <span className="text-2xl font-black text-sky-600">4</span>
            <span className="block text-xs font-bold text-slate-500">Colors (Red, Blue, Green, Yellow)</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-xs">
            <span className="text-2xl font-black text-purple-600">2 - 4</span>
            <span className="block text-xs font-bold text-slate-500">Players Allowed</span>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 text-center space-y-1 shadow-xs">
            <span className="text-2xl font-black text-emerald-600">500</span>
            <span className="block text-xs font-bold text-slate-500">Points to Win Tournament</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start border-b border-slate-200 pb-4">
          {(
            [
              { id: 'all', label: 'All Cards & Rules', icon: Layers },
              { id: 'standard', label: 'Standard Cards', icon: CheckCircle2 },
              { id: 'action', label: 'Action Cards (+2/Skip/Reverse)', icon: Flame },
              { id: 'special', label: 'Wild & House Rules', icon: Sparkles },
              { id: 'no_mercy', label: "No Mercy Expansion 💀", icon: Flame },
              { id: 'scoring', label: 'Scoring System', icon: Trophy },
            ] as const
          ).map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  filterCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-extrabold border border-sky-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> STANDARD CARDS (0-9)
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Number Cards</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Standard number cards range from 0 to 9 in each of the 4 colors (Red, Blue, Green, Yellow). Match the color or number to discard.
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <UnoCard color="RED" value="1" size="sm" />
                  <UnoCard color="YELLOW" value="5" size="sm" />
                  <UnoCard color="GREEN" value="8" size="sm" />
                  <UnoCard color="BLUE" value="3" size="sm" />
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 76 cards</span>
                  <span className="text-amber-600">Score: Face Value</span>
                </div>
              </div>
            )}

            {/* 2. Skip Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                    <Ban className="w-3.5 h-3.5 text-amber-600" /> ACTION CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">SKIP Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    When played, the next player loses their turn immediately. Can be played on a matching color or on another Skip card.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="YELLOW" value="SKIP" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">Skip Next Turn</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Also used in Deflect Shield rule!</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-600">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 3. Reverse Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-extrabold border border-purple-200">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> ACTION CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">REVERSE Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Reverses the turn order (Clockwise ➔ Counter-Clockwise). In a 2-player match, Reverse acts identically to a Skip card!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="RED" value="REVERSE" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">Reverse Turn Direction</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Swaps turn rotation order</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-600">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 4. Draw Two (+2) Card */}
            {(filterCategory === 'all' || filterCategory === 'action') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
                    <Flame className="w-3.5 h-3.5 text-red-600" /> STACKING ACTION
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">DRAW TWO (+2) Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Forces the next player to draw 2 cards. If <strong className="text-amber-600">Stacking</strong> is enabled, the next player can counter-stack another +2 or +4 to pass an accumulated penalty!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="BLUE" value="DRAW_TWO" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-red-600 block">+2 Penalty Attack</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Stacks up to +4, +6, +8!</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 8 cards</span>
                  <span className="text-amber-600">Score: 20 Points</span>
                </div>
              </div>
            )}

            {/* 5. Wild Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> WILD CARD
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">WILD Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Can be played on any turn regardless of top discard card color. Allows the player to select the active color (Red, Blue, Green, Yellow).
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="WILD" value="WILD" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-700 block">Choose Active Color</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Playable on any card!</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 4 cards</span>
                  <span className="text-amber-600">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 6. Wild Draw Four (+4) Card */}
            {(filterCategory === 'all' || filterCategory === 'special') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> ULTIMATE WILD
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">WILD DRAW FOUR (+4)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Choose the active color AND forces the next player to draw 4 cards! Can be stacked with +2 cards if Stacking mode is active.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-700 block">+4 Penalty & Color Choice</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Most powerful card in game!</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in Deck: 4 cards</span>
                  <span className="text-amber-600">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 7. Draw Six (+6) Card - No Mercy */}
            {(filterCategory === 'all' || filterCategory === 'no_mercy') && (
              <div className="bg-white rounded-3xl border border-red-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-extrabold border border-red-300">
                    <Flame className="w-3.5 h-3.5 text-red-600" /> NO MERCY ACTION
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">DRAW SIX (+6) Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Forces the next player to draw 6 cards! Can be stacked onto +2 or +4 cards in No Mercy mode.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="WILD" value="WILD_DRAW_SIX" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-red-600 block">+6 Penalty Attack</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Stackable with +2, +4, +6, +10</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in No Mercy Deck: 8 cards</span>
                  <span className="text-amber-600">Score: 30 Points</span>
                </div>
              </div>
            )}

            {/* 8. Wild Draw Ten (+10) Card - No Mercy */}
            {(filterCategory === 'all' || filterCategory === 'no_mercy') && (
              <div className="bg-white rounded-3xl border border-amber-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> NO MERCY ULTIMATE
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">WILD DRAW TEN (+10)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    The most devastating penalty card! Forces next player to draw 10 cards and lets you choose the color.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="WILD" value="WILD_DRAW_TEN" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-700 block">+10 Penalty & Color Choice</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Push opponents to 25 Mercy Limit!</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in No Mercy Deck: 4 cards</span>
                  <span className="text-amber-600">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 9. Skip Everyone Card - No Mercy */}
            {(filterCategory === 'all' || filterCategory === 'no_mercy') && (
              <div className="bg-white rounded-3xl border border-sky-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold border border-sky-300">
                    <Ban className="w-3.5 h-3.5 text-sky-600" /> NO MERCY ACTION
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">SKIP EVERYONE Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Skips every single opponent turn immediately, giving you another consecutive turn right away!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="BLUE" value="SKIP_EVERYONE" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-sky-700 block">Take Immediate Next Turn</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Skips all other players</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in No Mercy Deck: 4 cards</span>
                  <span className="text-amber-600">Score: 30 Points</span>
                </div>
              </div>
            )}

            {/* 10. Wild Color Roulette - No Mercy */}
            {(filterCategory === 'all' || filterCategory === 'no_mercy') && (
              <div className="bg-white rounded-3xl border border-purple-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold border border-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> NO MERCY WILD
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">WILD COLOR ROULETTE</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Choose a color. The next player must continuously draw cards from the deck until drawing a card of that chosen color!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="WILD" value="WILD_COLOR_ROULETTE" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-purple-700 block">Endless Draw Trap</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Target draws until color match</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in No Mercy Deck: 4 cards</span>
                  <span className="text-amber-600">Score: 50 Points</span>
                </div>
              </div>
            )}

            {/* 11. Discard All - No Mercy */}
            {(filterCategory === 'all' || filterCategory === 'no_mercy') && (
              <div className="bg-white rounded-3xl border border-emerald-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> NO MERCY ACTION
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">DISCARD ALL Card</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Discard every single card in your hand that matches the color of the Discard All card in one swift turn!
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <UnoCard color="GREEN" value="DISCARD_ALL" size="sm" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-emerald-700 block">Dump Matching Hand</span>
                    <span className="text-slate-500 text-[11px] block font-medium">Discards all matching color cards</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 font-bold flex justify-between">
                  <span>Count in No Mercy Deck: 8 cards</span>
                  <span className="text-amber-600">Score: 30 Points</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCORING BREAKDOWN SECTION                                     */}
        {/* ------------------------------------------------------------- */}
        {(filterCategory === 'all' || filterCategory === 'scoring') && (
          <div className="glass-white-panel rounded-3xl border border-white p-6 sm:p-8 space-y-6 mt-12 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">End-of-Match Scoring System</h3>
                <p className="text-xs text-slate-500 font-medium">Points earned when a player wins a round by emptying their hand</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Category 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  NUMBER CARDS (0-9)
                </span>
                <div className="text-2xl font-black text-slate-900 pt-1">Face Value</div>
                <p className="text-xs text-slate-500 font-medium">
                  Card 7 = 7 points, Card 3 = 3 points. Totaled from opponents' remaining hands.
                </p>
              </div>

              {/* Score Category 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  ACTION CARDS
                </span>
                <div className="text-2xl font-black text-amber-600 pt-1">20 Points Each</div>
                <p className="text-xs text-slate-500 font-medium">
                  Draw Two (+2), Skip, and Reverse cards are worth 20 points each.
                </p>
              </div>

              {/* Score Category 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  WILD & HOUSE CARDS
                </span>
                <div className="text-2xl font-black text-amber-600 pt-1">50 Points Each</div>
                <p className="text-xs text-slate-500 font-medium">
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
        <div className="glass-white-panel border border-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 border border-sky-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider">KEY RULE TO REMEMBER</h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                Always hit the <strong className="text-amber-600 font-black uppercase">UNO!</strong> button when playing down to your final card. If an opponent catches you before you call it, they can force you to draw +2 penalty cards!
              </p>
            </div>
          </div>
          <Link
            to="/how-to-play"
            className="bg-slate-100 hover:bg-slate-200 text-sky-700 hover:text-slate-900 font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors border border-slate-200 shrink-0"
          >
            Visual Game Guide ➔
          </Link>
        </div>
      </section>

    </div>
  );
};
