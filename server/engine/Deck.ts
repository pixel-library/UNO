import { Card, CardColor, CardValue, HouseRules } from '@shared/types/game';

export class Deck {
  private cards: Card[] = [];

  constructor(houseRules?: HouseRules) {
    this.createDeck(houseRules);
  }

  public createDeck(houseRules?: HouseRules): void {
    this.cards = [];
    let cardIdCounter = 1;

    const colors: CardColor[] = ['RED', 'YELLOW', 'GREEN', 'BLUE'];

    colors.forEach((color) => {
      // One '0' card
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: '0', score: 0 });

      // Two of each 1-9 card
      for (let i = 1; i <= 9; i++) {
        const valStr = i.toString() as CardValue;
        this.cards.push({ id: `c_${cardIdCounter++}`, color, value: valStr, score: i });
        this.cards.push({ id: `c_${cardIdCounter++}`, color, value: valStr, score: i });
      }

      // Two Skip cards per color
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'SKIP', score: 20 });
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'SKIP', score: 20 });

      // Two Reverse cards per color
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'REVERSE', score: 20 });
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'REVERSE', score: 20 });

      // Two Draw Two cards per color
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'DRAW_TWO', score: 20 });
      this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'DRAW_TWO', score: 20 });
    });

    // 4 Wild cards
    for (let i = 0; i < 4; i++) {
      this.cards.push({ id: `c_${cardIdCounter++}`, color: 'WILD', value: 'WILD', score: 50 });
    }

    // 4 Wild Draw Four cards
    for (let i = 0; i < 4; i++) {
      this.cards.push({ id: `c_${cardIdCounter++}`, color: 'WILD', value: 'WILD_DRAW_FOUR', score: 50 });
    }

    // Custom cards if enabled in house rules
    if (houseRules?.customCards) {
      colors.forEach((color) => {
        this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'REPLAY', score: 30 });
        this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'HASH', score: 30 });
        this.cards.push({ id: `c_${cardIdCounter++}`, color, value: 'MINUS_ONE', score: 30 });
      });
      this.cards.push({ id: `c_${cardIdCounter++}`, color: 'WILD', value: 'SKIP_WILD', score: 50 });
      this.cards.push({ id: `c_${cardIdCounter++}`, color: 'WILD', value: 'HASH_WILD', score: 50 });
      this.cards.push({ id: `c_${cardIdCounter++}`, color: 'WILD', value: 'MINUS_TWO_WILD', score: 50 });
    }

    this.shuffle();
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): Card | undefined {
    return this.cards.pop();
  }

  public drawMultiple(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  public reshuffleFromDiscard(discardPile: Card[]): void {
    if (discardPile.length <= 1) return;

    // Keep top discard card
    const topCard = discardPile.pop()!;
    const remaining = [...discardPile];
    discardPile.length = 0;
    discardPile.push(topCard);

    // Shuffle remaining into draw deck
    this.cards = remaining;
    this.shuffle();
  }

  public get count(): number {
    return this.cards.length;
  }
}
