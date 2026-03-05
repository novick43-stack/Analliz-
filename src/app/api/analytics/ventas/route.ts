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

        // Base filter parts
        const dateFilter = from && to ? sql`AND created_at >= ${from}::timestamp AND created_at <= ${to}::timestamp` : sql``;

        // Calculate Previous Period for comparison
        let prevDateFilter = sql``;
        if (from && to) {
            const currentFrom = new Date(from);
            const currentTo = new Date(to);
            const diffDays = Math.ceil((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24));

            const prevFrom = new Date(currentFrom);
            prevFrom.setDate(prevFrom.getDate() - diffDays);
            const prevTo = new Date(currentTo);
            prevTo.setDate(prevTo.getDate() - diffDays);

            prevDateFilter = sql`AND created_at >= ${prevFrom.toISOString()}::timestamp AND created_at <= ${prevTo.toISOString()}::timestamp`;
        }

        // 1. Revenue Over Time (Daily)
        const revenueOverTime = await sql`
            SELECT 
                date_trunc('day', created_at) as date,
                SUM(total) as revenue,
                COUNT(id) as orders
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY date
            ORDER BY date ASC
        `;

        // 2. Sales by Day and Hour (Heatmap analysis)
        const salesByDayHour = await sql`
            SELECT 
                extract(dow from created_at) as day,
                extract(hour from created_at) as hour,
                COUNT(id) as count,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY day, hour
            ORDER BY day ASC, hour ASC
        `;

        // 3. Payment Methods (Gateway analysis)
        const paymentMethods = await sql`
            SELECT 
                COALESCE(payment_method, 'Otro') as method,
                COUNT(id) as count,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY method
            ORDER BY revenue DESC
        `;

        // 4. Promo Impact (Coupon vs List Price)
        const promoImpact = await sql`
            SELECT 
                CASE WHEN coupon_code IS NOT NULL THEN 'Promocional' ELSE 'Precio de Lista' END as type,
                COUNT(id) as count,
                SUM(total) as revenue
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
            GROUP BY type
        `;

        // 5. KPIs Current Period
        const kpisResult = await sql`
            SELECT 
                SUM(total) as total_revenue,
                COUNT(id) as total_orders,
                AVG(total) as average_ticket
            FROM tn_orders
            WHERE user_id = ${userId}
            ${dateFilter}
        `;

        // 6. KPIs Previous Period
        const prevKpisResult = from && to ? await sql`
            SELECT 
                SUM(total) as total_revenue,
                COUNT(id) as total_orders,
                AVG(total) as average_ticket
            FROM tn_orders
            WHERE user_id = ${userId}
            ${prevDateFilter}
        ` : [null];

        // 7. Provinces (Geographic analysis)
        let salesByProvince: any[] = [];
        try {
            salesByProvince = await sql`
                SELECT 
                    COALESCE(province, 'Sin informar') as province,
                    COUNT(id) as count,
                    SUM(total) as revenue
                FROM tn_orders
                WHERE user_id = ${userId}
                ${dateFilter}
                GROUP BY province
                ORDER BY count DESC
            `;
        } catch (e) {
            console.error("Province query failed (likely missing column):", e);
        }

        // 8. Age Group Analysis (DNI estimation)
        let salesByAge: any[] = [];
        let averageAge = 0;
        try {
            // Helper to estimate birth year and age from DNI
            const ordersWithDni = await sql`
                SELECT customer_identification as dni
                FROM tn_orders
                WHERE user_id = ${userId}
                AND customer_identification ~ '^[0-9]+$'
                ${dateFilter}
            `;

            const currentYear = new Date().getFullYear();
            const ageCounts: Record<number, number> = {};
            let totalAges = 0;
            let countAges = 0;

            ordersWithDni.forEach((o: any) => {
                const dniNum = parseInt(o.dni);
                let birthYear = 0;

                // Heuristic for AR DNI roughly translating to birth year
                if (dniNum > 45000000) birthYear = 2003 + (dniNum - 45000000) / 1000000;
                else if (dniNum > 35000000) birthYear = 1990 + (dniNum - 35000000) / (45 - 35) * 13;
                else if (dniNum > 25000000) birthYear = 1976 + (dniNum - 25000000) / (35 - 25) * 14;
                else if (dniNum > 15000000) birthYear = 1965 + (dniNum - 15000000) / (25 - 15) * 11;
                else if (dniNum > 5000000) birthYear = 1945 + (dniNum - 5000000) / (15 - 5) * 20;
                else birthYear = 1930;

                const age = Math.round(currentYear - birthYear);
                if (age > 10 && age < 100) {
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
            console.error("Age query failed (likely missing column):", e);
        }

        return NextResponse.json({
            revenueOverTime,
            salesByDayHour,
            paymentMethods,
            promoImpact,
            salesByProvince,
            salesByAge,
            averageAge,
            kpis: kpisResult[0] || { total_revenue: 0, total_orders: 0, average_ticket: 0 },
            prevKpis: prevKpisResult[0] || { total_revenue: 0, total_orders: 0, average_ticket: 0 }
        });
    } catch (error: any) {
        console.error("Ventas Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
