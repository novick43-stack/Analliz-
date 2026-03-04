import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { getTiendaNubeConnection, getTiendaNubeOrders, getTiendaNubeProducts } from "@/lib/tiendanube";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get database user
        const userResult = await sql`SELECT id FROM users WHERE auth0_id = ${session.user.sub}`;
        const userId = userResult[0]?.id;
        if (!userId) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        // 2. Get Tienda Nube connection
        const connection = await getTiendaNubeConnection(userId);
        if (!connection) {
            return NextResponse.json({ error: "Tienda Nube not connected" }, { status: 400 });
        }

        // 3. Fetch real data (limiting for speed in this demo/standardized report)
        const [orders, products] = await Promise.all([
            getTiendaNubeOrders(connection.store_id, connection.access_token, 30),
            getTiendaNubeProducts(connection.store_id, connection.access_token, 30)
        ]);

        // 4. Process data for the "Standardized Report"
        // In a real scenario, this would go to an IA. For now, we mock the INSIGHTS
        // but use the REAL numbers from the fetched data.

        const totalSales = orders.reduce((acc: number, order: any) => acc + parseFloat(order.total || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
        const totalProducts = products.length;

        // Mocked IA Analysis based on real stats
        const reportData = {
            storeName: connection.store_name || "Mi Tienda",
            stats: {
                period: "Últimos 30 pedidos",
                totalSales: totalSales.toFixed(2),
                orderCount: orders.length,
                avgOrderValue: avgOrderValue.toFixed(2),
                productCount: totalProducts
            },
            pages: [
                {
                    title: "Resumen Ejecutivo",
                    content: `Tu tienda ${connection.store_name || 'Tienda Nube'} ha procesado ${orders.length} pedidos recientemente con un ticket promedio de $${avgOrderValue.toFixed(2)}. Observamos un potencial de crecimiento del 15% optimizando la tasa de conversión en dispositivos móviles.`
                },
                {
                    title: "Análisis de Ventas",
                    content: `El volumen total analizado es de $${totalSales.toFixed(2)}. Se detecta un pico de ventas los días martes y miércoles entre las 18:00 y 21:00 hs.`
                },
                {
                    title: "Inventario y Productos",
                    content: `Cuentas con ${totalProducts} productos activos. El 20% de tus productos genera el 80% de tus ingresos. Recomendamos revisar el stock de los 3 productos con mayor rotación.`
                },
                {
                    title: "Comportamiento del Cliente",
                    content: "El 35% de tus compradores son recurrentes. Implementar un programa de lealtad podría aumentar este número al 45% en el próximo trimestre."
                },
                {
                    title: "Oportunidades de Mejora",
                    content: "Se detectó una alta tasa de carritos abandonados en el paso de envío. Considera ofrecer una opción de envío gratuito para compras superiores a un monto fijo."
                },
                {
                    title: "Estrategia de Marketing",
                    content: "Tus campañas de Instagram están trayendo tráfico de calidad, pero la conversión final sucede mejor vía Email Marketing. Automatiza tus flujos de bienvenida."
                },
                {
                    title: "Análisis de Competencia",
                    content: "Comparado con el promedio de tu rubro, tu tiempo de entrega está 1.5 días por debajo. Esto es una ventaja competitiva fuerte que debes comunicar más."
                },
                {
                    title: "Optimización SEO",
                    content: "Tus productos principales tienen descripciones cortas. Agregar 200 palabras de contenido rico en keywords aumentará tu tráfico orgánico."
                },
                {
                    title: "Escalabilidad",
                    content: "Tu infraestructura actual soporta hasta 10x el volumen actual. Es momento de invertir en pauta paga agresiva."
                },
                {
                    title: "Conclusión y Próximos Pasos",
                    content: "Tu tienda está en una etapa de consolidación. El siguiente paso lógico es integrar el Panel de Control de Analliz para monitorear estas métricas en tiempo real."
                }
            ]
        };

        return NextResponse.json(reportData);
    } catch (error: any) {
        console.error("Report generation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
