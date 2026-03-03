import { sql } from "@/lib/db";

const TIENDANUBE_APP_ID = "27071";
const TIENDANUBE_API_KEY = "d8aa94bbc668653b82f2a1380a7c4c83140b4408a6ef9605";
const TIENDANUBE_AUTH_URL = "https://www.tiendanube.com/apps/authorize";
const TIENDANUBE_TOKEN_URL = "https://www.tiendanube.com/api/v1/oauth/token";

export async function initializeTiendaNubeTable() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS tiendanube_connections (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                auth0_id VARCHAR(255) NOT NULL,
                store_id VARCHAR(255) UNIQUE NOT NULL,
                access_token VARCHAR(500) NOT NULL,
                store_name VARCHAR(255),
                connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
    } catch (e) {
        console.error("Failed to create tiendanube_connections table", e);
    }
}

export function getTiendaNubeAuthUrl(state: string) {
    // The standard OAuth authorization URL for Tienda Nube apps.
    // Replace (app_id) with your actual APP ID.
    const AUTH_URL = `https://www.tiendanube.com/apps/${TIENDANUBE_APP_ID}/authorize`;

    const url = new URL(AUTH_URL);
    url.searchParams.set('state', state);

    return url.toString();
}

export async function exchangeCodeForToken(code: string) {
    // Tienda Nube provides examples that use the partners token endpoint
    // (POST https://www.tiendanube.com/apps/authorize/token with JSON body).
    // Some docs also mention /api/v1/oauth/token (form-encoded). We'll try the
    // partners JSON endpoint first, then fall back to the form-encoded URL.
    try {
        // Try JSON endpoint used by Partners UI
        const jsonPayload = {
            client_id: TIENDANUBE_APP_ID,
            client_secret: TIENDANUBE_API_KEY,
            grant_type: "authorization_code",
            code: code,
        };

        let response = await fetch("https://www.tiendanube.com/apps/authorize/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonPayload),
        });

        // If the partners endpoint returns 404 or 405, fallback to the API endpoint
        if (!response.ok) {
            console.warn("TiendaNube JSON token endpoint failed, status:", response.status);
            // Fallback
            response = await fetch(TIENDANUBE_TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: TIENDANUBE_APP_ID,
                    client_secret: TIENDANUBE_API_KEY,
                    grant_type: "authorization_code",
                    code: code,
                }).toString(),
            });
        }

        const body = await response.text();
        let parsed;
        try {
            parsed = JSON.parse(body);
        } catch (parseErr) {
            console.error("Failed to parse token response as JSON", parseErr, "raw body:", body);
            throw new Error(`Token endpoint returned non-JSON response: ${response.status}`);
        }

        if (!response.ok) {
            console.error("Token exchange failed:", response.status, parsed);
            throw new Error(`Failed to exchange code: ${response.status}`);
        }

        console.log("TiendaNube token response:", parsed);
        return parsed;
    } catch (e) {
        console.error("Error exchanging code for token", e);
        throw e;
    }
}

export async function saveTiendaNubeConnection(
    userId: number,
    auth0Id: string,
    storeId: string,
    accessToken: string,
    storeName?: string
) {
    try {
        await sql`
            INSERT INTO tiendanube_connections (user_id, auth0_id, store_id, access_token, store_name)
            VALUES (${userId}, ${auth0Id}, ${storeId}, ${accessToken}, ${storeName || null})
            ON CONFLICT (store_id) DO UPDATE SET
                access_token = EXCLUDED.access_token,
                store_name = EXCLUDED.store_name,
                updated_at = CURRENT_TIMESTAMP
        `;
    } catch (e) {
        console.error("Failed to save tiendanube connection", e);
        throw e;
    }
}

export async function getTiendaNubeConnection(userId: number) {
    try {
        const result = await sql`
            SELECT * FROM tiendanube_connections
            WHERE user_id = ${userId}
            LIMIT 1
        `;
        return result[0] || null;
    } catch (e) {
        console.error("Failed to get tiendanube connection", e);
        return null;
    }
}
