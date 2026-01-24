'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Globe, Github } from 'lucide-react';
import { useThemeStore } from '@/src/store/themeStore';

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

interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    const { theme } = useThemeStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (project) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [project]);

    if (!project) return null;

    const images = (project.images && project.images.length > 0 ? project.images : [project.mockup])
        .filter(img => img && img.trim() !== '');

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <AnimatePresence>
            {project && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full max-w-5xl border rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Left: Image Carousel */}
                        <div className="w-full md:w-3/5 relative bg-black flex items-center justify-center group overflow-hidden h-64 md:h-auto">
                            <AnimatePresence mode="wait">
                                {images[currentImageIndex] && (
                                    <motion.img
                                        key={currentImageIndex}
                                        src={images[currentImageIndex]}
                                        alt={project.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </AnimatePresence>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    {/* Indicators */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-cyan-500' : 'bg-gray-500'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right: Project Details */}
                        <div className={`w-full md:w-2/5 p-6 md:p-8 overflow-y-auto backdrop-blur-md transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
                            <div className="mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 mb-2 block">
                                    {project.category}
                                </span>
                                <h2 className={`text-3xl font-bold mb-4 transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {project.name}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-sm font-semibold uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>The Problem</h3>
                                    <p className={`leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {project.problem}
                                    </p>
                                </div>

                                <div>
                                    <h3 className={`text-sm font-semibold uppercase mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description</h3>
                                    <p className={`leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {project.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-400"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    {project.liveLink && (
                                        <a
                                            href={project.liveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium"
                                        >
                                            <Globe size={18} />
                                            Live Demo
                                        </a>
                                    )}
                                    <a
                                        href={project.repoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors font-medium border ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-200'}`}
                                    >
                                        <Github size={18} />
                                        Repository
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
