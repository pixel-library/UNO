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
});
