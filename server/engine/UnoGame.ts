import {
  Card,
  CardColor,
  GamePublicState,
  GameSettings,
  PlayerPrivateState,
  PlayerPublic,
  ChatMessage,
  ActionEvent,
  TableEmote
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
  public pendingHandSwapPlayerId: string | null = null;
  public chatMessages: ChatMessage[] = [];
  public lastActionMessage: string = 'Game created';
  public lastActionEvent: ActionEvent | null = null;
  public activeEmote: TableEmote | null = null;
  public kickedPlayerIds: Set<string> = new Set();
  public kickedNames: Set<string> = new Set();

  constructor(id: string, roomCode: string, settings?: Partial<GameSettings>) {
    this.id = id;
    this.roomCode = roomCode;
    this.settings = { 
      ...DEFAULT_GAME_SETTINGS, 
      ...settings,
      houseRules: { ...DEFAULT_GAME_SETTINGS.houseRules, ...settings?.houseRules }
    };
    this.deck = new Deck(this.settings.houseRules);
  }

  public addPlayer(id: string, sessionId: string, name: string, isHost: boolean = false, isSpectator: boolean = false): PlayerPublic | null {
    if (!isSpectator && this.players.filter(p => !p.isSpectator).length >= this.settings.maxPlayers) {
      return null;
    }

    const avatars = ['🐶', '🐱', '🦊', '🐯', '🦁', '🐸', '🐵', '🚀', '⭐', '🔥', '👑', '🎮'];
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

  public addBot(): PlayerPublic | null {
    if (this.players.filter(p => !p.isSpectator).length >= this.settings.maxPlayers) {
      return null;
    }

    const botNames = ['Bot Alex (AI) 🤖', 'Bot Sam (AI) 👾', 'Bot Morgan (AI) 🧠', 'Bot Charlie (AI) 🚀'];
    const existingBotsCount = this.players.filter(p => p.id.startsWith('bot_')).length;
    const name = botNames[existingBotsCount % botNames.length];
    const botId = `bot_${Math.random().toString(36).substring(2, 9)}`;

    const botPlayer = this.addPlayer(botId, `sess_${botId}`, name, false);
    if (botPlayer) {
      this.lastActionMessage = `${name} joined the room!`;
    }
    return botPlayer;
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
    this.playerHands.delete(playerId);
    if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
      const firstActive = this.players.find(p => !p.isSpectator);
      if (firstActive) firstActive.isHost = true;
    }
  }

  public kickPlayer(hostId: string, targetPlayerId: string): boolean {
    const host = this.players.find(p => p.id === hostId);
    if (!host || !host.isHost) return false;
    const target = this.players.find(p => p.id === targetPlayerId);
    if (target) {
      this.kickedPlayerIds.add(target.id);
      this.kickedNames.add(target.name.toLowerCase());
    }
    this.removePlayer(targetPlayerId);
    this.lastActionMessage = `${host.name} kicked a player from the room.`;
    return true;
  }

  public transferHost(hostId: string, newHostId: string): boolean {
    const host = this.players.find(p => p.id === hostId);
    const target = this.players.find(p => p.id === newHostId);
    if (!host || !host.isHost || !target) return false;

    host.isHost = false;
    target.isHost = true;
    this.lastActionMessage = `${host.name} transferred host to ${target.name}.`;
    return true;
  }

  public updateSettings(hostId: string, newSettings: Partial<GameSettings>): boolean {
    const host = this.players.find(p => p.id === hostId);
    if (!host || !host.isHost) return false;

    this.settings = {
      ...this.settings,
      ...newSettings,
      houseRules: { ...this.settings.houseRules, ...newSettings.houseRules }
    };
    this.lastActionMessage = `Room settings updated by ${host.name}.`;
    return true;
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
    this.pendingHandSwapPlayerId = null;

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

  public isBasePlayable(card: Card): boolean {
    const top = this.topDiscardCard;
    if (!top) return true;

    const cardColor = String(card.color || '').trim().toUpperCase();
    const cardVal = String(card.value || '').trim().toUpperCase();
    const activeColor = String(this.currentColor || top.color || '').trim().toUpperCase();
    const topColor = String(top.color || '').trim().toUpperCase();
    const topVal = String(top.value || '').trim().toUpperCase();

    // Wild cards are always playable
    if (cardColor === 'WILD') return true;

    // Matching active color or top card color
    if (cardColor === activeColor) return true;
    if (topColor !== 'WILD' && cardColor === topColor) return true;

    // Matching card value / symbol / number
    if (cardVal === topVal) return true;

    return false;
  }

  public isPlayable(card: Card): boolean {
    return this.isBasePlayable(card);
  }

  public playCard(playerId: string, cardId: string, chosenColor?: CardColor, cardColor?: CardColor, cardValue?: any): { success: boolean; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const hand = this.playerHands.get(playerId);
    if (!hand || hand.length === 0) return { success: false, error: 'Player hand not found' };

    let cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1 && cardId) {
      cardIndex = hand.findIndex(c => c.id.endsWith(cardId) || cardId.endsWith(c.id));
    }
    if (cardIndex === -1 && cardColor && cardValue) {
      cardIndex = hand.findIndex(c => c.color === cardColor && c.value === cardValue);
    }
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = hand[cardIndex];

    if (!this.isPlayable(card)) {
      return { success: false, error: 'Illegal move. Card does not match active color or value.' };
    }

    const cardVal = String(card.value || '').trim().toUpperCase();
    const isStackingCard = cardVal === 'DRAW_TWO' || cardVal === 'WILD_DRAW_FOUR' ||
      (this.settings.houseRules.counterDeflect && (cardVal === 'SKIP' || cardVal === 'REVERSE' || cardVal === 'SKIP_WILD'));

    // If active stack is active and player plays a non-stacking matching card, absorb the stack penalty first!
    if (this.activeStackCount > 0 && !isStackingCard) {
      const penaltyCount = this.activeStackCount;
      const penaltyCards = this.deck.drawMultiple(penaltyCount, this.discardPile);
      hand.push(...penaltyCards);
      this.activeStackCount = 0;
      this.lastActionEvent = {
        type: 'STACK',
        title: `+${penaltyCount} CARDS TAKEN! 📥`,
        playerName: currentPlayer.name,
        timestamp: Date.now()
      };
      cardIndex = hand.findIndex(c => c.id === card.id);
      if (cardIndex === -1) {
        cardIndex = hand.indexOf(card);
      }
    }

    // Remove from hand and add to discard pile
    if (cardIndex !== -1) {
      hand.splice(cardIndex, 1);
    }
    this.discardPile.push(card);
    currentPlayer.cardCount = hand.length;

    // Discard All rule: remove all other matching color cards from hand
    if (card.value === 'DISCARD_ALL' && card.color !== 'WILD') {
      const matchColor = card.color;
      const discardedMatchingCards = hand.filter(c => c.color === matchColor);
      const remainingHand = hand.filter(c => c.color !== matchColor);
      this.playerHands.set(playerId, remainingHand);
      this.discardPile.push(...discardedMatchingCards);
      currentPlayer.cardCount = remainingHand.length;
    }

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
    this.applyCardAction(card, playerId);

    // If pending 7-swap, do not advance turn until target is selected
    if (this.pendingHandSwapPlayerId === playerId) {
      return { success: true };
    }

    // Advance turn
    this.advanceTurn();
    return { success: true };
  }

  public jumpIn(playerId: string, cardId: string, chosenColor?: CardColor): { success: boolean; error?: string } {
    if (!this.settings.houseRules.jumpIn) {
      return { success: false, error: 'Jump-in rule is disabled' };
    }

    const top = this.topDiscardCard;
    if (!top) return { success: false, error: 'No discard pile' };

    const hand = this.playerHands.get(playerId);
    if (!hand) return { success: false, error: 'Hand not found' };

    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = hand[cardIndex];

    // Jump-in requires exact color AND value match
    const exactColorMatch = card.color === top.color || (card.color === 'WILD' && top.color === 'WILD');
    const exactValueMatch = card.value === top.value;

    if (!exactColorMatch || !exactValueMatch) {
      return { success: false, error: 'Jump-in requires an exact matching card (color + value).' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Move player index to jumping player
    const activePlayers = this.players.filter(p => !p.isSpectator);
    const newIdx = activePlayers.findIndex(p => p.id === playerId);
    if (newIdx !== -1) {
      this.currentPlayerIndex = newIdx;
    }

    // Play card
    hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    player.cardCount = hand.length;
    if (card.color === 'WILD') {
      this.currentColor = chosenColor && chosenColor !== 'WILD' ? chosenColor : 'RED';
    } else {
      this.currentColor = card.color;
    }

    this.lastActionEvent = {
      type: 'JUMP_IN',
      title: 'JUMP IN!',
      playerName: player.name,
      timestamp: Date.now()
    };
    this.lastActionMessage = `⚡ ${player.name} JUMPED IN with ${card.color} ${card.value}!`;

    if (hand.length === 0) {
      this.status = 'FINISHED';
      this.winner = player;
      this.calculateScores();
      return { success: true };
    }

    this.advanceTurn();
    return { success: true };
  }

  public swapHands(sourcePlayerId: string, targetPlayerId: string): { success: boolean; error?: string } {
    if (this.pendingHandSwapPlayerId !== sourcePlayerId) {
      return { success: false, error: 'No hand swap pending' };
    }

    const sourceHand = this.playerHands.get(sourcePlayerId);
    const targetHand = this.playerHands.get(targetPlayerId);
    const sourcePlayer = this.players.find(p => p.id === sourcePlayerId);
    const targetPlayer = this.players.find(p => p.id === targetPlayerId);

    if (!sourceHand || !targetHand || !sourcePlayer || !targetPlayer) {
      return { success: false, error: 'Invalid swap targets' };
    }

    // Swap hands
    this.playerHands.set(sourcePlayerId, targetHand);
    this.playerHands.set(targetPlayerId, sourceHand);
    sourcePlayer.cardCount = targetHand.length;
    targetPlayer.cardCount = sourceHand.length;
    this.pendingHandSwapPlayerId = null;

    this.lastActionEvent = {
      type: 'HAND_SWAP',
      title: 'HAND SWAP 🔄',
      playerName: sourcePlayer.name,
      timestamp: Date.now()
    };
    this.lastActionMessage = `🔄 ${sourcePlayer.name} swapped hands with ${targetPlayer.name}!`;

    this.advanceTurn();
    return { success: true };
  }

  public drawCard(playerId: string): { success: boolean; drawnCard?: Card; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // If active stack penalties exist, draw the accumulated stack!
    if (this.activeStackCount > 0) {
      const count = this.activeStackCount;
      const penaltyCards = this.deck.drawMultiple(count, this.discardPile);
      const hand = this.playerHands.get(playerId) || [];
      hand.push(...penaltyCards);
      this.playerHands.set(playerId, hand);
      currentPlayer.cardCount = hand.length;
      
      this.activeStackCount = 0;
      this.turnStartedAt = Date.now();

      this.lastActionEvent = {
        type: 'STACK',
        title: `+${count} CARDS DRAWN! 📥`,
        playerName: currentPlayer.name,
        timestamp: Date.now()
      };
      this.lastActionMessage = `📥 ${currentPlayer.name} drew ${count} penalty cards and can play a ${this.currentColor} card!`;

      return { success: true, drawnCard: penaltyCards[0] };
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
      this.lastActionEvent = {
        type: 'UNO_CALL',
        title: 'UNO! 🔥',
        playerName: player.name,
        timestamp: Date.now()
      };
      this.lastActionMessage = `🔥 ${player.name} called UNO!`;
      return { success: true, message: `${player.name} called UNO!` };
    }

    return { success: false, message: 'Cannot call UNO with more than 2 cards' };
  }

  public challengeUno(challengerId: string, targetPlayerId?: string): { success: boolean; message?: string; error?: string } {
    const challenger = this.players.find(p => p.id === challengerId);
    if (!challenger) return { success: false, error: 'Challenger not found' };

    let target = targetPlayerId ? this.players.find(p => p.id === targetPlayerId) : undefined;
    if (!target) {
      target = this.players.find(p => p.id !== challengerId && !p.isSpectator && p.cardCount === 1 && !p.hasCalledUno);
    }

    if (!target) {
      return { success: false, error: 'No opponent found holding 1 card who forgot to call UNO.' };
    }

    const targetHand = this.playerHands.get(target.id) || [];
    
    // Target must have exactly 1 card AND failed to call UNO!
    if (targetHand.length === 1 && !target.hasCalledUno) {
      const penaltyCards = this.deck.drawMultiple(2, this.discardPile);
      targetHand.push(...penaltyCards);
      target.cardCount = targetHand.length;
      target.hasCalledUno = false;

      this.lastActionEvent = {
        type: 'UNO_CHALLENGE',
        title: 'CAUGHT! 🚨',
        playerName: challenger.name,
        timestamp: Date.now()
      };
      this.lastActionMessage = `🚨 ${challenger.name} CAUGHT ${target.name} NOT calling UNO! ${target.name} drew 2 penalty cards!`;
      return { success: true, message: `Caught ${target.name}! They drew 2 cards.` };
    }

    return { success: false, error: `${target.name} has already called UNO or does not have 1 card.` };
  }

  public passTurn(playerId: string): { success: boolean; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.activeStackCount > 0 && this.settings.houseRules.stacking) {
      const penaltyCards = this.deck.drawMultiple(this.activeStackCount, this.discardPile);
      const hand = this.playerHands.get(playerId) || [];
      hand.push(...penaltyCards);
      this.playerHands.set(playerId, hand);
      currentPlayer.cardCount = hand.length;

      this.lastActionEvent = {
        type: 'STACK',
        title: `+${this.activeStackCount} PENALTY! 💥`,
        playerName: currentPlayer.name,
        timestamp: Date.now()
      };
      this.lastActionMessage = `💥 ${currentPlayer.name} passed turn and took ${this.activeStackCount} penalty stack cards!`;
      this.activeStackCount = 0;
      this.advanceTurn();
      return { success: true };
    }

    this.lastActionMessage = `${currentPlayer.name} passed turn`;
    this.advanceTurn();
    return { success: true };
  }

  public sendEmote(senderId: string, emote: string): boolean {
    const sender = this.players.find(p => p.id === senderId);
    if (!sender) return false;

    this.activeEmote = {
      senderId,
      senderName: sender.name,
      emote,
      timestamp: Date.now()
    };
    return true;
  }

  private applyCardAction(card: Card, playerId: string): void {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    const player = this.players.find(p => p.id === playerId);
    const playerName = player?.name || 'Player';

    // Deflect Shield Rule: If active stack is active and player plays SKIP/REVERSE, deflect stack penalty!
    if (this.activeStackCount > 0 && this.settings.houseRules.counterDeflect && (card.value === 'SKIP' || card.value === 'REVERSE' || card.value === 'SKIP_WILD')) {
      if (card.value === 'REVERSE' && activePlayers.length > 2) {
        this.direction = this.direction === 'CW' ? 'CCW' : 'CW';
      }
      this.lastActionEvent = { type: 'DEFLECT', title: 'DEFLECTED! 🛡️', playerName, timestamp: Date.now() };
      this.lastActionMessage = `🛡️ ${playerName} DEFLECTED the +${this.activeStackCount} stack penalty!`;
      return;
    }

    switch (card.value) {
      case 'DISCARD_ALL':
        this.lastActionEvent = { type: 'DISCARD_ALL', title: 'DISCARD ALL! 🎨', playerName, timestamp: Date.now() };
        this.lastActionMessage = `🎨 ${playerName} discarded all ${card.color} cards from hand!`;
        break;

      case 'WILD_SHUFFLE':
        this.shuffleAllPlayerHands();
        this.lastActionEvent = { type: 'SHUFFLE_HANDS', title: 'WILD SHUFFLE! 🌀', playerName, timestamp: Date.now() };
        this.lastActionMessage = `🌀 ${playerName} played WILD SHUFFLE! All player hands were gathered and redistributed!`;
        break;

      case 'WILD_SWAP':
        this.pendingHandSwapPlayerId = playerId;
        this.lastActionEvent = { type: 'WILD_SWAP', title: 'WILD SWAP! 🎯', playerName, timestamp: Date.now() };
        this.lastActionMessage = `🎯 ${playerName} played WILD SWAP! Select a player to swap hands with.`;
        break;

      case 'SKIP':
      case 'SKIP_WILD':
        this.advanceTurnIndex();
        this.lastActionEvent = { type: 'SKIP', title: 'SKIP! ⊘', playerName, timestamp: Date.now() };
        this.lastActionMessage += ' — Next player skipped!';
        break;

      case 'REVERSE':
        if (activePlayers.length === 2) {
          this.advanceTurnIndex();
          this.lastActionEvent = { type: 'SKIP', title: 'SKIP! ⊘', playerName, timestamp: Date.now() };
          this.lastActionMessage += ' — Skip in 2-player!';
        } else {
          this.direction = this.direction === 'CW' ? 'CCW' : 'CW';
          this.lastActionEvent = { type: 'REVERSE', title: 'REVERSE ⇄', playerName, timestamp: Date.now() };
          this.lastActionMessage += ' — Direction reversed!';
        }
        break;

      case 'DRAW_TWO':
        this.activeStackCount += 2;
        this.lastActionEvent = { type: 'STACK', title: `+${this.activeStackCount} STACK! ⚡`, playerName, timestamp: Date.now() };
        this.lastActionMessage += ` — +2 stacked! (Total stack: +${this.activeStackCount})`;
        break;

      case 'WILD_DRAW_FOUR':
        this.activeStackCount += 4;
        this.lastActionEvent = { type: 'STACK', title: `+${this.activeStackCount} STACK! ⚡`, playerName, timestamp: Date.now() };
        this.lastActionMessage += ` — +4 stacked! (Total stack: +${this.activeStackCount})`;
        break;

      case '7':
        if (this.settings.houseRules.sevenZero) {
          this.pendingHandSwapPlayerId = playerId;
          this.lastActionMessage += ' — Select a player to swap hands with!';
        }
        break;

      case '0':
        if (this.settings.houseRules.sevenZero && activePlayers.length > 1) {
          this.rotateAllHands();
          this.lastActionEvent = { type: 'HAND_ROTATE', title: 'HANDS ROTATED! 🌀', playerName, timestamp: Date.now() };
          this.lastActionMessage += ' — All player hands rotated!';
        }
        break;

      case 'REPLAY':
        this.lastActionMessage += ' — Replay turn!';
        break;
    }
  }

  private shuffleAllPlayerHands(): void {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    if (activePlayers.length === 0) return;

    let allCards: Card[] = [];
    activePlayers.forEach(p => {
      const hand = this.playerHands.get(p.id) || [];
      allCards.push(...hand);
    });

    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    const baseCount = Math.floor(allCards.length / activePlayers.length);
    let extra = allCards.length % activePlayers.length;

    let cardIdx = 0;
    activePlayers.forEach(p => {
      const giveCount = baseCount + (extra > 0 ? 1 : 0);
      if (extra > 0) extra--;
      const newHand = allCards.slice(cardIdx, cardIdx + giveCount);
      cardIdx += giveCount;
      this.playerHands.set(p.id, newHand);
      p.cardCount = newHand.length;
    });
  }

  private rotateAllHands(): void {
    const activePlayers = this.players.filter(p => !p.isSpectator);
    if (activePlayers.length < 2) return;

    const handsArray = activePlayers.map(p => this.playerHands.get(p.id) || []);
    
    if (this.direction === 'CW') {
      // Shift right
      const lastHand = handsArray[handsArray.length - 1];
      for (let i = handsArray.length - 1; i > 0; i--) {
        handsArray[i] = handsArray[i - 1];
      }
      handsArray[0] = lastHand;
    } else {
      // Shift left
      const firstHand = handsArray[0];
      for (let i = 0; i < handsArray.length - 1; i++) {
        handsArray[i] = handsArray[i + 1];
      }
      handsArray[handsArray.length - 1] = firstHand;
    }

    activePlayers.forEach((p, idx) => {
      this.playerHands.set(p.id, handsArray[idx]);
      p.cardCount = handsArray[idx].length;
    });
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
      pendingHandSwapPlayerId: this.pendingHandSwapPlayerId,
      lastActionMessage: this.lastActionMessage,
      lastActionEvent: this.lastActionEvent,
      activeEmote: this.activeEmote,
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
