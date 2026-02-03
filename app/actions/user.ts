"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserAddress(formData: FormData) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    const address = formData.get("address") as string;

    if (!address) {
        return { error: "Address is required" };
    }

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data: { address }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update address" };
    }
}
