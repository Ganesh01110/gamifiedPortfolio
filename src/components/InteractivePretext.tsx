'use client';

import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '@/src/store/themeStore';
import themeData from '@/src/data/theme.json';

interface Particle {
    char: string;
    originX: number;
    originY: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    highlightColor: string;
    alpha: number;
    baseAlpha: number;
}

export const InteractivePretext: React.FC<{ className?: string }> = ({ className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useThemeStore();
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const phrases = [
            "// ARCHITECTURE & SYSTEM DESIGN",
            "Full-Stack Engineering • Next.js 16 • React 19 • TypeScript • Microservices",
            "Real-Time WebSockets • Scalable Cloud APIs • High Performance UI",
            "Agentic AI Workflows • PostgreSQL • TailwindCSS • System Optimization",
            "Gamified Interfaces • Phaser Engine • Secure Backend Architecture",
            "Turning complex ideas into seamless digital experiences through clean code",
            "const developer = { name: 'Ganesh Sahu', status: 'Building the Future' };",
            "// RESILIENT • SCALABLE • INTERACTIVE • PRODUCTION-READY"
        ];

        const initParticles = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            const fontSize = Math.max(11, Math.min(13, rect.width / 80));
            const lineHeight = fontSize * 2.2;
            const charSpacing = fontSize * 0.72;

            ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

            const totalHeight = phrases.length * lineHeight;
            const startY = Math.max(20, (rect.height - totalHeight) / 2);

            phrases.forEach((phrase, lineIdx) => {
                const lineWidth = phrase.length * charSpacing;
                const startX = Math.max(20, (rect.width - lineWidth) / 2);
                const y = startY + lineIdx * lineHeight;

                for (let i = 0; i < phrase.length; i++) {
                    const char = phrase[i];
                    if (char === ' ') continue;

                    const x = startX + i * charSpacing;
                    const baseAlpha = theme === 'dark' ? 0.16 : 0.22;

                    particles.push({
                        char,
                        originX: x,
                        originY: y,
                        x,
                        y,
                        vx: 0,
                        vy: 0,
                        color: theme === 'dark' ? '#00ACC1' : '#037582',
                        highlightColor: themeData.colors.primary || '#07CEE5',
                        alpha: baseAlpha,
                        baseAlpha
                    });
                }
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        const handleResize = () => {
            initParticles();
        };

        const render = () => {
            const rect = container.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const mouse = mouseRef.current;
            const radius = 110;
            const radiusSq = radius * radius;
            const spring = 0.08;
            const friction = 0.82;

            const fontSize = Math.max(11, Math.min(13, rect.width / 80));
            ctx.font = `500 ${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < radiusSq && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (1 - dist / radius) * 18;
                        const angle = Math.atan2(dy, dx);
                        p.vx += Math.cos(angle) * force;
                        p.vy += Math.sin(angle) * force;
                        p.alpha = Math.min(1, p.baseAlpha + (1 - dist / radius) * 0.85);
                    } else {
                        p.alpha += (p.baseAlpha - p.alpha) * 0.05;
                    }
                } else {
                    p.alpha += (p.baseAlpha - p.alpha) * 0.05;
                }

                // Spring back to origin
                const homeDx = p.originX - p.x;
                const homeDy = p.originY - p.y;
                p.vx += homeDx * spring;
                p.vy += homeDy * spring;
                p.vx *= friction;
                p.vy *= friction;

                p.x += p.vx;
                p.y += p.vy;

                // Render character
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.alpha > p.baseAlpha + 0.2 ? p.highlightColor : p.color;
                
                // Add soft glow for activated characters
                if (p.alpha > p.baseAlpha + 0.3) {
                    ctx.shadowColor = themeData.colors.primary || '#07CEE5';
                    ctx.shadowBlur = 8;
                }

                ctx.fillText(p.char, p.x, p.y);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        initParticles();
        window.addEventListener('resize', handleResize);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div 
            ref={containerRef} 
            className={`absolute inset-0 pointer-events-auto overflow-hidden select-none z-0 ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};
