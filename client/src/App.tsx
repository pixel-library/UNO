import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Home } from '@/pages/Home';
import { EnterName } from '@/pages/EnterName';
import { Play } from '@/pages/Play';
import { WaitingRoom } from '@/pages/WaitingRoom';
import { GameScreen } from '@/pages/GameScreen';
import { GameResult } from '@/pages/GameResult';
import { Rules } from '@/pages/Rules';
import { HowToPlay } from '@/pages/HowToPlay';
import { Settings } from '@/pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-white text-uno-navy">
        <Routes>
          {/* Game screen has its own custom full-screen blue layout */}
          <Route path="/game/:gameId" element={<GameScreen />} />
          
          {/* Standard pages wrapped in Navbar & Footer */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/enter-name" element={<EnterName />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/create-game" element={<Play />} />
                    <Route path="/join-game" element={<Play />} />
                    <Route path="/join/:roomCode" element={<Play />} />
                    <Route path="/room/:roomCode" element={<WaitingRoom />} />
                    <Route path="/game/:gameId/result" element={<GameResult />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/how-to-play" element={<HowToPlay />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
