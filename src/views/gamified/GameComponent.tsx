'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { gameConfig } from './gameConfig';
import { BattleScene } from './scenes/BattleScene';
import { RewardScene } from './scenes/RewardScene';

interface GameComponentProps {
    characterId: string;
    onReturnToSelection: () => void;
}

export const GameComponent: React.FC<GameComponentProps> = ({
    characterId,
    onReturnToSelection
}) => {
    const gameRef = useRef<Phaser.Game | null>(null);

    const [isPortrait, setIsPortrait] = React.useState(false);

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

    useEffect(() => {
        // Initialize Phaser game
        const config: Phaser.Types.Core.GameConfig = {
            ...gameConfig,
            scene: [BattleScene, RewardScene],
        };

        gameRef.current = new Phaser.Game(config);

        // Start the battle scene with the selected character
        gameRef.current.scene.start('BattleScene', { characterId });

        // Listen for return to selection event
        const handleReturn = () => {
            onReturnToSelection();
        };

        window.addEventListener('return-to-selection', handleReturn);

        // Cleanup
        return () => {
            window.removeEventListener('return-to-selection', handleReturn);
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [characterId, onReturnToSelection]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            {isPortrait && (
                <div className="absolute inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
                    <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
                    <p className="text-gray-400">This game is best experienced in Landscape mode.</p>
                </div>
            )}
            <div id="game-container" className="w-full h-full" />
        </div>
    );
};
