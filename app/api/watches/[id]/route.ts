import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const watch = await prisma.watch.findUnique({
            where: { id },
            include: {
                brand: true,
                category: true,
            },
        });

        if (!watch) {
            return NextResponse.json(
                { error: 'Watch not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(watch);
    } catch (error) {
        console.error('Error fetching watch:', error);
        return NextResponse.json(
            { error: 'Failed to fetch watch' },
            { status: 500 }
        );
    }
}
