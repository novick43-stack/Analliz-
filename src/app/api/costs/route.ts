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

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        let costs;
        if (from && to) {
            costs = await sql`
                SELECT * FROM costs_general 
                WHERE user_id = ${userId} 
                AND start_date <= ${to} 
                AND end_date >= ${from}
                ORDER BY created_at DESC
            `;
        } else {
            costs = await sql`
                SELECT * FROM costs_general 
                WHERE user_id = ${userId} 
                ORDER BY created_at DESC
            `;
        }

        return NextResponse.json(costs);
    } catch (error: any) {
        console.error("GET Costs error:", error);
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
        const { id, type, category, amount, start_date, end_date } = body;

        if (id) {
            // Update
            await sql`
                UPDATE costs_general 
                SET type = ${type}, category = ${category}, amount = ${amount}, start_date = ${start_date}, end_date = ${end_date}
                WHERE id = ${id} AND user_id = ${userId}
            `;
            return NextResponse.json({ success: true, id });
        } else {
            // Insert
            const result = await sql`
                INSERT INTO costs_general (user_id, type, category, amount, start_date, end_date)
                VALUES (${userId}, ${type}, ${category}, ${amount}, ${start_date}, ${end_date})
                RETURNING id
            `;
            return NextResponse.json({ success: true, id: result[0].id });
        }
    } catch (error: any) {
        console.error("POST Costs error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await sql`DELETE FROM costs_general WHERE id = ${id} AND user_id = ${userId}`;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Costs error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
