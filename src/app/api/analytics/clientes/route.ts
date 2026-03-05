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

        // 1. Customer KPIs (LTV, Retention Rate)
        const kpis = await sql`
            SELECT 
                AVG(total_spent) as avg_ltv,
                COUNT(id) as total_customers,
                COUNT(CASE WHEN orders_count > 1 THEN 1 END) * 100.0 / NULLIF(COUNT(id), 0) as retention_rate
            FROM tn_customers
            WHERE user_id = ${userId}
        `;

        // 2. RFM Segmentation (Frequency vs Monetary)
        // We calculate Recency as days since last order
        const rfmData = await sql`
            SELECT 
                id,
                name,
                total_spent as monetary,
                orders_count as frequency,
                EXTRACT(DAY FROM (NOW() - last_order_at)) as recency
            FROM tn_customers
            WHERE user_id = ${userId}
            AND orders_count > 0
            ORDER BY monetary DESC
            LIMIT 100
        `;

        // 3. Geographic Distribution (by Province)
        const geographic = await sql`
            SELECT 
                COALESCE(province, 'Desconocido') as name,
                COUNT(id) as orders,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY province
            ORDER BY revenue DESC
            LIMIT 10
        `;

        // 4. Acquisition Trend
        const acquisition = await sql`
            SELECT 
                date_trunc('day', created_at) as date,
                COUNT(id) as count
            FROM tn_customers
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY date
            ORDER BY date ASC
        `;

        return NextResponse.json({
            kpis: kpis[0] || { avg_ltv: 0, total_customers: 0, retention_rate: 0 },
            rfmData,
            geographic,
            acquisition
        });
    } catch (error: any) {
        console.error("Clientes Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
