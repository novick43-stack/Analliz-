import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { sql } from '@/lib/db';
import { exchangeCodeForToken, saveTiendaNubeConnection, initializeTiendaNubeTable } from '@/lib/tiendanube';

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const pendingId = url.searchParams.get('pending');
        if (!pendingId) {
            return NextResponse.json({ error: 'Missing pending id' }, { status: 400 });
        }

        // Ensure needed tables exist
        await initializeTiendaNubeTable();

        // Verify session
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get pending record
        const rows = await sql`
            SELECT * FROM tiendanube_pending WHERE id = ${pendingId} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Pending code not found' }, { status: 404 });
        }

        const pending = rows[0];

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(pending.code);

        // Find user in DB
        const users = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userId = users[0].id;

        // Save connection -- tokenData shape may vary; attempt to extract store id and name
        const storeId = tokenData?.user?.id || tokenData?.store_id || tokenData?.shop_id || tokenData?.store?.id;
        const accessToken = tokenData?.access_token || tokenData?.token || tokenData?.accessToken;
        const storeName = tokenData?.user?.name || tokenData?.store?.name || tokenData?.shop_name || null;

        if (!storeId || !accessToken) {
            console.error('Unexpected token response shape', tokenData);
            return NextResponse.json({ error: 'Invalid token response' }, { status: 500 });
        }

        await saveTiendaNubeConnection(userId, session.user.sub, String(storeId), String(accessToken), storeName);

        // Delete pending
        await sql`DELETE FROM tiendanube_pending WHERE id = ${pendingId}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error claiming pending tiendanube code', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
