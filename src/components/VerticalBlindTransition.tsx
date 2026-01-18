'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerticalBlindTransitionProps {
    onComplete?: () => void;
    color?: string;
}

export const VerticalBlindTransition: React.FC<VerticalBlindTransitionProps> = ({
    onComplete,
    color = "#0f172a" // slate-900 or similar
}) => {
    const [phase, setPhase] = useState<'solid' | 'shrink' | 'done'>('solid');
    const numBars = 15;

    useEffect(() => {
        // Step 1: Show solid color for 2 seconds
        const timer1 = setTimeout(() => {
            setPhase('shrink');
        }, 2000);

        return () => clearTimeout(timer1);
    }, []);

    const barVariants = {
        solid: {
            scaleX: 1,
            transition: { duration: 0 }
        },
        shrink: (i: number) => ({
            scaleX: 0,
            transition: {
                duration: 1.5,
                ease: "easeInOut" as const,
                delay: i * 0.05
            }
        })
    };

    return (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex">
            {Array.from({ length: numBars }).map((_, i) => (
                <motion.div
                    key={i}
                    custom={i}
                    initial="solid"
                    animate={phase === 'shrink' ? 'shrink' : 'solid'}
                    variants={barVariants}
                    onAnimationComplete={() => {
                        if (phase === 'shrink' && i === numBars - 1) {
                            onComplete?.();
                        }
                    }}
                    style={{
                        flex: 1,
                        backgroundColor: color,
                        originX: 0.5, // Shrink to center of each bar
                        height: '100%',
                    }}
                />
            ))}
        </div>
    );
};
