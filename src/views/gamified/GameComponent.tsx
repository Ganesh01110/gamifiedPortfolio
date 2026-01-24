'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { gameConfig } from './gameConfig';
import { PreloaderScene } from './scenes/PreloaderScene';
import { BattleScene } from './scenes/BattleScene';
import { RewardScene } from './scenes/RewardScene';
import { ProjectModal } from '@/src/components/ProjectModal';
import { MobileControls } from '@/src/components/MobileControls';

interface Project {
    id: string;
    name: string;
    category: string;
    problem: string;
    techStack: string[];
    description: string;
    mockup: string;
    images?: string[];
    liveLink: string;
    repoLink: string;
}

interface GameComponentProps {
    characterId: string;
    onReturnToSelection: () => void;
}

export const GameComponent: React.FC<GameComponentProps> = ({
    characterId,
    onReturnToSelection
}) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [isPortrait, setIsPortrait] = React.useState(false);
    const [isGameOver, setIsGameOver] = React.useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    // React Effect to initialize Phaser Game
    useEffect(() => {
        let gameInstance: Phaser.Game | null = null;

        if (typeof window !== 'undefined') {
            // Import Phaser dynamically to avoid SSR issues
            import('phaser').then((Phaser) => {
                // Prevent duplicate game instances
                if (gameRef.current) return;

                console.log('Initializing Phaser Game');
                const config = {
                    ...gameConfig,
                    scene: [] // Start with empty scene list to prevent auto-boot without data
                };

                // Create Phaser Game Instance
                gameInstance = new Phaser.Game(config);
                gameRef.current = gameInstance;

                // Manually add and start scenes to guarantee data injection
                gameInstance.events.once('ready', () => {
                    console.log('[GameComponent] Phaser ready, mounting scenes with ID:', characterId);
                    gameInstance?.scene.add('PreloaderScene', PreloaderScene, false);
                    gameInstance?.scene.add('BattleScene', BattleScene, false);
                    gameInstance?.scene.add('RewardScene', RewardScene, false);

                    // Now start the preloader with the data
                    gameInstance?.scene.start('PreloaderScene', { characterId });
                });

                // Listen for 'open-project-modal' event from Phaser Scene
                window.addEventListener('open-project-modal', ((e: CustomEvent) => {
                    const project = e.detail;
                    setSelectedProject(project);
                }) as EventListener);

                // Listen for 'game-over' event from Phaser Scene
                window.addEventListener('game-over', () => {
                    setIsGameOver(true);
                });

                // Listen for 'return-to-selection' from RewardScene
                window.addEventListener('return-to-selection', () => {
                    if (gameRef.current) {
                        gameRef.current.destroy(true);
                        gameRef.current = null;
                    }
                    onReturnToSelection();
                });
            });
        }

        // Cleanup Function
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [characterId, onReturnToSelection]);

    const handleCloseModal = () => {
        setSelectedProject(null);
        // Signal Phaser to resume and go to level 2
        window.dispatchEvent(new CustomEvent('resume-game'));
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            {isPortrait && (
                <div className="absolute inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
                    <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
                    <p className="text-gray-400">This game is best experienced in Landscape mode.</p>
                </div>
            )}
            <div id="game-container" className="w-full h-full" style={{ touchAction: 'none' }} />

            {isGameOver && (
                <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-[#0a192f]/85 backdrop-blur-sm animate-in fade-in duration-500">
                    <h2 className="text-8xl font-black text-red-500 mb-8 drop-shadow-[4px_4px_4px_rgba(0,0,0,1)] tracking-widest font-mono border-b-4 border-red-600 pb-2">
                        GAME OVER
                    </h2>
                    <button
                        onClick={handleRefresh}
                        className="text-4xl font-bold text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-all duration-300 font-mono tracking-wider drop-shadow-lg animate-pulse"
                    >
                        Click to Refresh
                    </button>
                </div>
            )}

            <MobileControls isVisible={!isPortrait && !isGameOver} />

            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};
