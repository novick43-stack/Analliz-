"use client";

import Link from "next/link";
import {
  Users,
  Zap,
  LayoutGrid,
  ArrowRight,
  Package,
  BarChart3,
  MousePointer2,
  PieChart,
  Sparkles,
  RefreshCcw,
  Box
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <BarChart3 className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">Analliz</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#features" className="hover:text-accent transition-colors">Funcionalidades</a>
          <a href="#pricing" className="hover:text-accent transition-colors">Precios</a>
          <Link href="/admin/login" className="hover:text-accent transition-colors">Admin</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="px-5 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-accent/20"
          >
            Comenzar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 flex flex-col items-center mesh-gradient">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 pointer-events-none opacity-30 dark:opacity-30">
          <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse-soft"></div>
          <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Análisis Inteligente para Tienda Nube</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center leading-[0.9] mb-8 text-foreground uppercase italic px-4">
          Toma Decisiones <br />
          <span className="inline-block text-gradient pr-10">Basadas en Datos</span>
        </h1>

        <p className="max-w-xl text-center text-muted-foreground font-bold text-base md:text-lg mb-10 leading-relaxed px-4 opacity-90">
          Transformamos tu tienda en una máquina de rentabilidad. Visualiza tus ventas, stock y clientes con precisión quirúrgica.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            href="/auth/login"
            className="group flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_15px_40px_rgba(88,65,216,0.4)] active:scale-95"
          >
            Empezar Gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 text-foreground bg-muted/30 backdrop-blur-md border border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95">
            Ver Demo
          </a>
        </div>

        {/* Repositioned Logo Carousel */}
        <div className="w-full max-w-5xl overflow-hidden relative mb-12">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
          <div className="flex animate-scroll whitespace-nowrap gap-16 py-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {['V-CORP', 'QUARK', 'NEXUS', 'FLUX', 'AXON', 'ORBIT', 'PULSE', 'VOID', 'ZENITH', 'CORE'].map((logo, i) => (
              <span key={i} className="text-xl font-black tracking-tighter text-foreground/50 hover:text-accent transition-colors cursor-default select-none uppercase italic flex items-center gap-2">
                <Box className="w-4 h-4" /> {logo}
              </span>
            ))}
            {['V-CORP', 'QUARK', 'NEXUS', 'FLUX', 'AXON', 'ORBIT', 'PULSE', 'VOID', 'ZENITH', 'CORE'].map((logo, i) => (
              <span key={i + 10} className="text-xl font-black tracking-tighter text-foreground/50 hover:text-accent transition-colors cursor-default select-none uppercase italic flex items-center gap-2">
                <Box className="w-4 h-4" /> {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Visual Refined (More compact) */}
        <div className="w-full max-w-5xl px-4 animate-float">
          <div className="p-2 md:p-3 rounded-[3rem] bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-[#020617] rounded-[2.5rem] border border-white/5 p-8 min-h-[400px] relative overflow-hidden group">
              <div className="flex flex-col gap-8 opacity-70 group-hover:opacity-100 transition-opacity duration-700 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="h-3 w-32 bg-white/10 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
                    <div className="h-8 w-24 bg-white/5 rounded-lg border border-white/10"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { l: "Revenue Flow", v: "$12,482", c: "text-emerald-400" },
                    { l: "Conversion Rate", v: "4.2%", c: "text-accent" },
                    { l: "Active Sessions", v: "1,240", c: "text-indigo-400" }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.l}</div>
                      <div className={`text-2xl font-black ${stat.c}`}>{stat.v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/[0.01] rounded-[2rem] border border-white/[0.05] h-48 flex items-end p-8 gap-3 overflow-hidden relative">
                  {[40, 70, 50, 90, 60, 80, 45, 100, 75, 60, 85, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-accent/20 rounded-t-lg group-hover:bg-accent/40 transition-all duration-1000" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent flex items-center justify-center">
                    <div className="text-white/20 font-black uppercase tracking-[0.5em] text-[8px]">Real-Time Data Engine</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-105 transition-all duration-700 group-hover:opacity-100 opacity-0">
                <div className="px-8 py-8 bg-accent/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_70px_rgba(88,65,216,0.7)] text-white font-black text-center uppercase tracking-[0.2em] text-[10px] border border-white/20 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center animate-spin-slow">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xl mb-1">99.9%</span>
                    <span className="block text-[7px] opacity-70 uppercase tracking-widest">Uptime Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-20">
          <div className="bg-accent/10 text-accent px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-accent/20">Ingeniería de Datos</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8]">
            Potencia tu <br /> <span className="text-gradient">E-commerce</span>
          </h2>
          <p className="text-muted-foreground font-bold text-base max-w-xl leading-relaxed opacity-80 mt-2">Todo lo que necesitas para escalar tu negocio en una sola plataforma.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Ventas IQ", desc: "Mapa de calor de ventas por hora y día. Descubre tus picos de demanda máxima.", icon: <LayoutGrid className="w-5 h-5" /> },
            { title: "Radar Clientes", desc: "Analiza la recurrencia y el valor de vida del cliente con algoritmos de precisión.", icon: <Users className="w-5 h-5" /> },
            { title: "Inventario Pro", desc: "Previsiones de stock y alertas de quiebre automáticas basadas en velocidad de SKU.", icon: <Package className="w-5 h-5" /> },
            { title: "Insights IA", desc: "Descubre tus productos estrella y optimiza tus márgenes de ganancia hoy mismo.", icon: <Zap className="w-5 h-5" /> }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-accent/40 hover:translate-y-[-5px] transition-all duration-500 flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:bg-accent group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black mb-3 text-foreground tracking-tight uppercase italic">{feature.title}</h3>
              <p className="text-muted-foreground font-bold text-xs leading-relaxed opacity-70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section Refined */}
      <section id="pricing" className="py-32 bg-muted/20 px-6 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-accent/10 blur-[120px] -z-10 rounded-full opacity-30"></div>

        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic mb-4">Planes de <span className="text-gradient">Escala</span></h2>
            <p className="text-sm text-muted-foreground font-bold opacity-70 uppercase tracking-widest">Poder de procesamiento real.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              { name: "Gratis", price: "0", features: ["1 Tienda", "Métricas Básicas", "Sync 24h", "Soporte Mail"], accent: false },
              { name: "Growth", price: "12.000", features: ["3 Tiendas", "Ventas IQ Full", "Sync Real-Time", "Support VIP"], accent: true },
              { name: "Enterprise", price: "28.000", features: ["Tiendas Infinitas", "Insights IA", "Reportes Custom", "Dedicated Node"], accent: false }
            ].map((plan, i) => (
              <div key={i} className={`p-10 rounded-[3rem] flex flex-col h-full border transition-all duration-500 hover:scale-[1.03] ${plan.accent ? 'bg-accent text-white border-white/20 shadow-2xl shadow-accent/40 relative' : 'bg-card text-foreground border-white/5'}`}>
                {plan.accent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-accent font-black text-[8px] uppercase tracking-widest rounded-full">Más Popular</div>}
                <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-base font-black tracking-tighter opacity-70 italic">$</span>
                  <span className="text-5xl font-black tracking-tighter italic">{plan.price}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">/ mes</span>
                </div>
                <ul className="flex flex-col gap-4 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-xs font-bold opacity-80 uppercase tracking-widest italic">
                      <div className={`w-1 h-1 rounded-full ${plan.accent ? 'bg-white' : 'bg-accent'}`}></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${plan.accent ? 'bg-white text-accent hover:bg-white/90 shadow-xl' : 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20'}`}>
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-20 border-b border-border px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center opacity-70">
          {[
            { val: "+40%", label: "Escala en Rentabilidad" },
            { val: "REAL-TIME", label: "Protocolo de Datos" },
            { val: "100%", label: "Cloud Integration" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <p className="text-4xl font-black text-foreground tracking-tighter italic uppercase">{stat.val}</p>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-accent">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <BarChart3 className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground uppercase">Analliz</span>
            </div>
            <p className="text-sm text-muted-foreground font-bold max-w-xs text-center md:text-left leading-relaxed">La plataforma definitiva para el análisis crítico en Tienda Nube.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex flex-wrap justify-center md:justify-end gap-8 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-accent transition-colors">Privacidad</a>
              <a href="#" className="hover:text-accent transition-colors">Términos</a>
              <a href="#" className="hover:text-accent transition-colors">Support</a>
            </div>
            <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">© 2026 Analliz. Protocolo de Inteligencia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
