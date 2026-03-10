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

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub} `;
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

        console.log(`[VENTAS_DEBUG] User: ${userId} | From: ${finalFrom} | To: ${finalTo} | Default: ${isDefault}`);

        // Calculate Previous Period for comparison
        const currentFrom = new Date(finalFrom);
        const currentTo = new Date(finalTo);
        const diffDays = Math.ceil((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24)) || 7;

        const prevFromDate = new Date(currentFrom);
        prevFromDate.setDate(prevFromDate.getDate() - diffDays);
        const prevToDate = new Date(currentTo);
        prevToDate.setDate(prevToDate.getDate() - diffDays);

        const finalPrevFrom = prevFromDate.toISOString();
        const finalPrevTo = prevToDate.toISOString();

        // Run all independent queries in parallel
        const [
            revenueOverTime,
            salesByDayHour,
            paymentMethods,
            promoImpact,
            kpisResult,
            prevKpisResult,
            salesByProvince,
            detailedOrders,
            connection,
            ordersWithDni,
        ] = await Promise.all([
            // 1. Revenue Over Time (Daily)
            sql`
                SELECT
                    date_trunc('day', created_at) as date,
                    SUM(total) as revenue,
                    COUNT(id) as orders
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY date
                ORDER BY date ASC
            `,

            // 2. Sales by Day and Hour (Heatmap analysis)
            sql`
                SELECT
                    extract(dow from created_at) as day,
                    extract(hour from created_at) as hour,
                    COUNT(id) as count,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY day, hour
                ORDER BY day ASC, hour ASC
            `,

            // 3. Payment Methods (Gateway analysis)
            sql`
                SELECT
                    COALESCE(payment_method, 'Otro') as method,
                    COUNT(id) as count,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY method
                ORDER BY revenue DESC
            `,

            // 4. Promo Impact (Coupon vs List Price)
            sql`
                SELECT 
                    CASE WHEN coupon_code IS NOT NULL THEN 'Promocional' ELSE 'Precio de Lista' END as type,
                    COUNT(id) as count,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY type
            `,

            // 5. KPIs Current Period
            sql`
                SELECT
                    SUM(total) as total_revenue,
                    COUNT(id) as total_orders,
                    AVG(total) as average_ticket
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
            `,

            // 6. KPIs Previous Period
            sql`
                SELECT
                    SUM(total) as total_revenue,
                    COUNT(id) as total_orders,
                    AVG(total) as average_ticket
                FROM tn_orders
                WHERE user_id = ${userId}
                AND created_at >= ${finalPrevFrom}::timestamptz AND created_at <= ${finalPrevTo}::timestamptz
            `,

            // 7. Provinces (Geographic analysis)
            sql`
                SELECT
                    CASE 
                        WHEN TRIM(LOWER(province)) IN ('cordoba', 'córdoba') THEN 'Córdoba'
                        WHEN TRIM(LOWER(province)) IN ('buenos aires', 'bs as', 'pba', 'buenos aires ') THEN 'Buenos Aires'
                        WHEN TRIM(LOWER(province)) IN ('capital federal', 'caba', 'ciudad autónoma de buenos aires', 'ciudad autonoma de buenos aires') THEN 'CABA'
                        WHEN TRIM(LOWER(province)) IN ('santa fe', 'santa fé') THEN 'Santa Fe'
                        WHEN TRIM(LOWER(province)) IN ('mendoza', 'mendoza ') THEN 'Mendoza'
                        ELSE INITCAP(TRIM(province))
                    END as province,
                    COUNT(id) as count,
                    CAST(SUM(total) AS FLOAT) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                AND province IS NOT NULL AND TRIM(province) != ''
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
                GROUP BY 1
                ORDER BY revenue DESC
            `,

            // 8. Detailed Orders for Table
            sql`
                SELECT 
                    o.id,
                    o.number,
                    o.total,
                    o.status,
                    o.payment_status,
                    o.shipping_status,
                    o.created_at,
                    c.name as customer_name,
                    c.email as customer_email,
                    (
                        SELECT json_agg(items)
                        FROM (
                            SELECT name, quantity, price
                            FROM tn_order_items
                            WHERE order_id = o.id
                        ) items
                    ) as items
                FROM tn_orders o
                LEFT JOIN tn_customers c ON o.customer_id = c.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
                ORDER BY o.created_at DESC
                LIMIT 100
            `,

            // 9. Store info
            sql`SELECT store_id, store_name FROM tiendanube_connections WHERE user_id = ${userId} LIMIT 1`,

            // 10. Orders with DNI for age analysis
            sql`
                SELECT customer_identification as dni
                FROM tn_orders
                WHERE user_id = ${userId}
                AND customer_identification ~ '^[0-9]+$'
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
            `,
        ]);

        // Process age distribution from DNI data
        let salesByAge: any[] = [];
        let averageAge = 0;
        try {
            const currentYear = new Date().getFullYear();
            const ageCounts: Record<number, number> = {};
            let totalAges = 0;
            let countAges = 0;

            ordersWithDni.forEach((o: any) => {
                const dniNum = parseInt(o.dni);
                if (isNaN(dniNum)) return;

                let birthYear = 0;
                if (dniNum >= 45000000) birthYear = 2003 + (dniNum - 45000000) / 1000000;
                else if (dniNum >= 38000000) birthYear = 1994 + (dniNum - 38000000) / 1000000;
                else if (dniNum >= 30000000) birthYear = 1983 + (dniNum - 30000000) / 1000000;
                else if (dniNum >= 20000000) birthYear = 1968 + (dniNum - 20000000) / 1000000;
                else if (dniNum >= 10000000) birthYear = 1952 + (dniNum - 10000000) / 1000000;
                else birthYear = 1930 + (dniNum / 1000000) * 2;

                const age = Math.round(currentYear - birthYear);
                if (age >= 16 && age <= 90) {
                    ageCounts[age] = (ageCounts[age] || 0) + 1;
                    totalAges += age;
                    countAges++;
                }
            });

            salesByAge = Object.entries(ageCounts)
                .map(([age, count]) => ({ age: parseInt(age), count }))
                .sort((a, b) => a.age - b.age);

            averageAge = countAges > 0 ? Math.round(totalAges / countAges) : 0;
        } catch (e) {
            console.error("Age processing failed:", e);
        }

        const storeInfo = connection[0] || { store_id: null, store_name: null };

        return NextResponse.json({
            revenueOverTime,
            salesByDayHour,
            paymentMethods,
            promoImpact,
            salesByProvince,
            salesByAge,
            averageAge,
            detailedOrders,
            storeId: storeInfo.store_id,
            storeName: storeInfo.store_name,
            kpis: kpisResult[0] || { total_revenue: 0, total_orders: 0, average_ticket: 0 },
            prevKpis: prevKpisResult[0] || { total_revenue: 0, total_orders: 0, average_ticket: 0 }
        });
    } catch (error: any) {
        console.error("Ventas Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
