import db from '../utils/database';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio de Generación de Reportes
 * Incluye 10 reportes: 3 simples, 4 intermedios, 3 complejos
 */
export class ReportService {
    private static REPORTS_DIR = path.join(process.cwd(), 'reports');

    /**
     * Asegurar que existe el directorio de reportes
     */
    private static ensureReportsDir(): void {
        if (!fs.existsSync(this.REPORTS_DIR)) {
            fs.mkdirSync(this.REPORTS_DIR, { recursive: true });
        }
    }

    // ===============================================
    // REPORTES SIMPLES (Consultas a una sola tabla)
    // ===============================================

    /**
     * REPORTE SIMPLE 1: Listado de todos los deportes
     */
    public static async reporteDeportes(): Promise<any[]> {
        const result = await db.query(
            `SELECT id_deporte, nombre, descripcion, activo 
             FROM Deporte 
             ORDER BY nombre`
        );
        return result.rows;
    }

    /**
     * REPORTE SIMPLE 2: Listado de apostadores con su saldo
     */
    public static async reporteApostadoresSaldo(): Promise<any[]> {
        const result = await db.query(
            `SELECT id_apostador, documento, tipo_documento, 
                    CONCAT(apellido, ', ', nombre) as nombre_completo,
                    ciudad, saldo_actual, verificado, fecha_registro
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             ORDER BY saldo_actual DESC`
        );
        return result.rows;
    }

    /**
     * REPORTE SIMPLE 3: Listado de métodos de pago disponibles
     */
    public static async reporteMetodosPago(): Promise<any[]> {
        const result = await db.query(
            `SELECT id_metodo_pago, nombre, descripcion, comision, activo
             FROM MetodoPago
             ORDER BY nombre`
        );
        return result.rows;
    }

    // ===============================================
    // REPORTES INTERMEDIOS (Consultas multitabla con operaciones)
    // ===============================================

    /**
     * REPORTE INTERMEDIO 1: Apuestas por deporte con totales
     */
    public static async reporteApuestasPorDeporte(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                d.nombre as deporte,
                COUNT(a.id_apuesta) as total_apuestas,
                SUM(a.monto_apostado) as monto_total_apostado,
                SUM(CASE WHEN a.estado = 'ganada' THEN a.ganancia_real ELSE 0 END) as total_pagado,
                COUNT(CASE WHEN a.estado = 'ganada' THEN 1 END) as apuestas_ganadas,
                COUNT(CASE WHEN a.estado = 'perdida' THEN 1 END) as apuestas_perdidas
             FROM Apuesta a
             JOIN Cuota c ON a.id_cuota = c.id_cuota
             JOIN Partido p ON c.id_partido = p.id_partido
             JOIN Liga l ON p.id_liga = l.id_liga
             JOIN Deporte d ON l.id_deporte = d.id_deporte
             GROUP BY d.nombre
             ORDER BY monto_total_apostado DESC`
        );
        return result.rows;
    }

    /**
     * REPORTE INTERMEDIO 2: Partidos por liga con estadísticas
     */
    public static async reportePartidosPorLiga(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                l.nombre as liga,
                d.nombre as deporte,
                l.pais,
                COUNT(p.id_partido) as total_partidos,
                COUNT(CASE WHEN p.estado = 'finalizado' THEN 1 END) as partidos_finalizados,
                COUNT(CASE WHEN p.estado = 'programado' THEN 1 END) as partidos_programados,
                AVG(p.asistencia) as promedio_asistencia
             FROM Liga l
             JOIN Deporte d ON l.id_deporte = d.id_deporte
             LEFT JOIN Partido p ON l.id_liga = p.id_liga
             GROUP BY l.nombre, d.nombre, l.pais
             HAVING COUNT(p.id_partido) > 0
             ORDER BY total_partidos DESC`
        );
        return result.rows;
    }

    /**
     * REPORTE INTERMEDIO 3: Transacciones por tipo y mes
     */
    public static async reporteTransaccionesPorMes(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                TO_CHAR(fecha_transaccion, 'YYYY-MM') as mes,
                tipo,
                COUNT(*) as cantidad_transacciones,
                SUM(monto) as monto_total,
                SUM(comision) as comision_total,
                SUM(monto_neto) as monto_neto_total
             FROM Transaccion
             WHERE estado = 'completada'
             GROUP BY TO_CHAR(fecha_transaccion, 'YYYY-MM'), tipo
             ORDER BY mes DESC, tipo`
        );
        return result.rows;
    }

    /**
     * REPORTE INTERMEDIO 4: Equipos con más partidos jugados
     */
    public static async reporteEquiposMasActivos(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                e.nombre as equipo,
                e.pais,
                e.ciudad,
                l.nombre as liga,
                COUNT(DISTINCT p.id_partido) as total_partidos,
                COUNT(DISTINCT CASE WHEN p.estado = 'finalizado' THEN p.id_partido END) as partidos_jugados
             FROM Equipo e
             JOIN Liga l ON e.id_liga = l.id_liga
             LEFT JOIN Partido p ON (e.id_equipo = p.id_equipo_local OR e.id_equipo = p.id_equipo_visitante)
             GROUP BY e.nombre, e.pais, e.ciudad, l.nombre
             HAVING COUNT(DISTINCT p.id_partido) > 0
             ORDER BY total_partidos DESC
             LIMIT 20`
        );
        return result.rows;
    }

    // ===============================================
    // REPORTES COMPLEJOS (Con subconsultas)
    // ===============================================

    /**
     * REPORTE COMPLEJO 1: Top apostadores por ganancias
     */
    public static async reporteTopApostadoresGanancias(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                a.id_apostador,
                u.username,
                CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
                a.ciudad,
                (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as total_apuestas,
                (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') as apuestas_ganadas,
                (SELECT SUM(monto_apostado) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as total_apostado,
                (SELECT SUM(ganancia_real) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') as total_ganado,
                (SELECT SUM(ganancia_real) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') - 
                (SELECT SUM(monto_apostado) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as balance_neto,
                a.saldo_actual
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             WHERE (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) > 0
             ORDER BY balance_neto DESC
             LIMIT 10`
        );
        return result.rows;
    }

    /**
     * REPORTE COMPLEJO 2: Análisis de cuotas más rentables
     */
    public static async reporteCuotasMasRentables(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                c.id_cuota,
                c.descripcion,
                ta.nombre as tipo_apuesta,
                c.valor_cuota,
                (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) as veces_apostada,
                (SELECT SUM(monto_apostado) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) as monto_total_apostado,
                (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada') as veces_ganada,
                (SELECT SUM(ganancia_real) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada') as total_pagado,
                CASE 
                    WHEN (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) > 0 
                    THEN ROUND((SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada')::NUMERIC * 100 / 
                         (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota), 2)
                    ELSE 0
                END as porcentaje_acierto
             FROM Cuota c
             JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
             WHERE (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) > 0
             ORDER BY veces_apostada DESC, monto_total_apostado DESC
             LIMIT 20`
        );
        return result.rows;
    }

    /**
     * REPORTE COMPLEJO 3: Rendimiento de ligas por apuestas
     */
    public static async reporteRendimientoLigas(): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                l.id_liga,
                l.nombre as liga,
                d.nombre as deporte,
                l.pais,
                (SELECT COUNT(DISTINCT p.id_partido) FROM Partido p WHERE p.id_liga = l.id_liga) as total_partidos,
                (SELECT COUNT(*) FROM Apuesta a 
                 JOIN Cuota c ON a.id_cuota = c.id_cuota
                 JOIN Partido p ON c.id_partido = p.id_partido
                 WHERE p.id_liga = l.id_liga) as total_apuestas,
                (SELECT SUM(a.monto_apostado) FROM Apuesta a 
                 JOIN Cuota c ON a.id_cuota = c.id_cuota
                 JOIN Partido p ON c.id_partido = p.id_partido
                 WHERE p.id_liga = l.id_liga) as monto_total_apostado,
                (SELECT AVG(a.monto_apostado) FROM Apuesta a 
                 JOIN Cuota c ON a.id_cuota = c.id_cuota
                 JOIN Partido p ON c.id_partido = p.id_partido
                 WHERE p.id_liga = l.id_liga) as promedio_apuesta,
                (SELECT SUM(a.ganancia_real) FROM Apuesta a 
                 JOIN Cuota c ON a.id_cuota = c.id_cuota
                 JOIN Partido p ON c.id_partido = p.id_partido
                 WHERE p.id_liga = l.id_liga AND a.estado = 'ganada') as total_pagado
             FROM Liga l
             JOIN Deporte d ON l.id_deporte = d.id_deporte
             WHERE (SELECT COUNT(*) FROM Apuesta a 
                    JOIN Cuota c ON a.id_cuota = c.id_cuota
                    JOIN Partido p ON c.id_partido = p.id_partido
                    WHERE p.id_liga = l.id_liga) > 0
             ORDER BY monto_total_apostado DESC`
        );
        return result.rows;
    }

    // ===============================================
    // EXPORTAR REPORTES A PDF
    // ===============================================

    /**
     * Generar PDF genérico
     */
    public static async generatePDF(
        titulo: string,
        headers: string[],
        data: any[],
        filename: string
    ): Promise<string> {
        this.ensureReportsDir();
        
        const filepath = path.join(this.REPORTS_DIR, `${filename}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Encabezado
        doc.fontSize(20).text('SportWin - Sistema de Apuestas Deportivas', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(titulo, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Fecha: ${new Date().toLocaleString('es-CO')}`, { align: 'right' });
        doc.moveDown(2);

        // Datos
        doc.fontSize(10);
        
        if (data.length === 0) {
            doc.text('No hay datos disponibles para este reporte.');
        } else {
            data.forEach((row, index) => {
                doc.fontSize(12).text(`Registro ${index + 1}:`, { underline: true });
                doc.fontSize(10);
                
                headers.forEach(header => {
                    const key = header.toLowerCase().replace(/ /g, '_');
                    doc.text(`${header}: ${row[key] || 'N/A'}`);
                });
                
                doc.moveDown();
                
                if (doc.y > 700) {
                    doc.addPage();
                }
            });
        }

        // Pie de página
        doc.fontSize(8).text(
            `Reporte generado por SportWin - Página ${doc.bufferedPageRange().count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
        );

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filepath));
            stream.on('error', reject);
        });
    }
}
