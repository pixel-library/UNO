import React, { useState } from 'react';
import { Settings as SettingsIcon, Volume2, VolumeX, Music, Zap, Eye, Check } from 'lucide-react';
import { audioService } from '@/services/audioService';

export const Settings: React.FC = () => {
  const [sound, setSound] = useState(audioService.isSoundEnabled());
  const [music, setMusic] = useState(audioService.isMusicEnabled());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [speed, setSpeed] = useState<'NORMAL' | 'FAST' | 'INSTANT'>('NORMAL');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    audioService.setSoundEnabled(sound);
    audioService.setMusicEnabled(music);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-xl space-y-8">
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neutral-100 text-uno-navy">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-uno-navy">GAME SETTINGS</h1>
            <p className="text-xs font-semibold text-neutral-500">Preferences are saved locally in your browser.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Audio Toggles */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">AUDIO & SOUND EFFECTS</span>

            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-uno-blue" />
                <div>
                  <div className="font-bold text-sm text-uno-navy">Sound Effects</div>
                  <div className="text-xs text-neutral-500">Play card deal, draw, UNO calls, and victory sounds.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="w-5 h-5 accent-uno-blue rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-bold text-sm text-uno-navy">Background Music</div>
                  <div className="text-xs text-neutral-500">Play ambient background music during matches.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={music}
                onChange={(e) => setMusic(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Animation Preferences */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">ANIMATION SPEED</span>

            <div className="grid grid-cols-3 gap-3">
              {(['NORMAL', 'FAST', 'INSTANT'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`py-3 rounded-xl font-extrabold text-xs border-2 transition-all ${
                    speed === s
                      ? 'border-uno-blue bg-blue-50 text-uno-blue'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-sm text-uno-navy">Reduced Motion</div>
                  <div className="text-xs text-neutral-500">Disable complex card animations for accessibility.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-uno-yellow hover:bg-amber-400 text-uno-navy font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]"
          >
            {saved ? <Check className="w-5 h-5 text-emerald-700" /> : <SettingsIcon className="w-5 h-5" />}
            {saved ? 'SETTINGS SAVED!' : 'SAVE PREFERENCES'}
          </button>

        </div>

      </div>
    </div>
  );
};
