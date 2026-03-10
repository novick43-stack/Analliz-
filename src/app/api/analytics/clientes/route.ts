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
        let from = searchParams.get("from");
        let to = searchParams.get("to");

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const currentUserId = userResult[0]?.id;
        if (!currentUserId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Default to "This Week" if no range is provided to avoid 0s on mount
        if (!from || !to) {
            const now = new Date();
            const dFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            dFrom.setUTCHours(0, 0, 0, 0);
            from = dFrom.toISOString();
            to = now.toISOString();
        }

        const finalFrom = from.length === 10 ? `${from} 00:00:00` : from;
        const finalTo = to.length === 10 ? `${to} 23:59:59` : to;

        const dateFilter = sql`AND created_at >= ${finalFrom}::timestamp AND created_at <= ${finalTo}::timestamp`;
        // For joins where we need o.created_at
        const oDateFilter = sql`AND o.created_at >= ${finalFrom}::timestamp AND o.created_at <= ${finalTo}::timestamp`;

        // Run all queries in parallel
        const [recurrenceSummary, trend, frequencyDist, varietyDist, valueDist, globalStats, detailedCustomers] = await Promise.all([
            // 1. Retention & Recurrence Logic (Period Summary)
            sql`
                WITH customer_stats AS (
                    SELECT 
                        customer_id,
                        MIN(created_at) as first_order,
                        COUNT(id) as total_orders
                    FROM tn_orders
                    WHERE user_id = ${currentUserId}
                    GROUP BY customer_id
                ),
                period_orders AS (
                    SELECT 
                        o.id,
                        o.customer_id,
                        o.created_at,
                        cs.first_order
                    FROM tn_orders o
                    JOIN customer_stats cs ON o.customer_id = cs.customer_id
                    WHERE o.user_id = ${currentUserId}
                    ${oDateFilter}
                )
                SELECT 
                    COUNT(DISTINCT CASE WHEN first_order >= ${finalFrom}::timestamp THEN customer_id END)::int as new_customers,
                    COUNT(DISTINCT CASE WHEN first_order < ${finalFrom}::timestamp THEN customer_id END)::int as recurrent_customers,
                    COUNT(CASE WHEN first_order >= ${finalFrom}::timestamp THEN 1 END)::int as new_orders,
                    COUNT(CASE WHEN first_order < ${finalFrom}::timestamp THEN 1 END)::int as recurrent_orders
                FROM period_orders
            `,

            // 2. New vs Recurrent Trend
            sql`
                WITH customer_stats AS (
                    SELECT customer_id, MIN(created_at) as first_order
                    FROM tn_orders
                    WHERE user_id = ${currentUserId}
                    GROUP BY customer_id
                )
                SELECT 
                    date_trunc('day', o.created_at) as date,
                    COUNT(CASE WHEN cs.first_order >= ${finalFrom}::timestamp THEN 1 END)::int as nuevos,
                    COUNT(CASE WHEN cs.first_order < ${finalFrom}::timestamp THEN 1 END)::int as recurrentes
                FROM tn_orders o
                JOIN customer_stats cs ON o.customer_id = cs.customer_id
                WHERE o.user_id = ${currentUserId}
                ${oDateFilter}
                GROUP BY date
                ORDER BY date ASC
            `,

            // 3. Purchase Frequency Distribution
            sql`
                WITH counts AS (
                    SELECT customer_id, COUNT(id) as order_count
                    FROM tn_orders
                    WHERE user_id = ${currentUserId}
                    ${dateFilter}
                    GROUP BY customer_id
                )
                SELECT 
                    CASE 
                        WHEN order_count = 1 THEN '1'
                        WHEN order_count = 2 THEN '2'
                        WHEN order_count = 3 THEN '3'
                        WHEN order_count = 4 THEN '4'
                        ELSE '5+'
                    END as label,
                    COUNT(customer_id)::int as value
                FROM counts
                GROUP BY label
                ORDER BY label ASC
            `,

            // 4. Product Variety (Unique products per customer)
            sql`
                WITH variety AS (
                    SELECT o.customer_id, COUNT(DISTINCT item.product_id) as product_count
                    FROM tn_orders o
                    JOIN tn_order_items item ON o.id = item.order_id
                    WHERE o.user_id = ${currentUserId}
                    ${oDateFilter}
                    GROUP BY o.customer_id
                )
                SELECT 
                    CASE 
                        WHEN product_count = 1 THEN '1'
                        WHEN product_count = 2 THEN '2'
                        WHEN product_count = 3 THEN '3'
                        WHEN product_count = 4 THEN '4'
                        ELSE '5+'
                    END as label,
                    COUNT(customer_id)::int as value
                FROM variety
                GROUP BY label
                ORDER BY label ASC
            `,

            // 5. Monetary Value Distribution (Spending tiers)
            sql`
                WITH spending AS (
                    SELECT customer_id, SUM(total) as total_spent
                    FROM tn_orders
                    WHERE user_id = ${currentUserId}
                    ${dateFilter}
                    GROUP BY customer_id
                )
                SELECT 
                    CASE 
                        WHEN total_spent < 10000 THEN 'Under $10k'
                        WHEN total_spent < 30000 THEN '$10k - $30k'
                        WHEN total_spent < 60000 THEN '$30k - $60k'
                        WHEN total_spent < 100000 THEN '$60k - $100k'
                        ELSE 'Over $100k'
                    END as label,
                    COUNT(customer_id)::int as value
                FROM spending
                GROUP BY label
                ORDER BY MIN(total_spent) ASC
            `,

            // 6. Global Stats for Averages
            sql`
                WITH customer_metrics AS (
                    SELECT 
                        customer_id,
                        COUNT(id) as orders_count,
                        SUM(total) as total_spent,
                        (SELECT COUNT(DISTINCT item.product_id) FROM tn_order_items item JOIN tn_orders o2 ON item.order_id = o2.id WHERE o2.customer_id = tn_orders.customer_id AND o2.user_id = ${currentUserId} AND o2.created_at >= ${finalFrom}::timestamp AND o2.created_at <= ${finalTo}::timestamp) as unique_products
                    FROM tn_orders
                    WHERE user_id = ${currentUserId}
                    ${dateFilter}
                    GROUP BY customer_id
                )
                SELECT 
                    COALESCE(AVG(orders_count), 0)::float as avg_orders,
                    COALESCE(AVG(unique_products), 0)::float as avg_variety,
                    COALESCE(AVG(total_spent), 0)::float as avg_spend
                FROM customer_metrics
            `,

            // 7. Detailed Customers (for table)
            sql`
                SELECT 
                    COALESCE(c.name, 'Visitante') as name,
                    COALESCE(c.email, 'N/A') as email,
                    COUNT(o.id)::int as order_count,
                    SUM(o.total)::float as total_spent,
                    MAX(o.created_at) as last_order_date
                FROM tn_orders o
                LEFT JOIN tn_customers c ON o.customer_id = c.id
                WHERE o.user_id = ${currentUserId}
                ${oDateFilter}
                GROUP BY c.email, c.name
                ORDER BY total_spent DESC
                LIMIT 100
            `
        ]);

        return NextResponse.json({
            summary: recurrenceSummary[0] || { new_customers: 0, recurrent_customers: 0, new_orders: 0, recurrent_orders: 0 },
            trend,
            frequencyDist,
            varietyDist,
            valueDist,
            averages: globalStats[0] || { avg_orders: 0, avg_variety: 0, avg_spend: 0 },
            detailedCustomers
        });
    } catch (error: any) {
        console.error("Clientes Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
