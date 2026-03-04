import { sql } from "@/lib/db";

const TIENDANUBE_APP_ID = "27071";
const TIENDANUBE_API_KEY = "d8aa94bbc668653b82f2a1380a7c4c83140b4408a6ef9605";
const TIENDANUBE_AUTH_URL = "https://www.tiendanube.com/apps/authorize";
const TIENDANUBE_TOKEN_URL = "https://www.tiendanube.com/api/v1/oauth/token";

const TIENDANUBE_USER_AGENT = "Analliz (novick43@gmail.com)";

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
            headers: {
                "Content-Type": "application/json",
                "User-Agent": TIENDANUBE_USER_AGENT
            },
            body: JSON.stringify(jsonPayload),
        });

        // If the partners endpoint returns 404 or 405, fallback to the API endpoint
        if (!response.ok) {
            console.warn("TiendaNube JSON token endpoint failed, status:", response.status);
            // Fallback
            response = await fetch(TIENDANUBE_TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": TIENDANUBE_USER_AGENT
                },
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

/**
 * Fetches recent orders from Tienda Nube
 */
export async function getTiendaNubeOrders(storeId: string, accessToken: string, limit: number = 50) {
    try {
        const url = `https://api.tiendanube.com/v1/${storeId}/orders?per_page=${limit}`;
        const response = await fetch(url, {
            headers: {
                "Authentication": `bearer ${accessToken}`,
                "User-Agent": TIENDANUBE_USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Tienda Nube API error: ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error("Error fetching orders from Tienda Nube", e);
        throw e;
    }
}

/**
 * Fetches products from Tienda Nube
 */
export async function getTiendaNubeProducts(storeId: string, accessToken: string, limit: number = 50) {
    try {
        const url = `https://api.tiendanube.com/v1/${storeId}/products?per_page=${limit}`;
        const response = await fetch(url, {
            headers: {
                "Authentication": `bearer ${accessToken}`,
                "User-Agent": TIENDANUBE_USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Tienda Nube API error: ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error("Error fetching products from Tienda Nube", e);
        throw e;
    }
}
/**
 * Fetches customers from Tienda Nube
 */
export async function getTiendaNubeCustomers(storeId: string, accessToken: string, limit: number = 50) {
    try {
        const url = `https://api.tiendanube.com/v1/${storeId}/customers?per_page=${limit}`;
        const response = await fetch(url, {
            headers: {
                "Authentication": `bearer ${accessToken}`,
                "User-Agent": TIENDANUBE_USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Tienda Nube API error (customers): ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error("Error fetching customers from Tienda Nube", e);
        throw e;
    }
}

/**
 * Fetches categories from Tienda Nube
 */
export async function getTiendaNubeCategories(storeId: string, accessToken: string) {
    try {
        const url = `https://api.tiendanube.com/v1/${storeId}/categories`;
        const response = await fetch(url, {
            headers: {
                "Authentication": `bearer ${accessToken}`,
                "User-Agent": TIENDANUBE_USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`Tienda Nube API error (categories): ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error("Error fetching categories from Tienda Nube", e);
        throw e;
    }
}

/**
 * Initializes all synchronization tables in Neon
 */
export async function initializeTiendaNubeSyncTables() {
    try {
        // Products Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_products (
                id BIGINT PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name JSONB,
                description JSONB,
                handle JSONB,
                brand VARCHAR(255),
                published BOOLEAN,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            )
        `;

        // Variants Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_variants (
                id BIGINT PRIMARY KEY,
                product_id BIGINT REFERENCES tn_products(id) ON DELETE CASCADE,
                price DECIMAL(15, 2),
                stock INTEGER,
                sku VARCHAR(255),
                barcode VARCHAR(255),
                weight DECIMAL(10, 3)
            )
        `;

        // Categories Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_categories (
                id BIGINT PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name JSONB,
                description JSONB,
                parent_id BIGINT,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            )
        `;

        // Customers Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_customers (
                id BIGINT PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                total_spent DECIMAL(15, 2),
                orders_count INTEGER,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            )
        `;

        // Orders Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_orders (
                id BIGINT PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                customer_id BIGINT,
                number INTEGER,
                total DECIMAL(15, 2),
                subtotal DECIMAL(15, 2),
                status VARCHAR(50),
                payment_status VARCHAR(50),
                shipping_status VARCHAR(50),
                currency VARCHAR(10),
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            )
        `;

        // Order Items Table
        await sql`
            CREATE TABLE IF NOT EXISTS tn_order_items (
                id BIGINT PRIMARY KEY,
                order_id BIGINT REFERENCES tn_orders(id) ON DELETE CASCADE,
                product_id BIGINT,
                variant_id BIGINT,
                name VARCHAR(255),
                quantity INTEGER,
                price DECIMAL(15, 2)
            )
        `;
    } catch (e) {
        console.error("Failed to initialize Tienda Nube sync tables", e);
        throw e;
    }
}

/**
 * Syncs all data for a specific user
 */
export async function syncTiendaNubeData(userId: number, storeId: string, accessToken: string) {
    try {
        await initializeTiendaNubeSyncTables();

        // 1. Sync Products & Variants
        const products = await getTiendaNubeProducts(storeId, accessToken, 200);
        for (const p of products) {
            await sql`
                INSERT INTO tn_products (id, user_id, name, description, handle, brand, published, created_at, updated_at)
                VALUES (${p.id}, ${userId}, ${JSON.stringify(p.name)}, ${JSON.stringify(p.description)}, ${JSON.stringify(p.handle)}, ${p.brand}, ${p.published}, ${p.created_at}, ${p.updated_at})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    brand = EXCLUDED.brand,
                    published = EXCLUDED.published,
                    updated_at = EXCLUDED.updated_at
            `;

            for (const v of p.variants) {
                await sql`
                    INSERT INTO tn_variants (id, product_id, price, stock, sku, barcode, weight)
                    VALUES (${v.id}, ${p.id}, ${v.price}, ${v.stock}, ${v.sku}, ${v.barcode}, ${v.weight})
                    ON CONFLICT (id) DO UPDATE SET
                        price = EXCLUDED.price,
                        stock = EXCLUDED.stock,
                        sku = EXCLUDED.sku
                `;
            }
        }

        // 2. Sync Orders & Items
        const orders = await getTiendaNubeOrders(storeId, accessToken, 200);
        for (const o of orders) {
            await sql`
                INSERT INTO tn_orders (id, user_id, customer_id, number, total, subtotal, status, payment_status, shipping_status, currency, created_at, updated_at)
                VALUES (${o.id}, ${userId}, ${o.customer?.id || null}, ${o.number}, ${o.total}, ${o.subtotal}, ${o.status}, ${o.payment_status}, ${o.shipping_status}, ${o.currency}, ${o.created_at}, ${o.updated_at})
                ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    payment_status = EXCLUDED.payment_status,
                    shipping_status = EXCLUDED.shipping_status,
                    updated_at = EXCLUDED.updated_at
            `;

            for (const item of o.products) {
                await sql`
                    INSERT INTO tn_order_items (id, order_id, product_id, variant_id, name, quantity, price)
                    VALUES (${item.id}, ${o.id}, ${item.product_id}, ${item.variant_id}, ${item.name}, ${item.quantity}, ${item.price})
                    ON CONFLICT (id) DO UPDATE SET
                        quantity = EXCLUDED.quantity,
                        price = EXCLUDED.price
                `;
            }
        }

        // 3. Sync Customers
        const customers = await getTiendaNubeCustomers(storeId, accessToken, 200);
        for (const c of customers) {
            await sql`
                INSERT INTO tn_customers (id, user_id, name, email, phone, total_spent, orders_count, created_at, updated_at)
                VALUES (${c.id}, ${userId}, ${c.name}, ${c.email}, ${c.phone}, ${c.total_spent}, ${c.orders_count}, ${c.created_at}, ${c.updated_at})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    phone = EXCLUDED.phone,
                    total_spent = EXCLUDED.total_spent,
                    orders_count = EXCLUDED.orders_count,
                    updated_at = EXCLUDED.updated_at
            `;
        }

        // 4. Sync Categories
        const categories = await getTiendaNubeCategories(storeId, accessToken);
        for (const cat of categories) {
            await sql`
                INSERT INTO tn_categories (id, user_id, name, description, parent_id, created_at, updated_at)
                VALUES (${cat.id}, ${userId}, ${JSON.stringify(cat.name)}, ${JSON.stringify(cat.description)}, ${cat.parent_id}, ${cat.created_at}, ${cat.updated_at})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    parent_id = EXCLUDED.parent_id,
                    updated_at = EXCLUDED.updated_at
            `;
        }

        return {
            success: true,
            productsCount: products.length,
            ordersCount: orders.length,
            customersCount: customers.length,
            categoriesCount: categories.length
        };
    } catch (e) {
        console.error("Sync failed", e);
        throw e;
    }
}
