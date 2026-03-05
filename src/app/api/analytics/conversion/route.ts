import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

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

        const dateFilter = from && to ? sql`AND created_at >= ${from}::timestamp AND created_at <= ${to}::timestamp` : sql``;

        // 1. Order Status Funnel
        const statusFunnel = await sql`
            SELECT 
                status,
                payment_status,
                shipping_status,
                COUNT(id) as count,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY status, payment_status, shipping_status
        `;

        // 2. Conversion KPIs (Orders / Unique customers ratio as a proxy if visits are not available)
        const summary = await sql`
            SELECT 
                COUNT(DISTINCT id) as total_orders,
                COUNT(DISTINCT customer_id) as unique_customers,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
        `;

        return NextResponse.json({
            statusFunnel,
            summary: summary[0] || { total_orders: 0, unique_customers: 0, revenue: 0 }
        });
    } catch (error: any) {
        console.error("Conversion Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
