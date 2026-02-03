import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return new NextResponse("Email already exists", { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // Storing as plain text as requested for now
                name,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log("[REGISTER_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
