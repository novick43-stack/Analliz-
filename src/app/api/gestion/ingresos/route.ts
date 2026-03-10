import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json({ error: "Missing date range" }, { status: 400 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        if (userResult.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = userResult[0].id;

        // Alignment with Ventas logic: ensures the range covers the whole day
        const finalFrom = from.length === 10 ? `${from} 00:00:00` : from;
        const finalTo = to.length === 10 ? `${to} 23:59:59` : to;

        // Fetch metrics: Total Revenue, Order Count using 'total' and 'created_at'
        const metricsResult = await sql`
            SELECT 
                COALESCE(SUM(total), 0) as total_revenue,
                COUNT(*) as order_count,
                AVG(total) as average_ticket
            FROM tn_orders
            WHERE user_id = ${userId}
            AND created_at >= ${finalFrom}::timestamptz 
            AND created_at <= ${finalTo}::timestamptz
        `;

        const totalRevenue = parseFloat(metricsResult[0].total_revenue);
        const orderCount = parseInt(metricsResult[0].order_count);
        const averageTicket = parseFloat(metricsResult[0].average_ticket) || 0;

        // Fetch daily data for chart
        const chartData = await sql`
            SELECT 
                date_trunc('day', created_at) as date,
                COALESCE(SUM(total), 0) as revenue,
                COUNT(*) as orders
            FROM tn_orders
            WHERE user_id = ${userId}
            AND created_at >= ${finalFrom}::timestamptz 
            AND created_at <= ${finalTo}::timestamptz
            GROUP BY date
            ORDER BY date ASC
        `;

        return NextResponse.json({
            summary: {
                totalRevenue,
                orderCount,
                averageTicket
            },
            chartData: chartData.map(d => ({
                date: new Date(d.date).toISOString().split('T')[0],
                revenue: parseFloat(d.revenue),
                orders: parseInt(d.orders)
            }))
        });

    } catch (error) {
        console.error("Ingresos API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
