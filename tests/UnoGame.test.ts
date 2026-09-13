import { describe, it, expect, beforeEach } from 'vitest';
import { UnoGame } from '../server/engine/UnoGame';
import { Deck } from '../server/engine/Deck';
import { AIPlayer } from '../server/engine/AIPlayer';

describe('Deck Unit Tests', () => {
  it('should initialize standard 108 cards deck', () => {
    const deck = new Deck();
    expect(deck.count).toBe(108);
  });

  it('should draw cards and decrease deck size', () => {
    const deck = new Deck();
    const card = deck.draw();
    expect(card).toBeDefined();
    expect(deck.count).toBe(107);
  });
});

describe('UnoGame Engine Unit Tests', () => {
  let game: UnoGame;

  beforeEach(() => {
    game = new UnoGame('g_101', 'ABC123');
    game.addPlayer('p1', 's1', 'Player 1', true);
    game.addPlayer('p2', 's2', 'Player 2', false);
  });

  it('should start game and deal 7 cards each', () => {
    const started = game.startGame();
    expect(started).toBe(true);
    expect(game.status).toBe('PLAYING');
    expect(game.playerHands.get('p1')?.length).toBe(7);
    expect(game.playerHands.get('p2')?.length).toBe(7);
    expect(game.topDiscardCard).not.toBeNull();
  });

  it('should validate legal playable cards correctly', () => {
    game.startGame();
    game.currentColor = 'RED';
    game.discardPile = [{ id: 'test_1', color: 'RED', value: '7', score: 7 }];

    const matchingColor = { id: 'c1', color: 'RED' as const, value: '2' as const, score: 2 };
    const matchingNumber = { id: 'c2', color: 'BLUE' as const, value: '7' as const, score: 7 };
    const wildCard = { id: 'c3', color: 'WILD' as const, value: 'WILD' as const, score: 50 };
    const unmatchingCard = { id: 'c4', color: 'GREEN' as const, value: '9' as const, score: 9 };

    expect(game.isPlayable(matchingColor)).toBe(true);
    expect(game.isPlayable(matchingNumber)).toBe(true);
    expect(game.isPlayable(wildCard)).toBe(true);
    expect(game.isPlayable(unmatchingCard)).toBe(false);
  });

  it('should handle AI decisions correctly', () => {
    game.startGame();
    const hand = game.playerHands.get('p1') || [];
    const move = AIPlayer.selectMove(hand, game.getPublicState(), 'HARD');
    if (move) {
      expect(move.cardId).toBeDefined();
    }
  });

  it('should correctly handle joining players and enforce max player limit', () => {
    const customGame = new UnoGame('g_102', 'JOIN99', { maxPlayers: 2 });
    const p1 = customGame.addPlayer('p1', 's1', 'Host Player', true);
    expect(p1).not.toBeNull();
    expect(p1?.isHost).toBe(true);
    expect(customGame.players.length).toBe(1);

    const p2 = customGame.addPlayer('p2', 's2', 'Guest Player', false);
    expect(p2).not.toBeNull();
    expect(p2?.isHost).toBe(false);
    expect(customGame.players.length).toBe(2);

    // 3rd player should be rejected as room is full (max 2)
    const p3 = customGame.addPlayer('p3', 's3', 'Extra Player', false);
    expect(p3).toBeNull();
    expect(customGame.players.length).toBe(2);
  });

  it('should stack +2 cards and force player without +2 to draw total accumulated cards', () => {
    const stackGame = new UnoGame('g_stack', 'STACK1', {
      houseRules: { stacking: true, sevenZero: false, jumpIn: false, forcedDraw: true }
    });
    stackGame.addPlayer('p1', 's1', 'Player 1', true);
    stackGame.addPlayer('p2', 's2', 'Player 2', false);
    stackGame.addPlayer('p3', 's3', 'Player 3', false);
    stackGame.startGame();

    // Give specific hands with extra cards so hands do not empty early
    const cardPlusTwo1 = { id: 'dt_1', color: 'RED' as const, value: 'DRAW_TWO' as const, score: 20 };
    const cardPlusTwo2 = { id: 'dt_2', color: 'BLUE' as const, value: 'DRAW_TWO' as const, score: 20 };
    const cardNormal1 = { id: 'norm_1', color: 'RED' as const, value: '5' as const, score: 5 };
    const cardNormal2 = { id: 'norm_2', color: 'GREEN' as const, value: '7' as const, score: 7 };

    stackGame.playerHands.set('p1', [cardPlusTwo1, cardNormal1]);
    stackGame.playerHands.set('p2', [cardPlusTwo2, cardNormal2]);
    stackGame.playerHands.set('p3', [cardNormal1]);
    stackGame.currentColor = 'RED';

    // Player 1 plays +2
    const res1 = stackGame.playCard('p1', 'dt_1');
    expect(res1.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(2);
    expect(stackGame.getCurrentPlayer().id).toBe('p2');

    // Player 2 stacks another +2
    const res2 = stackGame.playCard('p2', 'dt_2');
    expect(res2.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(4);
    expect(stackGame.getCurrentPlayer().id).toBe('p3');

    // Player 3 tries to play a non-+2 card -> should fail
    const illegalRes = stackGame.playCard('p3', 'norm_1');
    expect(illegalRes.success).toBe(false);
    expect(illegalRes.error).toContain('+4 Stack active');

    // Player 3 draws cards -> gets 4 penalty cards and activeStackCount resets to 0
    const handBefore = stackGame.playerHands.get('p3')?.length || 0;
    const drawRes = stackGame.drawCard('p3');
    expect(drawRes.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(0);
    expect(stackGame.playerHands.get('p3')?.length).toBe(handBefore + 4);

    // Player 3 should STILL be the current player and able to play a card matching currentColor ('BLUE')
    expect(stackGame.getCurrentPlayer().id).toBe('p3');
    expect(stackGame.currentColor).toBe('BLUE');

    // Give p3 a BLUE 5 card to play
    const blueCard = { id: 'b_5', color: 'BLUE' as const, value: '5' as const, score: 5 };
    stackGame.playerHands.get('p3')?.push(blueCard);

    const playBlueRes = stackGame.playCard('p3', 'b_5');
    expect(playBlueRes.success).toBe(true);
    expect(stackGame.getCurrentPlayer().id).toBe('p1');
  });
});
