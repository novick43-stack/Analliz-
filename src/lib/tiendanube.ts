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
    // Tienda Nube expects the OAuth authorize call to redirect back to the
    // partners authentication URL. Using the partners authentication URL as
    // the redirect_uri is the recommended flow for partner applications.
    // The partners URL will then complete installation and forward to the
    // app's configured callback when appropriate.
    // For partner-installed apps, direct the user to the partners
    // authentication/installation page. After the merchant installs the
    // app there, Tienda Nube (partners) will redirect to the callback URL
    // you configured in the Partners panel (e.g. http://localhost:3001/api/tiendanube/callback).
    const PARTNER_INSTALL_URL = `https://partners.tiendanube.com/applications/authentication/${TIENDANUBE_APP_ID}`;

    // Optionally include the state in the partners URL so we can validate it
    // after the redirect back to our callback.
    const partnerUrl = new URL(PARTNER_INSTALL_URL);
    partnerUrl.searchParams.set('state', state);

    return partnerUrl.toString();
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
