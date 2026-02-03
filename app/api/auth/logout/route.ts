import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, clearSessionCookie } from '@/lib/auth';

export async function POST() {
    try {
        const session = await getSession();

        if (session) {
            // Delete session from database
            await prisma.session.deleteMany({
                where: { userId: session.userId },
            });
        }

        // Clear session cookie
        await clearSessionCookie();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    }
}
