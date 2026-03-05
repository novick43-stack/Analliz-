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

        // 1. Retention & Recurrence Logic (Period Summary)
        // A customer is "New" if their FIRST order in the store happened in this period.
        // A customer is "Recurrent" if they had an order in this period AND at least one order BEFORE this period.
        const recurrenceSummary = await sql`
            WITH customer_stats AS (
                SELECT 
                    customer_id,
                    MIN(created_at) as first_order,
                    COUNT(id) as total_orders
                FROM tn_orders
                WHERE user_id = ${userId}
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
                WHERE o.user_id = ${userId}
                ${dateFilter}
            )
            SELECT 
                COUNT(DISTINCT CASE WHEN first_order >= ${from}::timestamp THEN customer_id END) as new_customers,
                COUNT(DISTINCT CASE WHEN first_order < ${from}::timestamp THEN customer_id END) as recurrent_customers,
                COUNT(CASE WHEN first_order >= ${from}::timestamp THEN 1 END) as new_orders,
                COUNT(CASE WHEN first_order < ${from}::timestamp THEN 1 END) as recurrent_orders
            FROM period_orders
        `;

        // 2. New vs Recurrent Trend
        const trend = await sql`
            WITH customer_stats AS (
                SELECT customer_id, MIN(created_at) as first_order
                FROM tn_orders
                WHERE user_id = ${userId}
                GROUP BY customer_id
            )
            SELECT 
                date_trunc('day', o.created_at) as date,
                COUNT(CASE WHEN cs.first_order >= ${from}::timestamp THEN 1 END) as nuevos,
                COUNT(CASE WHEN cs.first_order < ${from}::timestamp THEN 1 END) as recurrentes
            FROM tn_orders o
            JOIN customer_stats cs ON o.customer_id = cs.customer_id
            WHERE o.user_id = ${userId}
            ${dateFilter}
            GROUP BY date
            ORDER BY date ASC
        `;

        // 3. Purchase Frequency Distribution (How many orders per customer)
        const frequencyDist = await sql`
            WITH counts AS (
                SELECT customer_id, COUNT(id) as order_count
                FROM tn_orders
                WHERE user_id = ${userId}
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
                COUNT(customer_id) as value
            FROM counts
            GROUP BY label
            ORDER BY label ASC
        `;

        // 4. Product Variety (Unique products per customer)
        const varietyDist = await sql`
            WITH variety AS (
                SELECT o.customer_id, COUNT(DISTINCT item.product_id) as product_count
                FROM tn_orders o
                JOIN tn_order_items item ON o.id = item.order_id
                WHERE o.user_id = ${userId}
                ${dateFilter}
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
                COUNT(customer_id) as value
            FROM variety
            GROUP BY label
            ORDER BY label ASC
        `;

        // 5. Monetary Value Distribution (Spending tiers)
        const valueDist = await sql`
            WITH spending AS (
                SELECT customer_id, SUM(total) as total_spent
                FROM tn_orders
                WHERE user_id = ${userId}
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
                COUNT(customer_id) as value
            FROM spending
            GROUP BY label
            ORDER BY MIN(total_spent) ASC
        `;

        return NextResponse.json({
            summary: recurrenceSummary[0] || { new_customers: 0, recurrent_customers: 0, new_orders: 0, recurrent_orders: 0 },
            trend,
            frequencyDist,
            varietyDist,
            valueDist
        });
    } catch (error: any) {
        console.error("Clientes Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
