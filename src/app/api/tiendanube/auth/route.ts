import { getTiendaNubeAuthUrl } from '@/lib/tiendanube';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const state = request.nextUrl.searchParams.get('state');

        if (!state) {
            return NextResponse.json(
                { error: 'State parameter is required' },
                { status: 400 }
            );
        }

        const authUrl = getTiendaNubeAuthUrl(state);

        return NextResponse.json({ authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate authorization URL' },
            { status: 500 }
        );
    }
}
