import React from 'react';
import { UnoCard } from '@/components/card/UnoCard';
import { Lightbulb, Layers, RotateCcw, Ban, Sparkles, RefreshCw, Hash, Minus, Zap } from 'lucide-react';

export const Rules: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-white pb-20">
      
      {/* ------------------------------------------------------------- */}
      {/* HEADER HERO                                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-neutral-100">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-uno-blue uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> LEARN THE RULES
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-uno-navy tracking-tight leading-tight">
            UNO GAME <span className="text-uno-red">RULES</span>
          </h1>
          <p className="text-base text-neutral-600 font-medium max-w-xl">
            Simple rules. Endless fun. Learn how to play standard UNO as well as custom house rules, and get ready for your next game!
          </p>
        </div>

        {/* Hero Card Deck Fanned Visual */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="flex -space-x-8 transform rotate-3">
            <UnoCard faceDown size="md" />
            <UnoCard faceDown size="md" />
            <UnoCard faceDown size="md" />
            <UnoCard faceDown size="md" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TWO-COLUMN RULES GRID                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Basic Cards */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-blue-100 text-uno-blue text-xs font-bold w-fit">
              <Layers className="w-4 h-4" />
              <span>BASIC CARDS</span>
            </div>

            <p className="text-xs text-neutral-600 font-medium">
              These are the standard number cards (0 to 9). You can play a card if it matches the color or number of the current top card on the discard pile.
            </p>

            <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
              <UnoCard color="RED" value="1" size="sm" />
              <UnoCard color="YELLOW" value="5" size="sm" />
              <UnoCard color="GREEN" value="8" size="sm" />
              <UnoCard color="BLUE" value="3" size="sm" />
            </div>

            <div className="border-t border-neutral-200 pt-3">
              <h4 className="text-xs font-bold text-uno-navy">Number Cards (0 - 9)</h4>
              <p className="text-[11px] text-neutral-500">Match the color or number to play.</p>
            </div>
          </div>

          {/* Card 2: Reverse Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold w-fit">
              <RotateCcw className="w-4 h-4" />
              <span>REVERSE</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="RED" value="REVERSE" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">REVERSE</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  The direction of the game is reversed. This card can only be played on a matching color or on another "Reverse" card.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Skip Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-600 text-xs font-bold w-fit">
              <Ban className="w-4 h-4" />
              <span>SKIP</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="YELLOW" value="SKIP" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">SKIP</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  The next player has their turn skipped. This card can only be played on a matching color or on another "Skip" card.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Skip Wild Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4" />
              <span>SKIP WILD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="SKIP_WILD" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">SKIP WILD (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose the active game color AND skip the next player's turn immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Replay Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-sky-100 text-uno-blue text-xs font-bold w-fit">
              <RefreshCw className="w-4 h-4" />
              <span>REPLAY</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="YELLOW" value="REPLAY" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">REPLAY (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  When played, you immediately get to take another turn. Can be chained with multiple Replay cards!
                </p>
              </div>
            </div>
          </div>

          {/* Card 6: Wild Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4" />
              <span>WILD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="WILD" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">WILD</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose the active game color (Red, Yellow, Green, or Blue). Can be played on any card regardless of color or symbol.
                </p>
              </div>
            </div>
          </div>

          {/* Card 7: # Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-teal-100 text-teal-600 text-xs font-bold w-fit">
              <Hash className="w-4 h-4" />
              <span># CARD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="GREEN" value="HASH" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy"># (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose any number between 0 and 9. This card matches cards of the chosen number.
                </p>
              </div>
            </div>
          </div>

          {/* Card 8: # Wild Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-800 text-xs font-bold w-fit">
              <Hash className="w-4 h-4" />
              <span># WILD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="HASH_WILD" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy"># WILD (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose a color AND a number between 0 and 9 to set both active conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Card 9: -1 Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold w-fit">
              <Minus className="w-4 h-4" />
              <span>-1 CARD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="BLUE" value="MINUS_ONE" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">-1 (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose 1 extra card from your hand to discard directly to the bottom of the draw deck!
                </p>
              </div>
            </div>
          </div>

          {/* Card 10: -2 Wild Card */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-pink-100 text-pink-700 text-xs font-bold w-fit">
              <Minus className="w-4 h-4" />
              <span>-2 WILD</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="MINUS_TWO_WILD" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Choose game color AND select 2 cards from your hand to discard to the deck bottom.
                </p>
              </div>
            </div>
          </div>

          {/* Card 11: Discard All Color */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4" />
              <span>DISCARD ALL COLOR 🎨</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="RED" value="DISCARD_ALL" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">DISCARD ALL COLOR (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Immediately discard ALL cards of that matching color from your hand in a single move!
                </p>
              </div>
            </div>
          </div>

          {/* Card 12: Deflect Shield */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold w-fit">
              <Zap className="w-4 h-4" />
              <span>DEFLECT SHIELD 🛡️</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="RED" value="SKIP" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">DEFLECT SHIELD (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Playing a SKIP or REVERSE when hit with a +2/+4 penalty deflects the accumulated stack back onto the attacker!
                </p>
              </div>
            </div>
          </div>

          {/* Card 13: Wild Shuffle */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold w-fit">
              <RotateCcw className="w-4 h-4" />
              <span>WILD SHUFFLE 🌀</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="WILD_SHUFFLE" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">WILD SHUFFLE (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Gather all player hands, shuffle them together into one pile, and re-deal them evenly back to all players!
                </p>
              </div>
            </div>
          </div>

          {/* Card 14: Wild Swap */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4" />
              <span>WILD SWAP 🎯</span>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="shrink-0 flex justify-center">
                <UnoCard color="WILD" value="WILD_SWAP" size="sm" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-uno-navy">WILD SWAP (House Rule)</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Pick any opponent to swap your entire hand of cards with on demand!
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM REMEMBER TIP CONTAINER                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-uno-blue">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-uno-navy text-base uppercase tracking-wider">REMEMBER</h3>
              <p className="text-xs text-neutral-600 font-medium mt-1">
                When playing a card, it must match the color, number or symbol of the current top card (or be a Wild card). If you cannot play, draw a card. Remember to call UNO when down to 1 card!
              </p>
            </div>
          </div>
          <div className="text-right whitespace-nowrap text-xs font-bold italic text-uno-blue hidden md:block">
            Same Cards.<br />New Friends.<br />More Fun!
          </div>
        </div>
      </section>

    </div>
  );
};
