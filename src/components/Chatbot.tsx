'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Minus } from 'lucide-react';
import { useThemeStore } from '@/src/store/themeStore';
import themeData from '@/src/data/theme.json';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    text: string;
    timestamp: string;
}

export const Chatbot: React.FC = () => {
    const { theme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: "Hi there! 👋 I'm Ganesh's Portfolio Assistant. Ask me anything about his skills, experience, projects, or background!",
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
        "Who is Ganesh?",
        "What are his top skills?",
        "Tell me about the HMS project",
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
                            w-[92vw] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border
                            backdrop-blur-xl transition-colors duration-300
                            ${theme === 'dark'
                                ? 'bg-black/90 border-cyan-500/30 shadow-[0_10px_40px_rgba(7,206,229,0.15)] text-white'
                                : 'bg-white/95 border-cyan-600/20 shadow-[0_10px_40px_rgba(0,131,143,0.15)] text-gray-900'}
                        `}
                    >
                        {/* Header */}
                        <div className={`
                            px-4 py-3 flex items-center justify-between border-b
                            ${theme === 'dark' ? 'bg-gray-900/80 border-white/10' : 'bg-gray-50 border-gray-200'}
                        `}>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                                    style={{ background: themeData.textGradients.secondary || 'linear-gradient(135deg, #07CEE5, #00838F)' }}
                                >
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold leading-none flex items-center gap-1.5">
                                        Ganesh AI
                                        <Sparkles className="w-3 h-3 text-cyan-400" />
                                    </h3>
                                    <span className="text-[10px] text-green-400 font-medium">● Online</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    aria-label="Minimize Chat"
                                    title="Minimize"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
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
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]
                                        ${msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white' 
                                            : theme === 'dark' ? 'bg-gray-800 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-100 text-cyan-800'}
                                    `}>
                                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                    </div>

                                    <div className={`
                                        max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-cyan-600 to-[#00838F] text-white rounded-tr-none'
                                            : theme === 'dark'
                                                ? 'bg-gray-900 border border-white/10 text-gray-200 rounded-tl-none'
                                                : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-none'}
                                    `}>
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                        <div className={`text-[9px] mt-1 text-right opacity-60`}>{msg.timestamp}</div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 pl-8">
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Prompts */}
                        {messages.length < 3 && (
                            <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/5">
                                {suggestions.map((sug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(sug)}
                                        className={`
                                            whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium transition-all
                                            ${theme === 'dark' 
                                                ? 'bg-gray-800/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
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
                            ${theme === 'dark' ? 'bg-gray-900/60 border-white/10' : 'bg-gray-50 border-gray-200'}
                        `}>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about skills, projects, experience..."
                                disabled={isLoading}
                                className={`
                                    flex-1 text-xs px-3 py-2 rounded-xl outline-none transition-all
                                    ${theme === 'dark'
                                        ? 'bg-black/50 text-white placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 border border-white/10'
                                        : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 border border-gray-300'}
                                `}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                                aria-label="Send Message"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Launcher Button */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(prev => !prev)}
                className={`
                    relative p-3.5 rounded-full shadow-2xl flex items-center justify-center group cursor-pointer
                    border transition-all duration-300
                    ${theme === 'dark' 
                        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border-cyan-500/40 text-cyan-400 shadow-[0_0_25px_rgba(7,206,229,0.35)]' 
                        : 'bg-gradient-to-br from-cyan-600 to-[#00838F] border-white text-white shadow-[0_0_25px_rgba(0,131,143,0.35)]'}
                `}
                aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageSquare className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                        </span>
                    </>
                )}
            </motion.button>
        </div>
    );
};
