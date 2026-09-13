'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Sparkles, Minus } from 'lucide-react';
import Image from 'next/image';
import { useThemeStore } from '@/src/store/themeStore';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    text: string;
    timestamp: string;
}

function renderFormattedLine(line: string, isUser: boolean) {
    const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+|`[^`]+`)/g;
    const parts = line.split(regex);

    return parts.map((part, i) => {
        if (!part) return null;

        // Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            return (
                <strong key={i} className={`font-semibold ${isUser ? 'text-white' : 'text-cyan-400 dark:text-cyan-300'}`}>
                    {content}
                </strong>
            );
        }

        // Markdown Link: [text](url)
        const mdLinkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (mdLinkMatch) {
            const [, linkText, url] = mdLinkMatch;
            return (
                <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors"
                >
                    {linkText} ↗
                </a>
            );
        }

        // Direct URL: http:// or https://
        if (part.startsWith('http://') || part.startsWith('https://')) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline break-all font-medium transition-colors"
                >
                    {part.length > 35 ? part.substring(0, 32) + '...' : part} ↗
                </a>
            );
        }

        // Code: `code`
        if (part.startsWith('`') && part.endsWith('`')) {
            const code = part.slice(1, -1);
            return (
                <code key={i} className="px-1 py-0.5 rounded bg-black/30 dark:bg-black/50 text-cyan-400 dark:text-cyan-300 font-mono text-[10px]">
                    {code}
                </code>
            );
        }

        return <span key={i}>{part}</span>;
    });
}

function FormattedMessage({ text, isUser }: { text: string; isUser: boolean }) {
    const lines = text.split('\n');

    return (
        <div className="space-y-1">
            {lines.map((line, lIdx) => {
                if (!line.trim()) {
                    return <div key={lIdx} className="h-1" />;
                }

                return (
                    <div key={lIdx} className="leading-relaxed">
                        {renderFormattedLine(line, isUser)}
                    </div>
                );
            })}
        </div>
    );
}

export const Chatbot: React.FC = () => {
    const { theme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: "Hi there! 👋 I'm Ganesh's Portfolio Assistant. Ask me anything about his projects (like HMS, Sworm, Gamified Portfolio), work experience, skills, or background!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (textToSend?: string) => {
        const query = textToSend || input;
        if (!query.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: query.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text }))
                })
            });

            const data = await res.json();
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: data.reply || "I couldn't process that response. Please try again!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMsg]);
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: "Sorry, I ran into an error connecting to the server. You can reach Ganesh at ganeshsahu0108@gmail.com!",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Tell me about HMS project",
        "Who is Ganesh?",
        "What are his top skills?",
        "Sworm Simulation",
        "How do I contact him?"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`
                            w-[92vw] sm:w-[400px] h-[540px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border
                            backdrop-blur-xl transition-colors duration-300
                            ${theme === 'dark'
                                ? 'bg-black/95 border-cyan-500/30 shadow-[0_10px_50px_rgba(7,206,229,0.2)] text-white'
                                : 'bg-white/95 border-cyan-600/20 shadow-[0_10px_50px_rgba(0,131,143,0.2)] text-gray-900'}
                        `}
                    >
                        {/* Header */}
                        <div className={`
                            px-4 py-3 flex items-center justify-between border-b
                            ${theme === 'dark' ? 'bg-gray-900/90 border-white/10' : 'bg-gray-50 border-gray-200'}
                        `}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-[#00838F] to-[#07CEE5] shadow-md">
                                    <Image
                                        src="/image.png"
                                        alt="Ganesh AI"
                                        width={28}
                                        height={28}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold leading-none flex items-center gap-1.5">
                                        Ganesh AI
                                        <Sparkles className="w-3 h-3 text-cyan-400" />
                                    </h3>
                                    <span className="text-[10px] text-green-400 font-medium">● Online • Portfolio Assistant</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    aria-label="Minimize Chat"
                                    title="Minimize"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                                    aria-label="Close Chat"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-cyan-600 text-white text-[11px] shadow-sm">
                                            <User className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-900 border border-cyan-500/40 p-0.5 shadow-sm">
                                            <Image
                                                src="/image.png"
                                                alt="Bot"
                                                width={22}
                                                height={22}
                                                className="object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className={`
                                        max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-cyan-600 to-[#00838F] text-white rounded-tr-none'
                                            : theme === 'dark'
                                                ? 'bg-gray-900/90 border border-white/10 text-gray-200 rounded-tl-none'
                                                : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-none'}
                                    `}>
                                        <FormattedMessage text={msg.text} isUser={msg.role === 'user'} />
                                        <div className={`text-[9px] mt-1.5 text-right opacity-60`}>{msg.timestamp}</div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 pl-9">
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Prompts */}
                        {messages.length < 4 && (
                            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/20">
                                {suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(sug)}
                                        className={`
                                            whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium transition-all cursor-pointer
                                            ${theme === 'dark' 
                                                ? 'bg-gray-800 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                                                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200'}
                                        `}
                                    >
                                        {sug}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className={`
                            p-3 border-t flex items-center gap-2
                            ${theme === 'dark' ? 'bg-gray-900/80 border-white/10' : 'bg-gray-50 border-gray-200'}
                        `}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about HMS, skills, projects, experience..."
                                disabled={isLoading}
                                className={`
                                    flex-1 text-xs px-3 py-2.5 rounded-xl outline-none transition-all
                                    ${theme === 'dark'
                                        ? 'bg-black/60 text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 border border-white/10'
                                        : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 border border-gray-300'}
                                `}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                                aria-label="Send Message"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Launcher Button with image.png */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(prev => !prev)}
                className={`
                    relative p-2.5 rounded-full shadow-2xl flex items-center justify-center group cursor-pointer
                    border transition-all duration-300
                    ${theme === 'dark' 
                        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 border-cyan-400/50 shadow-[0_0_30px_rgba(7,206,229,0.4)]' 
                        : 'bg-gradient-to-br from-cyan-500 to-[#00838F] border-white shadow-[0_0_30px_rgba(0,131,143,0.4)]'}
                `}
                aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
            >
                {isOpen ? (
                    <div className="w-10 h-10 flex items-center justify-center text-white">
                        <X className="w-6 h-6" />
                    </div>
                ) : (
                    <div className="relative w-11 h-11 flex items-center justify-center">
                        <Image
                            src="/image.png"
                            alt="Ganesh AI Assistant"
                            width={42}
                            height={42}
                            className="object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                            priority
                        />
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                        </span>
                    </div>
                )}
            </motion.button>
        </div>
    );
};
