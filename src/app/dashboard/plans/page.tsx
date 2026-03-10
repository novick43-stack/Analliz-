"use client";

import { Check, Sparkles, CreditCard, Zap, ShieldCheck } from "lucide-react";

export default function PlansPage() {
    const currentPlan = "Growth"; // This would normally come from a user context or backend

    const plans = [
        {
            name: "Gratis",
            price: "0",
            description: "Para startups que recién comienzan.",
            features: [
                "1 Tienda conectada",
                "Métricas básicas de ventas",
                "Sincronización cada 24h",
                "Soporte por email"
            ],
            accent: false
        },
        {
            name: "Growth",
            price: "12.000",
            description: "Nuestra opción más popular para escalar.",
            features: [
                "Hasta 3 tiendas conectadas",
                "Ventas IQ (Análisis por hora/día)",
                "Sincronización en Tiempo Real",
                "Insights inteligentes de IA",
                "Soporte prioritario"
            ],
            accent: true
        },
        {
            name: "Enterprise",
            price: "28.000",
            description: "Para grandes operaciones de e-commerce.",
            features: [
                "Tiendas ilimitadas",
                "Todo lo de Growth",
                "Reportes customizados",
                "Infraestructura dedicada",
                "Account Manager dedicado"
            ],
            accent: false
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Suscripción</h1>
                </div>
                <p className="text-xs font-bold text-muted-foreground max-w-xl leading-relaxed opacity-70">
                    Gestiona tu plan y herramientas de crecimiento.
                </p>
            </div>

            {/* Current Plan Status */}
            <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
                    <ShieldCheck className="w-24 h-24 text-accent" />
                </div>

                <div className="flex flex-col gap-1 relative z-10">
                    <p className="text-[9px] font-black text-accent uppercase tracking-[0.3em]">Plan Actual</p>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">{currentPlan}</h2>
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1">Siguiente: 15 Abr, 2026</p>
                </div>

                <div className="relative z-10">
                    <button className="px-6 py-3 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl">
                        Gestionar Pagos
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full relative group ${plan.accent
                            ? 'bg-accent text-white border-white/20 shadow-2xl shadow-accent/40 scale-[1.03] z-10'
                            : 'bg-card text-foreground border-border hover:border-accent/40'
                            }`}
                    >
                        {plan.name === currentPlan && (
                            <div className="absolute top-4 right-4">
                                <ShieldCheck className="w-5 h-5 opacity-40" />
                            </div>
                        )}

                        {plan.accent && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-accent font-black text-[8px] uppercase tracking-widest rounded-full shadow-lg">
                                Recomendado
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mb-8">
                            <div className={`text-[9px] font-black uppercase tracking-[0.3em] ${plan.accent ? 'text-white/60' : 'text-muted-foreground'}`}>
                                {plan.name}
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-black italic opacity-70">$</span>
                                <span className="text-4xl font-black tracking-tighter italic">{plan.price}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest ml-1 ${plan.accent ? 'text-white/60' : 'text-muted-foreground'}`}>/ mes</span>
                            </div>
                            <p className={`text-[10px] font-bold leading-relaxed ${plan.accent ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {plan.description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 mb-8">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${plan.accent ? 'bg-white/20' : 'bg-accent/10'}`}>
                                        <Check className={`w-2 h-2 ${plan.accent ? 'text-white' : 'text-accent'}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest italic leading-tight ${plan.accent ? 'text-white/90' : 'text-foreground/90'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={plan.name === currentPlan}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${plan.accent
                                ? 'bg-white text-accent shadow-xl hover:bg-white/90'
                                : 'bg-accent text-white shadow-lg shadow-accent/20 hover:opacity-90'
                                }`}
                        >
                            {plan.name === currentPlan ? "Plan Actual" : "Cambiar Plan"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Help / FAQ Prompt */}
            <div className="mt-6 p-8 rounded-[2.5rem] bg-muted/30 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">¿Plan custom?</h3>
                    <p className="text-xs font-bold text-muted-foreground">Si tienes requerimientos especiales, hablemos.</p>
                </div>
                <button className="px-6 py-3 bg-muted border border-border text-foreground rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-border transition-all active:scale-95">
                    Hablar con Soporte
                </button>
            </div>
        </div>
    );
}
