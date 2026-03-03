import { auth0 } from "../../lib/auth0";
import { sql } from "../../lib/db";
import { redirect } from "next/navigation";
import DashboardContent from "./dashboard-content";
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
        <DashboardContent 
            user={user} 
            userInfo={userInfo} 
            userLogins={userLogins}
            tiendaNubeConnection={tiendaNubeConnection}
        />
    );
}
