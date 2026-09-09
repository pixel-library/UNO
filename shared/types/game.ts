export type CardColor = 'RED' | 'YELLOW' | 'GREEN' | 'BLUE' | 'WILD';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type CardValue = 
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'SKIP' | 'REVERSE' | 'DRAW_TWO'
  | 'WILD' | 'WILD_DRAW_FOUR'
  | 'REPLAY' | 'SKIP_WILD' | 'HASH' | 'HASH_WILD' | 'MINUS_ONE' | 'MINUS_TWO_WILD';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  score: number;
}

export type GameMode = 'CLASSIC' | 'CUSTOM' | 'VS_COMPUTER' | 'QUICK_PLAY' | 'TOURNAMENT';

export interface HouseRules {
  stacking: boolean;            // +2 on +2 or +4 on +4
  jumpIn: boolean;              // Play exact same card out of turn
  sevenZero: boolean;           // 7 swaps hand, 0 rotates hands
  forcePlay: boolean;           // Must play drawn card if playable
  drawUntilPlayable: boolean;   // Draw continuously until playable card drawn
  multipleCardPlay: boolean;    // Play multiple same value cards at once
  customCards: boolean;         // Enable Replay, Skip Wild, #, -1, etc.
}

export interface GameSettings {
  maxPlayers: number;           // 2, 3, 4
  startingCards: number;        // Default 7
  turnTimerSeconds: number;     // 0 (OFF), 15, 30, 60
  houseRules: HouseRules;
  allowSpectators: boolean;
  enableChat: boolean;
}

export interface PlayerPublic {
  id: string;
  sessionId: string;
  name: string;
  avatar: string;
  cardCount: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isSpectator: boolean;
  hasCalledUno: boolean;
  score: number;
}

export interface GamePublicState {
  id: string;
  roomCode: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  players: PlayerPublic[];
  currentPlayerIndex: number;
  direction: 'CW' | 'CCW';
  currentColor: CardColor;
  topDiscardCard: Card | null;
  drawPileCount: number;
  discardPileCount: number;
  winner: PlayerPublic | null;
  turnStartedAt: number;
  turnDuration: number;
  settings: GameSettings;
  activeStackCount: number;      // Stacking penalty pool (+2 +2 = +4)
  lastActionMessage?: string;
  chatMessages?: ChatMessage[];
}

export interface PlayerPrivateState extends GamePublicState {
  hand: Card[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface MovePayload {
  cardId?: string;
  chosenColor?: CardColor;
  chosenNumber?: string;
}

export interface RoomInfo {
  code: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  mode: GameMode;
  allowSpectators: boolean;
}
