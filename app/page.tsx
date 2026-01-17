'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewStore } from '@/src/store/viewStore';
import { Button } from '@/src/components/Button';
import { CharacterSelection } from '@/src/views/gamified/CharacterSelection';
import { ProfessionalView } from '@/src/views/normal/ProfessionalView';
import profileData from '@/src/data/profile.json';

export default function Home() {
  const { currentView, setView } = useViewStore();

  if (currentView === 'normal') {
    return <ProfessionalView />;
  }

  if (currentView === 'gamified') {
    return <CharacterSelection />;
  }

  return (
    <div style={{ zoom: '70%' }} className="min-h-[145vh] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl w-full"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 bg-clip-text text-transparent">
              {profileData.name}
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-2">{profileData.title}</p>
            <p className="text-lg text-gray-400 italic">{profileData.tagline}</p>
          </motion.div>

          {/* View Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Normal View Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-8 cursor-pointer hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
              onClick={() => setView('normal')}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">💼</div>
                <h2 className="text-3xl font-bold mb-4">Professional View</h2>
                <p className="text-gray-400 mb-6">
                  Traditional portfolio showcasing skills, projects, and experience in a clean, professional format
                </p>
                <Button variant="primary">Enter Professional Mode</Button>
              </div>
            </motion.div>

            {/* Gamified View Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900 border-2 border-purple-700 rounded-2xl p-8 cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-300"
              onClick={() => setView('gamified')}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Gamified Experience
                </h2>
                <p className="text-gray-300 mb-6">
                  Embark on an interactive journey through skills and projects. Choose your character and battle through challenges!
                </p>
                <Button variant="neon-purple">Start the Adventure</Button>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center text-gray-500 text-sm"
          >
            <p>Choose your preferred experience above</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
