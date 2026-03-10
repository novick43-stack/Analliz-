"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SidebarNav from "./sidebar-nav";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Settings, LogOut, Layout, CreditCard, ChevronDown, Menu, X, Sparkles } from "lucide-react";

export default function DashboardShell({
    children,
    user
}: {
    children: React.ReactNode;
    user: any;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-accent/30">
            {/* Header / Navigation */}
            <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-full mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            {/* Toggle Sidebar */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-9 h-9 rounded-xl bg-muted hover:bg-accent/10 flex items-center justify-center transition-all duration-300 border border-border group active:scale-95"
                                aria-label="Toggle Sidebar"
                            >
                                {isSidebarOpen ? (
                                    <X className="w-4 h-4 text-foreground group-hover:text-accent transition-colors" />
                                ) : (
                                    <Menu className="w-4 h-4 text-foreground group-hover:text-accent transition-colors" />
                                )}
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                                    <Sparkles className="text-white w-5 h-5" />
                                </div>
                                <Link href="/dashboard" className="text-xl font-black text-foreground tracking-tight hover:opacity-80 transition-opacity uppercase">
                                    Analliz
                                </Link>
                                <div className="hidden md:flex items-center px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                                    <span className="text-[8px] font-bold text-accent uppercase tracking-widest">v2.0</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            <div className="h-6 w-[1px] bg-border mx-1"></div>

                            <div className="flex items-center gap-2 relative" ref={settingsRef}>
                                {/* User Info (Desktop) */}
                                <div className="hidden lg:flex flex-col items-end mr-1">
                                    <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Admin</p>
                                </div>

                                {/* Avatar Button */}
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-muted hover:bg-accent/10 transition-all active:scale-95"
                                >
                                    {user.picture && (
                                        <img
                                            src={user.picture}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-[10px] object-cover"
                                        />
                                    )}
                                    <ChevronDown className={`w-3 h-3 text-muted-foreground mr-0.5 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {/* ... settings popup skipped ... */}
                                {/* Settings Popup */}
                                {isSettingsOpen && (
                                    <div className="absolute right-0 top-[120%] w-64 bg-card rounded-[1.5rem] shadow-2xl border border-border p-2 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                                        <div className="px-4 py-3 border-b border-border mb-1">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Logged in as</p>
                                            <p className="text-xs font-bold text-foreground mt-0.5 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-accent transition-all group"
                                            onClick={() => setIsSettingsOpen(false)}
                                        >
                                            <Settings className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                                            Ajustes de Cuenta
                                        </Link>

                                        <Link
                                            href="/dashboard/plans"
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-accent transition-all group"
                                            onClick={() => setIsSettingsOpen(false)}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Suscripción
                                        </Link>

                                        <div className="h-px bg-border my-1.5 px-4"></div>

                                        <a
                                            href="/auth/logout"
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all uppercase tracking-widest"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-full mx-auto py-6 px-6 lg:px-10 relative">
                <div className="flex gap-6 items-start">
                    {/* Sidebar with Transition */}
                    <aside
                        className={`transition-all duration-500 ease-in-out ${isSidebarOpen
                            ? "w-72 opacity-100 translate-x-0"
                            : "w-0 opacity-0 -translate-x-12 pointer-events-none"
                            } overflow-hidden sticky top-24`}
                    >
                        <SidebarNav closeSidebar={() => setIsSidebarOpen(false)} />
                    </aside>

                    {/* Page Content */}
                    <div className="flex-1 transition-all duration-500 min-w-0">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
