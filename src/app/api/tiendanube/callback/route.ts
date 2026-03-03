import { sql } from "@/lib/db";
import {
    exchangeCodeForToken,
    saveTiendaNubeConnection,
    initializeTiendaNubeTable,
} from "@/lib/tiendanube";
import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        console.log('[TiendaNube Callback] URL:', request.url);
        console.log('[TiendaNube Callback] searchParams:', Object.fromEntries(request.nextUrl.searchParams.entries()));
        // Initialize table if needed
        await initializeTiendaNubeTable();

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            return NextResponse.json(
                { error: "Missing authorization code" },
                { status: 400 }
            );
        }

        // Get current session
        const session = await auth0.getSession();
        if (!session || !session.user) {
            // No session: Redirect to login with a message
            return NextResponse.redirect(
                new URL(`/auth/login?error=session_required`, request.url)
            );
        }

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code);

        // Get user from database
        const users = await sql`
            SELECT id FROM users WHERE auth0_id = ${session.user.sub}
        `;

        if (!users || users.length === 0) {
            return NextResponse.json(
                { error: "User not found in database" },
                { status: 404 }
            );
        }

        const userId = users[0].id;

        // Save connection
        await saveTiendaNubeConnection(
            userId,
            session.user.sub,
            tokenData.user_id.toString(),
            tokenData.access_token,
            "" // tokenData usually doesn't include name in this flow, using empty string
        );

        // Redirect to dashboard with success message
        return NextResponse.redirect(
            new URL("/dashboard?tiendanube=connected", request.url)
        );
    } catch (error) {
        console.error("Tienda Nube callback error:", error);
        return NextResponse.redirect(
            new URL("/dashboard?tiendanube=error", request.url)
        );
    }
}
