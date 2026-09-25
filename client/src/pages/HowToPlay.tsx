import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Zap,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowLeft,
  Play,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Shuffle,
  Target,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { UnoCard } from '@/components/card/UnoCard';
import { useScroll3D } from '@/hooks/useScroll3D';

export const HowToPlay: React.FC = () => {
  useScroll3D();
  const [activeTab, setActiveTab] = useState<'basics' | 'stacking' | 'special' | 'uno_call' | 'no_mercy'>('basics');

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-800 pb-20 font-sans selection:bg-[#FCD116] selection:text-slate-950">
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO SECTION (WHITE THEME)                             */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white/80 backdrop-blur-md pt-10 pb-16 border-b border-slate-200/80 shadow-sm">
        {/* Glow Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

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
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest shadow-xs">
                <BookOpen className="w-4 h-4 text-amber-600" /> COMPREHENSIVE VISUAL GUIDE
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
                HOW TO PLAY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600">UNO</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Master core card matching, intense <span className="text-amber-600 font-bold">+2 / +4 penalty stacking</span>, shield deflections, wild swaps, and calling UNO before your opponents win!
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  to="/play"
                  className="bg-gradient-to-r from-[#FCD116] to-[#F5A623] hover:from-[#FFE033] hover:to-[#FCD116] text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  START MULTIPLAYER MATCH
                </Link>
                <Link
                  to="/rules"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 border border-slate-200 transition-all"
                >
                  <Layers className="w-4 h-4 text-sky-600" />
                  CARD RULES MANUAL
                </Link>
              </div>
            </div>

            {/* Visual Hero Card Showcase (Non-Clashing Fan) */}
            <div className="lg:col-span-5 flex justify-center items-center py-6">
              <div className="relative flex items-center justify-center">
                <div className="flex -space-x-3 sm:-space-x-5 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="transform -rotate-6 hover:scale-105 transition-transform shadow-lg z-10">
                    <UnoCard color="RED" value="7" size="md" />
                  </div>
                  <div className="transform -rotate-3 translate-y-1 hover:scale-105 transition-transform shadow-lg z-20">
                    <UnoCard color="BLUE" value="DRAW_TWO" size="md" />
                  </div>
                  <div className="transform rotate-3 hover:scale-105 transition-transform shadow-lg z-30">
                    <UnoCard color="YELLOW" value="SKIP" size="md" />
                  </div>
                  <div className="transform rotate-6 translate-y-1 hover:scale-105 transition-transform shadow-lg z-40">
                    <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE TOPIC TABS NAVIGATION                            */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="glass-white-panel p-2 rounded-3xl border border-white shadow-xl flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('basics')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'basics'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4" /> 1. Basics & Setup
          </button>
          <button
            onClick={() => setActiveTab('stacking')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stacking'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" /> 2. +2 / +4 Stacking
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'special'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-200" /> 3. Deflect & House Rules
          </button>
          <button
            onClick={() => setActiveTab('uno_call')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'uno_call'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-300" /> 4. Calling & Catching UNO
          </button>
          <button
            onClick={() => setActiveTab('no_mercy')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'no_mercy'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-red-400" /> 5. UNO Show 'em No Mercy 💀
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TAB CONTENT SECTIONS WITH VISUAL MOVE ILLUSTRATIONS          */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* TAB 1: BASICS & SETUP */}
        {activeTab === 'basics' && (
          <div className="space-y-10 animate-fade-in">
            {/* Step A: Game Objective */}
            <div className="glass-white-panel rounded-3xl p-6 sm:p-8 border border-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest">STEP 1 — OBJECTIVE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Be the First to Play All Cards</h2>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Each match begins by dealing <strong className="text-slate-900 font-black">7 cards</strong> to every player. Your goal is to discard all cards in your hand before any opponent does. Match the discard pile by <strong className="text-red-600">Color</strong>, <strong className="text-amber-600">Number</strong>, or <strong className="text-sky-600">Symbol</strong>!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                    <span className="block text-2xl font-black text-amber-600">7</span>
                    <span className="text-xs text-slate-500 font-semibold">Starting Cards</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                    <span className="block text-2xl font-black text-sky-600">2 - 4</span>
                    <span className="text-xs text-slate-500 font-semibold">Players</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                    <span className="block text-2xl font-black text-emerald-600">0</span>
                    <span className="text-xs text-slate-500 font-semibold">Cards to Win</span>
                  </div>
                </div>
              </div>

              {/* Card Fan Visual */}
              <div className="lg:col-span-5 bg-white/90 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Example Starting Hand</span>
                <div className="flex -space-x-3 sm:-space-x-4 py-2">
                  <UnoCard color="RED" value="3" size="sm" />
                  <UnoCard color="BLUE" value="7" size="sm" />
                  <UnoCard color="GREEN" value="REVERSE" size="sm" />
                  <UnoCard color="YELLOW" value="SKIP" size="sm" />
                  <UnoCard color="WILD" value="WILD" size="sm" />
                </div>
              </div>
            </div>

            {/* Step B: Card Matching Visual Diagrams */}
            <div className="glass-white-panel rounded-3xl p-6 sm:p-8 border border-white shadow-xl space-y-6">
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">STEP 2 — LEGAL MOVES</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">How Matching Works</h3>
                <p className="text-slate-600 text-sm font-medium">
                  On your turn, choose a card from your hand that matches the current Discard Pile card:
                </p>
              </div>

              {/* Move Illustrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Move 1: Match Color */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                        MATCH COLOR
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Play a Red card on a Red card.</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">DISCARD</span>
                      <UnoCard color="RED" value="5" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-600 font-bold block">YOUR CARD</span>
                      <UnoCard color="RED" value="9" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Move 2: Match Value / Number */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                        MATCH NUMBER
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Play any 7 on top of a Red 7.</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">DISCARD</span>
                      <UnoCard color="RED" value="7" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-600 font-bold block">YOUR CARD</span>
                      <UnoCard color="BLUE" value="7" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Move 3: Play Wild */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        PLAY WILD CARD
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Wild cards can be played anytime!</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">DISCARD</span>
                      <UnoCard color="GREEN" value="2" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-600 font-bold block">ANYTIME</span>
                      <UnoCard color="WILD" value="WILD" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step C: Drawing Cards when no match exists */}
            <div className="glass-white-panel rounded-3xl p-6 sm:p-8 border border-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <UnoCard faceDown size="md" />
                <span className="text-xs font-black text-amber-600">DRAW DECK</span>
                <p className="text-[11px] text-slate-500 font-medium">Click deck to draw when you have no matching card.</p>
              </div>

              <div className="lg:col-span-8 space-y-3">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">STEP 3 — DRAWING CARDS</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">What Happens When You Cannot Play?</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  If you have no playable card in your hand (or choose not to play one), you must draw <strong className="text-amber-600">1 card</strong> from the draw pile. If the newly drawn card matches the discard pile, you may immediately play it or click <strong className="text-slate-900 font-bold">Pass Turn</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STACKING RULES */}
        {activeTab === 'stacking' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header Box */}
            <div className="glass-white-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-widest border border-amber-300">
                <Flame className="w-4 h-4 text-amber-600" /> +2 & +4 ACCUMULATED PENALTY STACKING
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Stack Cards or Absorb the Entire Pile!
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium max-w-3xl">
                When a player attacks with a <strong className="text-red-600">+2 (Draw Two)</strong> or <strong className="text-amber-600">+4 (Wild Draw Four)</strong>, the penalty stack increases (<strong className="text-amber-600 font-bold">+2, +4, +6, +8...</strong>). The targeted player can either stack another +2/+4 OR draw the accumulated penalty cards!
              </p>
            </div>

            {/* Visual Stacking Flow */}
            <div className="glass-white-panel rounded-3xl p-6 sm:p-8 border border-white shadow-xl space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Full Stacking & Absorption Example</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">3 Players in order: Player 1 ➔ Player 2 ➔ Player 3</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300">
                  Active Stack Counter
                </span>
              </div>

              {/* Flow Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      TURN 1 — PLAYER 1
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Plays Wild +4 (Chooses RED)</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Player 1 plays +4. Stack counter rises to <strong className="text-amber-600 font-extrabold">+4</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2 border border-slate-200">
                    <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
                    <div className="text-[11px] font-extrabold text-amber-800 bg-amber-100 py-1 px-2 rounded-lg border border-amber-300">
                      🔥 activeStackCount = +4
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                      TURN 2 — PLAYER 2
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Stacks BLUE +2 onto +4!</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Player 2 counter-stacks +2. Stack grows to <strong className="text-amber-600 font-extrabold">4 + 2 = +6</strong>!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2 border border-slate-200">
                    <UnoCard color="BLUE" value="DRAW_TWO" size="sm" />
                    <div className="text-[11px] font-extrabold text-amber-800 bg-amber-100 py-1 px-2 rounded-lg border border-amber-300">
                      🔥 activeStackCount = +6
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      TURN 3 — PLAYER 3
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">Clicks DRAW / Absorbs Stack</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Player 3 has no +2/+4 counter. Draws all <strong className="text-amber-600 font-extrabold">+6 cards</strong> into hand!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2 border border-slate-200">
                    <div className="text-xs font-black text-red-700 bg-red-100 py-2 px-3 rounded-lg border border-red-200">
                      📥 Absorbs +6 Penalty Cards
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100 py-1 px-2 rounded-lg border border-emerald-200">
                      ✅ activeStackCount resets to 0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEFLECT SHIELD & SPECIAL HOUSE RULES */}
        {activeTab === 'special' && (
          <div className="space-y-10 animate-fade-in">
            {/* Deflect Shield Highlight */}
            <div className="glass-white-panel rounded-3xl p-6 sm:p-8 border border-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-widest border border-sky-300">
                  <ShieldAlert className="w-4 h-4 text-sky-600" /> DEFLECT SHIELD RULE 🛡️
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Deflect +2 / +4 Stacks with SKIP or REVERSE!
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  When targeted by an active +2 or +4 stack penalty, if the <strong className="text-sky-600">Deflect Shield</strong> house rule is enabled, you can play a matching color <strong className="text-amber-600">SKIP</strong> or <strong className="text-purple-600">REVERSE</strong> card to deflect the accumulated penalty back onto the attacker!
                </p>
              </div>

              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <UnoCard color="RED" value="DRAW_TWO" size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <UnoCard color="RED" value="SKIP" size="sm" />
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  🛡️ STACK DEFLECTED!
                </span>
              </div>
            </div>

            {/* Special Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rule 1: Wild Swap */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm">
                    <Shuffle className="w-5 h-5" /> Wild Swap 🎯
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-300">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                  <UnoCard color="WILD" value="WILD_SWAP" size="sm" />
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Choose game color AND pick any opponent in the match to swap your entire hand of cards with!
                  </p>
                </div>
              </div>

              {/* Rule 2: 7-0 Swap */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
                    <RotateCcw className="w-5 h-5" /> 7 - 0 Swap Rule 🔄
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-300">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                  <UnoCard color="GREEN" value="7" size="sm" />
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Playing a <strong className="text-slate-900">7</strong> allows swapping hand with any player. Playing a <strong className="text-slate-900">0</strong> rotates all hands in play direction!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CALLING & CATCHING UNO */}
        {activeTab === 'uno_call' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header Box */}
            <div className="glass-white-panel p-6 sm:p-8 rounded-3xl border border-white shadow-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-widest border border-rose-300">
                <Zap className="w-4 h-4 text-yellow-500" /> THE UNO BUTTON & PENALTY
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Call UNO! When Down to 1 Card
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium max-w-3xl">
                When you play your second-to-last card leaving you with <strong className="text-rose-600 font-black">1 card in hand</strong>, press the prominent <strong className="text-amber-600 font-black uppercase">UNO!</strong> button immediately. If an opponent catches you before you call it, click <strong className="text-sky-600 font-black uppercase">Catch UNO!</strong> to penalize them <strong className="text-amber-600 font-black">+2 cards</strong>!
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: UNO SHOW 'EM NO MERCY */}
        {activeTab === 'no_mercy' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header Box */}
            <div className="bg-gradient-to-br from-red-950 via-slate-900 to-black text-white p-6 sm:p-8 rounded-3xl border border-red-800 shadow-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-900/80 text-red-200 text-xs font-black uppercase tracking-widest border border-red-700">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" /> BRUTAL EXPANSION RULESET 💀
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-orange-500">
                UNO Show 'em No Mercy
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium max-w-3xl">
                The ruthless, high-stakes game mode with <strong className="text-red-400">Extreme Penalty Stacking (+2, +4, +6, +10)</strong>, <strong className="text-amber-400">25-Card Mercy Knockouts</strong>, and game-changing cards like <strong className="text-emerald-400">Skip Everyone</strong> and <strong className="text-sky-400">Wild Color Roulette</strong>!
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Mercy Rule */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-700 font-extrabold text-base">
                    <ShieldAlert className="w-5 h-5 text-red-600" /> Mercy Rule (25 Cards Knockout) 💀
                  </div>
                  <span className="text-[10px] font-black bg-red-100 text-red-800 px-3 py-1 rounded-full border border-red-300">
                    INSTANT KNOCKOUT
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  If a player ever holds <strong className="text-red-600 font-extrabold">25 or more cards</strong> in their hand at any time, they are instantly eliminated from the match ("Knocked Out by Mercy Rule"). All their cards are discarded back to the pile!
                </p>
              </div>

              {/* 2. Stacking */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 font-extrabold text-base">
                    <Flame className="w-5 h-5 text-amber-600" /> Extreme Stacking (+2, +4, +6, +10) 🔥
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                    PENALTY CUMULATIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  When targeted by a draw penalty (+2, +4, +6, +10), you can stack another penalty card of <strong className="text-amber-700 font-bold">equal or higher value</strong> (+2 onto +2, +6 onto +4, +10 onto +6) to pass the entire accumulated sum to the next player!
                </p>
              </div>

              {/* 3. New Action Cards */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-md md:col-span-2">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" /> New No Mercy Action Cards Showcase
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <UnoCard color="RED" value="DRAW_SIX" size="sm" />
                    <span className="block text-xs font-black text-red-700">+6 Draw Six</span>
                    <p className="text-[11px] text-slate-500 font-medium">Forces target to draw 6 cards unless stacked.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <UnoCard color="WILD" value="WILD_DRAW_TEN" size="sm" />
                    <span className="block text-xs font-black text-amber-700">+10 Wild Draw Ten</span>
                    <p className="text-[11px] text-slate-500 font-medium">Massive 10 card penalty + pick active color!</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <UnoCard color="BLUE" value="SKIP_EVERYONE" size="sm" />
                    <span className="block text-xs font-black text-sky-700">Skip Everyone</span>
                    <p className="text-[11px] text-slate-500 font-medium">Skips ALL opponents so you take another turn!</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                    <UnoCard color="WILD" value="WILD_COLOR_ROULETTE" size="sm" />
                    <span className="block text-xs font-black text-purple-700">Color Roulette</span>
                    <p className="text-[11px] text-slate-500 font-medium">Target keeps drawing until getting chosen color!</p>
                  </div>
                </div>
              </div>

              {/* 4. 7-0 Hand Swap */}
              <div className="glass-white-panel rounded-3xl p-6 border border-white space-y-4 shadow-md md:col-span-2">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-base">
                  <RotateCcw className="w-5 h-5 text-indigo-600" /> Mandatory 7-0 Swap Rules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <UnoCard color="GREEN" value="7" size="sm" />
                    <div className="text-xs space-y-1">
                      <span className="font-extrabold text-slate-900 block">7 Card = Target Swap</span>
                      <span className="text-slate-600 font-medium block">Must swap your entire hand with any chosen player!</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <UnoCard color="YELLOW" value="0" size="sm" />
                    <div className="text-xs space-y-1">
                      <span className="font-extrabold text-slate-900 block">0 Card = Rotation Pass</span>
                      <span className="text-slate-600 font-medium block">All players pass their hands to the next player in turn order!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM FOOTER CTA                                             */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-4 relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">READY FOR YOUR NEXT MATCH?</h2>
          <p className="text-blue-100 text-sm font-medium max-w-xl mx-auto">
            Create a private lobby with friends or browse open public lobbies online!
          </p>
          <div className="pt-3 flex justify-center gap-4 relative z-10">
            <Link
              to="/play"
              className="bg-gradient-to-r from-[#FCD116] to-[#F5A623] hover:from-[#FFE033] hover:to-[#FCD116] text-slate-950 font-black px-9 py-4 rounded-2xl text-base flex items-center gap-2.5 shadow-xl transition-all transform hover:scale-105 active:scale-100"
            >
              <Play className="w-5 h-5 fill-current text-slate-950" />
              PLAY NOW
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
