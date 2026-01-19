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

    const controlBtnClass = "w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border border-white/20 bg-green-500/20 backdrop-blur-sm active:bg-green-600/40 active:scale-95 transition-all pointer-events-auto select-none touch-none";

    return (
        <div className="fixed inset-0 z-[105] pointer-events-none">
            {/* Left Side Controls - Movement + Jump (PUBG Style) */}
            <div className="absolute left-10 bottom-10 flex flex-col items-center gap-2">
                {/* Jump Button - Top Center */}
                <button
                    onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
                    className={controlBtnClass}
                    aria-label="Jump"
                >
                    ^
                </button>
                <div className="flex gap-16 -mt-2">
                    {/* Move Left */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleMoveLeft(); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleStopMove(); }}
                        className={controlBtnClass}
                        aria-label="Move Left"
                    >
                        &lt;
                    </button>
                    {/* Move Right */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleMoveRight(); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleStopMove(); }}
                        className={controlBtnClass}
                        aria-label="Move Right"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* Right Side Controls - Combat (PUBG Style) */}
            <div className="absolute right-10 bottom-10 flex flex-col items-center gap-2">
                {/* Dodge Button - Top Center */}
                <button
                    onTouchStart={(e) => { e.preventDefault(); handleDodge(); }}
                    className={controlBtnClass}
                    aria-label="Dodge"
                >
                    🛡️
                </button>
                <div className="flex gap-16 -mt-2">
                    {/* Attack 2 - Left */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleHeavyAttack(); }}
                        className={controlBtnClass}
                        aria-label="Heavy Attack"
                    >
                        🔥
                    </button>
                    {/* Attack 1 - Right */}
                    <button
                        onTouchStart={(e) => { e.preventDefault(); handleAttack(); }}
                        className={controlBtnClass}
                        aria-label="Attack"
                    >
                        ⚔️
                    </button>
                </div>
            </div>
        </div>
    );
};
