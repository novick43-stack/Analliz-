import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Webhook: Customer data request
 * Called when a customer requests a data export from the app
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { store_id, customer_id, request_id } = body;

        if (!store_id || !customer_id || !request_id) {
            return NextResponse.json(
                { error: 'Missing required fields: store_id, customer_id, request_id' },
                { status: 400 }
            );
        }

        console.log(
            `[Webhook] Customer data export requested - Store: ${store_id}, Customer: ${customer_id}, Request ID: ${request_id}`
        );

        // Here you would gather all customer data from your app
        // For now, we just acknowledge the request
        // In a real scenario, you might:
        // 1. Gather customer data (orders, preferences, etc.)
        // 2. Format it as JSON or CSV
        // 3. Return it or send it to Tienda Nube's API

        return NextResponse.json(
            { success: true, message: 'Customer data request received and will be processed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Customer data request webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
