'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { socketClient, generateSessionId } from '@/lib/socket';

interface Message {
    content: string;
    sender: 'user' | 'ai';
    timestamp: string;
    metadata?: any;
    payload?: any;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isEscalated, setIsEscalated] = useState(false);
    const [handoffData, setHandoffData] = useState<any>(null);
    const [sessionId] = useState(() => generateSessionId());
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Connect to Socket.IO
        const socket = socketClient.connect(sessionId);

        // Listen for session joined
        socketClient.onSessionJoined((data) => {
            console.log('Session joined:', data);
            if (data.messages && data.messages.length > 0) {
                setMessages(data.messages);
            }
        });

        // Listen for AI messages
        socketClient.onMessage((data) => {
            const newMessage: Message = {
                content: data.message,
                sender: 'ai',
                timestamp: data.timestamp,
                metadata: data.metadata,
                payload: data.payload,
            };

            setMessages((prev) => [...prev, newMessage]);
            setIsTyping(false);

            // Increment unread count if chat is closed
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        // Listen for typing indicator
        socketClient.onTyping((data) => {
            setIsTyping(data.typing);
        });

        // Listen for escalation
        socketClient.onEscalation((data) => {
            setIsEscalated(data.escalated);
            setHandoffData(data.handoff_data);
        });

        return () => {
            socketClient.disconnect();
        };
    }, [sessionId, isOpen]);

    const handleSendMessage = (message: string) => {
        // Add user message to UI
        const userMessage: Message = {
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send to backend
        socketClient.sendMessage(message);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <ChatWindow
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                messages={messages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                isEscalated={isEscalated}
                handoffData={handoffData}
            />

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center z-50 hover:shadow-purple-500/50 transition-shadow"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unread badge */}
                {unreadCount > 0 && !isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                        {unreadCount}
                    </motion.div>
                )}
            </motion.button>
        </>
    );
}
