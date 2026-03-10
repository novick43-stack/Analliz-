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

        // Default to "This Week" (Monday to Now) if no range is provided
        let fromDate = from;
        let toDate = to;
        let isDefault = false;

        if (!fromDate || !toDate) {
            const now = new Date();
            const dFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            dFrom.setUTCHours(0, 0, 0, 0);

            fromDate = dFrom.toISOString();
            toDate = now.toISOString();
            isDefault = true;
        }

        // If it's just a date (YYYY-MM-DD), make sure it covers the whole day
        const finalFrom = fromDate.length === 10 ? `${fromDate} 00:00:00` : fromDate;
        const finalTo = toDate.length === 10 ? `${toDate} 23:59:59` : toDate;

        console.log(`[CONVERSION_DEBUG] User: ${userId} | From: ${finalFrom} | To: ${finalTo} | Default: ${isDefault}`);

        // Run both queries in parallel
        const [statusFunnel, summary] = await Promise.all([
            // 1. Order Status Funnel
            sql`
                SELECT 
                    status,
                    payment_status,
                    shipping_status,
                    COUNT(id) as count,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY status, payment_status, shipping_status
            `,

            // 2. Conversion KPIs
            sql`
                SELECT 
                    COUNT(DISTINCT id) as total_orders,
                    COUNT(DISTINCT customer_id) as unique_customers,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
            `,
        ]);

        return NextResponse.json({
            statusFunnel,
            summary: summary[0] || { total_orders: 0, unique_customers: 0, revenue: 0 }
        });
    } catch (error: any) {
        console.error("Conversion Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
