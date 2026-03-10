import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { runMigrations } from "@/lib/tiendanube";

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

        // Ensure schema is up to date before running analytics
        try {
            await runMigrations();
        } catch (e) {
            console.error("Rentabilidad API: Migration failed", e);
        }

        // Default to "This Month" if no range is provided
        if (!from || !to) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            from = firstDay.toISOString();
            to = now.toISOString();
        }

        const finalFrom = from.length === 10 ? `${from} 00:00:00` : from;
        const finalTo = to.length === 10 ? `${to} 23:59:59` : to;

        // KPI Queries
        const [kpis, cogsResult, generalCostsBreakdown, discountBreakdown] = await Promise.all([
            // 1. Basic Stats: Ventas, Ingresos, Ticket Promedio
            sql`
                SELECT 
                    COUNT(id)::int as ventas,
                    COALESCE(SUM(total), 0)::float as ingresos,
                    COALESCE(AVG(total), 0)::float as ticket_promedio
                FROM tn_orders
                WHERE user_id = ${currentUserId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
            `,

            // 2. COGS (Product Costs)
            sql`
                SELECT 
                    SUM(i.quantity * COALESCE(pc.cost_price, 0))::float as cogs
                FROM tn_order_items i
                JOIN tn_orders o ON i.order_id = o.id
                LEFT JOIN product_costs pc ON i.variant_id::text = pc.variant_id AND o.user_id = pc.user_id
                WHERE o.user_id = ${currentUserId}
                AND o.created_at >= ${finalFrom}::timestamptz AND o.created_at <= ${finalTo}::timestamptz
            `,

            // 3. General Costs Breakdown (Fijos, Publicidad, Variables, Comisiones)
            sql`
                SELECT 
                    type,
                    COALESCE(SUM(amount), 0)::float as amount
                FROM costs_general
                WHERE user_id = ${currentUserId}
                AND start_date <= ${finalTo}::date
                AND end_date >= ${finalFrom}::date
                GROUP BY type
            `,

            // 4. Detailed Discounts Breakdown
            sql`
                SELECT 
                    COALESCE(SUM(discount), 0)::float as total_discount,
                    COALESCE(SUM(shipping_cost_owner), 0)::float as shipping_owner_cost,
                    (
                        SELECT COALESCE(SUM(quantity * (original_price - price)), 0)::float
                        FROM tn_order_items i2
                        JOIN tn_orders o2 ON i2.order_id = o2.id
                        WHERE o2.user_id = ${currentUserId}
                        AND o2.created_at >= ${finalFrom}::timestamptz AND o2.created_at <= ${finalTo}::timestamptz
                    ) as product_promo_discounts
                FROM tn_orders
                WHERE user_id = ${currentUserId}
                AND created_at >= ${finalFrom}::timestamptz AND created_at <= ${finalTo}::timestamptz
            `
        ]);

        const stats = kpis[0] || { ventas: 0, ingresos: 0, ticket_promedio: 0 };
        const cogs = cogsResult[0]?.cogs || 0;

        // Map general costs
        const opexMap: Record<string, number> = {};
        generalCostsBreakdown.forEach((row: any) => {
            opexMap[row.type] = row.amount;
        });

        const fijos = opexMap['fijo'] || 0;
        const variables = opexMap['variable'] || 0;
        const comisiones = opexMap['comision'] || 0;
        const opex = fijos + variables + comisiones;

        const discounts = discountBreakdown[0] || { total_discount: 0, shipping_owner_cost: 0, product_promo_discounts: 0 };
        const totalDiscounts = discounts.total_discount + discounts.product_promo_discounts;

        const totalCosts = cogs + opex + discounts.shipping_owner_cost;
        const ganancia = stats.ingresos - totalCosts;

        // Margen Bruto = (Revenue - COGS) / Revenue
        const margenBruto = stats.ingresos > 0 ? ((stats.ingresos - cogs) / stats.ingresos) * 100 : 0;

        // Rentabilidad = (Ganancia / Revenue)
        const rentabilidad = stats.ingresos > 0 ? (ganancia / stats.ingresos) * 100 : 0;

        return NextResponse.json({
            ventas: stats.ventas,
            ingresos: stats.ingresos,
            ticket_promedio: stats.ticket_promedio,
            costos_totales: totalCosts,
            ganancia: ganancia,
            margen_bruto: margenBruto,
            rentabilidad: rentabilidad,
            cogs,
            opex,
            distributions: {
                main: [
                    { name: "Costos", value: totalCosts, color: "#F49372" },
                    { name: "Ganancia", value: Math.max(0, ganancia), color: "#78C9BA" },
                    { name: "Descuentos", value: totalDiscounts, color: "#F4C051" }
                ],
                costs: [
                    { name: "Fijos", value: fijos },
                    { name: "Productos", value: cogs },
                    { name: "Financieros / Comisiones", value: comisiones },
                    { name: "Publicidad", value: 0 }, // Placeholder for future publicity costs
                    { name: "Envíos", value: discounts.shipping_owner_cost },
                    { name: "Variables", value: variables }
                ],
                discounts: [
                    { name: "Productos (precios promo)", value: discounts.product_promo_discounts },
                    { name: "Cupones (sin envíos)", value: discounts.total_discount },
                    { name: "Medios de pago", value: 0 }, // Placeholder
                    { name: "Promociones", value: 0 } // Placeholder
                ]
            }
        });
    } catch (error: any) {
        console.error("Rentabilidad Analytics API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
