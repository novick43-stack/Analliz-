import { auth0 } from "../../lib/auth0";
import { sql } from "../../lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTiendaNubeConnection, initializeTiendaNubeTable } from "@/lib/tiendanube";
import { Sparkles, Terminal, ArrowRight, CheckCircle2, AlertTriangle, Zap, LayoutGrid } from "lucide-react";

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
        <div className="flex flex-col gap-6 pb-20">
            {/* Header / Welcome Area */}
            <div className="flex flex-col gap-1 border-b border-border pb-4">
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase leading-none">Console Executive</h2>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[8px] font-bold uppercase tracking-widest">Operator: {user.nickname || "Root"}</span>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="relative bg-card rounded-[2.5rem] border border-border p-8 lg:p-10 shadow-2xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                                <span className="text-[9px] font-black uppercase text-accent tracking-[0.2em]">Protocolo de Bienvenida</span>
                            </div>

                            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9] pr-10">
                                <span className="inline-block pr-2">Hola,</span> <br />
                                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent to-violet-400 pr-10">
                                    {user.name || user.nickname || "Usuario"}
                                </span>
                            </h2>

                            <p className="text-base text-muted-foreground font-bold italic leading-relaxed max-w-xl opacity-80">
                                Tu centro de comando de inteligencia de retail está listo para procesar datos.
                            </p>

                            {tiendaNubeConnection ? (
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <div className="flex items-center gap-3 px-6 py-3 bg-accent/10 border border-accent/20 text-accent rounded-xl font-black uppercase text-[9px] tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Tienda: {tiendaNubeConnection.store_name?.toUpperCase() || "STORE ACTIVE"}
                                    </div>
                                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-black uppercase text-[9px] tracking-widest">
                                        <Zap className="w-4 h-4" />
                                        Sync: Optimal
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] group/alert">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover/alert:scale-110 transition-transform">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-amber-500 font-black uppercase text-[9px] tracking-[0.2em]">Acción Requerida</p>
                                            <p className="text-foreground text-xs font-bold opacity-80">Sin tienda vinculada.</p>
                                        </div>
                                    </div>
                                    <Link href="/setup/tiendanube" className="ml-auto flex items-center gap-2.5 px-6 py-3 bg-amber-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95 group/btn">
                                        Conectar
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex flex-col gap-3 w-64">
                            {[
                                { label: "Sincronización", status: "Active", icon: <RefreshCcw className="w-3.5 h-3.5" /> },
                                { label: "IA Predictive", status: "Ready", icon: <Terminal className="w-3.5 h-3.5" /> },
                                { label: "Reportes IQ", status: "Gen 2", icon: <LayoutGrid className="w-3.5 h-3.5" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted border border-border group/item hover:border-accent/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-accent transition-colors scale-90">
                                            {item.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
                                            <span className="text-[10px] font-bold text-foreground">{item.status}</span>
                                        </div>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Real-Time Sales", href: "/dashboard/analytics/ventas", desc: "Monitoreo en vivo de flujos de caja y tendencias.", color: "accent" },
                    { title: "Inventory Strategy", href: "/dashboard/analytics/productos", desc: "Detección de quiebres y stock.", color: "accent" },
                    { title: "Client Intelligence", href: "/dashboard/analytics/clientes", desc: "Métricas de retención y LTV.", color: "accent" }
                ].map((item, i) => (
                    <Link
                        key={i}
                        href={item.href}
                        className="group bg-muted/50 rounded-[2rem] p-8 border border-border hover:bg-card hover:shadow-2xl hover:border-accent/40 transition-all duration-500 flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic group-hover:text-accent transition-colors">{item.title}</h3>
                            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Re-using some icons
import { RefreshCcw } from "lucide-react";
