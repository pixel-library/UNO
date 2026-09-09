import {
  Card,
  CardColor,
  GamePublicState,
  GameSettings,
  PlayerPrivateState,
  PlayerPublic,
  ChatMessage
} from '@shared/types/game';
import { Deck } from './Deck';
import { DEFAULT_GAME_SETTINGS } from '@shared/constants/gameConstants';

export class UnoGame {
  public id: string;
  public roomCode: string;
  public status: 'WAITING' | 'PLAYING' | 'FINISHED' = 'WAITING';
  public players: PlayerPublic[] = [];
  public playerHands: Map<string, Card[]> = new Map();
  public currentPlayerIndex: number = 0;
  public direction: 'CW' | 'CCW' = 'CW';
  public currentColor: CardColor = 'RED';
  public discardPile: Card[] = [];
  public deck: Deck;
  public winner: PlayerPublic | null = null;
  public turnStartedAt: number = Date.now();
  public settings: GameSettings;
  public activeStackCount: number = 0;
  public chatMessages: ChatMessage[] = [];
  public lastActionMessage: string = 'Game created';

  constructor(id: string, roomCode: string, settings?: Partial<GameSettings>) {
    this.id = id;
    this.roomCode = roomCode;
    this.settings = { ...DEFAULT_GAME_SETTINGS, ...settings };
    this.deck = new Deck(this.settings.houseRules);
  }

  public addPlayer(id: string, sessionId: string, name: string, isHost: boolean = false, isSpectator: boolean = false): PlayerPublic | null {
    if (!isSpectator && this.players.filter(p => !p.isSpectator).length >= this.settings.maxPlayers) {
      return null;
    }

    const avatars = ['🐶', '🐱', '🦊', '🐯', '🦁', '🐸', '🐵', '🚀', '⭐', '🔥'];
    const avatar = avatars[this.players.length % avatars.length];

    const player: PlayerPublic = {
      id,
      sessionId,
      name,
      avatar,
      cardCount: 0,
      isHost,
      isReady: isHost,
      isConnected: true,
      isSpectator,
      hasCalledUno: false,
      score: 0
    };

    this.players.push(player);
    this.playerHands.set(id, []);
    return player;
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
    this.playerHands.delete(playerId);
    if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
      const firstActive = this.players.find(p => !p.isSpectator);
      if (firstActive) firstActive.isHost = true;
    }
  }

  public startGame(): boolean {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    if (activePlayers.length < 2) return false;

    this.deck.createDeck(this.settings.houseRules);
    this.discardPile = [];
    this.direction = 'CW';
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.activeStackCount = 0;

    // Deal starting hands
    activePlayers.forEach((player) => {
      const hand = this.deck.drawMultiple(this.settings.startingCards);
      this.playerHands.set(player.id, hand);
      player.cardCount = hand.length;
      player.hasCalledUno = false;
    });

    // Draw initial discard card (must not be a Wild Draw Four)
    let initialCard = this.deck.draw();
    while (initialCard && initialCard.value === 'WILD_DRAW_FOUR') {
      this.deck.createDeck(this.settings.houseRules);
      initialCard = this.deck.draw();
    }

    if (initialCard) {
      this.discardPile.push(initialCard);
      this.currentColor = initialCard.color === 'WILD' ? 'RED' : initialCard.color;
    }

    this.status = 'PLAYING';
    this.turnStartedAt = Date.now();
    this.lastActionMessage = 'Game started! Initial card: ' + initialCard?.color + ' ' + initialCard?.value;
    return true;
  }

  public get topDiscardCard(): Card | null {
    return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
  }

  public getCurrentPlayer(): PlayerPublic {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    return activePlayers[this.currentPlayerIndex % activePlayers.length];
  }

  public isPlayable(card: Card): boolean {
    const top = this.topDiscardCard;
    if (!top) return true;

    // Wild cards are always playable
    if (card.color === 'WILD') return true;

    // Matching active color
    if (card.color === this.currentColor) return true;

    // Matching card value / symbol / number
    if (card.value === top.value) return true;

    return false;
  }

  public playCard(playerId: string, cardId: string, chosenColor?: CardColor): { success: boolean; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const hand = this.playerHands.get(playerId);
    if (!hand) return { success: false, error: 'Player hand not found' };

    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = hand[cardIndex];

    if (!this.isPlayable(card)) {
      return { success: false, error: 'Illegal move. Card does not match color or value.' };
    }

    // Remove from hand and add to discard pile
    hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    currentPlayer.cardCount = hand.length;

    // Set new current color
    if (card.color === 'WILD') {
      this.currentColor = chosenColor && chosenColor !== 'WILD' ? chosenColor : 'RED';
    } else {
      this.currentColor = card.color;
    }

    this.lastActionMessage = `${currentPlayer.name} played ${card.color} ${card.value}`;

    // Check victory
    if (hand.length === 0) {
      this.status = 'FINISHED';
      this.winner = currentPlayer;
      this.calculateScores();
      return { success: true };
    }

    // Apply special card action
    this.applyCardAction(card);

    // Advance turn
    this.advanceTurn();
    return { success: true };
  }

  public drawCard(playerId: string): { success: boolean; drawnCard?: Card; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Handle deck depletion
    if (this.deck.count === 0) {
      this.deck.reshuffleFromDiscard(this.discardPile);
    }

    const drawnCard = this.deck.draw();
    if (!drawnCard || !drawnCard.id || !drawnCard.color || !drawnCard.value) {
      return { success: false, error: 'No valid cards left in deck' };
    }

    const hand = this.playerHands.get(playerId) || [];
    hand.push(drawnCard);
    this.playerHands.set(playerId, hand);
    currentPlayer.cardCount = hand.length;
    if (hand.length > 1) {
      currentPlayer.hasCalledUno = false;
    }

    this.lastActionMessage = `${currentPlayer.name} drew a card`;

    // Always advance turn after drawing a card
    this.advanceTurn();

    return { success: true, drawnCard };
  }

  public callUno(playerId: string): { success: boolean; message: string } {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const hand = this.playerHands.get(playerId) || [];
    if (hand.length <= 2) {
      player.hasCalledUno = true;
      return { success: true, message: `${player.name} called UNO!` };
    }

    return { success: false, message: 'Cannot call UNO with more than 2 cards' };
  }

  public passTurn(playerId: string): { success: boolean; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    this.lastActionMessage = `${currentPlayer.name} passed turn`;
    this.advanceTurn();
    return { success: true };
  }

  private applyCardAction(card: Card): void {
    const activePlayers = this.players.filter(p => !p.isSpectator);

    switch (card.value) {
      case 'SKIP':
      case 'SKIP_WILD':
        this.advanceTurnIndex();
        this.lastActionMessage += ' — Next player skipped!';
        break;

      case 'REVERSE':
        if (activePlayers.length === 2) {
          // In 2-player game, Reverse acts as a Skip
          this.advanceTurnIndex();
          this.lastActionMessage += ' — Skip in 2-player!';
        } else {
          this.direction = this.direction === 'CW' ? 'CCW' : 'CW';
          this.lastActionMessage += ' — Direction reversed!';
        }
        break;

      case 'DRAW_TWO':
        const nextP2 = this.getNextPlayer();
        const penaltyHand2 = this.playerHands.get(nextP2.id) || [];
        const drawnCards2 = this.deck.drawMultiple(2, this.discardPile);
        penaltyHand2.push(...drawnCards2);
        nextP2.cardCount = penaltyHand2.length;
        this.advanceTurnIndex(); // Skip penalty player's turn
        this.lastActionMessage += ` — ${nextP2.name} drew 2 cards and skipped!`;
        break;

      case 'WILD_DRAW_FOUR':
        const nextP4 = this.getNextPlayer();
        const penaltyHand4 = this.playerHands.get(nextP4.id) || [];
        const drawnCards4 = this.deck.drawMultiple(4, this.discardPile);
        penaltyHand4.push(...drawnCards4);
        nextP4.cardCount = penaltyHand4.length;
        this.advanceTurnIndex(); // Skip penalty player's turn
        this.lastActionMessage += ` — ${nextP4.name} drew 4 cards and skipped!`;
        break;

      case 'REPLAY':
        // Replay allows taking another turn immediately (do not advance index)
        this.lastActionMessage += ' — Replay turn!';
        break;
    }
  }

  private advanceTurnIndex(): void {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    if (activePlayers.length === 0) return;

    if (this.direction === 'CW') {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex - 1 + activePlayers.length) % activePlayers.length;
    }
  }

  private advanceTurn(): void {
    this.advanceTurnIndex();
    this.turnStartedAt = Date.now();
  }

  private getNextPlayer(): PlayerPublic {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    const step = this.direction === 'CW' ? 1 : -1;
    const nextIdx = (this.currentPlayerIndex + step + activePlayers.length) % activePlayers.length;
    return activePlayers[nextIdx];
  }

  private calculateScores(): void {
    if (!this.winner) return;
    let totalScore = 0;

    this.playerHands.forEach((hand, playerId) => {
      if (playerId !== this.winner!.id) {
        hand.forEach((card) => {
          totalScore += card.score;
        });
      }
    });

    this.winner.score = totalScore;
  }

  public getPublicState(): GamePublicState {
    return {
      id: this.id,
      roomCode: this.roomCode,
      status: this.status,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      currentColor: this.currentColor,
      topDiscardCard: this.topDiscardCard,
      drawPileCount: this.deck.count,
      discardPileCount: this.discardPile.length,
      winner: this.winner,
      turnStartedAt: this.turnStartedAt,
      turnDuration: this.settings.turnTimerSeconds,
      settings: this.settings,
      activeStackCount: this.activeStackCount,
      lastActionMessage: this.lastActionMessage,
      chatMessages: this.chatMessages
    };
  }

  public getPrivateState(playerId: string): PlayerPrivateState & { targetPlayerId?: string } {
    const publicState = this.getPublicState();
    const rawHand = this.playerHands.get(playerId) || [];
    const hand = rawHand.filter(c => c && c.id && c.color && c.value);
    return {
      ...publicState,
      hand,
      targetPlayerId: playerId
    };
  }
}
