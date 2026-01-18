'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/src/components/Button';
import charactersData from '@/src/data/characters.json';

interface StoryComponentProps {
    characterId: string;
    onComplete: () => void;
}

export const StoryComponent: React.FC<StoryComponentProps> = ({ characterId, onComplete }) => {
    const character = charactersData.find(c => c.id === characterId);

    // Debug logging
    console.log('StoryComponent: characterId:', characterId);
    console.log('StoryComponent: found character:', character);

    const [step, setStep] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Define the story beats safely with useMemo
    const storyBeats = React.useMemo(() => character ? [
        {
            title: "The Beginning",
            text: character.story || "No story available.",
            image: "/assets/gamebackground.png"
        },
        {
            title: "The Challenge",
            text: character.encounter || "No encounter details available.",
            image: "/assets/gamebackground2.png"
        },
        {
            title: "The Enemy Reveals Itself",
            text: `Suddenly, ${character.villain?.name || "The Enemy"} appears! ${character.villain?.description || ""}.`,
            image: "/assets/monster/monster1-readyToAttack.gif"
        }
    ] : [], [character]);

    const currentBeat = storyBeats[step];

    useEffect(() => {
        if (!character || !currentBeat) return;

        let index = 0;
        setDisplayText('');
        setIsTyping(true);

        // Clear any existing interval
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

        typingIntervalRef.current = setInterval(() => {
            if (index < currentBeat.text.length) {
                setDisplayText((prev) => prev + currentBeat.text.charAt(index));
                index++;
            } else {
                setIsTyping(false);
                if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            }
        }, 30); // Typing speed

        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, [step, currentBeat, character]);

    // Fallback if character not found (AFTER hooks)
    if (!character) {
        return <div className="text-white p-8">Error: Character not found</div>;
    }

    const handleNext = () => {
        if (step < storyBeats.length - 1) {
            setStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        if (isTyping) {
            // Instant finish text
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
            setDisplayText(currentBeat.text);
            setIsTyping(false);
        } else {
            handleNext();
        }
    };

    const isMonsterReveal = currentBeat.title === "The Enemy Reveals Itself";

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-auto p-4">
            {/* Background Layer */}
            <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center fixed"
                style={{ backgroundImage: `url(${currentBeat.image})` }}
            />

            {/* Content Layer */}
            <div className={`relative z-10 w-full ${isMonsterReveal ? 'max-w-6xl' : 'max-w-4xl'}`}>
                <AnimatePresence mode="wait">
                    {isMonsterReveal ? (
                        // Monster Reveal Layout (Two Columns)
                        <motion.div
                            key="monster-reveal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col md:flex-row gap-8 items-center justify-center p-4 md:p-8"
                        >
                            {/* Left Container: Text & Controls */}
                            <div className="flex-1 w-full bg-black/80 border-2 border-cyan-500/50 rounded-xl p-8 backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                                <h2 className="text-3xl font-bold mb-6 text-cyan-400 font-mono tracking-wider">
                                    {currentBeat.title}
                                </h2>
                                <div className="min-h-[100px] mb-6">
                                    <p className="text-xl text-gray-300 leading-relaxed font-mono">
                                        {displayText}
                                        {isTyping && <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />}
                                    </p>
                                </div>
                                <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                                    <Button
                                        variant="neon-cyan"
                                        onClick={handleSkip}
                                        className="min-w-[150px]"
                                    >
                                        {isTyping ? "SKIP TYPE" : "ENTER BATTLE"}
                                    </Button>
                                </div>
                            </div>

                            {/* Right Container: Monster Animation */}
                            <div className="flex-1 w-full flex justify-center items-center">
                                <div className="bg-black/40 border-2 border-red-500/30 rounded-xl p-4 backdrop-blur-sm shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                    {/* Using standard img for GIFs as Next/Image can be tricky with animated optimization sometimes, checking if warning persists or using unoptimized */}
                                    <Image
                                        src="/assets/monster/monster1-readyToAttack.gif"
                                        alt="Monster Reveal"
                                        className="w-full max-w-[400px] object-contain rounded-lg"
                                        width={400} // Specify a width
                                        height={300} // Specify a height
                                        unoptimized // Use unoptimized for GIFs to prevent issues
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Standard Layout (Centered Single Column)
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-black/80 border-2 border-cyan-500/50 rounded-xl p-8 backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                        >
                            <h2 className="text-3xl font-bold mb-6 text-cyan-400 font-mono tracking-wider">
                                {currentBeat.title}
                            </h2>

                            <div className="min-h-[150px] mb-8">
                                <p className="text-xl text-gray-300 leading-relaxed font-mono">
                                    {displayText}
                                    {isTyping && <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />}
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-6">
                                <span className="text-gray-500 text-sm">
                                    STEP {step + 1} / {storyBeats.length}
                                </span>

                                <Button
                                    variant="neon-cyan"
                                    onClick={handleSkip}
                                    className="min-w-[150px]"
                                >
                                    {isTyping ? "SKIP TYPE" : (step === storyBeats.length - 1 ? "ENTER BATTLE" : "NEXT >>")}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
