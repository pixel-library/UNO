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

  it('should stack +2 cards and automatically skip turn when targeted player draws penalty cards', () => {
    const stackGame = new UnoGame('g_stack', 'STACK1', {
      houseRules: { stacking: true, sevenZero: false, jumpIn: false, counterDeflect: false }
    });
    stackGame.addPlayer('p1', 's1', 'Player 1', true);
    stackGame.addPlayer('p2', 's2', 'Player 2', false);
    stackGame.addPlayer('p3', 's3', 'Player 3', false);
    stackGame.startGame();

    const cardPlusTwo1 = { id: 'dt_1', color: 'RED' as const, value: 'DRAW_TWO' as const, score: 20 };
    const cardPlusTwo2 = { id: 'dt_2', color: 'BLUE' as const, value: 'DRAW_TWO' as const, score: 20 };
    const cardBlueMatching = { id: 'b_matching', color: 'BLUE' as const, value: '3' as const, score: 3 };
    const extraCard = { id: 'ext_1', color: 'RED' as const, value: '9' as const, score: 9 };

    stackGame.playerHands.set('p1', [cardPlusTwo1, extraCard]);
    stackGame.playerHands.set('p2', [cardPlusTwo2, extraCard]);
    stackGame.playerHands.set('p3', [cardBlueMatching, extraCard]);
    stackGame.currentColor = 'RED';

    // Player 1 plays +2 (RED)
    const res1 = stackGame.playCard('p1', 'dt_1');
    expect(res1.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(2);
    expect(stackGame.getCurrentPlayer().id).toBe('p2');

    // Player 2 stacks another +2 (BLUE) -> stack becomes 4
    const res2 = stackGame.playCard('p2', 'dt_2');
    expect(res2.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(4);
    expect(stackGame.getCurrentPlayer().id).toBe('p3');

    // Player 3 has BLUE 3 (non-stacking). Trying to play BLUE 3 should be rejected while activeStackCount > 0!
    const resPlay = stackGame.playCard('p3', 'b_matching');
    expect(resPlay.success).toBe(false);

    // Player 3 draws the +4 penalty cards -> absorbs +4 penalty & turn is skipped to Player 1!
    const handBeforeP3 = stackGame.playerHands.get('p3')?.length || 2;
    const resDraw = stackGame.drawCard('p3');
    expect(resDraw.success).toBe(true);
    expect(stackGame.activeStackCount).toBe(0);
    expect(stackGame.playerHands.get('p3')?.length).toBe(handBeforeP3 + 4);
    // Turn skipped p3 and advanced to p1!
    expect(stackGame.getCurrentPlayer().id).toBe('p1');
  });

  it('should handle DISCARD_ALL rule and discard all cards of matching color from hand', () => {
    game.startGame();
    game.currentColor = 'RED';
    const discardAllCard = { id: 'da_red', color: 'RED' as const, value: 'DISCARD_ALL' as const, score: 30 };
    const red1 = { id: 'r1', color: 'RED' as const, value: '3' as const, score: 3 };
    const red2 = { id: 'r2', color: 'RED' as const, value: '7' as const, score: 7 };
    const blue1 = { id: 'b1', color: 'BLUE' as const, value: '5' as const, score: 5 };

    game.playerHands.set('p1', [discardAllCard, red1, red2, blue1]);

    const res = game.playCard('p1', 'da_red');
    expect(res.success).toBe(true);
    // After playing DISCARD_ALL (RED), p1 should only have blue1 left in hand!
    const handAfter = game.playerHands.get('p1') || [];
    expect(handAfter.length).toBe(1);
    expect(handAfter[0].id).toBe('b1');
  });

  it('should handle Deflect Shield rule by deflecting +2 stack with SKIP or REVERSE', () => {
    const deflectGame = new UnoGame('g_deflect', 'DEF1', {
      houseRules: { stacking: true, counterDeflect: true }
    });
    deflectGame.addPlayer('p1', 's1', 'Player 1', true);
    deflectGame.addPlayer('p2', 's2', 'Player 2', false);
    deflectGame.startGame();

    const dtCard = { id: 'dt1', color: 'RED' as const, value: 'DRAW_TWO' as const, score: 20 };
    const skipCard = { id: 'sk1', color: 'RED' as const, value: 'SKIP' as const, score: 20 };
    const normCard = { id: 'n1', color: 'RED' as const, value: '1' as const, score: 1 };

    deflectGame.playerHands.set('p1', [dtCard, normCard]);
    deflectGame.playerHands.set('p2', [skipCard, normCard]);
    deflectGame.currentColor = 'RED';

    // p1 plays +2
    deflectGame.playCard('p1', 'dt1');
    expect(deflectGame.activeStackCount).toBe(2);

    // p2 plays SKIP to DEFLECT stack penalty!
    const res = deflectGame.playCard('p2', 'sk1');
    expect(res.success).toBe(true);
    expect(deflectGame.lastActionEvent?.type).toBe('DEFLECT');
  });

  it('should handle WILD_SHUFFLE rule by gathering and redistributing all cards', () => {
    game.startGame();
    game.playerHands.set('p1', [
      { id: 'ws1', color: 'WILD' as const, value: 'WILD_SHUFFLE' as const, score: 50 },
      { id: 'c1', color: 'RED' as const, value: '1' as const, score: 1 }
    ]);
    game.playerHands.set('p2', [
      { id: 'c2', color: 'BLUE' as const, value: '2' as const, score: 2 },
      { id: 'c3', color: 'GREEN' as const, value: '3' as const, score: 3 }
    ]);

    const totalBefore = (game.playerHands.get('p1')?.length || 0) + (game.playerHands.get('p2')?.length || 0);

    const res = game.playCard('p1', 'ws1', 'RED');
    expect(res.success).toBe(true);

    const totalAfter = (game.playerHands.get('p1')?.length || 0) + (game.playerHands.get('p2')?.length || 0);
    // Total remaining cards across hands should equal totalBefore minus the 1 played card
    expect(totalAfter).toBe(totalBefore - 1);
  });

  it('should handle WILD_SWAP card by setting pendingHandSwapPlayerId and swapping hands correctly', () => {
    game.startGame();
    const wildSwapCard = { id: 'ws_card', color: 'WILD' as const, value: 'WILD_SWAP' as const, score: 50 };
    const p1OtherCard = { id: 'p1_c1', color: 'RED' as const, value: '1' as const, score: 1 };
    const p2Card1 = { id: 'p2_c1', color: 'BLUE' as const, value: '5' as const, score: 5 };
    const p2Card2 = { id: 'p2_c2', color: 'BLUE' as const, value: '6' as const, score: 6 };

    game.playerHands.set('p1', [wildSwapCard, p1OtherCard]);
    game.playerHands.set('p2', [p2Card1, p2Card2]);

    const resPlay = game.playCard('p1', 'ws_card', 'RED');
    expect(resPlay.success).toBe(true);
    expect(game.pendingHandSwapPlayerId).toBe('p1');
    expect(game.status).toBe('PLAYING');

    // Perform hand swap with p2
    const resSwap = game.swapHands('p1', 'p2');
    expect(resSwap.success).toBe(true);
    expect(game.pendingHandSwapPlayerId).toBeNull();
    // p1 now has p2's 2 cards, p2 now has p1's remaining 1 card
    expect(game.playerHands.get('p1')?.length).toBe(2);
    expect(game.playerHands.get('p2')?.length).toBe(1);
  });

  it('should correctly award victory to target player if source player plays WILD_SWAP as their last card', () => {
    game.startGame();
    const wildSwapCard = { id: 'ws_last', color: 'WILD' as const, value: 'WILD_SWAP' as const, score: 50 };
    const p2Card1 = { id: 'p2_c1', color: 'GREEN' as const, value: '7' as const, score: 7 };

    game.playerHands.set('p1', [wildSwapCard]);
    game.playerHands.set('p2', [p2Card1]);

    // p1 plays WILD_SWAP as their last card
    const resPlay = game.playCard('p1', 'ws_last', 'GREEN');
    expect(resPlay.success).toBe(true);
    expect(game.pendingHandSwapPlayerId).toBe('p1');
    expect(game.status).toBe('PLAYING');

    // p1 swaps with p2. p2 receives p1's empty hand (0 cards) -> p2 wins!
    const resSwap = game.swapHands('p1', 'p2');
    expect(resSwap.success).toBe(true);
    expect(game.status).toBe('FINISHED');
    expect(game.winner?.id).toBe('p2');
  });
});
