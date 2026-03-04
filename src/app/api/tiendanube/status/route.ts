import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { getTiendaNubeConnection } from "@/lib/tiendanube";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ connected: false });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;

        if (!userId) {
            return NextResponse.json({ connected: false });
        }

        const connection = await getTiendaNubeConnection(userId);
        return NextResponse.json({ connected: !!connection });
    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json({ connected: false });
    }
}
