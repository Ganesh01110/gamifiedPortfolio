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
            "// GANESH SAHU • FULL STACK ARCHITECTURE & SYSTEM DESIGN",
            "import { ScalableSystems, HighPerformance, ResilientArchitecture } from '@ganesh/core';",
            "Next.js 16 • React 19 • TypeScript • Node.js • Express • Spring Boot • PHP • Python",
            "WebSockets • PostgreSQL • MariaDB • Prisma ORM • Redis Cache • Docker Compose",
            "const mission = 'Crafting digital experiences with precision, clean code, and passion';",
            "Hospital Management System • 2D Gamified Engine • Socio-Political Simulation Swarm",
            "Microservices • Real-Time Data Pipelines • Automated CLOSE_WAIT Resolution • Prometheus",
            "Fitness Tracker PWA • Smart Car Parking System • Library Management • CI/CD Pipelines",
            "export async function buildTomorrow() { return await Innovation.scale({ mode: 'production' }); }",
            "const dev = { status: 'Available', focus: 'High-Impact Engineering', location: 'India' };",
            "// INTERACTIVE TYPOGRAPHY • PHYSICS-DRIVEN PARTICLES • REACTIVE CANVAS MATRIX",
            "// PERFORMANCE • OBSERVABILITY • CLEAN CODE • AGENTIC WORKFLOWS • USER CENTRIC"
        ];

        const initParticles = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            const fontSize = Math.max(10, Math.min(12.5, rect.width / 80));
            const lineHeight = fontSize * 2.1;
            const charSpacing = fontSize * 0.7;

            ctx.font = `${fontSize}px "JetBrains Mono", "Courier New", monospace`;

            const totalHeight = phrases.length * lineHeight;
            const startY = Math.max(15, (rect.height - totalHeight) / 2);

            phrases.forEach((phrase, lineIdx) => {
                const lineWidth = phrase.length * charSpacing;
                const startX = Math.max(16, (rect.width - lineWidth) / 2);
                const y = startY + lineIdx * lineHeight;

                for (let i = 0; i < phrase.length; i++) {
                    const char = phrase[i];
                    if (char === ' ') continue;

                    const x = startX + i * charSpacing;
                    const baseAlpha = theme === 'dark' ? 0.18 : 0.25;

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

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Active when cursor is anywhere over or slightly around the container
            if (x >= -80 && x <= rect.width + 80 && y >= -80 && y <= rect.height + 80) {
                mouseRef.current = { x, y, active: true };
            } else {
                mouseRef.current.active = false;
            }
        };

        const handleResize = () => {
            initParticles();
        };

        const render = () => {
            const rect = container.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const mouse = mouseRef.current;
            const radius = 130;
            const radiusSq = radius * radius;
            const spring = 0.09;
            const friction = 0.82;

            const fontSize = Math.max(11, Math.min(13, rect.width / 75));
            ctx.font = `500 ${fontSize}px "JetBrains Mono", "Courier New", monospace`;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < radiusSq && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (1 - dist / radius) * 24;
                        const angle = Math.atan2(dy, dx);
                        p.vx += Math.cos(angle) * force;
                        p.vy += Math.sin(angle) * force;
                        p.alpha = Math.min(1, p.baseAlpha + (1 - dist / radius) * 0.82);
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
                ctx.fillStyle = p.alpha > p.baseAlpha + 0.15 ? p.highlightColor : p.color;
                
                // Add electric glow when activated
                if (p.alpha > p.baseAlpha + 0.25) {
                    ctx.shadowColor = themeData.colors.primary || '#07CEE5';
                    ctx.shadowBlur = 10;
                }

                ctx.fillText(p.char, p.x, p.y);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        initParticles();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleGlobalMouseMove);
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div 
            ref={containerRef} 
            className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};
