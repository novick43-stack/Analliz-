import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const maxDuration = 30;

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Date ranges
        const now = new Date();
        const startCurrent = startOfMonth(now).toISOString();
        const startPrev = startOfMonth(subMonths(now, 1)).toISOString();
        const endPrev = endOfMonth(subMonths(now, 1)).toISOString();

        // Run all summary queries in parallel
        const [curKpis, prevKpis, topProducts, inventoryAlerts, customerStats] = await Promise.all([
            // 1. Current month KPIs
            sql`
                SELECT 
                    SUM(total) as revenue,
                    COUNT(id) as orders
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${startCurrent}
            `,

            // 2. Previous month KPIs
            sql`
                SELECT 
                    SUM(total) as revenue,
                    COUNT(id) as orders
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${startPrev}
                AND created_at <= ${endPrev}
            `,

            // 3. Top Products (Pareto snapshot)
            sql`
                SELECT name, SUM(price * quantity) as revenue
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                GROUP BY name
                ORDER BY revenue DESC
                LIMIT 3
            `,

            // 4. Inventory Urgency
            sql`
                SELECT COUNT(*) as count
                FROM tn_variants v
                JOIN tn_products p ON v.product_id = p.id
                WHERE p.user_id = ${userId}
                AND v.stock < 10
            `,

            // 5. Customer Health
            sql`
                SELECT AVG(total_spent) as ltv, COUNT(id) as total
                FROM tn_customers
                WHERE user_id = ${userId}
            `,
        ]);

        return NextResponse.json({
            sales: {
                current: curKpis[0] || { revenue: 0, orders: 0 },
                previous: prevKpis[0] || { revenue: 0, orders: 0 }
            },
            topProducts,
            inventoryAlerts: Number(inventoryAlerts[0]?.count || 0),
            customers: customerStats[0] || { ltv: 0, total: 0 }
        });
    } catch (error: any) {
        console.error("Summary Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
