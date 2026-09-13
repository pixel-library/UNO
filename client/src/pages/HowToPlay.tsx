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

export const HowToPlay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'stacking' | 'special' | 'uno_call'>('basics');

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 pb-20 selection:bg-uno-yellow selection:text-slate-900 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO SECTION                                          */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 pt-10 pb-16 border-b border-slate-800">
        {/* Glow Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-uno-red/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-uno-blue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-uno-yellow/10 rounded-full blur-3xl pointer-events-none" />

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
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uno-yellow/10 border border-uno-yellow/30 text-uno-yellow text-xs font-black uppercase tracking-widest">
                <BookOpen className="w-4 h-4" /> COMPREHENSIVE VISUAL GUIDE
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
                HOW TO PLAY <span className="text-transparent bg-clip-text bg-gradient-to-r from-uno-red via-uno-yellow to-uno-green">UNO</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                Master core card matching, intense <span className="text-amber-400 font-bold">+2 / +4 penalty stacking</span>, shield deflections, wild swaps, and calling UNO before your opponents win!
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  to="/play"
                  className="bg-gradient-to-r from-amber-400 to-uno-yellow hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-sm flex items-center gap-2.5 shadow-lg shadow-uno-yellow/20 hover:shadow-uno-yellow/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  START MULTIPLAYER MATCH
                </Link>
                <Link
                  to="/rules"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 border border-slate-700 transition-all"
                >
                  <Layers className="w-4 h-4 text-sky-400" />
                  CARD RULES MANUAL
                </Link>
              </div>
            </div>

            {/* Visual Hero Card Showcase */}
            <div className="lg:col-span-5 flex justify-center items-center py-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-uno-red via-uno-blue to-uno-yellow opacity-30 rounded-full blur-2xl transform scale-110" />
                <div className="flex -space-x-12 sm:-space-x-14 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="transform -rotate-12 hover:scale-110 transition-transform shadow-2xl">
                    <UnoCard color="RED" value="7" size="md" />
                  </div>
                  <div className="transform -rotate-6 translate-y-2 hover:scale-110 transition-transform shadow-2xl z-10">
                    <UnoCard color="BLUE" value="DRAW_TWO" size="md" />
                  </div>
                  <div className="transform rotate-6 translate-y-1 hover:scale-110 transition-transform shadow-2xl z-20">
                    <UnoCard color="YELLOW" value="SKIP" size="md" />
                  </div>
                  <div className="transform rotate-12 hover:scale-110 transition-transform shadow-2xl z-30">
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
        <div className="bg-slate-800/90 backdrop-blur-xl p-2 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('basics')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'basics'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Target className="w-4 h-4" /> 1. Basics & Setup
          </button>
          <button
            onClick={() => setActiveTab('stacking')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stacking'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" /> 2. +2 / +4 Stacking
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'special'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" /> 3. Deflect & House Rules
          </button>
          <button
            onClick={() => setActiveTab('uno_call')}
            className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'uno_call'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-300" /> 4. Calling & Catching UNO
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
            <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-black text-sky-400 uppercase tracking-widest">STEP 1 — OBJECTIVE</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Be the First to Play All Cards</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Each match begins by dealing <strong className="text-white font-black">7 cards</strong> to every player. Your goal is to discard all cards in your hand before any opponent does. Match the discard pile by <strong className="text-uno-red">Color</strong>, <strong className="text-uno-yellow">Number</strong>, or <strong className="text-uno-blue">Symbol</strong>!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                    <span className="block text-2xl font-black text-amber-400">7</span>
                    <span className="text-xs text-slate-400 font-semibold">Starting Cards</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                    <span className="block text-2xl font-black text-sky-400">2 - 4</span>
                    <span className="text-xs text-slate-400 font-semibold">Players</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
                    <span className="block text-2xl font-black text-emerald-400">0</span>
                    <span className="text-xs text-slate-400 font-semibold">Cards to Win</span>
                  </div>
                </div>
              </div>

              {/* Card Fan Visual */}
              <div className="lg:col-span-5 bg-slate-950/70 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Starting Hand</span>
                <div className="flex -space-x-8 transform scale-90 sm:scale-100 py-2">
                  <UnoCard color="RED" value="3" size="sm" />
                  <UnoCard color="BLUE" value="7" size="sm" />
                  <UnoCard color="GREEN" value="REVERSE" size="sm" />
                  <UnoCard color="YELLOW" value="SKIP" size="sm" />
                  <UnoCard color="WILD" value="WILD" size="sm" />
                </div>
              </div>
            </div>

            {/* Step B: Card Matching Visual Diagrams */}
            <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">STEP 2 — LEGAL MOVES</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">How Matching Works</h3>
                <p className="text-slate-300 text-sm">
                  On your turn, choose a card from your hand that matches the current Discard Pile card:
                </p>
              </div>

              {/* Interactive Card Move Illustrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Move 1: Match Color */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700/70 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-uno-red bg-uno-red/15 px-2.5 py-1 rounded-full border border-uno-red/30">
                        MATCH COLOR
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-300">Play a Red card on a Red card.</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">DISCARD</span>
                      <UnoCard color="RED" value="5" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold block">YOUR CARD</span>
                      <UnoCard color="RED" value="9" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Move 2: Match Value / Number */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700/70 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-uno-blue bg-uno-blue/15 px-2.5 py-1 rounded-full border border-uno-blue/30">
                        MATCH NUMBER
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-300">Play any 7 on top of a Red 7.</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">DISCARD</span>
                      <UnoCard color="RED" value="7" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold block">YOUR CARD</span>
                      <UnoCard color="BLUE" value="7" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Move 3: Play Wild */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700/70 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-uno-yellow bg-uno-yellow/15 px-2.5 py-1 rounded-full border border-uno-yellow/30">
                        PLAY WILD CARD
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-slate-300">Wild cards can be played anytime!</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">DISCARD</span>
                      <UnoCard color="GREEN" value="2" size="sm" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 shrink-0" />
                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold block">ANYTIME</span>
                      <UnoCard color="WILD" value="WILD" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step C: Drawing Cards when no match exists */}
            <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <UnoCard faceDown size="md" />
                <span className="text-xs font-extrabold text-amber-400">DRAW DECK</span>
                <p className="text-[11px] text-slate-400">Click deck to draw when you have no matching card.</p>
              </div>

              <div className="lg:col-span-8 space-y-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">STEP 3 — DRAWING CARDS</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">What Happens When You Cannot Play?</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  If you have no playable card in your hand (or choose not to play one), you must draw <strong className="text-amber-400">1 card</strong> from the draw pile. If the newly drawn card matches the discard pile, you may immediately play it or click <strong className="text-white font-bold">Pass Turn</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STACKING RULES */}
        {activeTab === 'stacking' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header Box */}
            <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-500/40">
                <Flame className="w-4 h-4" /> +2 & +4 ACCUMULATED PENALTY STACKING
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Stack Cards or Absorb the Entire Pile!
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                When a player attacks with a <strong className="text-uno-red">+2 (Draw Two)</strong> or <strong className="text-amber-400">+4 (Wild Draw Four)</strong>, the penalty stack increases (<strong className="text-amber-400">+2, +4, +6, +8...</strong>). The targeted player can either stack another +2/+4 OR draw the accumulated penalty cards!
              </p>
            </div>

            {/* Visual Turn-by-Turn Play Flow Scenario */}
            <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-8">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Full Stacking & Absorption Example</h3>
                  <p className="text-xs text-slate-400 mt-0.5">3 Players in order: Player 1 ➔ Player 2 ➔ Player 3</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/30">
                  Active Stack Counter
                </span>
              </div>

              {/* Flow Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 1: P1 plays +4 */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400 bg-amber-400/15 px-2.5 py-1 rounded-md">
                        TURN 1 — PLAYER 1
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Plays Wild +4 (Chooses RED)</h4>
                    <p className="text-xs text-slate-300">
                      Player 1 plays +4. The stack counter rises to <strong className="text-amber-400 font-extrabold">+4</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl text-center space-y-2 border border-slate-800">
                    <UnoCard color="WILD" value="WILD_DRAW_FOUR" size="sm" />
                    <div className="text-[11px] font-extrabold text-amber-400 bg-amber-950/80 py-1 px-2 rounded-lg border border-amber-500/30">
                      🔥 activeStackCount = +4
                    </div>
                  </div>
                </div>

                {/* Step 2: P2 stacks Blue +2 onto +4 */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-uno-blue bg-uno-blue/15 px-2.5 py-1 rounded-md">
                        TURN 2 — PLAYER 2
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Stacks BLUE +2 onto +4!</h4>
                    <p className="text-xs text-slate-300">
                      Player 2 counter-stacks +2. The stack grows to <strong className="text-amber-400 font-extrabold">4 + 2 = +6</strong>!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl text-center space-y-2 border border-slate-800">
                    <UnoCard color="BLUE" value="DRAW_TWO" size="sm" />
                    <div className="text-[11px] font-extrabold text-amber-400 bg-amber-950/80 py-1 px-2 rounded-lg border border-amber-500/30">
                      🔥 activeStackCount = +6
                    </div>
                  </div>
                </div>

                {/* Step 3: P3 Draws +6 cards OR Plays Same Color */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-700 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-uno-green bg-uno-green/15 px-2.5 py-1 rounded-md">
                        TURN 3 — PLAYER 3
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Clicks DRAW / Plays Card</h4>
                    <p className="text-xs text-slate-300">
                      Player 3 has no +2/+4 counter. Draws all <strong className="text-amber-400 font-extrabold">+6 cards</strong> into hand. Stack resets to 0!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl text-center space-y-2 border border-slate-800">
                    <div className="text-xs font-black text-rose-400 bg-rose-950/80 py-2 px-3 rounded-lg border border-rose-500/30">
                      📥 Absorbs +6 Penalty Cards
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 py-1 px-2 rounded-lg border border-emerald-500/30">
                      ✅ activeStackCount resets to 0
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Rule Callout Box */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700/80 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Same-Color Card Against Active Stack</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If a player targeted by a stack penalty plays a regular matching-color card (instead of a +2/+4 counter card), that player immediately absorbs the full active stack penalty into their hand, and the stack count resets to 0 so the next player starts with zero penalty!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEFLECT SHIELD & SPECIAL HOUSE RULES */}
        {activeTab === 'special' && (
          <div className="space-y-10 animate-fade-in">
            {/* Deflect Shield Highlight */}
            <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest border border-blue-500/30">
                  <ShieldAlert className="w-4 h-4 text-sky-400" /> DEFLECT SHIELD RULE 🛡️
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Deflect +2 / +4 Stacks with SKIP or REVERSE!
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  When targeted by an active +2 or +4 stack penalty, if the <strong className="text-sky-400">Deflect Shield</strong> house rule is enabled, you can play a matching color <strong className="text-uno-yellow">SKIP</strong> or <strong className="text-purple-400">REVERSE</strong> card to deflect the accumulated penalty back onto the attacker!
                </p>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-bold text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-uno-yellow shrink-0" />
                  <span>Attacker absorbs their own penalty stack when deflected!</span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950/90 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-3">
                  <UnoCard color="RED" value="DRAW_TWO" size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <UnoCard color="RED" value="SKIP" size="sm" />
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                  🛡️ STACK DEFLECTED!
                </span>
              </div>
            </div>

            {/* Special Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rule 1: Wild Swap */}
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Shuffle className="w-5 h-5" /> Wild Swap 🎯
                  </div>
                  <span className="text-[10px] font-bold bg-amber-400/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/30">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD_SWAP" size="sm" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Choose game color AND pick any opponent in the match to swap your entire hand of cards with!
                  </p>
                </div>
              </div>

              {/* Rule 2: 7-0 Swap */}
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
                    <RotateCcw className="w-5 h-5" /> 7 - 0 Swap Rule 🔄
                  </div>
                  <span className="text-[10px] font-bold bg-purple-400/10 text-purple-300 px-2.5 py-1 rounded-full border border-purple-400/30">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="GREEN" value="7" size="sm" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Playing a <strong className="text-white">7</strong> allows swapping hand with any player. Playing a <strong className="text-white">0</strong> rotates all hands in play direction!
                  </p>
                </div>
              </div>

              {/* Rule 3: Discard All Color */}
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                    <Layers className="w-5 h-5" /> Discard All Color 🎨
                  </div>
                  <span className="text-[10px] font-bold bg-rose-400/10 text-rose-300 px-2.5 py-1 rounded-full border border-rose-400/30">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="RED" value="DISCARD_ALL" size="sm" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Discard ALL cards in your hand matching this card's color in a single turn!
                  </p>
                </div>
              </div>

              {/* Rule 4: Wild Shuffle */}
              <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm">
                    <Sparkles className="w-5 h-5" /> Wild Shuffle 🌀
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-400/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/30">
                    House Rule
                  </span>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <UnoCard color="WILD" value="WILD_SHUFFLE" size="sm" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Collect every player's hand cards, shuffle them into 1 pile, and re-deal them evenly to all players!
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
            <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-widest border border-rose-500/40">
                <Zap className="w-4 h-4 text-yellow-300" /> THE UNO BUTTON & PENALTY
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Call UNO! When Down to 1 Card
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                When you play your second-to-last card leaving you with <strong className="text-rose-400 font-black">1 card in hand</strong>, press the prominent <strong className="text-uno-yellow font-black uppercase">UNO!</strong> button immediately. If an opponent catches you before you call it, click <strong className="text-sky-400 font-black uppercase">Catch UNO!</strong> to penalize them <strong className="text-amber-400">+2 cards</strong>!
              </p>
            </div>

            {/* Visual Dual Card Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Scenario 1: Successful UNO Call */}
              <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-400/15 px-3 py-1 rounded-full border border-emerald-400/30">
                      SUCCESSFUL CALL
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Press UNO! Immediately</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Before playing your 2nd-to-last card (or right as you play it), hit the UNO! button. A loud sound effect alerts all players that you are 1 card away from victory!
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="inline-block bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-xl px-8 py-3 rounded-2xl shadow-lg animate-pulse">
                    ⚡ CALL UNO!
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold">Protected against opponent Catch penalties!</p>
                </div>
              </div>

              {/* Scenario 2: Getting Caught */}
              <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-400 bg-rose-400/15 px-3 py-1 rounded-full border border-rose-400/30">
                      PENALTY FOR FAILURE
                    </span>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Caught Not Calling UNO</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If another player notices you forgot to call UNO while down to 1 card, they click <strong className="text-sky-400">Catch UNO!</strong>. You are forced to draw <strong className="text-rose-400 font-extrabold">+2 penalty cards</strong>!
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="inline-block bg-sky-500 text-slate-950 font-black text-sm px-6 py-2.5 rounded-xl shadow-md">
                    🚨 CATCH UNO! (+2 Penalty)
                  </div>
                  <p className="text-[11px] text-rose-400 font-semibold">Forces opponent to draw 2 extra cards!</p>
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
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">READY FOR YOUR NEXT MATCH?</h2>
          <p className="text-blue-100 text-sm font-medium max-w-xl mx-auto">
            Create a private lobby with friends or browse open public lobbies online!
          </p>
          <div className="pt-3 flex justify-center gap-4 relative z-10">
            <Link
              to="/play"
              className="bg-gradient-to-r from-amber-400 to-uno-yellow hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-9 py-4 rounded-2xl text-base flex items-center gap-2.5 shadow-xl transition-all transform hover:scale-105 active:scale-100"
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
