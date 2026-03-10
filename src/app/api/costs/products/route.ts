import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const countResult = await sql`SELECT COUNT(*) FROM tn_products WHERE user_id = ${userId}`;
        console.log(`[COST_PRODUCTS_DEBUG] UserId: ${userId} | tn_products count: ${countResult[0]?.count}`);

        if (Number(countResult[0]?.count) === 0) {
            console.log(`[COST_PRODUCTS_DEBUG] No products found for user ${userId}. Checking tiendanube_connections...`);
            const conn = await sql`SELECT id, store_name FROM tiendanube_connections WHERE user_id = ${userId}`;
            console.log(`[COST_PRODUCTS_DEBUG] Connections for user: ${JSON.stringify(conn)}`);
        }

        // Fetch products and their variants, joined with existing costs
        // We use LEFT JOIN to ensure all products appear even if they don't have variants or costs
        const products = await sql`
            SELECT 
                p.id::text as product_id,
                p.name as product_name,
                v.id::text as variant_id,
                v.sku,
                COALESCE(v.price, 0) as price,
                pc.cost_price,
                pc.updated_at
            FROM tn_products p
            LEFT JOIN tn_variants v ON p.id = v.product_id
            LEFT JOIN product_costs pc ON v.id::text = pc.variant_id AND pc.user_id = ${userId}
            WHERE p.user_id = ${userId}
            ORDER BY p.id ASC
        `;

        console.log(`[COST_PRODUCTS_DEBUG] Query returned ${products.length} rows`);

        return NextResponse.json(products);
    } catch (error: any) {
        console.error("GET Product Costs error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await request.json();
        const { variant_id, product_id, cost_price } = body;

        if (!variant_id || !product_id || cost_price === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await sql`
            INSERT INTO product_costs (user_id, product_id, variant_id, cost_price)
            VALUES (${userId}, ${product_id}, ${variant_id}, ${cost_price})
            ON CONFLICT (user_id, variant_id) DO UPDATE SET
                cost_price = EXCLUDED.cost_price,
                updated_at = CURRENT_TIMESTAMP
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("POST Product Costs error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
