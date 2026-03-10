import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    const res = await sql`
        SELECT SUM(v.stock * v.price) as total_value, COUNT(DISTINCT p.id) as published_products_count
        FROM tn_variants v
        JOIN tn_products p ON v.product_id = p.id
        WHERE p.published = true
    `;
    return NextResponse.json(res);
}
