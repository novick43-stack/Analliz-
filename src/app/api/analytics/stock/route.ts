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

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;

        if (!userId) {
            return NextResponse.json({
                error: "User not found",
                debug: { sessionSub: session.user.sub }
            }, { status: 404 });
        }

        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        // 1. Base counts for debugging
        const baseCounts = await sql`SELECT count(*) as count FROM tn_products WHERE user_id = ${userId}`;
        const totalRawProducts = parseInt(baseCounts[0]?.count || "0");

        // 2. Inventory macro health
        const healthStats = await sql`
            WITH ProductStock AS (
                SELECT 
                    p.id as product_id,
                    COALESCE(SUM(v.stock), 0) as total_stock,
                    COALESCE(SUM(v.stock * v.price), 0) as total_value
                FROM tn_products p
                LEFT JOIN tn_variants v ON p.id = v.product_id
                WHERE p.user_id = ${userId} AND p.published = true
                GROUP BY p.id
            ),
            ProductVelocity AS (
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
                CAST(SUM(ps.total_value) AS FLOAT) as total_inventory_value,
                CAST(SUM(ps.total_stock) AS FLOAT) as total_stock,
                COUNT(DISTINCT ps.product_id) as total_products,
                COUNT(CASE WHEN ps.total_stock <= 0 THEN 1 END) as out_of_stock,
                COUNT(CASE WHEN ps.total_stock > 0 AND (ps.total_stock / NULLIF(pv.daily_velocity, 0)) < 7 THEN 1 END) as critical_risk,
                COUNT(CASE WHEN (ps.total_stock / NULLIF(pv.daily_velocity, 0)) >= 7 AND (ps.total_stock / NULLIF(pv.daily_velocity, 0)) < 15 THEN 1 END) as low_stock
            FROM ProductStock ps
            LEFT JOIN ProductVelocity pv ON ps.product_id = pv.product_id
        `;

        // 3. Detailed list for management
        const productList = await sql`
            WITH ProductStats AS (
                SELECT 
                    p.id,
                    p.name,
                    p.published,
                    COUNT(v.id) as variant_count,
                    COALESCE(SUM(v.stock), 0) as total_stock
                FROM tn_products p
                LEFT JOIN tn_variants v ON p.id = v.product_id
                WHERE p.user_id = ${userId}
                GROUP BY p.id, p.name, p.published
            ),
            RecentSales AS (
                SELECT 
                    product_id,
                    SUM(quantity) as units_sold_30d
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                WHERE o.user_id = ${userId}
                AND o.created_at >= ${thirtyDaysAgo}
                GROUP BY product_id
            ),
            VariantDetails AS (
                SELECT 
                    product_id,
                    jsonb_agg(jsonb_build_object(
                        'id', id,
                        'values', COALESCE(values, '[]'::jsonb),
                        'stock', stock,
                        'price', price,
                        'sku', sku
                    )) as variants
                FROM tn_variants
                GROUP BY product_id
            )
            SELECT 
                ps.*,
                COALESCE(vd.variants, '[]'::jsonb) as variants,
                COALESCE(rs.units_sold_30d, 0) as units_sold_30d,
                CAST(COALESCE(rs.units_sold_30d, 0) / 30.0 AS FLOAT) as daily_velocity,
                CASE 
                    WHEN COALESCE(rs.units_sold_30d, 0) > 0 THEN CAST(ps.total_stock / (rs.units_sold_30d / 30.0) AS FLOAT)
                    ELSE NULL 
                END as days_to_stockout
            FROM ProductStats ps
            LEFT JOIN RecentSales rs ON ps.id = rs.product_id
            LEFT JOIN VariantDetails vd ON ps.id = vd.product_id
            ORDER BY 
                CASE WHEN ps.total_stock <= 0 THEN 0 ELSE 1 END, 
                days_to_stockout ASC NULLS LAST,
                ps.total_stock ASC
        `;

        // Get admin domain for links
        const connectionResult = await sql`SELECT admin_domain FROM tiendanube_connections WHERE user_id = ${userId} LIMIT 1`;
        const adminDomain = connectionResult[0]?.admin_domain;

        return NextResponse.json({
            health: healthStats[0] || {},
            productList: productList,
            adminDomain,
            debug: {
                userId,
                sessionSub: session.user.sub,
                totalRawProducts,
                healthCount: healthStats.length,
                productListCount: productList.length
            }
        });
    } catch (error: any) {
        console.error("Stock API error:", error);
        return NextResponse.json({
            error: error.message,
            debug: {
                phase: "error_catch",
                timestamp: new Date().toISOString()
            }
        }, { status: 500 });
    }
}
