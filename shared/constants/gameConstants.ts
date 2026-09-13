import { CardColor, GameSettings } from '../types/game';

export const CARD_COLORS: Record<CardColor, { bg: string; text: string; hex: string; border: string }> = {
  RED: {
    bg: 'bg-uno-red',
    text: 'text-uno-red',
    hex: '#E52521',
    border: 'border-uno-red'
  },
  YELLOW: {
    bg: 'bg-uno-yellow',
    text: 'text-amber-500',
    hex: '#FCD116',
    border: 'border-uno-yellow'
  },
  GREEN: {
    bg: 'bg-uno-green',
    text: 'text-uno-green',
    hex: '#2D963F',
    border: 'border-uno-green'
  },
  BLUE: {
    bg: 'bg-uno-blue',
    text: 'text-uno-blue',
    hex: '#0082CA',
    border: 'border-uno-blue'
  },
  WILD: {
    bg: 'bg-uno-cardDark',
    text: 'text-white',
    hex: '#1E1E1E',
    border: 'border-neutral-800'
  }
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  maxPlayers: 4,
  startingCards: 7,
  turnTimerSeconds: 30,
  allowSpectators: true,
  enableChat: true,
  houseRules: {
    stacking: true,
    jumpIn: false,
    sevenZero: false,
    forcePlay: true,
    drawUntilPlayable: false,
    multipleCardPlay: false,
    customCards: false,
    discardAll: false,
    counterDeflect: true,
    shuffleHands: false,
    wildSwap: false
  }
};

export const DEFAULT_AVATARS = [
  '🐶', '🐱', '🦊', '🐯', '🦁', '🐸', '🐵', '🚀', '⭐', '🔥', '👑', '🎮'
];
