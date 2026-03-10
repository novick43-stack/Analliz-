import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { subDays } from "date-fns";

export const maxDuration = 30;

export async function GET(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub} `;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // UNIFIED DATE HANDLING (same as Ventas)
        let fromDate = from;
        let toDate = to;

        if (!fromDate || !toDate) {
            const now = new Date();
            const dFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            dFrom.setUTCHours(0, 0, 0, 0);

            fromDate = dFrom.toISOString();
            toDate = now.toISOString();
        }

        const finalFrom = fromDate.length === 10 ? `${fromDate} 00:00:00` : fromDate;
        const finalTo = toDate.length === 10 ? `${toDate} 23:59:59` : toDate;
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        console.log(`[PRODUCTOS_DEBUG] User: ${userId} | From: ${finalFrom} | To: ${finalTo}`);

        // Run all independent queries in parallel
        const [
            allProductsRevenueResult,
            categoryPerformanceResult,
            inventoryHealthResult,
            alertsResult,
            productsSoldByDayResult,
            periodSummaryResult,
            productListResult,
            totalItemsInDB,
        ] = await Promise.all([
            // 1. Top products with Pareto
            sql`
                WITH ProductSales AS (
                    SELECT 
                        i.product_id,
                        i.name,
                        SUM(i.quantity) as sold_quantity,
                        CAST(SUM(i.price * i.quantity) AS FLOAT) as total_revenue
                    FROM tn_order_items i
                    JOIN tn_orders o ON i.order_id = o.id
                    WHERE o.user_id = ${userId}
                    AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
                    GROUP BY 1, 2
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
            `.catch((e) => { console.error("Pareto query failed:", e); return []; }),

            // 2. Category/Brand Performance
            sql`
                WITH BrandStock AS (
                    SELECT 
                        COALESCE(p.brand, 'Sin Marca') as brand_name,
                        SUM(v.stock) as total_stock,
                        CAST(SUM(v.stock * v.price) AS FLOAT) as total_value
                    FROM tn_products p
                    LEFT JOIN tn_variants v ON p.id = v.product_id
                    WHERE p.user_id = ${userId} AND p.published = true
                    GROUP BY 1
                ),
                BrandSales AS (
                    SELECT 
                        COALESCE(p.brand, 'Sin Marca') as brand_name,
                        SUM(i.quantity) as total_sold
                    FROM tn_order_items i
                    JOIN tn_orders o ON i.order_id = o.id
                    JOIN tn_products p ON i.product_id = p.id
                    WHERE o.user_id = ${userId}
                    AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
                    GROUP BY 1
                )
                SELECT 
                    bs.brand_name as name,
                    COALESCE(bs.total_stock, 0) as stock,
                    COALESCE(bs.total_value, 0) as value,
                    COALESCE(bss.total_sold, 0) as sold_quantity
                FROM BrandStock bs
                LEFT JOIN BrandSales bss ON bs.brand_name = bss.brand_name
                ORDER BY value DESC
            `.catch((e) => { console.error("Category query failed:", e); return []; }),

            // 3. Inventory KPIs & Health
            sql`
                WITH ProductVelocity AS (
                    SELECT 
                        i.product_id,
                        SUM(i.quantity) / 30.0 as daily_velocity
                    FROM tn_order_items i
                    JOIN tn_orders o ON i.order_id = o.id
                    WHERE o.user_id = ${userId}
                    AND o.created_at >= ${thirtyDaysAgo}
                    GROUP BY i.product_id
                ),
                ProductStock AS (
                    SELECT 
                        p.id as product_id,
                        SUM(v.stock) as total_stock,
                        SUM(v.stock * v.price) as total_value
                    FROM tn_products p
                    JOIN tn_variants v ON p.id = v.product_id
                    WHERE p.user_id = ${userId} AND p.published = true
                    GROUP BY p.id
                )
                SELECT 
                    CAST(SUM(ps.total_value) AS FLOAT) as total_inventory_value,
                    CAST(SUM(ps.total_stock) AS FLOAT) as total_stock,
                    COUNT(DISTINCT ps.product_id) as total_products,
                    CAST(SUM(CASE WHEN pv.daily_velocity > 0 THEN ps.total_stock / pv.daily_velocity ELSE 0 END * ps.total_value) / 
                    NULLIF(SUM(ps.total_value), 0) AS FLOAT) as avg_days_inventory
                FROM ProductStock ps
                LEFT JOIN ProductVelocity pv ON ps.product_id = pv.product_id
            `.catch((e) => { console.error("Health query failed:", e); return []; }),

            // 4. Low Stock Alerts
            sql`
                WITH ProductVelocity AS (
                    SELECT 
                        i.product_id,
                        SUM(i.quantity) / 30.0 as daily_velocity
                    FROM tn_order_items i
                    JOIN tn_orders o ON i.order_id = o.id
                    WHERE o.user_id = ${userId}
                    AND o.created_at >= ${thirtyDaysAgo}
                    GROUP BY i.product_id
                ),
                ProductStock AS (
                    SELECT 
                        p.id,
                        p.name,
                        SUM(v.stock) as stock
                    FROM tn_products p
                    JOIN tn_variants v ON p.id = v.product_id
                    WHERE p.user_id = ${userId} AND p.published = true
                    GROUP BY p.id, p.name
                )
                SELECT 
                    ps.name,
                    ps.stock,
                    pv.daily_velocity,
                    CAST(ps.stock / NULLIF(pv.daily_velocity, 0) AS FLOAT) as days_left
                FROM ProductStock ps
                JOIN ProductVelocity pv ON ps.id = pv.product_id
                WHERE ps.stock < (pv.daily_velocity * 7)
                ORDER BY days_left ASC
                LIMIT 5
            `.catch((e) => { console.error("Alerts query failed:", e); return []; }),

            // 5. Daily Product Sales Trend
            sql`
                SELECT 
                    date_trunc('day', o.created_at) as date,
                    SUM(i.quantity) as count
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
                GROUP BY 1
                ORDER BY 1 ASC
            `.catch((e) => { console.error("DailyTrend query failed:", e); return []; }),

            // 6. Summary KPIs for the period
            sql`
                SELECT 
                    SUM(i.quantity) as total_sold,
                    COUNT(DISTINCT o.id) as total_orders,
                    SUM(i.price * i.quantity) as total_revenue
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
            `.catch((e) => { console.error("Summary query failed:", e); return []; }),

            // 7. Product List with Variant Count
            sql`
                SELECT 
                    p.id,
                    p.name,
                    p.published,
                    COUNT(v.id) as variant_count
                FROM tn_products p
                LEFT JOIN tn_variants v ON p.id = v.product_id
                WHERE p.user_id = ${userId}
                GROUP BY p.id, p.name, p.published
            `.catch((e) => { console.error("ProductList query failed:", e); return []; }),

            // 8. Total items count for debug
            sql`SELECT COUNT(*) FROM tn_order_items i JOIN tn_orders o ON i.order_id = o.id WHERE o.user_id = ${userId}`.catch(() => [{ count: 0 }]),
        ]);

        const healthData = (inventoryHealthResult[0] as any) || { total_inventory_value: 0, total_stock: 0, total_products: 0, avg_days_inventory: 0 };
        const summaryRow = (periodSummaryResult[0] as any) || {};
        const summaryResult = {
            total_sold: Number(summaryRow.total_sold || 0),
            total_orders: Number(summaryRow.total_orders || 0),
            total_revenue: Number(summaryRow.total_revenue || 0),
        };

        const diffTime = Math.abs(new Date(finalTo).getTime() - new Date(finalFrom).getTime());
        const daysInRange = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

        const kpis = {
            totalSold: summaryResult.total_sold,
            soldPerDay: summaryResult.total_sold / daysInRange,
            soldPerOrder: summaryResult.total_sold / Math.max(summaryResult.total_orders, 1),
            avgPricePerItem: summaryResult.total_revenue / Math.max(summaryResult.total_sold, 1),
            total_revenue: summaryResult.total_revenue
        };

        console.log(`[PRODUCTOS_DEBUG] Final Results: 
            User: ${userId},
            Total Items in DB for User: ${(totalItemsInDB[0] as any)?.count},
            Pareto: ${(allProductsRevenueResult as any[]).length} rows,
            Treemap: ${(categoryPerformanceResult as any[]).length} rows,
            Health: ${healthData.total_products} products,
            DailyTrend: ${(productsSoldByDayResult as any[]).length} days,
            TotalSold: ${kpis.totalSold}`);

        let adminDomain = null;
        try {
            const connectionResult = await sql`SELECT * FROM tiendanube_connections WHERE user_id = ${userId} LIMIT 1`;
            const connection = connectionResult[0];
            if (connection) {
                adminDomain = connection.admin_domain || null;

                // Proactive fetch if missing
                if (!adminDomain && connection.access_token && connection.store_id) {
                    try {
                        const { getTiendaNubeStoreInfo } = await import("@/lib/tiendanube");
                        const storeInfo = await getTiendaNubeStoreInfo(connection.store_id, connection.access_token);
                        if (storeInfo) {
                            adminDomain = storeInfo.original_domain || storeInfo.domain || null;
                            if (adminDomain) {
                                await sql`UPDATE tiendanube_connections SET admin_domain = ${adminDomain} WHERE user_id = ${userId}`;
                            }
                        }
                    } catch (e) {
                        console.error("Proactive store info fetch failed:", e);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch connection or adminDomain:", e);
        }

        return NextResponse.json({
            paretoData: allProductsRevenueResult,
            categoryTreemap: categoryPerformanceResult,
            health: healthData,
            alerts: alertsResult,
            productsSoldByDay: productsSoldByDayResult,
            summary: kpis,
            productList: productListResult,
            adminDomain
        });
    } catch (error: any) {
        console.error("Productos Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
