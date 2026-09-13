import { Card, CardColor, GamePublicState, AIDifficulty } from '@shared/types/game';

export class AIPlayer {
  public static selectMove(
    hand: Card[],
    gameState: GamePublicState,
    difficulty: AIDifficulty = 'MEDIUM'
  ): { cardId?: string; chosenColor?: CardColor } | null {
    if (hand.length === 0) return null;

    const isStackActive = (gameState.activeStackCount || 0) > 0 && gameState.settings?.houseRules?.stacking;

    // Filter all legal cards in hand
    const playableCards = hand.filter(card => {
      const cardVal = String(card.value || '').trim().toUpperCase();
      const cardColor = String(card.color || '').trim().toUpperCase();
      const activeColor = String(gameState.currentColor || '').trim().toUpperCase();
      const topVal = String(gameState.topDiscardCard?.value || '').trim().toUpperCase();

      if (isStackActive) {
        if (cardVal === 'DRAW_TWO' || cardVal === 'WILD_DRAW_FOUR') return true;
        if (gameState.settings?.houseRules?.counterDeflect && (cardVal === 'SKIP' || cardVal === 'REVERSE' || cardVal === 'SKIP_WILD')) {
          return true;
        }
        return false;
      }

      if (cardColor === 'WILD') return true;
      if (cardColor === activeColor) return true;
      if (topVal && cardVal === topVal) return true;
      return false;
    });

    // If no playable cards, return null (AI must draw)
    if (playableCards.length === 0) {
      return null;
    }

    let chosenCard: Card;

    if (difficulty === 'EASY') {
      // Pick random playable card
      chosenCard = playableCards[Math.floor(Math.random() * playableCards.length)];
    } else if (difficulty === 'MEDIUM') {
      // Prefer non-wild matching cards first; save wilds for last
      const nonWilds = playableCards.filter(c => c.color !== 'WILD');
      if (nonWilds.length > 0) {
        chosenCard = nonWilds[Math.floor(Math.random() * nonWilds.length)];
      } else {
        chosenCard = playableCards[0];
      }
    } else {
      // HARD Strategy:
      // 1. If opponent has 1-2 cards left, prioritize Action cards (Skip, Draw Two, Wild +4) to sabotage!
      // 2. Play card matching dominant color in hand.
      // 3. Save Wild cards until no color match exists.
      const opponents = gameState.players.filter(p => p.id !== gameState.players[gameState.currentPlayerIndex]?.id);
      const dangerousOpponent = opponents.find(p => p.cardCount <= 2);

      if (dangerousOpponent) {
        const actionCards = playableCards.filter(c => ['SKIP', 'DRAW_TWO', 'WILD_DRAW_FOUR', 'REVERSE'].includes(c.value));
        if (actionCards.length > 0) {
          chosenCard = actionCards[0];
        } else {
          chosenCard = playableCards[0];
        }
      } else {
        const nonWilds = playableCards.filter(c => c.color !== 'WILD');
        if (nonWilds.length > 0) {
          // Sort by color frequency in hand
          const colorCounts: Record<string, number> = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0 };
          hand.forEach(c => { if (c.color !== 'WILD') colorCounts[c.color]++; });
          nonWilds.sort((a, b) => (colorCounts[b.color] || 0) - (colorCounts[a.color] || 0));
          chosenCard = nonWilds[0];
        } else {
          chosenCard = playableCards[0];
        }
      }
    }

    // Determine chosen color if wild card
    let chosenColor: CardColor = 'RED';
    if (chosenCard.color === 'WILD') {
      const counts: Record<CardColor, number> = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, WILD: 0 };
      hand.forEach(c => { if (c.color !== 'WILD') counts[c.color]++; });
      
      let maxColor: CardColor = 'RED';
      let maxCount = -1;
      (['RED', 'YELLOW', 'GREEN', 'BLUE'] as CardColor[]).forEach(col => {
        if (counts[col] > maxCount) {
          maxCount = counts[col];
          maxColor = col;
        }
      });
      chosenColor = maxColor;
    }

    return {
      cardId: chosenCard.id,
      chosenColor
    };
  }
}
