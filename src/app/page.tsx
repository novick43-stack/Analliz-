"use client";

import Link from "next/link";
import {
  Users,
  TrendingUp,
  Zap,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Globe,
  Package,
  BarChart3
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh-light text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-white/30 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic uppercase text-slate-900">Analliz</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
          <a href="#insights" className="hover:text-blue-600 transition-colors">Insights</a>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <Link href="/admin/login" className="hover:text-amber-600 transition-colors">Admin Access</Link>
        </div>
        <Link
          href="/auth/login"
          className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95"
        >
          Ingresar
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none opacity-20">
          <div className="absolute top-40 left-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px]"></div>
          <div className="absolute top-60 right-0 w-96 h-96 bg-purple-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white shadow-sm mb-8 animate-float">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inteligencia Artificial para tu E-commerce</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-center leading-[0.85] mb-8 italic uppercase text-slate-900">
          Domina tus <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Datos Reales</span>
        </h1>

        <p className="max-w-2xl text-center text-slate-500 font-bold text-lg mb-12 leading-relaxed italic">
          Convierte la información de Tienda Nube en decisiones estratégicas. <br className="hidden md:block" />
          Analytics avanzado para vendedores que buscan el siguiente nivel.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link
            href="/auth/login"
            className="group flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:shadow-2xl hover:scale-105 transition-all duration-500"
          >
            Comenzar Ahora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-10 py-5 text-slate-900 border border-slate-200 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white transition-all">
            Explorar Features
          </a>
        </div>

        {/* Floating Dashboard Elements Mockup */}
        <div className="mt-24 w-full max-w-6xl relative animate-float">
          <div className="glass-card-light rounded-[3rem] p-4 border border-white/50 shadow-2xl overflow-hidden relative group">
            {/* Mockup Dashboard Content Overlay */}
            <div className="w-full aspect-video bg-slate-50 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 via-transparent to-purple-100/50"></div>
              {/* Minimalist chart shapes */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 px-12 flex items-end gap-2">
                {[40, 60, 45, 80, 55, 90, 70, 85, 50, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/80 rounded-t-2xl shadow-sm group-hover:bg-blue-500/10 transition-colors" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              {/* Floating labels */}
              <div className="absolute top-12 left-12 p-6 glass-card-light rounded-2xl shadow-lg border border-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ventas del Mes</p>
                <p className="text-3xl font-black text-slate-900">$2.4M</p>
              </div>
              <div className="absolute top-40 right-12 p-6 glass-card-light rounded-2xl shadow-lg border border-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Critical</p>
                <p className="text-3xl font-black text-red-500">12 SKUs</p>
              </div>
            </div>
          </div>
          {/* Shadow behind the mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-blue-600/5 blur-[80px] -z-10"></div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-16 px-4">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">Poder de <span className="text-blue-600">Análisis</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Cuatro pilares para tu crecimiento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Centro de Control",
              desc: "Ventas en tiempo real, KPIs de facturación y mapas de calor por horario.",
              icon: <LayoutGrid className="text-blue-600" />,
              bg: "bg-blue-50"
            },
            {
              title: "Radar de Clientes",
              desc: "Segmentación RFM, geolocalización y análisis de fidelidad.",
              icon: <Users className="text-pink-600" />,
              bg: "bg-pink-50"
            },
            {
              title: "Stock Inteligente",
              desc: "Alerta de quiebres, análisis Pareto y valoración de inventario.",
              icon: <Package className="text-teal-600" />,
              bg: "bg-teal-50"
            },
            {
              title: "Insights IA",
              desc: "Velocidad de venta por SKU y predicciones basadas en histórico.",
              icon: <Zap className="text-amber-600" />,
              bg: "bg-amber-50"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500">
              <div className={`w-16 h-16 rounded-[1.5rem] ${feature.bg} flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 italic uppercase text-slate-900 leading-tight">{feature.title}</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 leading-[0.9]">
              ¿Listo para dar el <br />
              <span className="text-blue-400">Próximo Paso?</span>
            </h2>
            <p className="text-blue-100/60 font-bold mb-12 max-w-xl mx-auto">
              Únete a las tiendas que ya están optimizando su rentabilidad con datos reales.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-blue-400 hover:text-white hover:scale-105 transition-all duration-500 shadow-2xl shadow-white/10"
            >
              Iniciar Sincronización
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-slate-400 w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tighter italic uppercase text-slate-400">Analliz</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 Analliz Data Lab. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <ShieldCheck className="w-5 h-5 text-slate-300" />
            <Globe className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </footer>
    </div>
  );
}
