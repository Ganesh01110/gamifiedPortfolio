import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: 'cyan' | 'amber' | 'purple' | 'green' | 'none';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glowColor = 'none',
    onClick
}) => {
    const glowStyles = {
        cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:border-cyan-500',
        amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:border-amber-500',
        purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:border-purple-500',
        green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:border-green-500',
        none: '',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`bg-gray-900 border-2 border-gray-700 rounded-xl p-6 transition-all duration-300 ${glowStyles[glowColor]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </motion.div>
    );
};
