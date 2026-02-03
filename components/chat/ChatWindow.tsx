'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2 } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { EscalationNotice } from './EscalationNotice';

interface Message {
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    metadata?: any;
    payload?: any;
}

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSendMessage: (message: string) => void;
    isTyping: boolean;
    isEscalated: boolean;
    handoffData?: any;
}

export function ChatWindow({
    isOpen,
    onClose,
    messages,
    onSendMessage,
    isTyping,
    isEscalated,
    handoffData,
}: ChatWindowProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-white/80">
                                    {isEscalated ? 'Connecting to human...' : 'Online'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex flex-col h-[calc(100%-80px)]">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-8 text-center">
                                <div>
                                    <div className="text-6xl mb-4">👋</div>
                                    <h4 className="text-lg font-semibold text-white mb-2">
                                        Welcome to AI Support
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Ask me anything about our watches, orders, or account!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <MessageList messages={messages} />
                                {isTyping && <TypingIndicator isTyping={isTyping} />}
                                {isEscalated && <EscalationNotice handoffData={handoffData} />}
                            </>
                        )}

                        {/* Input */}
                        <MessageInput
                            onSendMessage={onSendMessage}
                            disabled={isTyping}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
