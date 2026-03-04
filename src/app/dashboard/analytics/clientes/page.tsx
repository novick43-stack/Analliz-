"use client";

export default function ClientesAnalyticsPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Base de Clientes</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-widest">Deep Dive</span>
                    <p className="text-gray-400 font-bold italic">Segmentación y Comportamiento de Compra</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-white rounded-[3rem] p-12 border border-purple-100/50 shadow-2xl flex flex-col gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-purple-600 flex items-center justify-center text-white text-4xl shadow-xl shadow-purple-100">
                            👥
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900">Nuevos Clientes</h3>
                            <p className="text-purple-600 font-bold">Últimos 30 días</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-purple-50/30 rounded-[2.5rem] border-2 border-dotted border-purple-100">
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">✨</span>
                        <p className="text-purple-400 font-black italic">Aún no hay clientes registrados.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-8">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">💎</span>
                        Top Spenders
                    </h3>

                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between opacity-30">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-24 h-3 bg-gray-200 rounded-full"></div>
                                        <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="w-20 h-4 bg-green-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto p-6 rounded-3xl bg-blue-600 text-white flex flex-col gap-2">
                        <h4 className="font-black text-lg">Próximamente Analytics Pro</h4>
                        <p className="text-blue-100 text-xs font-bold leading-relaxed">
                            Podrás segmentar a tus clientes por valor de vida (CLV) y frecuencia de compra automáticamente.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
