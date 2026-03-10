import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const maxDuration = 30;

export async function GET(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const dateFilter = from && to ? sql`AND o.created_at >= ${from}::timestamp AND o.created_at <= ${to}::timestamp` : sql``;

        // Run both queries in parallel
        const [skuVelocity, aovDistribution] = await Promise.all([
            // 1. SKU Velocity (Items sold vs stock)
            sql`
                SELECT 
                    i.name,
                    SUM(i.quantity) as sold_count,
                    MAX(v.stock) as current_stock,
                    SUM(i.price * i.quantity) as revenue
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                JOIN tn_variants v ON i.variant_id = v.id
                WHERE o.user_id = ${userId}
                ${dateFilter}
                GROUP BY i.name
                ORDER BY sold_count DESC
                LIMIT 15
            `,

            // 2. Average Order Value (AOV) Distribution
            sql`
                SELECT 
                    floor(total / 1000) * 1000 as bucket,
                    COUNT(id) as count
                FROM tn_orders
                WHERE user_id = ${userId}
                ${dateFilter}
                GROUP BY bucket
                ORDER BY bucket ASC
            `,
        ]);

        return NextResponse.json({
            skuVelocity,
            aovDistribution
        });
    } catch (error: any) {
        console.error("Insights Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
