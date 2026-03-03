import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Webhook: Store data redaction
 * Called when a store owner requests their data to be deleted from the app
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { store_id } = body;

        if (!store_id) {
            return NextResponse.json(
                { error: 'Missing store_id' },
                { status: 400 }
            );
        }

        console.log(`[Webhook] Store redaction requested for store: ${store_id}`);

        // Delete all data associated with this store
        await sql`
            DELETE FROM tiendanube_connections
            WHERE store_id = ${store_id}
        `;

        return NextResponse.json(
            { success: true, message: 'Store data redacted' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Store redaction webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
