import React from 'react';
import { CardColor, CardValue } from '@shared/types/game';

export interface UnoCardProps {
  color?: CardColor;
  value?: CardValue;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xs: { width: 'w-10', height: 'h-14', text: 'text-xs', cornerText: 'text-[9px]', pad: 'p-1', border: 'rounded-lg', ovalWidth: 'w-[82%]', ovalHeight: 'h-[68%]' },
  sm: { width: 'w-14', height: 'h-20', text: 'text-xl', cornerText: 'text-[11px]', pad: 'p-1.5', border: 'rounded-xl', ovalWidth: 'w-[84%]', ovalHeight: 'h-[70%]' },
  md: { width: 'w-20 sm:w-24', height: 'h-28 sm:h-36', text: 'text-3xl sm:text-5xl', cornerText: 'text-xs sm:text-base', pad: 'p-1.5 sm:p-2', border: 'rounded-xl sm:rounded-2xl', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' },
  lg: { width: 'w-28 sm:w-32', height: 'h-40 sm:h-48', text: 'text-5xl sm:text-6xl', cornerText: 'text-base sm:text-lg', pad: 'p-2 sm:p-2.5', border: 'rounded-2xl sm:rounded-3xl', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' },
  xl: { width: 'w-36 sm:w-40', height: 'h-52 sm:h-60', text: 'text-6xl sm:text-7xl', cornerText: 'text-lg sm:text-xl', pad: 'p-2.5 sm:p-3', border: 'rounded-3xl', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' }
};

const COLOR_MAP: Record<CardColor, { bg: string; text: string }> = {
  RED: { bg: 'bg-[#E52521]', text: 'text-[#E52521]' },
  YELLOW: { bg: 'bg-[#FCD116]', text: 'text-[#FCD116]' },
  GREEN: { bg: 'bg-[#2D963F]', text: 'text-[#2D963F]' },
  BLUE: { bg: 'bg-[#0082CA]', text: 'text-[#0082CA]' },
  WILD: { bg: 'bg-[#1E1E1E]', text: 'text-white' }
};

export const UnoCard: React.FC<UnoCardProps> = ({
  color = 'RED',
  value = '0',
  size = 'md',
  faceDown = false,
  playable = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  style
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const colorConfig = COLOR_MAP[color] || COLOR_MAP.RED;

  // Render Face-Down Card (Matching Reference 3: Black card, thick white border, red oval with yellow border & yellow 3D UNO text)
  if (faceDown) {
    return (
      <div
        onClick={!disabled && onClick ? onClick : undefined}
        style={style}
        className={`relative select-none ${sizeConfig.width} ${sizeConfig.height} bg-white ${sizeConfig.pad} ${sizeConfig.border} shadow-card transition-all duration-200 cursor-pointer hover:shadow-card-hover ${className}`}
      >
        <div className="w-full h-full bg-[#111111] rounded-[6px] flex items-center justify-center relative overflow-hidden border border-neutral-800 p-1">
          {/* Inner tilted Red Oval with yellow border & yellow/white UNO logo */}
          <div className="w-[88%] h-[72%] bg-[#E52521] rounded-full -rotate-[28deg] border-2 border-[#FCD116] flex items-center justify-center shadow-md">
            <span className="font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans italic text-center px-1" style={{ fontSize: size === 'xs' ? '8px' : size === 'sm' ? '12px' : size === 'md' ? '18px' : '26px' }}>
              <span className="text-[#FCD116]">U</span>
              <span className="text-white">N</span>
              <span className="text-[#FCD116]">O</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Card Symbol
  const renderSymbol = () => {
    switch (value) {
      case 'SKIP':
        return (
          <svg className="w-2/3 h-2/3 stroke-current fill-none stroke-[3]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          </svg>
        );
      case 'REVERSE':
        return (
          <svg className="w-2/3 h-2/3 fill-current" viewBox="0 0 24 24">
            <path d="M7 7h10v3l5-4-5-4v3H5v6h2V7zm10 10H7v-3l-5 4 5 4v-3h12v-6h-2v4z" />
          </svg>
        );
      case 'DRAW_TWO':
        return <span className="font-black italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">+2</span>;
      case 'WILD':
        return (
          <div className="w-3/4 h-3/4 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border border-white/50 transform -rotate-[28deg]">
            <div className="bg-[#E52521]" />
            <div className="bg-[#0082CA]" />
            <div className="bg-[#FCD116]" />
            <div className="bg-[#2D963F]" />
          </div>
        );
      case 'WILD_DRAW_FOUR':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="w-4/5 h-4/5 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border border-white/50 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-2xl sm:text-3xl">+4</span>
          </div>
        );
      case 'REPLAY':
        return (
          <svg className="w-2/3 h-2/3 fill-current" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        );
      case 'SKIP_WILD':
        return (
          <div className="w-3/4 h-3/4 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 relative flex items-center justify-center">
            <div className="bg-[#E52521]" />
            <div className="bg-[#0082CA]" />
            <div className="bg-[#FCD116]" />
            <div className="bg-[#2D963F]" />
            <svg className="absolute inset-0 m-auto w-full h-full stroke-white fill-none stroke-[3]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
            </svg>
          </div>
        );
      case 'HASH':
      case 'HASH_WILD':
        return <span className="font-black italic">#</span>;
      case 'MINUS_ONE':
        return <span className="font-black italic">-1</span>;
      case 'MINUS_TWO_WILD':
        return <span className="font-black italic">-2</span>;
      default:
        return <span className="font-black italic tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">{value}</span>;
    }
  };

  const cornerLabel = () => {
    switch (value) {
      case 'SKIP': return '⊘';
      case 'REVERSE': return '⇄';
      case 'DRAW_TWO': return '+2';
      case 'WILD': return '★';
      case 'WILD_DRAW_FOUR': return '+4';
      case 'REPLAY': return '↺';
      case 'SKIP_WILD': return '⊘';
      case 'HASH':
      case 'HASH_WILD': return '#';
      case 'MINUS_ONE': return '-1';
      case 'MINUS_TWO_WILD': return '-2';
      default: return value;
    }
  };

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      style={style}
      className={`relative select-none ${sizeConfig.width} ${sizeConfig.height} bg-white ${sizeConfig.pad} ${sizeConfig.border} 
        transition-all duration-200 cursor-pointer shadow-card
        ${playable ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-transparent shadow-[0_0_20px_rgba(52,211,153,0.9)] scale-[1.03] z-20' : ''}
        ${selected ? '-translate-y-8 shadow-card-hover ring-4 ring-white ring-offset-2 z-30' : 'hover:-translate-y-4 hover:shadow-card-hover'}
        ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : ''}
        ${className}`}
    >
      {/* Colored Inner Card Face */}
      <div className={`w-full h-full ${colorConfig.bg} rounded-[8px] relative overflow-hidden flex items-center justify-center p-1 border border-black/10`}>
        
        {/* Top-Left Corner Value */}
        <div className={`absolute top-1 left-1.5 font-black ${sizeConfig.cornerText} text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)] leading-none z-10 font-sans`}>
          <span>{cornerLabel()}</span>
        </div>

        {/* Bottom-Right Corner Value (Rotated 180 deg) */}
        <div className={`absolute bottom-1 right-1.5 font-black ${sizeConfig.cornerText} text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)] leading-none z-10 transform rotate-180 font-sans`}>
          <span>{cornerLabel()}</span>
        </div>

        {/* Tilted White Oval Center (Exact match to Reference 3!) */}
        <div className={`${sizeConfig.ovalWidth} ${sizeConfig.ovalHeight} bg-white rounded-full -rotate-[28deg] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] relative overflow-hidden`}>
          {/* Symbol Container */}
          <div className={`${colorConfig.text} ${sizeConfig.text} font-black flex items-center justify-center w-full h-full transform rotate-[28deg]`}>
            {renderSymbol()}
          </div>
        </div>

      </div>
    </div>
  );
};
