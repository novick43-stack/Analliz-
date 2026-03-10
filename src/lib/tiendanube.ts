import { sql } from "@/lib/db";

const TIENDANUBE_APP_ID = "27071";
const TIENDANUBE_API_KEY = "d8aa94bbc668653b82f2a1380a7c4c83140b4408a6ef9605";
const TIENDANUBE_AUTH_URL = "https://www.tiendanube.com/apps/authorize";
const TIENDANUBE_TOKEN_URL = "https://www.tiendanube.com/api/v1/oauth/token";

const TIENDANUBE_USER_AGENT = "Analliz (novick43@gmail.com)";

/**
 * Parses Tienda Nube date formats.
 * TN sometimes returns ISO strings, sometimes objects with .date and .timezone
 */
function parseTNDate(tnDate: any) {
    if (!tnDate) return null;
    if (typeof tnDate === 'string') return tnDate;
    if (tnDate.date) return tnDate.date;
    return tnDate;
}

/**
 * Helper to fetch with retries for transient errors (429, 502, 503, 504)
 */
async function fetchWithRetry(url: string, options: any, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);

        if (response.ok || response.status === 404) return response;

        const isTransientError = [429, 502, 503, 504].includes(response.status);
        if (!isTransientError || i === retries - 1) return response;

        console.warn(`Fetch failed (${response.status}), retrying in ${backoff}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
    }
    throw new Error("Fetch with retry failed unexpectedly");
}

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
                admin_domain VARCHAR(255),
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
            INSERT INTO tiendanube_connections (user_id, auth0_id, store_id, access_token, store_name, admin_domain)
            VALUES (${userId}, ${auth0Id}, ${storeId}, ${accessToken}, ${storeName || null}, null)
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
                identification VARCHAR(50),
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
                payment_method VARCHAR(100),
                shipping_method VARCHAR(100),
                currency VARCHAR(10),
                city VARCHAR(255),
                province VARCHAR(255),
                coupon_code VARCHAR(100),
                discount DECIMAL(15, 2) DEFAULT 0,
                shipping_cost_owner DECIMAL(15, 2) DEFAULT 0,
                shipping_cost_customer DECIMAL(15, 2) DEFAULT 0,
                customer_identification VARCHAR(50),
                paid_at TIMESTAMP WITH TIME ZONE,
                shipped_at TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                cancelled_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE
            )
        `;

        // User Goals Table
        await sql`
            CREATE TABLE IF NOT EXISTS user_goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                month DATE NOT NULL,
                revenue_target DECIMAL(15, 2) DEFAULT 0,
                orders_target INTEGER DEFAULT 0,
                UNIQUE(user_id, month)
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
                price DECIMAL(15, 2),
                original_price DECIMAL(15, 2)
            )
        `;
    } catch (e) {
        console.error("Failed to initialize Tienda Nube sync tables", e);
        throw e;
    }
}

/**
 * Run one-time schema migrations (column additions).
 * Call this from the init-db route, NOT from every sync.
 */
export async function runMigrations() {
    try {
        await Promise.all([
            sql`ALTER TABLE tn_products ADD COLUMN IF NOT EXISTS brand VARCHAR(255)`,
            sql`ALTER TABLE tn_customers ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`,
            sql`ALTER TABLE tn_customers ADD COLUMN IF NOT EXISTS total_spent DECIMAL(15, 2)`,
            sql`ALTER TABLE tn_customers ADD COLUMN IF NOT EXISTS orders_count INTEGER`,
            sql`ALTER TABLE tn_customers ADD COLUMN IF NOT EXISTS identification VARCHAR(50)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS customer_id BIGINT`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS city VARCHAR(255)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS province VARCHAR(255)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS discount DECIMAL(15, 2) DEFAULT 0`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS shipping_cost_owner DECIMAL(15, 2) DEFAULT 0`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS shipping_cost_customer DECIMAL(15, 2) DEFAULT 0`,
            sql`ALTER TABLE tn_order_items ADD COLUMN IF NOT EXISTS original_price DECIMAL(15, 2)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS customer_identification VARCHAR(50)`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE`,
            sql`ALTER TABLE tn_orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE`,
            sql`ALTER TABLE tiendanube_connections ADD COLUMN IF NOT EXISTS admin_domain VARCHAR(255)`,
        ]);
        console.log("[Migrations] Schema migrations completed successfully.");
    } catch (e) {
        console.error("[Migrations] Schema migration failed", e);
        throw e;
    }
}

/**
 * Helper to fetch many pages in parallel
 */
async function fetchPaginatedParallel(baseUrl: string, accessToken: string, concurrency = 5) {
    let allData: any[] = [];
    let page = 1;

    // Fetch first page
    const firstUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=1`;
    const firstRes = await fetchWithRetry(firstUrl, {
        headers: { "Authentication": `bearer ${accessToken}`, "User-Agent": TIENDANUBE_USER_AGENT }
    });
    if (!firstRes.ok) return [];
    const firstPage = await firstRes.json();
    if (firstPage.length === 0) return [];
    allData = [...firstPage];

    if (firstPage.length < 100) return allData;

    // Fetch subsequent pages in parallel batches
    page = 2;
    let hasMore = true;
    while (hasMore) {
        const promises = [];
        for (let i = 0; i < concurrency; i++) {
            const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page + i}`;
            promises.push(fetchWithRetry(url, {
                headers: { "Authentication": `bearer ${accessToken}`, "User-Agent": TIENDANUBE_USER_AGENT }
            }).then(r => r.ok ? r.json() : []));
        }

        const results = await Promise.all(promises);
        let foundEmpty = false;
        for (const res of results) {
            if (res.length === 0) {
                foundEmpty = true;
            } else {
                allData = [...allData, ...res];
            }
        }
        if (foundEmpty) hasMore = false;
        else page += concurrency;
        if (page > 300) break; // Defensive cap
    }

    return allData;
}

export async function getTiendaNubeOrders(storeId: string, accessToken: string, sinceDate?: string) {
    let url = `https://api.tiendanube.com/v1/${storeId}/orders`;
    if (sinceDate) url += `?created_at_min=${sinceDate}`;
    return fetchPaginatedParallel(url, accessToken, 10); // High concurrency
}

export async function getTiendaNubeProducts(storeId: string, accessToken: string, sinceDate?: string) {
    let url = `https://api.tiendanube.com/v1/${storeId}/products`;
    if (sinceDate) url += `?updated_at_min=${sinceDate}`;
    return fetchPaginatedParallel(url, accessToken, 5);
}

export async function getTiendaNubeCustomers(storeId: string, accessToken: string, sinceDate?: string) {
    let url = `https://api.tiendanube.com/v1/${storeId}/customers`;
    if (sinceDate) url += `?updated_at_min=${sinceDate}`;
    return fetchPaginatedParallel(url, accessToken, 5);
}

export async function getTiendaNubeCategories(storeId: string, accessToken: string, sinceDate?: string) {
    let url = `https://api.tiendanube.com/v1/${storeId}/categories`;
    if (sinceDate) url += `?updated_at_min=${sinceDate}`;
    return fetchPaginatedParallel(url, accessToken, 2);
}

/**
 * Fetches store info from Tienda Nube
 */
export async function getTiendaNubeStoreInfo(storeId: string, accessToken: string) {
    try {
        const url = `https://api.tiendanube.com/v1/${storeId}/store`;
        const response = await fetchWithRetry(url, {
            headers: {
                "Authentication": `bearer ${accessToken}`,
                "User-Agent": TIENDANUBE_USER_AGENT
            }
        });

        if (!response.ok) {
            console.error(`TN Store Info API error: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (e) {
        console.error("Error fetching store info from Tienda Nube", e);
        return null;
    }
}

/**
 * Syncs all data for a specific user with ULTRA performance optimizations
 */
export async function syncTiendaNubeData(
    userId: number,
    storeId: string,
    accessToken: string,
    onProgress?: (msg: string, progress: number) => void
) {
    try {
        const reportProgress = (msg: string, p: number) => {
            if (onProgress) onProgress(msg, p);
            console.log(`[ULTRA SYNC] ${msg} (${p}%)`);
        };

        reportProgress("Inicializando motores de alta velocidad...", 5);
        await initializeTiendaNubeSyncTables();
        await runMigrations();

        reportProgress("Buscando última sincronización...", 10);
        const [lastOrderRes, lastProductRes, lastCustomerRes, lastCategoryRes] = await Promise.all([
            sql`SELECT created_at FROM tn_orders WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1`,
            sql`SELECT updated_at FROM tn_products WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1`,
            sql`SELECT updated_at FROM tn_customers WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1`,
            sql`SELECT updated_at FROM tn_categories WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1`
        ]);

        const lastOrderDate = lastOrderRes[0]?.created_at;
        const lastProductDate = lastProductRes[0]?.updated_at;
        const lastCustomerDate = lastCustomerRes[0]?.updated_at;
        const lastCategoryDate = lastCategoryRes[0]?.updated_at;

        const isIncremental = !!lastOrderDate;

        if (isIncremental) {
            reportProgress(`Modo incremental detectado (Sincronizando desde: ${new Date(lastOrderDate).toLocaleDateString()})`, 12);
        } else {
            reportProgress("Modo historial completo detectado...", 12);
        }

        // 1. Store Info
        reportProgress("Sincronizando información de la tienda...", 15);
        const storeInfo = await getTiendaNubeStoreInfo(storeId, accessToken);
        if (storeInfo) {
            const principalName = typeof storeInfo.name === 'object' ? Object.values(storeInfo.name)[0] : storeInfo.name;
            const domain = storeInfo.original_domain || storeInfo.domain || null;
            await sql`
                UPDATE tiendanube_connections 
                SET store_name = ${principalName}, 
                    admin_domain = ${domain} 
                WHERE store_id = ${storeId}
            `;
        }

        // 2. Categories
        reportProgress("Sincronizando categorías...", 20);
        const categories = await getTiendaNubeCategories(storeId, accessToken, lastCategoryDate ? new Date(lastCategoryDate).toISOString() : undefined);
        if (categories.length > 0) {
            for (const cat of categories) {
                await sql`
                    INSERT INTO tn_categories (id, user_id, name, description, parent_id, created_at, updated_at)
                    VALUES (${cat.id}, ${userId}, ${JSON.stringify(cat.name)}, ${JSON.stringify(cat.description)}, ${cat.parent_id}, ${parseTNDate(cat.created_at)}, ${parseTNDate(cat.updated_at)})
                    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
                `;
            }
        }

        // 3. Products & Variants
        reportProgress("Buscando nuevos productos...", 25);
        const products = await getTiendaNubeProducts(storeId, accessToken, lastProductDate ? new Date(lastProductDate).toISOString() : undefined);
        if (products.length > 0) {
            reportProgress(`Guardando ${products.length} productos...`, 30);
            const batchSize = 10; // Smaller batch size for Neon
            for (let i = 0; i < products.length; i += batchSize) {
                const batch = products.slice(i, i + batchSize);
                await Promise.all(batch.map(async (p) => {
                    await sql`
                        INSERT INTO tn_products (id, user_id, name, description, handle, brand, published, created_at, updated_at)
                        VALUES (${p.id}, ${userId}, ${JSON.stringify(p.name)}, ${JSON.stringify(p.description)}, ${JSON.stringify(p.handle)}, ${p.brand}, ${p.published}, ${parseTNDate(p.created_at)}, ${parseTNDate(p.updated_at)})
                        ON CONFLICT (id) DO UPDATE SET 
                            updated_at = EXCLUDED.updated_at,
                            published = EXCLUDED.published,
                            name = EXCLUDED.name,
                            brand = EXCLUDED.brand
                    `;
                    if (p.variants) {
                        for (const v of p.variants) {
                            await sql`
                                INSERT INTO tn_variants (id, product_id, price, stock, sku, barcode, weight)
                                VALUES (${v.id}, ${p.id}, ${v.price}, ${v.stock}, ${v.sku}, ${v.barcode}, ${v.weight})
                                ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock
                            `;
                        }
                    }
                }));
                reportProgress(`Procesando productos: ${Math.min(i + batchSize, products.length)}/${products.length}`, 30 + Math.floor((i / products.length) * 20));
            }
        }

        // 4. Customers
        reportProgress("Buscando nuevos clientes...", 50);
        const customers = await getTiendaNubeCustomers(storeId, accessToken, lastCustomerDate ? new Date(lastCustomerDate).toISOString() : undefined);
        if (customers.length > 0) {
            reportProgress(`Guardando ${customers.length} clientes...`, 55);
            const batchSize = 25;
            for (let i = 0; i < customers.length; i += batchSize) {
                const batch = customers.slice(i, i + batchSize);
                await Promise.all(batch.map(c => sql`
                    INSERT INTO tn_customers (id, user_id, name, email, phone, total_spent, orders_count, identification, created_at, updated_at)
                    VALUES (${c.id}, ${userId}, ${c.name}, ${c.email}, ${c.phone}, ${c.total_spent}, ${c.orders_count}, ${c.identification || null}, ${parseTNDate(c.created_at)}, ${parseTNDate(c.updated_at)})
                    ON CONFLICT (id) DO UPDATE SET total_spent = EXCLUDED.total_spent, orders_count = EXCLUDED.orders_count, updated_at = EXCLUDED.updated_at
                `));
                reportProgress(`Procesando clientes: ${Math.min(i + batchSize, customers.length)}/${customers.length}`, 55 + Math.floor((i / customers.length) * 10));
            }
        }

        // 5. Orders & Items
        reportProgress("Buscando nuevas órdenes...", 65);
        const orders = await getTiendaNubeOrders(storeId, accessToken, lastOrderDate ? new Date(lastOrderDate).toISOString() : undefined);
        if (orders.length > 0) {
            reportProgress(`Importando ${orders.length} órdenes...`, 70);
            const orderBatchSize = 20;
            for (let i = 0; i < orders.length; i += orderBatchSize) {
                const batch = orders.slice(i, i + orderBatchSize);
                await Promise.all(batch.map(async (o) => {
                    await sql`
                        INSERT INTO tn_orders (
                            id, user_id, customer_id, number, total, subtotal, status, 
                            payment_status, shipping_status, payment_method, shipping_method, 
                            currency, city, province, coupon_code, customer_identification, paid_at, shipped_at, 
                            completed_at, cancelled_at, created_at, updated_at
                        )
                        VALUES (
                            ${o.id}, ${userId}, ${o.customer?.id || null}, ${o.number}, ${o.total}, ${o.subtotal}, ${o.status}, 
                            ${o.payment_status}, ${o.shipping_status}, ${o.payment_method}, ${o.shipping_option}, 
                            ${o.currency}, ${o.shipping_address?.city || null}, ${o.shipping_address?.province || null}, 
                            ${o.coupon?.[0]?.code || null}, ${Number(o.discount || 0)}, ${Number(o.shipping_cost_owner || 0)}, ${Number(o.shipping_cost_customer || 0)},
                            ${o.customer?.identification || null}, ${parseTNDate(o.paid_at)}, ${parseTNDate(o.shipped_at)}, 
                            ${parseTNDate(o.completed_at)}, ${parseTNDate(o.cancelled_at)}, ${parseTNDate(o.created_at)}, ${parseTNDate(o.updated_at)}
                        )
                        ON CONFLICT (id) DO UPDATE SET 
                            status = EXCLUDED.status, 
                            payment_status = EXCLUDED.payment_status, 
                            updated_at = EXCLUDED.updated_at,
                            discount = EXCLUDED.discount,
                            shipping_cost_owner = EXCLUDED.shipping_cost_owner,
                            shipping_cost_customer = EXCLUDED.shipping_cost_customer
                    `;

                    if (o.products && o.products.length > 0) {
                        const itemBatchSize = 10;
                        for (let j = 0; j < o.products.length; j += itemBatchSize) {
                            const itemBatch = o.products.slice(j, j + itemBatchSize);
                            await Promise.all(itemBatch.map((item: any) => sql`
                                INSERT INTO tn_order_items (id, order_id, product_id, variant_id, name, quantity, price, original_price)
                                VALUES (${item.id}, ${o.id}, ${item.product_id}, ${item.variant_id}, ${item.name}, ${item.quantity}, ${item.price}, ${item.original_price || item.price})
                                ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, price = EXCLUDED.price, original_price = EXCLUDED.original_price
                            `));
                        }
                    }
                }));
                reportProgress(`Procesando órdenes: ${Math.min(i + orderBatchSize, orders.length)}/${orders.length}`, 70 + Math.floor((i / orders.length) * 30));
            }
        }

        reportProgress("¡Sincronización completada con éxito!", 100);

        return {
            success: true,
            productsCount: products.length,
            ordersCount: orders.length,
            customersCount: customers.length
        };
    } catch (e) {
        console.error("Ultra Sync failed", e);
        if (onProgress) onProgress(`Error: ${e instanceof Error ? e.message : String(e)}`, -1);
        throw e;
    }
}
