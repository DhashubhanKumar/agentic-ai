import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000';

class SocketClient {
    private socket: Socket | null = null;
    private sessionId: string | null = null;

    connect(sessionId: string, userId?: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.sessionId = sessionId;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✓ Connected to AI backend');
            this.socket?.emit('join_session', { session_id: sessionId, user_id: userId });
        });

        this.socket.on('disconnect', () => {
            console.log('✗ Disconnected from AI backend');
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(message: string, userId?: string) {
        if (!this.socket || !this.sessionId) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('send_message', {
            session_id: this.sessionId,
            message,
            user_id: userId,
        });
    }

    onMessage(callback: (data: any) => void) {
        this.socket?.on('ai_message', callback);
    }

    onTyping(callback: (data: { typing: boolean }) => void) {
        this.socket?.on('typing', callback);
    }

    onEscalation(callback: (data: any) => void) {
        this.socket?.on('escalation_notice', callback);
    }

    onSessionJoined(callback: (data: any) => void) {
        this.socket?.on('session_joined', callback);
    }

    getSocket() {
        return this.socket;
    }
}

export const socketClient = new SocketClient();

// Generate unique session ID
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
