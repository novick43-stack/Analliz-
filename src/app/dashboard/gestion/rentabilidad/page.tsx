"use client";

export default function RentabilidadPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Rentabilidad</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">Finanzas</span>
                    <p className="text-gray-400 font-bold italic">Márgenes y salud económica de tu tienda</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[3rem] p-12 text-white shadow-2xl flex flex-col gap-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-y-40 translate-x-40"></div>

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-blue-600 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20">💎</div>
                        <div>
                            <h3 className="text-3xl font-black">Margen Neto</h3>
                            <p className="text-blue-300 font-bold">Real-time Insight</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-4xl font-black">0%</span>
                            <span className="text-sm font-bold opacity-60 italic">Cálculo pendiente</span>
                        </div>
                        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[0%]"></div>
                        </div>
                    </div>

                    <p className="text-sm font-medium leading-relaxed opacity-70">
                        Carga tus costos en la sección de "Costos" para que podamos mostrarte el margen real de cada venta que realizas por Tienda Nube.
                    </p>
                </div>

                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-8">
                    <h3 className="text-2xl font-black text-gray-900">Productos más Rentables</h3>
                    <div className="flex flex-col gap-4 items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dotted border-gray-200 text-gray-300">
                        <span className="text-5xl">🏷️</span>
                        <p className="font-bold italic">Esperando datos de costos...</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
