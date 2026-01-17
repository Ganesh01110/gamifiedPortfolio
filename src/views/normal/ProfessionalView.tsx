'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/src/components/Button';
import { useViewStore } from '@/src/store/viewStore';
import profileData from '@/src/data/profile.json';
import projectsData from '@/src/data/projects.json';
import skillsData from '@/src/data/skills.json';

export const ProfessionalView: React.FC = () => {
    const { setView } = useViewStore();

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div style={{ zoom: '80%' }} className="min-h-[125vh] bg-black text-white selection:bg-cyan-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            {profileData.name}
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
                            <a href="#skills" className="text-gray-400 hover:text-white transition-colors">Skills</a>
                            <a href="#projects" className="text-gray-400 hover:text-white transition-colors">Projects</a>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setView('gamified')}
                                className="hidden md:flex"
                            >
                                Switch to Game Mode 🎮
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Building digital <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 bg-clip-text text-transparent">
                                experiences that matter
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            {profileData.tagline}
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="primary" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
                                View Work
                            </Button>
                            <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                                Contact Me
                            </Button>
                            <a href={profileData.resumeLink || '#'} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary">
                                    Resume
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl font-bold mb-8">About Me</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            {profileData.bio}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Technical Arsenal</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(skillsData).map(([category, skills]) => (
                            <motion.div
                                key={category}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                            >
                                <h3 className="text-xl font-semibold mb-4 capitalize text-cyan-400">
                                    {category.replace(/([A-Z])/g, ' $1').trim()}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(skills as string[]).map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
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
            <section id="projects" className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Featured Projects</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projectsData.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-black border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors"
                            >
                                <div className="h-48 bg-gray-800 relative overflow-hidden">
                                    {/* Placeholder for project image when actual images aren't available */}
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-gray-800 to-gray-900 group-hover:scale-105 transition-transform duration-500">
                                        {project.category === 'frontend' && '🎨'}
                                        {project.category === 'backend' && '⚙️'}
                                        {project.category === 'fullstack' && '⚡'}
                                        {project.category === 'devops' && '🐳'}
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
            <section id="contact" className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeInUp}
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
                                {Object.entries(profileData.socials).map(([platform, link]) => (
                                    <a
                                        key={platform}
                                        href={link}
                                        target="_blank"
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
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800"
                        >
                            <ContactForm />
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
    );
};

function ContactForm() {
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                />
            </div>

            {status.message && (
                <div className={`p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status.message}
                </div>
            )}

            <Button variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message 🚀'}
            </Button>
        </form>
    );
}
