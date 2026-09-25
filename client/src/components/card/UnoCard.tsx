import React from 'react';
import { CardColor, CardValue } from '@shared/types/game';

export interface UnoCardProps {
  color?: CardColor | 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'WILD' | 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value?: CardValue | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  faceDown?: boolean;
  playable?: boolean;
  isPlayable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xs: { width: 'w-10', height: 'h-14', text: 'text-xs', cornerText: 'text-[9px]', pad: 'p-[2px]', border: 'rounded-[6px]', innerBorder: 'rounded-[4px]', ovalWidth: 'w-[82%]', ovalHeight: 'h-[68%]' },
  sm: { width: 'w-14 sm:w-16', height: 'h-20 sm:h-24', text: 'text-xl sm:text-2xl', cornerText: 'text-[11px] sm:text-xs', pad: 'p-[3px]', border: 'rounded-[8px] sm:rounded-[10px]', innerBorder: 'rounded-[5px] sm:rounded-[7px]', ovalWidth: 'w-[84%]', ovalHeight: 'h-[70%]' },
  md: { width: 'w-20 sm:w-24', height: 'h-28 sm:h-36', text: 'text-3xl sm:text-4xl', cornerText: 'text-xs sm:text-sm', pad: 'p-1 sm:p-[5px]', border: 'rounded-[10px] sm:rounded-[14px]', innerBorder: 'rounded-[7px] sm:rounded-[10px]', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' },
  lg: { width: 'w-28 sm:w-34', height: 'h-40 sm:h-48', text: 'text-4xl sm:text-5xl', cornerText: 'text-base sm:text-lg', pad: 'p-1.5 sm:p-2', border: 'rounded-[12px] sm:rounded-[16px]', innerBorder: 'rounded-[9px] sm:rounded-[12px]', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' },
  xl: { width: 'w-36 sm:w-44', height: 'h-52 sm:h-64', text: 'text-5xl sm:text-6xl', cornerText: 'text-lg sm:text-xl', pad: 'p-2 sm:p-2.5', border: 'rounded-[14px] sm:rounded-[18px]', innerBorder: 'rounded-[11px] sm:rounded-[14px]', ovalWidth: 'w-[85%]', ovalHeight: 'h-[70%]' }
};

const COLOR_MAP: Record<string, { bg: string; text: string; shadow: string; aura: string }> = {
  RED: { 
    bg: 'bg-gradient-to-br from-[#FF3B30] via-[#E52521] to-[#C01111]', 
    text: 'text-[#E52521]',
    shadow: 'shadow-[0_8px_18px_rgba(229,37,33,0.35)]',
    aura: 'aura-clean-red'
  },
  YELLOW: { 
    bg: 'bg-gradient-to-br from-[#FFE033] via-[#FCD116] to-[#D9AC00]', 
    text: 'text-[#D9AC00]',
    shadow: 'shadow-[0_8px_18px_rgba(252,209,22,0.35)]',
    aura: 'aura-clean-yellow'
  },
  GREEN: { 
    bg: 'bg-gradient-to-br from-[#34C759] via-[#2D963F] to-[#1E6B2C]', 
    text: 'text-[#2D963F]',
    shadow: 'shadow-[0_8px_18px_rgba(45,150,63,0.35)]',
    aura: 'aura-clean-green'
  },
  BLUE: { 
    bg: 'bg-gradient-to-br from-[#0095FF] via-[#0082CA] to-[#005B9E]', 
    text: 'text-[#0082CA]',
    shadow: 'shadow-[0_8px_18px_rgba(0,130,202,0.35)]',
    aura: 'aura-clean-blue'
  },
  WILD: { 
    bg: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617]', 
    text: 'text-white',
    shadow: 'shadow-[0_8px_18px_rgba(15,23,42,0.45)]',
    aura: 'aura-clean-wild'
  }
};

export const UnoCard: React.FC<UnoCardProps> = ({
  color = 'RED',
  value = '0',
  size = 'md',
  faceDown = false,
  playable,
  isPlayable,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  style
}) => {
  const activePlayable = playable ?? isPlayable ?? false;
  const normalizedColor = String(color).toUpperCase();
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const colorConfig = COLOR_MAP[normalizedColor] || COLOR_MAP.RED;
  const isNumberDigit = /^[0-9]$/.test(value || '');

  // Render Face-Down Card (Gold-embossed 3D UNO Logo)
  if (faceDown) {
    return (
      <div
        onClick={!disabled && onClick ? onClick : undefined}
        style={style}
        className={`relative select-none ${sizeConfig.width} ${sizeConfig.height} bg-white ${sizeConfig.pad} ${sizeConfig.border} border border-slate-300/80 clean-3d-shadow card-3d-tilt transition-all duration-200 cursor-pointer ${className}`}
      >
        <div className={`w-full h-full bg-gradient-to-br from-[#1A1A1A] via-[#111111] to-[#050505] ${sizeConfig.innerBorder} flex items-center justify-center relative overflow-hidden border border-neutral-800 p-1`}>
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className="absolute inset-0 card-gloss-sheen pointer-events-none z-10" />

          <div className="w-[88%] h-[72%] bg-gradient-to-br from-[#FF2D20] via-[#E52521] to-[#B3100C] rounded-full -rotate-[28deg] border-2 border-[#FCD116] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] z-20">
            <span className="font-black tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans italic text-center px-1" style={{ fontSize: size === 'xs' ? '10px' : size === 'sm' ? '14px' : size === 'md' ? '20px' : '26px' }}>
              <span className="text-[#FCD116] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">U</span>
              <span className="text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">N</span>
              <span className="text-[#FCD116] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">O</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Card Center Symbol
  const renderSymbol = () => {
    const valUpper = String(value).toUpperCase();
    switch (valUpper) {
      case 'SKIP':
        return (
          <svg className="w-3/4 h-3/4 stroke-current fill-none stroke-[3.2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          </svg>
        );
      case 'REVERSE':
        return (
          <svg className="w-3/4 h-3/4 fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24">
            <path d="M7 7h10v3l5-4-5-4v3H5v6h2V7zm10 10H7v-3l-5 4 5 4v-3h12v-6h-2v4z" />
          </svg>
        );
      case 'DRAW_TWO':
      case 'DRAW2':
      case '+2':
        return (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="font-black italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">+2</span>
          </div>
        );
      case 'WILD':
        const wildTextSize = size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-base';
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className={`absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] px-0.5 leading-none whitespace-nowrap max-w-full truncate text-center ${wildTextSize}`}>WILD</span>
          </div>
        );
      case 'WILD_DRAW_FOUR':
      case 'WILD4':
      case '+4':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-xl sm:text-3xl">+4</span>
          </div>
        );
      case 'DISCARD_ALL':
        const discardTextSize = size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-xs' : 'text-sm';
        return <span className={`font-black italic tracking-tighter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.25)] ${discardTextSize}`}>DISCARD ALL</span>;
      case 'WILD_SHUFFLE':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-base sm:text-xl">🌀</span>
          </div>
        );
      case 'WILD_SWAP':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-base sm:text-xl">🎯</span>
          </div>
        );
      case 'SKIP_EVERYONE':
        return <span className="font-black italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] text-xs sm:text-base">⊘ ALL</span>;
      case 'WILD_REVERSE_DRAW_FOUR':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-lg sm:text-2xl">⇄+4</span>
          </div>
        );
      case 'DRAW_SIX':
      case '+6':
        const plusSixSize = size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-base' : size === 'md' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl';
        return (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className={`font-black italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] ${plusSixSize}`}>+6</span>
          </div>
        );
      case 'WILD_DRAW_SIX':
        const wildSixSize = size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-base' : size === 'md' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl';
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className={`absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${wildSixSize}`}>+6</span>
          </div>
        );
      case 'WILD_DRAW_TEN':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-lg sm:text-2xl">+10</span>
          </div>
        );
      case 'WILD_COLOR_ROULETTE':
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 shadow-inner border-2 border-white/80 transform -rotate-[28deg]">
              <div className="bg-[#E52521]" />
              <div className="bg-[#0082CA]" />
              <div className="bg-[#FCD116]" />
              <div className="bg-[#2D963F]" />
            </div>
            <span className="absolute font-black italic tracking-tighter text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] text-base sm:text-lg">🎰</span>
          </div>
        );
      default:
        return <span className="font-black italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">{value}</span>;
    }
  };

  const cornerLabel = () => {
    const valUpper = String(value).toUpperCase();
    switch (valUpper) {
      case 'SKIP': return '⊘';
      case 'REVERSE': return '⇄';
      case 'DRAW_TWO':
      case 'DRAW2': return '+2';
      case 'WILD': return '★';
      case 'WILD_DRAW_FOUR':
      case 'WILD4': return '+4';
      case 'DISCARD_ALL': return 'ALL';
      case 'WILD_SHUFFLE': return '🌀';
      case 'WILD_SWAP': return '🎯';
      case 'SKIP_EVERYONE': return '⊘ALL';
      case 'WILD_REVERSE_DRAW_FOUR': return '⇄+4';
      case 'DRAW_SIX':
      case 'WILD_DRAW_SIX': return '+6';
      case 'WILD_DRAW_TEN': return '+10';
      case 'WILD_COLOR_ROULETTE': return '🎰';
      default: return value;
    }
  };

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      style={style}
      className={`relative select-none ${sizeConfig.width} ${sizeConfig.height} bg-white ${sizeConfig.pad} ${sizeConfig.border} 
        border-2 border-slate-900/80 ${colorConfig.shadow} card-3d-tilt transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer
        hover:-translate-y-2 hover:scale-105 active:scale-95
        ${activePlayable ? '-translate-y-1.5 ring-2 ring-emerald-400/90 z-20' : ''}
        ${selected ? '-translate-y-8 shadow-2xl ring-4 ring-amber-400 ring-offset-2 z-30 scale-[1.08]' : ''}
        ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : ''}
        ${className}`}
    >
      {/* Colored Inner Card Face with Gradient */}
      <div className={`w-full h-full ${colorConfig.bg} ${sizeConfig.innerBorder} relative overflow-hidden flex items-center justify-center p-1 border border-black/10 shadow-inner`}>
        
        {/* Light Glossy Sheen Overlay */}
        <div className="absolute inset-0 card-gloss-sheen pointer-events-none z-10" />

        {/* Top-Left Corner Value */}
        <div className={`absolute top-1 left-1.5 font-black ${sizeConfig.cornerText} text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] leading-none z-20 font-sans flex flex-col items-center`}>
          <span>{cornerLabel()}</span>
          {isNumberDigit && <div className="w-[85%] h-[1.5px] bg-white rounded-full mt-[1px] opacity-90 shadow-sm" />}
        </div>

        {/* Bottom-Right Corner Value (Rotated 180 deg) */}
        <div className={`absolute bottom-1 right-1.5 font-black ${sizeConfig.cornerText} text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] leading-none z-20 transform rotate-180 font-sans flex flex-col items-center`}>
          <span>{cornerLabel()}</span>
          {isNumberDigit && <div className="w-[85%] h-[1.5px] bg-white rounded-full mt-[1px] opacity-90 shadow-sm" />}
        </div>

        {/* Tilted White Oval Center */}
        <div className={`${sizeConfig.ovalWidth} ${sizeConfig.ovalHeight} bg-white rounded-full -rotate-[28deg] flex items-center justify-center shadow-[inset_0_3px_6px_rgba(0,0,0,0.25)] relative overflow-hidden border border-black/5 z-10`}>
          <div className={`${colorConfig.text} ${sizeConfig.text} font-black flex items-center justify-center w-full h-full transform rotate-[28deg]`}>
            {renderSymbol()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UnoCard;

