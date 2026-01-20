'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import dynamic from 'next/dynamic';
import { StoryComponent } from './StoryComponent';
import charactersData from '@/src/data/characters.json';
import skillsData from '@/src/data/skills.json';

const GameComponent = dynamic(() => import('./GameComponent').then(mod => mod.GameComponent), {
    ssr: false,
    loading: () => <div className="text-white p-8 text-center">Loading Game Engine...</div>
});

interface Character {
    id: string;
    name: string;
    role: string;
    color: 'cyan' | 'amber' | 'purple' | 'green';
    colorHex: string;
    weapon: string;
    weaponDescription: string;
    story: string;
    skills: string;
    assetPath: string; // Added assetPath
    villain: {
        name: string;
        description: string;
        weakness: string;
    };
}

type ViewState = 'selection' | 'story' | 'game';

export const CharacterSelection: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [viewState, setViewState] = useState<ViewState>('selection');
    const characters = charactersData as Character[];
    const selectedCharacter = characters[selectedIndex];

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? characters.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === characters.length - 1 ? 0 : prev + 1));
    };

    const handleStartStory = () => {
        setViewState('story');
    };

    const handleStartGame = () => {
        setViewState('game');
    };

    const handleReturnToSelection = () => {
        setViewState('selection');
    };

    const getSkillsForCharacter = (skillKey: string) => {
        return skillsData[skillKey as keyof typeof skillsData] || [];
    };

    // View Routing
    if (viewState === 'game') {
        return (
            <GameComponent
                characterId={selectedCharacter.id}
                onReturnToSelection={handleReturnToSelection}
            />
        );
    }

    if (viewState === 'story') {
        return (
            <StoryComponent
                characterId={selectedCharacter.id}
                onComplete={handleStartGame}
            />
        );
    }

    return (
        <div style={{ zoom: '70%' }} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 bg-clip-text text-transparent">
                        Choose Your Path
                    </h1>
                    <p className="text-gray-400 text-lg">Select a character to begin your journey</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Character Carousel */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Navigation Arrows */}
                            <button
                                onClick={handlePrevious}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-all"
                            >
                                ←
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-all"
                            >
                                →
                            </button>

                            {/* Character Cards */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedCharacter.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-8"
                                >
                                    <Card
                                        glowColor={selectedCharacter.color}
                                        className="text-center"
                                    >
                                        {/* Character Image Placeholder */}
                                        <div
                                            className="w-72 h-72 mx-auto mb-6 rounded-lg flex items-center justify-center overflow-hidden relative"
                                            style={{
                                                background: `linear-gradient(135deg, ${selectedCharacter.colorHex}33, ${selectedCharacter.colorHex}11)`,
                                                border: `2px solid ${selectedCharacter.colorHex}`,
                                            }}
                                        >
                                            {selectedCharacter.assetPath ? (
                                                <Image
                                                    src={selectedCharacter.assetPath}
                                                    alt={selectedCharacter.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="288px"
                                                    priority
                                                />
                                            ) : (
                                                <div className="text-6xl">
                                                    {selectedCharacter.role === 'Frontend' && '🎨'}
                                                    {selectedCharacter.role === 'Backend' && '🔨'}
                                                    {selectedCharacter.role === 'DevOps' && '🧙'}
                                                    {selectedCharacter.role === 'Full Stack' && '⚡'}
                                                </div>
                                            )}
                                        </div>

                                        <h2
                                            className="text-3xl font-bold mb-2"
                                            style={{ color: selectedCharacter.colorHex }}
                                        >
                                            {selectedCharacter.name}
                                        </h2>
                                        <p className="text-xl text-gray-400 mb-4">{selectedCharacter.role} Specialist</p>
                                        <div className="text-left">
                                            <p className="text-sm text-gray-500 mb-2 font-semibold">Weapon:</p>
                                            <p className="text-gray-300 mb-4">{selectedCharacter.weapon}</p>
                                            <p className="text-sm text-gray-400 italic">{selectedCharacter.weaponDescription}</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>

                            {/* Indicator Dots */}
                            <div className="flex justify-center gap-2 mt-4">
                                {characters.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === selectedIndex
                                            ? 'bg-white scale-125'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skills Panel */}
                    <div className="flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedCharacter.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-2xl font-bold mb-4" style={{ color: selectedCharacter.colorHex }}>
                                    Skills & Abilities
                                </h3>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {getSkillsForCharacter(selectedCharacter.skills).map((skill, index) => (
                                        <motion.div
                                            key={skill}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center text-sm hover:border-gray-500 transition-colors"
                                        >
                                            {skill}
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-300">Origin Story</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">{selectedCharacter.story}</p>
                                </div>

                                <div className="bg-gray-900 border-2 rounded-lg p-4 mb-6" style={{ borderColor: `${selectedCharacter.colorHex}44` }}>
                                    <h4 className="text-lg font-semibold mb-2" style={{ color: selectedCharacter.colorHex }}>
                                        First Challenge: {selectedCharacter.villain.name}
                                    </h4>
                                    <p className="text-gray-400 text-sm">{selectedCharacter.villain.description}</p>
                                </div>

                                <Button
                                    variant={`neon-${selectedCharacter.color}` as const}
                                    className="w-full"
                                    onClick={handleStartStory}
                                >
                                    Enter the Battle →
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
