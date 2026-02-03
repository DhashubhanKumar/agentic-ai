'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';

import RichMessage from './RichMessage';

interface Message {
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    metadata?: any;
    payload?: any;
}

interface MessageListProps {
    messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }`}>
                            {message.sender === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-white" />
                            )}
                        </div>

                        {/* Message bubble */}
                        <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl ${message.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/10 text-white border border-white/10'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            </div>

                            {/* Timestamp */}
                            <span className="text-xs text-gray-400 mt-1 px-2">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>

                            {/* AI metadata (confidence, intent) */}
                            {message.sender === 'ai' && (
                                <div className="text-xs text-gray-500 mt-1 px-2">
                                    {message.metadata?.intent && (
                                        <span className="opacity-70">Intent: {message.metadata.intent}</span>
                                    )}
                                </div>
                            )}

                            {/* Rich Content (e.g. Products) */}
                            {message.sender === 'ai' && message.payload && (
                                <div className="mt-2 w-full">
                                    <RichMessage payload={message.payload} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
}
