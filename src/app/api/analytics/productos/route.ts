import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";

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

        // 1. Top products with Pareto (Cumulative Revenue %)
        const allProductsRevenue = await sql`
            WITH ProductSales AS (
                SELECT 
                    i.product_id,
                    i.name,
                    SUM(i.quantity) as sold_quantity,
                    SUM(i.price * i.quantity) as total_revenue
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                ${dateFilter}
                GROUP BY i.product_id, i.name
            ),
            SortedSales AS (
                SELECT 
                    *,
                    SUM(total_revenue) OVER(ORDER BY total_revenue DESC) as cumulative_revenue,
                    SUM(total_revenue) OVER() as grand_total
                FROM ProductSales
            )
            SELECT 
                *,
                (cumulative_revenue / NULLIF(grand_total, 0)) * 100 as cumulative_percentage
            FROM SortedSales
            ORDER BY total_revenue DESC
            LIMIT 20
        `;

        // 2. Category Performance (Treemap data: Brand/Category)
        const categoryPerformance = await sql`
            SELECT 
                COALESCE(p.brand, 'Sin Marca') as name,
                SUM(v.stock) as stock,
                SUM(v.stock * v.price) as value,
                SUM(i.quantity) as sold_quantity
            FROM tn_products p
            LEFT JOIN tn_variants v ON p.id = v.product_id
            LEFT JOIN tn_order_items i ON p.id = i.product_id
            WHERE p.user_id = ${userId}
            GROUP BY p.brand
            ORDER BY value DESC
        `;

        // 3. Inventory KPIs & Health
        // Calculate daily velocity (last 30 days) to estimate "Days of Inventory"
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const inventoryHealth = await sql`
            WITH ProductVelocity AS (
                SELECT 
                    i.product_id,
                    SUM(i.quantity) / 30.0 as daily_velocity
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${thirtyDaysAgo}
                GROUP BY i.product_id
            )
            SELECT 
                SUM(v.stock * v.price) as total_inventory_value,
                SUM(v.stock) as total_stock,
                COUNT(DISTINCT p.id) as total_products,
                -- Average days of inventory (weighted by stock value)
                SUM(CASE WHEN pv.daily_velocity > 0 THEN v.stock / pv.daily_velocity ELSE 0 END * (v.stock * v.price)) / 
                NULLIF(SUM(v.stock * v.price), 0) as avg_days_inventory
            FROM tn_products p
            JOIN tn_variants v ON p.id = v.product_id
            LEFT JOIN ProductVelocity pv ON p.id = pv.product_id
            WHERE p.user_id = ${userId}
        `;

        // 4. Low Stock Alerts (Stock < velocity * 7 days)
        const alerts = await sql`
            WITH ProductVelocity AS (
                SELECT 
                    i.product_id,
                    SUM(i.quantity) / 30.0 as daily_velocity
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${thirtyDaysAgo}
                GROUP BY i.product_id
            )
            SELECT 
                p.name,
                SUM(v.stock) as stock,
                pv.daily_velocity,
                SUM(v.stock) / NULLIF(pv.daily_velocity, 0) as days_left
            FROM tn_products p
            JOIN tn_variants v ON p.id = v.product_id
            JOIN ProductVelocity pv ON p.id = pv.product_id
            WHERE p.user_id = ${userId}
            AND SUM(v.stock) < (pv.daily_velocity * 7)
            GROUP BY p.name, pv.daily_velocity
            ORDER BY days_left ASC
            LIMIT 5
        `;

        // 5. Daily Product Sales Trend (Mockup: Productos vendidos por día)
        const productsSoldByDay = await sql`
            SELECT 
                date_trunc('day', o.created_at) as date,
                SUM(i.quantity) as count
            FROM tn_order_items i
            JOIN tn_orders o ON i.order_id = o.id
            WHERE o.user_id = ${userId}
            ${dateFilter}
            GROUP BY date
            ORDER BY date ASC
        `;

        // 6. Summary KPIs for the period
        const periodSummary = await sql`
            SELECT 
                SUM(i.quantity) as total_sold,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(i.price * i.quantity) as total_revenue
            FROM tn_order_items i
            JOIN tn_orders o ON i.order_id = o.id
            WHERE o.user_id = ${userId}
            ${dateFilter}
        `;

        const summary = periodSummary[0] || { total_sold: 0, total_orders: 0, total_revenue: 0 };

        // Calculate days in range
        const fromDate = from ? new Date(from) : new Date();
        const toDate = to ? new Date(to) : new Date();
        const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
        const daysInRange = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

        const kpis = {
            totalSold: Number(summary.total_sold || 0),
            soldPerDay: Number(summary.total_sold || 0) / daysInRange,
            soldPerOrder: Number(summary.total_sold || 0) / Math.max(Number(summary.total_orders || 1), 1),
            avgPricePerItem: Number(summary.total_revenue || 0) / Math.max(Number(summary.total_sold || 1), 1)
        };

        return NextResponse.json({
            paretoData: allProductsRevenue,
            categoryTreemap: categoryPerformance,
            health: inventoryHealth[0] || { total_inventory_value: 0, total_stock: 0, avg_days_inventory: 0 },
            alerts,
            productsSoldByDay,
            summary: kpis
        });
    } catch (error: any) {
        console.error("Productos Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
