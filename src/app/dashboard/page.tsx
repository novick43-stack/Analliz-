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

    let tiendaNubeConnection: any = null;

    try {
        await initializeTiendaNubeTable();

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

        const userInfo = userResult[0] || null;

        if (userInfo?.id) {
            await sql`
                INSERT INTO login_events (user_id, auth0_id, email, name, ip_address, user_agent)
                VALUES (${userInfo.id}, ${user.sub}, ${user.email}, ${user.name}, ${null}, ${null})
            `;
            tiendaNubeConnection = await getTiendaNubeConnection(userInfo.id);
        }
    } catch (e) {
        console.error("Failed to initialize database or fetch user data", e);
    }

    return (
        <section className="flex flex-col gap-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-12">
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase mb-4">
                    ¡Hola, <span className="text-blue-600">{user.name || user.nickname || "Usuario"}</span>!
                </h2>
                <p className="text-gray-400 font-bold italic text-lg mb-8">Bienvenido a Analliz. Panel de control en preparación.</p>

                {tiendaNubeConnection ? (
                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-full w-fit font-black uppercase text-xs tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Tienda conectada: {tiendaNubeConnection.store_name || "Mi Tienda"}
                    </div>
                ) : (
                    <div className="flex items-center gap-6 p-8 bg-amber-50 border border-amber-100 rounded-[2rem]">
                        <div className="flex flex-col gap-1">
                            <p className="text-amber-800 font-black uppercase text-xs tracking-widest">Conexión Pendiente</p>
                            <p className="text-amber-600 text-sm font-bold">Aún no has vinculado tu Tienda Nube para ver analíticas.</p>
                        </div>
                        <Link href="/setup/tiendanube" className="ml-auto px-8 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all">
                            Conectar Tienda
                        </Link>
                    </div>
                )}
            </div>

            {/* Placeholder for future widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-20 pointer-events-none">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 border-2 border-dashed border-gray-200 rounded-[3rem] flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Espacio Disponible</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
