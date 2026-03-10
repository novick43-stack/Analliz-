import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { getTiendaNubeConnection, syncTiendaNubeData, initializeTiendaNubeSyncTables } from "@/lib/tiendanube";
import { sql } from "@/lib/db";

export const maxDuration = 300;

export async function POST() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;

        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const connection = await getTiendaNubeConnection(userId);
        if (!connection) {
            return NextResponse.json({ error: "Tienda Nube not connected" }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendProgress = (message: string, progress: number) => {
                    controller.enqueue(encoder.encode(JSON.stringify({ message, progress }) + "\n"));
                };

                try {
                    await syncTiendaNubeData(userId, connection.store_id, connection.access_token, (msg, p) => {
                        sendProgress(msg, p);
                    });
                    controller.close();
                } catch (err: any) {
                    console.error("Stream sync error:", err);
                    sendProgress(`Error: ${err.message}`, -1);
                    // Just close gracefully after sending the error message to avoid "network error" in browser
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error: any) {
        console.error("Sync API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const table = searchParams.get("table") || "tn_orders";

        // Basic security: only allow specific tn_ tables
        const allowedTables = ["tn_products", "tn_variants", "tn_orders", "tn_order_items", "tn_customers"];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;

        // Query data (filtering by user_id if applicable)
        let data;
        if (table === "tn_order_items" || table === "tn_variants") {
            // These tables don't have user_id, they join with parent
            if (table === "tn_order_items") {
                data = await sql`
                    SELECT i.* FROM tn_order_items i
                    JOIN tn_orders o ON i.order_id = o.id
                    WHERE o.user_id = ${userId}
                    LIMIT 50
                `;
            } else {
                data = await sql`
                    SELECT v.* FROM tn_variants v
                    JOIN tn_products p ON v.product_id = p.id
                    WHERE p.user_id = ${userId}
                    LIMIT 50
                `;
            }
        } else {
            data = await sql.query(`SELECT * FROM ${table} WHERE user_id = $1 LIMIT 50`, [userId]);
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Explore API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
