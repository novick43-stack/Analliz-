"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileText, Sparkles, Download, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export default function InformePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

    const generateReport = async () => {
        setIsLoading(true);
        setError(null);
        setStatus("Consultando base de inteligencia...");

        try {
            const response = await fetch("/api/tiendanube/report");
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al obtener datos");
            }

            const data = await response.json();
            setStatus("Sintetizando informe estratégico...");

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // --- Page 1: Cover ---
            doc.setFillColor(88, 65, 216); // Mailkit Violet (#5841D8)
            doc.rect(0, 0, pageWidth, 40, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("ANALLIZ - ESTRATEGIA PREMIUM", margin, 25);

            doc.setTextColor(50, 50, 50);
            doc.setFontSize(18);
            doc.text(`Store: ${data.storeName}`, margin, 60);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Expedido el: ${new Date().toLocaleDateString()}`, margin, 70);
            doc.text(`Data points: ${data.stats.orderCount} órdenes`, margin, 80);
            doc.text(`Volumen analizado: $${data.stats.totalSales}`, margin, 90);
            doc.text(`Rendimiento AOV: $${data.stats.avgOrderValue}`, margin, 100);

            doc.setDrawColor(220, 220, 220);
            doc.line(margin, 110, pageWidth - margin, 110);

            doc.setFontSize(14);
            doc.text("Este informe contiene insights estratégicos para escalar su rentabilidad.", margin, 130);

            data.pages.forEach((page: any, index: number) => {
                doc.addPage();
                doc.setFillColor(249, 250, 251);
                doc.rect(0, 0, pageWidth, 20, "F");
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(10);
                doc.text(`ANALLIZ INTELLIGENCE SYSTEM - VOL 1.0 - PÁGINA ${index + 2}`, margin, 13);

                doc.setTextColor(88, 65, 216);
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.text(page.title, margin, 40);

                doc.setTextColor(30, 41, 59);
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");

                const splitText = doc.splitTextToSize(page.content, contentWidth);
                doc.text(splitText, margin, 60);

                doc.setDrawColor(241, 245, 249);
                doc.rect(margin, 140, contentWidth, 50);
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(8);
                doc.text("[ Gráficos IQ Proyectado / Patentado ]", pageWidth / 2, 165, { align: "center" });
            });

            doc.save(`Analliz_Intelligence_${data.storeName.replace(/\s+/g, '_')}.pdf`);
            setStatus("Informe generado exitosamente.");

            setTimeout(() => {
                setStatus("");
                setIsLoading(false);
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Error inesperado al generar el informe");
            setIsLoading(false);
            setStatus("");
        }
    };

    return (
        <section className="flex flex-col gap-12 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-border pb-8">
                <h2 className="text-4xl font-black text-foreground tracking-tight uppercase leading-none">Generador de Inteligencia</h2>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Premium Reports IQ</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Visual Side */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full group-hover:bg-accent/30 transition-all duration-1000"></div>
                    <div className="relative bg-card rounded-[3.5rem] border border-border p-12 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/40 animate-pulse">
                                <FileText className="w-16 h-16" />
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-foreground uppercase tracking-tight leading-tight">Analliz Intel</div>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2">V. 2.0.4 Strategy Pack</div>
                            </div>
                        </div>
                        {/* Abstract elements */}
                        <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-accent/40"></div>
                        <div className="absolute bottom-20 right-10 w-4 h-4 rounded-full bg-accent/20"></div>
                        <div className="absolute top-1/2 left-0 w-20 h-px bg-gradient-to-r from-transparent to-accent/20"></div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-accent" />
                            <span className="text-xs font-black uppercase text-accent tracking-[0.2em]">Data Synthesis Engine</span>
                        </div>
                        <h3 className="text-5xl font-black text-foreground leading-[1.1] tracking-tighter uppercase italic">
                            Tu visión de negocio <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-violet-400">en 10 páginas.</span>
                        </h3>
                        <p className="text-lg text-muted-foreground font-bold leading-relaxed max-w-xl">
                            Analizamos patrones de compra, comportamiento de clientes y rotación de stock para entregarte una hoja de ruta accionable hacia el siguiente nivel de escala.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 bg-muted/50 p-8 rounded-[2.5rem] border border-border/50">
                        {error ? (
                            <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl text-sm font-bold">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    {error}
                                    {error.includes("Tienda Nube not connected") && (
                                        <a href="/setup/tiendanube" className="ml-2 underline font-black">Conectar tienda ahora</a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs font-bold text-foreground">Análisis de Pareto Automatizado</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs font-bold text-foreground">Detección de SKUs Estrella</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xs font-bold text-foreground">Proyección de Rentabilidad Mensual</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={generateReport}
                                disabled={isLoading}
                                className={`
                                    relative group w-full font-black py-6 px-10 rounded-full transition-all duration-500 active:scale-[0.98] text-sm uppercase tracking-widest overflow-hidden
                                    ${isLoading
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-accent text-white shadow-[0_20px_50px_rgba(88,65,216,0.3)] hover:shadow-[0_25px_60px_rgba(88,65,216,0.4)] hover:-translate-y-1"}
                                `}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {status}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Generar Informe Estratégico
                                        </>
                                    )}
                                </span>
                                {!isLoading && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                            </button>

                            {status && !isLoading && (
                                <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {status}
                                </div>
                            )}

                            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest opacity-60">
                                * Dataset basado en los últimos 30 días de operación.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
