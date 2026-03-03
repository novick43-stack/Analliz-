import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Webhook: Customer data redaction
 * Called when a customer requests their data to be deleted from the app
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { store_id, customer_id } = body;

        if (!store_id || !customer_id) {
            return NextResponse.json(
                { error: 'Missing store_id or customer_id' },
                { status: 400 }
            );
        }

        console.log(
            `[Webhook] Customer redaction requested - Store: ${store_id}, Customer: ${customer_id}`
        );

        // Here you would delete customer-specific data if you store it
        // For now, we just log and acknowledge the request
        // In a real scenario, you might delete customer orders, preferences, etc.

        return NextResponse.json(
            { success: true, message: 'Customer data redaction processed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Customer redaction webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
