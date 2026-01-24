'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import profileData from '@/src/data/profile.json';
import { useThemeStore } from '@/src/store/themeStore';
import Image from 'next/image';

export const IDCard: React.FC = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { theme } = useThemeStore();

    // Drag transformation values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring physics configuration for the snap-back effect
    const springConfig = { damping: 20, stiffness: 150, mass: 1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Tilt effect based on drag position
    const rotateX = useTransform(springY, [-100, 200], [20, -20]);
    const rotateY = useTransform(springX, [-100, 100], [-15, 15]);

    // Lanyard path calculation
    const lanyardPath = useTransform([springX, springY], ([lx, ly]) => {
        const startX = 140; // Center of the container
        const startY = -400; // Attached to the "ceiling"

        // The end point should be exactly where the card's clip is
        const endX = 140 + Number(lx);
        const endY = 15 + Number(ly);

        // Control points for a natural hang
        const cp1x = startX;
        const cp1y = startY + (endY - startY) * 0.4;
        const cp2x = endX;
        const cp2y = startY + (endY - startY) * 0.6;

        return `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`;
    });

    return (
        <div className="relative flex items-center justify-center h-[520px] w-full max-w-[400px] perspective-2000">
            {/* Lanyard SVG */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                viewBox="0 0 280 500"
            >
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Lanyard Strap */}
                <motion.path
                    d={lanyardPath}
                    fill="none"
                    stroke={theme === 'dark' ? '#222' : '#cbd5e1'}
                    strokeWidth="20"
                    strokeLinecap="round"
                    filter="url(#shadow)"
                />

                {/* Visual Knot/Clip Interface */}
                <motion.g style={{ x: springX, y: springY }}>
                    <rect x="130" y="5" width="30" height="25" rx="3" fill="#333" />
                    <circle cx="140" cy="15" r="4" fill="#666" />
                </motion.g>
            </svg>

            {/* The ID Card */}
            <motion.div
                ref={cardRef}
                drag
                dragConstraints={{ left: -150, right: 150, top: -100, bottom: 200 }}
                dragElastic={0.1}
                whileDrag={{ cursor: 'grabbing', scale: 0.98 }}
                onDrag={(e, info) => {
                    x.set(info.offset.x);
                    y.set(info.offset.y);
                }}
                onDragEnd={() => {
                    x.set(0);
                    y.set(0);
                }}
                style={{
                    x: springX,
                    y: springY,
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
                className={`
                    z-20 w-[280px] h-[450px] rounded-[32px] 
                    cursor-grab active:cursor-grabbing p-[8px] flex flex-col relative group transition-colors duration-500
                    ${theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-600 via-gray-200 to-gray-800 border-[0.6px] border-white/30'
                        : 'bg-gradient-to-br from-gray-400 via-white to-gray-500 border-[0.6px] border-black/20'}
                    shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)]
                `}
            >
                {/* Inner Container with Border Shadow */}
                <div className={`
                    w-full h-full rounded-[24px] overflow-hidden relative flex flex-col shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]
                    ${theme === 'dark' ? 'bg-[#151515]' : 'bg-[#ffffff]'}
                `}>
                    {/* Vibrant Card Top (Orange gradient) */}
                    <div className="absolute top-0 left-0 right-0 h-[58%] bg-gradient-to-br from-[#00838F] to-[#07CEE5] z-0" />

                    {/* Content Section */}
                    <div className="relative z-10 flex flex-col h-full p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Portfolio</span>
                            </div>
                            <div className="w-10 h-1 bg-white/30 rounded-full shadow-inner" />
                        </div>

                        {/* Profile Section */}
                        <div className="flex-grow flex flex-col items-center">
                            {/* Metallic Image Frame */}
                            <div className={`
                                w-44 h-44 p-1 rounded-3xl mb-3 overflow-hidden shadow-2xl relative translate-y-2
                                ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
                                bg-gradient-to-br from-gray-400 via-white to-gray-600
                            `}>
                                <div className={`w-full h-full rounded-[22px] overflow-hidden relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    <Image
                                        src="/projects/profile.jpg"
                                        alt={profileData.name}
                                        fill
                                        className="object-cover"
                                        sizes="176px"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    {/* Overlay Label */}
                                    <div className="absolute bottom-3 left-0 right-0 text-center">
                                        <span className="bg-white text-[#037582] text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                                            Fullstack developer
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="mt-6 text-center px-4">
                                <h2 className={`text-2xl font-black mb-1 drop-shadow-lg leading-none transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {profileData.name}
                                </h2>
                                <p className={`text-[10px] uppercase tracking-[0.3em] font-medium mb-6 transition-colors ${theme === 'dark' ? 'text-white/80' : 'text-gray-600'}`}>
                                    Interactive Developer
                                </p>

                                {/* Status Block */}
                                <div className={`
                                    w-full py-4 px-6 rounded-2xl border transition-all duration-500
                                    ${theme === 'dark' ? 'bg-black/40 border-white/5 shadow-inner' : 'bg-gray-200 border-black/5 shadow-md'}
                                `}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[8px] font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Status</span>
                                        <span className="text-[8px] font-black text-green-400 uppercase tracking-wider">● Available</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[8px] font-bold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Experience</span>
                                        <span className={`text-[8px] font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profileData.TotalExperience || 1}+ Years</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Notch Detail */}
                        <div className="mt-4 flex justify-center">
                            <div className={`h-1.5 w-16 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
