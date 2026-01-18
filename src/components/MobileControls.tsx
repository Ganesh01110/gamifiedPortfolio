'use client';

import React, { useEffect, useState } from 'react';

interface MobileControlsProps {
    isVisible?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ isVisible = true }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleJump = () => {
        window.dispatchEvent(new CustomEvent('mobile-jump'));
    };

    const handleMoveLeft = () => {
        window.dispatchEvent(new CustomEvent('mobile-move', { detail: { direction: 'left', active: true } }));
    };

    const handleMoveRight = () => {
        window.dispatchEvent(new CustomEvent('mobile-move', { detail: { direction: 'right', active: true } }));
    };

    const handleStopMove = () => {
        window.dispatchEvent(new CustomEvent('mobile-move', { detail: { direction: 'none', active: false } }));
    };

    const handleAttack = () => {
        window.dispatchEvent(new CustomEvent('mobile-attack', { detail: { type: 1 } }));
    };

    const handleHeavyAttack = () => {
        window.dispatchEvent(new CustomEvent('mobile-attack', { detail: { type: 2 } }));
    };

    const handleDodge = () => {
        window.dispatchEvent(new CustomEvent('mobile-dodge'));
    };

    if (!isMobile || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[105] pointer-events-none">
            {/* Left Side Controls - Movement + Jump */}
            <div className="absolute left-4 bottom-20 flex flex-col gap-3 pointer-events-auto">
                {/* Jump Button */}
                <button
                    onTouchStart={handleJump}
                    className="w-16 h-16 bg-blue-500/70 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg active:bg-blue-600/90 active:scale-95 transition-all"
                    aria-label="Jump"
                >
                    ⬆️
                </button>

                {/* Movement Controls */}
                <div className="flex gap-2">
                    <button
                        onTouchStart={handleMoveLeft}
                        onTouchEnd={handleStopMove}
                        className="w-16 h-16 bg-gray-700/70 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg active:bg-gray-800/90 active:scale-95 transition-all"
                        aria-label="Move Left"
                    >
                        ⬅️
                    </button>
                    <button
                        onTouchStart={handleMoveRight}
                        onTouchEnd={handleStopMove}
                        className="w-16 h-16 bg-gray-700/70 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg active:bg-gray-800/90 active:scale-95 transition-all"
                        aria-label="Move Right"
                    >
                        ➡️
                    </button>
                </div>
            </div>

            {/* Right Side Controls - Combat */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-3 pointer-events-auto">
                {/* Attack Buttons */}
                <button
                    onTouchStart={handleAttack}
                    className="w-16 h-16 bg-red-500/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg active:bg-red-600/90 active:scale-95 transition-all"
                    aria-label="Attack"
                >
                    ⚔️
                </button>
                <button
                    onTouchStart={handleHeavyAttack}
                    className="w-16 h-16 bg-orange-500/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg active:bg-orange-600/90 active:scale-95 transition-all"
                    aria-label="Heavy Attack"
                >
                    💥
                </button>
                <button
                    onTouchStart={handleDodge}
                    className="w-16 h-16 bg-purple-500/70 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg active:bg-purple-600/90 active:scale-95 transition-all"
                    aria-label="Dodge"
                >
                    🌀
                </button>
            </div>
        </div>
    );
};
