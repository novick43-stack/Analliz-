"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function InformePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

    const generateReport = async () => {
        setIsLoading(true);
        setError(null);
        setStatus("Extrayendo datos de Tienda Nube...");

        try {
            // 1. Fetch report data from our API
            const response = await fetch("/api/tiendanube/report");
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al obtener datos");
            }

            const data = await response.json();
            setStatus("Generando informe de 10 páginas...");

            // 2. Initialize jsPDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // --- Page 1: Cover ---
            doc.setFillColor(37, 99, 235); // Blue-600
            doc.rect(0, 0, pageWidth, 40, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("ANALLIZ - INFORME ESTRATÉGICO", margin, 25);

            doc.setTextColor(50, 50, 50);
            doc.setFontSize(18);
            doc.text(`Tienda: ${data.storeName}`, margin, 60);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, 70);
            doc.text(`Pedidos analizados: ${data.stats.orderCount}`, margin, 80);
            doc.text(`Ventas totales analizadas: $${data.stats.totalSales}`, margin, 90);
            doc.text(`Ticket promedio: $${data.stats.avgOrderValue}`, margin, 100);

            doc.setDrawColor(200, 200, 200);
            doc.line(margin, 110, pageWidth - margin, 110);

            doc.setFontSize(14);
            doc.text("Bienvenido a tu primer paso hacia el crecimiento exponencial.", margin, 130);

            // --- Individual Pages ---
            data.pages.forEach((page: any, index: number) => {
                doc.addPage();

                // Header for each page
                doc.setFillColor(243, 244, 246);
                doc.rect(0, 0, pageWidth, 20, "F");
                doc.setTextColor(75, 85, 99);
                doc.setFontSize(10);
                doc.text(`INFORME ANALLIZ - PÁGINA ${index + 2}`, margin, 13);

                // Title
                doc.setTextColor(37, 99, 235);
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.text(page.title, margin, 40);

                // Content
                doc.setTextColor(55, 65, 81);
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");

                const splitText = doc.splitTextToSize(page.content, contentWidth);
                doc.text(splitText, margin, 60);

                // Mocked "Standard" design elements
                doc.setDrawColor(229, 231, 235);
                doc.rect(margin, 120, contentWidth, 80);
                doc.setTextColor(156, 163, 175);
                doc.setFontSize(9);
                doc.text("[ Gráfico / Análisis Visual Proyectado ]", pageWidth / 2, 165, { align: "center" });
            });

            // Save PDF
            doc.save(`Analliz_Informe_${data.storeName.replace(/\s+/g, '_')}.pdf`);
            setStatus("¡Informe generado con éxito!");

            setTimeout(() => {
                setStatus("");
                setIsLoading(false);
            }, 3000);

        } catch (err: any) {
            console.error("Report generation error:", err);
            setError(err.message || "Error inesperado al generar el informe");
            setIsLoading(false);
            setStatus("");
        }
    };

    return (
        <section>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Informe</h2>

            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-12 text-center flex flex-col items-center gap-6 max-w-4xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900">Tu Informe Estratégico</h3>
                <p className="text-gray-600 text-lg max-w-2xl">
                    Analizamos tus ventas y productos en tiempo real para generar un informe de 10 páginas con sugerencias accionables para tu negocio.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl text-sm font-medium">
                        {error}
                        {error.includes("Tienda Nube not connected") && (
                            <a href="/setup/tiendanube" className="ml-2 underline font-bold">Conectar ahora</a>
                        )}
                    </div>
                )}

                <button
                    onClick={generateReport}
                    disabled={isLoading}
                    className={`
                        min-w-[300px] font-bold py-4 px-10 rounded-full shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg
                        ${isLoading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-200"}
                    `}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {status}
                        </div>
                    ) : "Generar mi informe detallado gratuito"}
                </button>

                {status && !isLoading && (
                    <p className="text-green-600 font-bold animate-bounce">{status}</p>
                )}

                <p className="text-gray-400 text-sm italic">
                    * El informe es gratuito y se genera basado en tus últimos 30 pedidos procesados.
                </p>
            </div>
        </section>
    );
}
