import { auth0 } from "../../lib/auth0";
import { sql } from "../../lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTiendaNubeConnection, initializeTiendaNubeTable } from "@/lib/tiendanube";

export default async function PersonalDashboard() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect("/");
    }

    const { user } = session;

    let userLogins: any[] = [];
    let userInfo: any = null;
    let tiendaNubeConnection: any = null;
    let dbError = false;

    try {
        // Initialize Tienda Nube table
        await initializeTiendaNubeTable();

        // Ensure tables exist
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                auth0_id VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255),
                name VARCHAR(255),
                nickname VARCHAR(255),
                last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS login_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                auth0_id VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                name VARCHAR(255),
                login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT
            )
        `;

        // Get or create user
        const userResult = await sql`
            INSERT INTO users (auth0_id, email, name, nickname)
            VALUES (${user.sub}, ${user.email}, ${user.name}, ${user.nickname})
            ON CONFLICT (auth0_id) DO UPDATE SET 
                last_login = CURRENT_TIMESTAMP,
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                nickname = EXCLUDED.nickname
            RETURNING *
        `;

        userInfo = userResult[0] || null;

        // Track login event
        if (userInfo?.id) {
            await sql`
                INSERT INTO login_events (user_id, auth0_id, email, name, ip_address, user_agent)
                VALUES (${userInfo.id}, ${user.sub}, ${user.email}, ${user.name}, ${null}, ${null})
            `;

            // Get login history
            const logins = await sql`
                SELECT * FROM login_events 
                WHERE user_id = ${userInfo.id}
                ORDER BY login_timestamp DESC
                LIMIT 10
            `;
            userLogins = logins || [];

            // Get Tienda Nube connection status
            tiendaNubeConnection = await getTiendaNubeConnection(userInfo.id);
        }
    } catch (e) {
        console.error("Failed to initialize database or fetch user data", e);
        dbError = true;
    }

    return (
        <section>
            {/* Welcome Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                            ¡Hola, {user.name || user.nickname || "Usuario"}!
                        </h2>
                        <p className="text-gray-600 text-lg">Bienvenido a tu panel central de Analliz.</p>
                        {tiendaNubeConnection ? (
                            <div className="mt-4 flex items-center gap-2 text-green-600 font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tienda conectada: <span className="font-bold">{tiendaNubeConnection.store_name || "Mi Tienda"}</span>
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center gap-2 text-amber-600 font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Aún no has conectado tu Tienda Nube.
                                <Link href="/setup/tiendanube" className="ml-2 underline hover:text-amber-700">Conectar ahora</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
