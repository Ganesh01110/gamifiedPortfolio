'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon-cyan' | 'neon-amber' | 'neon-purple' | 'neon-green';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = "button"
}) => {
    const baseStyles = 'rounded-lg font-bold transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-8 py-4 text-lg',
        lg: 'px-10 py-5 text-xl'
    };

    const variantStyles = {
        primary: 'bg-white text-black hover:bg-gray-200',
        secondary: 'bg-gray-800 text-white border-2 border-gray-600 hover:border-white',
        outline: 'bg-transparent text-white border-2 border-white hover:bg-white/10',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
        'neon-cyan': 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]',
        'neon-amber': 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]',
        'neon-purple': 'bg-purple-500 text-white hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]',
        'neon-green': 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    };

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};
