'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/src/components/Button';
import { useViewStore } from '@/src/store/viewStore';
import profileData from '@/src/data/profile.json';
import projectsData from '@/src/data/projects.json';
import skillsData from '@/src/data/skills.json';
import { ProjectModal } from '@/src/components/ProjectModal';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

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
    company?: string;
    role?: string;
}

export const ProfessionalView: React.FC = () => {
    const { setView } = useViewStore();

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const [cursorVariant, setCursorVariant] = React.useState<'default' | 'text' | 'button' | 'card' | 'header'>('default');
    const [activeSection, setActiveSection] = React.useState('hero');

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id || 'hero');
                }
            });
        }, { threshold: 0.5 });

        const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const cursorvariants = {
        default: {
            height: 32,
            width: 32,
            x: mousePos.x - 16,
            y: mousePos.y - 16,
            backgroundColor: "transparent",
            mixBlendMode: "normal" as const
        },
        text: {
            height: 64,
            width: 64,
            x: mousePos.x - 32,
            y: mousePos.y - 32,
            backgroundColor: "white",
            mixBlendMode: "difference" as const
        },
        button: {
            height: 80,
            width: 80,
            x: mousePos.x - 40,
            y: mousePos.y - 40,
            backgroundColor: "cyan",
            mixBlendMode: "difference" as const
        },
        card: {
            height: 120,
            width: 120,
            x: mousePos.x - 60,
            y: mousePos.y - 60,
            backgroundColor: "white",
            mixBlendMode: "difference" as const
        },
        header: {
            height: 100,
            width: 100,
            x: mousePos.x - 50,
            y: mousePos.y - 50,
            backgroundColor: "white",
            mixBlendMode: "difference" as const
        }
    };

    const textEnter = () => setCursorVariant('text');
    const textLeave = () => setCursorVariant('default');
    const buttonEnter = () => setCursorVariant('button');
    const buttonLeave = () => setCursorVariant('default');
    const cardEnter = () => setCursorVariant('card');
    const cardLeave = () => setCursorVariant('default');
    const headerEnter = () => setCursorVariant('header');
    const headerLeave = () => setCursorVariant('default');

    const quotes = [
        "Clean code, Elegant designs",
        "Elevating user experiences with elegant code and design.",
        "Html, css, Java script, typescript, tailwind, bootstrap",
        "Transforming ideas into captivating web realities",
        "java, spring, sql",
        "Bringing your vision to life, one pixel at a time.",
        "react, next.js, mongodb, redux, vite",
        "Building bridges between imagination and innovation"
    ];

    return (
        <>
            {/* Cursor Trail */}
            <motion.div
                className="fixed top-0 left-0 rounded-full border border-white pointer-events-none z-[9999] mix-blend-difference"
                animate={cursorVariant === 'default' ? cursorvariants.default : cursorvariants[cursorVariant]}
                transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-3 h-3 rounded-full bg-cyan-500 pointer-events-none z-[9999] mix-blend-difference"
                animate={{
                    x: mousePos.x - 1.5,
                    y: mousePos.y - 1.5,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 450, mass: 0.2 }}
            />

            <div style={{ zoom: '80%' }} className="min-h-[125vh] bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden professional-view">
                {/* Navigation */}
                <nav
                    onMouseEnter={headerEnter}
                    onMouseLeave={headerLeave}
                    className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div
                                onMouseEnter={textEnter}
                                onMouseLeave={textLeave}
                                className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
                            >
                                {profileData.name}
                            </div>
                            <div className="flex items-center gap-6">
                                <a href="#about" onMouseEnter={textEnter} onMouseLeave={textLeave} className="text-gray-400 hover:text-white transition-colors">About</a>
                                <a href="#skills" onMouseEnter={textEnter} onMouseLeave={textLeave} className="text-gray-400 hover:text-white transition-colors">Skills</a>
                                <a href="#projects" onMouseEnter={textEnter} onMouseLeave={textLeave} className="text-gray-400 hover:text-white transition-colors">Projects</a>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onMouseEnter={buttonEnter}
                                    onMouseLeave={buttonLeave}
                                    onClick={() => setView('gamified')}
                                    className="hidden md:flex"
                                >
                                    Switch to Game Mode 🎮
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Side Navigation Dots */}
                <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-6">
                    {['hero', 'about', 'skills', 'projects', 'contact'].map((section) => (
                        <div key={section} className="relative group flex items-center justify-end">
                            <span className={`
                                absolute right-8 px-2 py-1 rounded bg-black/80 border border-white/10 text-[10px] 
                                uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 
                                transition-all duration-300 pointer-events-none whitespace-nowrap
                                ${activeSection === section ? 'text-cyan-400 border-cyan-500/30' : ''}
                            `}>
                                {section}
                            </span>
                            <button
                                onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })}
                                className={`
                                    w-2 h-2 rounded-full transition-all duration-300
                                    ${activeSection === section
                                        ? 'bg-cyan-500 w-8 h-1'
                                        : 'bg-white/20 hover:bg-white/60 hover:scale-125'}
                                `}
                                onMouseEnter={buttonEnter}
                                onMouseLeave={buttonLeave}
                                aria-label={`Scroll to ${section}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Hero Section */}
                <section id="hero" className="pt-32 pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1
                                onMouseEnter={textEnter}
                                onMouseLeave={textLeave}
                                className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                            >
                                Building digital <br />
                                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 bg-clip-text text-transparent">
                                    experiences that matter
                                </span>
                            </h1>
                            <p
                                onMouseEnter={textEnter}
                                onMouseLeave={textLeave}
                                className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                            >
                                {profileData.tagline}
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="px-6 py-2.5 text-base font-medium rounded-full"
                                    onMouseEnter={buttonEnter}
                                    onMouseLeave={buttonLeave}
                                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    View Work
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-6 py-2.5 text-base font-medium rounded-full border-white/20 hover:border-white"
                                    onMouseEnter={buttonEnter}
                                    onMouseLeave={buttonLeave}
                                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Contact Me
                                </Button>
                                <a
                                    href={profileData.resumeLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="px-6 py-2.5 text-base font-medium rounded-full border-gray-800"
                                        onMouseEnter={buttonEnter}
                                        onMouseLeave={buttonLeave}
                                    >
                                        Resume
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* About & Experience Section */}
                <section
                    id="about"
                    onMouseEnter={headerEnter}
                    onMouseLeave={headerLeave}
                    className="py-24 bg-gray-900/30"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-x-12 gap-y-16 items-start">
                            {/* About Column */}
                            <div className="lg:col-span-7">
                                <h2
                                    onMouseEnter={textEnter}
                                    onMouseLeave={textLeave}
                                    className="text-3xl font-bold mb-12 text-center lg:text-left"
                                >
                                    About Me
                                </h2>
                                <motion.div
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    onMouseEnter={cardEnter}
                                    onMouseLeave={cardLeave}
                                    className="bg-black/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-sm min-h-[400px] flex flex-col justify-center"
                                >
                                    <p
                                        onMouseEnter={textEnter}
                                        onMouseLeave={textLeave}
                                        className="text-xl text-gray-300 leading-relaxed"
                                    >
                                        {profileData.bio}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Experience Column */}
                            <div className="lg:col-span-3">
                                <h2
                                    onMouseEnter={textEnter}
                                    onMouseLeave={textLeave}
                                    className="text-3xl font-bold mb-12 text-center lg:text-left"
                                >
                                    Experience
                                </h2>
                                <motion.div
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true }}
                                    variants={fadeInUp}
                                    onMouseEnter={cardEnter}
                                    onMouseLeave={cardLeave}
                                    className="bg-black/40 border border-gray-800 p-8 rounded-3xl backdrop-blur-sm min-h-[400px] flex flex-col relative"
                                >
                                    <div className="space-y-8 flex-grow">
                                        {profileData.experience?.map((exp, idx) => (
                                            <div
                                                key={idx}
                                                className="relative pl-6 group cursor-pointer"
                                                onClick={() => setSelectedProject({
                                                    ...exp.project,
                                                    company: exp.company,
                                                    role: exp.role,
                                                    id: `experience-${idx}`,
                                                    category: 'experience',
                                                    mockup: '',
                                                    liveLink: '',
                                                    repoLink: ''
                                                })}
                                            >
                                                <div className="absolute left-0 top-2 w-2 h-2 rounded-full border border-gray-400 group-hover:border-cyan-500 transition-colors" />
                                                <div className="flex justify-between items-start">
                                                    <div className="pr-4">
                                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                                                            {exp.company} <br />
                                                            <span className="text-[10px] text-gray-500 font-normal uppercase tracking-widest">({exp.role})</span>
                                                        </h3>
                                                    </div>
                                                    <div className="p-1.5 rounded-full border border-gray-800 group-hover:border-cyan-500 group-hover:bg-cyan-500/10 transition-all duration-300 transform group-hover:rotate-12">
                                                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-800/50">
                                        <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-medium">
                                            Click to view details
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                <section id="skills" className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-6xl font-bold mb-12 text-center">Technical Arsenal</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Object.entries(skillsData)
                                .filter(([category]) => category !== 'fullstack')
                                .map(([category, skills]) => (
                                    <motion.div
                                        key={category}
                                        initial="initial"
                                        whileInView="animate"
                                        viewport={{ once: true }}
                                        variants={fadeInUp}
                                        onMouseEnter={headerEnter}
                                        onMouseLeave={headerLeave}
                                        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                                    >
                                        <h3
                                            onMouseEnter={textEnter}
                                            onMouseLeave={textLeave}
                                            className="text-xl font-semibold mb-4 capitalize text-cyan-400"
                                        >
                                            {category.replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(skills as string[]).map((skill) => (
                                                <span
                                                    key={skill}
                                                    onMouseEnter={textEnter}
                                                    onMouseLeave={textLeave}
                                                    className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </section>

                {/* Projects Section */}
                <section id="projects" className="py-20 bg-gray-900/50 relative overflow-hidden">
                    {/* Criss-Cross Quote Loop */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col justify-between py-4 lg:justify-center lg:gap-12 overflow-hidden criss-cross-container">
                        <div className="whitespace-nowrap flex gap-8 animate-marquee-slow lg:rotate-[11deg] lg:scale-150 criss-cross-top">
                            {[...quotes, ...quotes].map((quote, i) => (
                                <span key={i} className="text-2xl lg:text-4xl font-black uppercase text-white/50 criss-cross-item">{quote}</span>
                            ))}
                        </div>
                        <div className="whitespace-nowrap flex gap-8 animate-marquee-slow-reverse lg:-rotate-[11deg] lg:scale-150 criss-cross-bottom">
                            {[...quotes, ...quotes].map((quote, i) => (
                                <span key={i} className="text-2xl lg:text-4xl font-black uppercase text-white/50 criss-cross-item">{quote}</span>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <h2 className="text-4xl font-bold mb-12 text-center">Featured Projects</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projectsData.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedProject(project)}
                                    onMouseEnter={cardEnter}
                                    onMouseLeave={cardLeave}
                                    className="group bg-black border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors cursor-pointer"
                                >
                                    <div className="h-48 bg-gray-800 relative overflow-hidden flex items-center justify-center">
                                        {/* Project Mockup Image */}
                                        {project.mockup ? (
                                            <Image
                                                src={project.mockup}
                                                alt={project.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-gray-800 to-gray-900 group-hover:scale-105 transition-transform duration-500">
                                                🌩️
                                            </div>
                                        )}

                                        {/* Category Emoji at Corner */}
                                        <div className="absolute top-3 left-3 text-xl bg-black/60 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center z-20 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            {project.category === 'frontend' && '🎨'}
                                            {project.category === 'backend' && '⚙️'}
                                            {project.category === 'fullstack' && '⚡'}
                                            {project.category === 'devops' && '🐳'}
                                            {project.category === 'experience' && '💼'}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.techStack.slice(0, 3).map((tech) => (
                                                <span key={tech} className="text-xs text-gray-500 border border-gray-800 px-2 py-1 rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.techStack.length > 3 && (
                                                <span className="text-xs text-gray-500 px-2 py-1">
                                                    +{project.techStack.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section
                    id="contact"
                    onMouseEnter={headerEnter}
                    onMouseLeave={headerLeave}
                    className="py-20"
                >
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            onMouseEnter={textEnter}
                            onMouseLeave={textLeave}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl font-bold mb-8">Let&apos;s Work Together</h2>
                            <p className="text-lg text-gray-400">
                                I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Info & Socials */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-xl font-semibold mb-6 text-cyan-400">Connect with me</h3>
                                <div className="flex flex-col gap-6">
                                    {Object.entries(profileData.socials).map(([platform, link]) => {
                                        let href = link;
                                        if (platform.toLowerCase() === 'email') {
                                            href = `mailto:${link}`;
                                        } else if (platform.toLowerCase() === 'whatsapp') {
                                            // Handle phone/whatsapp link with tel: protocol as requested
                                            href = `tel:${link.replace(/\s+/g, '')}`;
                                        }
                                        return (
                                            <a
                                                key={platform}
                                                href={href}
                                                target={platform.toLowerCase() === 'github' || platform.toLowerCase() === 'linkedin' || platform.toLowerCase() === 'twitter' ? "_blank" : undefined}
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group"
                                            >
                                                <span className="bg-gray-800 p-3 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                                                    {/* Simple Icon Placeholders */}
                                                    {platform === 'github' && '🐙'}
                                                    {platform === 'Email' && '📧'}
                                                    {platform === 'whatsapp' && '📞'}
                                                    {platform === 'linkedin' && '💼'}
                                                    {platform === 'twitter' && '🐦'}

                                                </span>
                                                <span className="capitalize">{platform}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                onMouseEnter={cardEnter}
                                onMouseLeave={cardLeave}
                                className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800"
                            >
                                <ContactForm
                                    buttonEnter={buttonEnter}
                                    buttonLeave={buttonLeave}
                                    textEnter={textEnter}
                                    textLeave={textLeave}
                                />
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="text-gray-500 text-sm text-center mt-20"
                        >
                            © {new Date().getFullYear()} {profileData.name}. All rights reserved.
                        </motion.p>
                    </div>
                </section>

                {/* Project Modal */}
                <ProjectModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />

                {/* Floating Action Button for Mobile */}
                <div className="fixed bottom-6 right-6 md:hidden z-50">
                    <Button
                        variant="neon-cyan"
                        className="rounded-full w-14 h-14 flex items-center justify-center p-0 shadow-lg"
                        onClick={() => setView('gamified')}
                    >
                        🎮
                    </Button>
                </div>
            </div>
        </>
    );
};

function ContactForm({
    buttonEnter,
    buttonLeave,
    textEnter,
    textLeave
}: {
    buttonEnter: () => void;
    buttonLeave: () => void;
    textEnter: () => void;
    textLeave: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [status, setStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    // Simple client-side submission wrapper
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        const formData = new FormData(event.currentTarget);

        // Dynamic import to avoid server-action issues/hydration mismatches if simple component
        const { sendEmail } = await import('@/src/actions/sendEmail');
        const result = await sendEmail(null, formData);

        setIsSubmitting(false);

        if (result?.errors) {
            setStatus({ type: 'error', message: 'Please fix the errors in the form.' });
        } else if (result?.message) {
            setStatus({
                type: result.success ? 'success' : 'error',
                message: result.message
            });
            if (result.success) {
                (event.target as HTMLFormElement).reset();
            }
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Your Name"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="your@email.com"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    rows={4}
                    onMouseEnter={textEnter}
                    onMouseLeave={textLeave}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                />
            </div>

            {status.message && (
                <div className={`p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status.message}
                </div>
            )}

            <Button
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
                onMouseEnter={buttonEnter}
                onMouseLeave={buttonLeave}
            >
                {isSubmitting ? 'Sending...' : 'Send Message 🚀'}
            </Button>
        </form>
    );
}
