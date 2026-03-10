"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Briefcase,
    ChevronDown,
    Layers,
    TrendingUp,
    Package,
    Users,
    RefreshCcw,
    Zap,
    Table,
    ShoppingCart,
    Stars,
    CreditCard
} from "lucide-react";

export default function SidebarNav({ closeSidebar }: { closeSidebar?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isTablesOpen, setIsTablesOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
    const [isGestionOpen, setIsGestionOpen] = useState(false);

    const TABLES = [
        { id: "tn_orders", name: "Pedidos", icon: <ShoppingCart className="w-4 h-4" /> },
        { id: "tn_products", name: "Productos", icon: <Package className="w-4 h-4" /> },
        { id: "tn_customers", name: "Clientes", icon: <Users className="w-4 h-4" /> },
        { id: "tn_variants", name: "Variantes", icon: <Layers className="w-4 h-4" /> },
        { id: "tn_order_items", name: "Items", icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    const ANALYTICS_LINKS = [
        { href: "/dashboard/control", name: "Vista General", icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: "/dashboard/analytics/ventas", name: "Ventas", icon: <TrendingUp className="w-4 h-4" /> },
        { href: "/dashboard/analytics/productos", name: "Productos", icon: <Package className="w-4 h-4" /> },
        { href: "/dashboard/analytics/stock", name: "Stock", icon: <Package className="w-4 h-4" /> },
        { href: "/dashboard/analytics/clientes", name: "Clientes", icon: <Users className="w-4 h-4" /> },
        { href: "/dashboard/analytics/conversion", name: "Conversión", icon: <RefreshCcw className="w-4 h-4" /> },
        { href: "/dashboard/analytics/insights", name: "Insights", icon: <Zap className="w-4 h-4" /> },
    ];

    const GESTION_LINKS = [
        { href: "/dashboard/gestion", name: "Finanzas", icon: <Briefcase className="w-4 h-4" /> },
        { href: "/dashboard/gestion/ingresos", name: "Ingresos", icon: <TrendingUp className="w-4 h-4" /> },
        { href: "/dashboard/gestion/costos", name: "Costos", icon: <BarChart3 className="w-4 h-4" /> },
        { href: "/dashboard/gestion/rentabilidad", name: "Rentabilidad", icon: <Stars className="w-4 h-4" /> },
    ];

    const toggleAnalytics = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsAnalyticsOpen(!isAnalyticsOpen);
    };

    const toggleGestion = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsGestionOpen(!isGestionOpen);
    };

    const toggleTables = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsTablesOpen(!isTablesOpen);
    };

    return (
        <div className="bg-card rounded-[2rem] border border-border p-4 h-fit sticky top-24 flex flex-col gap-4 shadow-sm min-w-[250px]">
            <nav className="flex flex-col gap-1.5">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4 mb-2">Core Platform</p>

                {/* Dashboard */}
                <Link
                    href="/dashboard"
                    onClick={() => closeSidebar?.()}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${pathname === "/dashboard"
                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs">Dashboard</span>
                </Link>

                {/* Informe Pro */}
                <Link
                    href="/dashboard/informe"
                    onClick={() => closeSidebar?.()}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${pathname === "/dashboard/informe"
                        ? "bg-accent text-white shadow-lg shadow-accent/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Informe Pro</span>
                </Link>

                <div className="h-px bg-border my-2 mx-4" />

                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4 mb-1">Deep Analytics</p>

                {/* Analytics Accordion */}
                <div className="flex flex-col gap-1">
                    <button
                        onClick={toggleAnalytics}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${pathname.startsWith("/dashboard/analytics")
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-xs">Data Intelligence</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isAnalyticsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-0.5 mt-0.5 px-2 border-l border-border ml-6 ${isAnalyticsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        {ANALYTICS_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => closeSidebar?.()}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${pathname === link.href
                                    ? "text-accent bg-accent/5 font-black"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <span className="shrink-0 scale-90">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Gestión Accordion */}
                <div className="flex flex-col gap-1 mt-1">
                    <button
                        onClick={toggleGestion}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${pathname.startsWith("/dashboard/gestion")
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-xs">Gestión & Profit</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isGestionOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-0.5 mt-0.5 px-2 border-l border-border ml-6 ${isGestionOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        {GESTION_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => closeSidebar?.()}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${pathname === link.href
                                    ? "text-accent bg-accent/5 font-black"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <span className="shrink-0 scale-90">{link.icon}</span>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-border my-2 mx-4" />

                {/* Databases Accordion */}
                <div className="flex flex-col gap-1">
                    <button
                        onClick={toggleTables}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all duration-300 text-muted-foreground hover:bg-muted`}
                    >
                        <div className="flex items-center gap-3">
                            <Table className="w-4 h-4" />
                            <span className="text-xs">Raw Data</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isTablesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-0.5 mt-0.5 px-2 border-l border-border ml-6 ${isTablesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        {TABLES.map((table) => (
                            <Link
                                key={table.id}
                                href={`/dashboard/control?table=${table.id}`}
                                onClick={() => closeSidebar?.()}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${searchParams.get('table') === table.id
                                    ? "text-accent bg-accent/5 font-black"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <span className="shrink-0 scale-90">{table.icon}</span>
                                {table.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
}
