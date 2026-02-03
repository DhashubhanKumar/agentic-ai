import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string) {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    return { token, expiresAt };
}

export async function verifySession(token: string) {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as { userId: string };
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    const payload = await verifySession(token);
    return payload;
}

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
