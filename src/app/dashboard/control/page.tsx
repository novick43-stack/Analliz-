"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Database,
    RefreshCcw,
    ChevronRight,
    Package,
    Tag,
    Users,
    Star,
    ShoppingCart,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Zap,
    LayoutGrid,
    Search,
    Filter,
    Download,
    Sparkles
} from "lucide-react";

const TABLES = [
    { id: "tn_orders", name: "Pedidos", icon: <Package className="w-5 h-5" />, color: "accent" },
    { id: "tn_products", name: "Productos", icon: <Tag className="w-5 h-5" />, color: "violet-500" },
    { id: "tn_customers", name: "Clientes", icon: <Users className="w-5 h-5" />, color: "emerald-500" },
    { id: "tn_variants", name: "Variantes", icon: <Star className="w-5 h-5" />, color: "amber-500" },
    { id: "tn_order_items", name: "Items", icon: <ShoppingCart className="w-5 h-5" />, color: "rose-500" },
];

export default function ControlPage() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ message: "", progress: 0 });
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncProgress({ message: "Iniciando motores...", progress: 0 });
        setStatusMsg("");

        try {
            const response = await fetch("/api/tiendanube/sync", { method: "POST" });
            if (!response.ok) throw new Error("Sync failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No reader available");

            let done = false;
            let buffer = "";
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || ""; // Keep partial line

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const data = JSON.parse(line);
                            setSyncProgress(data);
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }

            setStatusMsg("¡Sincronización completa con éxito!");
            if (tableId) fetchTableData(tableId);
        } catch (e: any) {
            setStatusMsg(`Error: ${e.message}`);
            setSyncProgress(p => ({ ...p, progress: -1 }));
        } finally {
            setTimeout(() => setIsSyncing(false), 2000);
        }
    };

    const fetchTableData = async (table: string) => {
        setIsLoadingData(true);
        try {
            const res = await fetch(`/api/tiendanube/sync?table=${table}`);
            const data = await res.json();
            setTableData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error fetching table data", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (tableId) {
            fetchTableData(tableId);
        } else {
            setTableData([]);
        }
    }, [tableId]);

    const activeTable = TABLES.find(t => t.id === tableId);

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Header / Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Database className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-black text-foreground tracking-tight uppercase leading-none italic">
                            {tableId ? activeTable?.name : "Data Control Center"}
                        </h2>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-10">
                        {tableId ? `Protocolo: RAW_DATA_${tableId.toUpperCase()}` : "Gestión de bases de datos relacionales"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {tableId && (
                        <div className="hidden lg:flex flex-col items-end mr-4">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Registros Cargados</span>
                            <span className="text-xs font-black text-foreground uppercase italic">{tableData.length} entries</span>
                        </div>
                    )}
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isSyncing
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-accent text-white hover:shadow-accent/20"
                            }`}
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Procesando..." : "Sincronizar Cloud"}
                    </button>
                </div>
            </div>

            {/* Sync Progress Indicator */}
            {isSyncing && (
                <div className="bg-card rounded-[1.5rem] p-6 border border-accent/20 shadow-xl shadow-accent/5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Sync Engine Active</span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{syncProgress.progress}%</span>
                    </div>

                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-3 border border-border/50">
                        <div
                            className="h-full bg-accent transition-all duration-500 ease-out shadow-[0_0_15px_rgba(88,65,216,0.5)]"
                            style={{ width: `${Math.max(5, syncProgress.progress)}%` }}
                        />
                    </div>

                    <p className="text-[11px] font-bold text-foreground uppercase tracking-tight flex items-center gap-2 italic">
                        <RefreshCcw className="w-3 h-3 animate-spin text-accent" />
                        {syncProgress.message || "Procesando..."}
                    </p>
                </div>
            )}

            {statusMsg && (
                <div className={`p-4 rounded-2xl text-[10px] font-bold border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${statusMsg.includes('Error') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {statusMsg.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="uppercase tracking-widest">{statusMsg}</span>
                </div>
            )}

            {/* Content Area */}
            <div className="w-full">
                {tableId ? (
                    <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col min-h-[500px] animate-in fade-in duration-500">
                        {/* Table Controls */}
                        <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-accent`}>
                                    {activeTable?.icon}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-black text-foreground uppercase tracking-tight text-xs">
                                        Explorador de {activeTable?.name}
                                    </h4>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Vista de tabla cruda</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Buscar registros..."
                                        className="bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold outline-none focus:border-accent/40 w-48 sm:w-64 transition-all"
                                    />
                                </div>
                                <button className="p-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            {isLoadingData ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                    <div className="w-10 h-10 border-b-2 border-accent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Fetching from Neon Cloud...</p>
                                </div>
                            ) : tableData.length > 0 ? (
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-black uppercase text-[9px] tracking-widest sticky top-0 z-10">
                                            <tr>
                                                {Object.keys(tableData[0]).slice(0, 10).map((key) => (
                                                    <th key={key} className="px-6 py-4 font-black">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {tableData.map((row, i) => (
                                                <tr key={i} className="hover:bg-accent/5 transition-colors group">
                                                    {Object.values(row).slice(0, 10).map((val: any, j) => (
                                                        <td key={j} className="px-6 py-4 text-xs font-bold text-foreground/80">
                                                            <div className="truncate max-w-[200px] group-hover:text-foreground transition-colors overflow-hidden text-ellipsis">
                                                                {typeof val === 'object'
                                                                    ? <span className="text-[8px] font-mono opacity-50">{JSON.stringify(val).slice(0, 30)}...</span>
                                                                    : String(val)}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground opacity-50">
                                        <Database className="w-8 h-8" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="font-black text-foreground uppercase tracking-tight text-sm italic">Status: Empty Stack</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">No se detectaron registros en esta partición.</p>
                                    </div>
                                    <button
                                        onClick={handleSync}
                                        className="mt-2 flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all transition-all active:scale-95"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                        Input Data
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {[
                            { title: "Ventas Insight", href: "/dashboard/analytics/ventas", desc: "Monitoreo en vivo de flujos de facturación y tickets.", icon: <Zap className="w-6 h-6" />, color: "accent" },
                            { title: "Inventory Strategy", href: "/dashboard/analytics/productos", desc: "Detección de quiebres y optimización de SKU.", icon: <Package className="w-6 h-6" />, color: "violet-500" },
                            { title: "Client Intel", href: "/dashboard/analytics/clientes", desc: "Métricas avanzadas de retención y comportamiento.", icon: <Users className="w-6 h-6" />, color: "emerald-500" },
                            { title: "Conversión Funnel", href: "/dashboard/analytics/conversion", desc: "Embudo de ventas y efectividad del checkout.", icon: <Filter className="w-6 h-6" />, color: "amber-500" },
                            { title: "Predictive IA", href: "/dashboard/analytics/insights", desc: "Análisis predictivo y velocidad de SKUs.", icon: <Sparkles className="w-6 h-6" />, color: "rose-500" }
                        ].map((card, i) => (
                            <Link
                                key={i}
                                href={card.href}
                                className="group relative bg-card rounded-[2rem] p-8 border border-border hover:bg-muted/50 transition-all duration-500 hover:-translate-y-2 flex flex-col gap-6 overflow-hidden shadow-sm hover:shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000"></div>

                                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-accent group-hover:scale-110 transition-transform relative z-10 shadow-sm">
                                    {card.icon}
                                </div>

                                <div className="relative z-10 flex-1">
                                    <h3 className="text-lg font-black text-foreground mb-2 uppercase tracking-tight italic group-hover:text-accent transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest">
                                        {card.desc}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-accent font-black text-[9px] uppercase tracking-[0.3em] mt-auto relative z-10">
                                    Explorar Módulo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
