'use client';

import { motion } from 'framer-motion';
import { AlertCircle, User } from 'lucide-react';

interface EscalationNoticeProps {
    handoffData?: any;
}

export function EscalationNotice({ handoffData }: EscalationNoticeProps) {
    const urgency = handoffData?.urgency_level || 'medium';

    const urgencyColors = {
        low: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        medium: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
        high: 'from-red-500/20 to-red-600/20 border-red-500/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mx-4 my-2 p-4 rounded-lg border bg-gradient-to-br ${urgencyColors[urgency as keyof typeof urgencyColors]}`}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-full">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">
                        Connecting you to a human agent...
                    </h4>
                    <p className="text-sm text-white/80">
                        A support specialist will be with you shortly. They'll have full context of our conversation.
                    </p>
                    {urgency === 'high' && (
                        <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            High priority - estimated wait time: 1-2 minutes
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
