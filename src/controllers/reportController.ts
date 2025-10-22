import { ConsoleUtils } from '../utils/console';
import { ReportService } from '../services/reportService';

/**
 * Controlador de Reportes
 */
export class ReportController {
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            ConsoleUtils.showHeader('Módulo de Reportes');
            console.log();
            
            // REPORTES SIMPLES
            ConsoleUtils.info('--- REPORTES SIMPLES ---');
            console.log('  1. Listado de Deportes');
            console.log('  2. Apostadores con Saldo');
            console.log('  3. Métodos de Pago');
            console.log();
            
            // REPORTES INTERMEDIOS
            ConsoleUtils.info('--- REPORTES INTERMEDIOS ---');
            console.log('  4. Apuestas por Deporte');
            console.log('  5. Partidos por Liga');
            console.log('  6. Transacciones por Mes');
            console.log('  7. Equipos Más Activos');
            console.log();
            
            // REPORTES COMPLEJOS
            ConsoleUtils.info('--- REPORTES COMPLEJOS ---');
            console.log('  8. Top Apostadores por Ganancias');
            console.log('  9. Cuotas Más Rentables');
            console.log('  10. Rendimiento de Ligas');
            console.log();
            console.log('  11. Volver');
            
            console.log();
            const choice = ConsoleUtils.inputNumber('Seleccione una opción', 1, 11);

            try {
                switch (choice) {
                    case 1:
                        await this.reporteDeportes();
                        break;
                    case 2:
                        await this.reporteApostadoresSaldo();
                        break;
                    case 3:
                        await this.reporteMetodosPago();
                        break;
                    case 4:
                        await this.reporteApuestasPorDeporte();
                        break;
                    case 5:
                        await this.reportePartidosPorLiga();
                        break;
                    case 6:
                        await this.reporteTransaccionesPorMes();
                        break;
                    case 7:
                        await this.reporteEquiposMasActivos();
                        break;
                    case 8:
                        await this.reporteTopApostadoresGanancias();
                        break;
                    case 9:
                        await this.reporteCuotasMasRentables();
                        break;
                    case 10:
                        await this.reporteRendimientoLigas();
                        break;
                    case 11:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    // REPORTES SIMPLES

    private static async reporteDeportes(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Listado de Deportes');
        const data = await ReportService.reporteDeportes();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Descripción', 'Activo']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Listado de Deportes',
                    ['ID Deporte', 'Nombre', 'Descripción', 'Activo'],
                    data,
                    'deportes_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteApostadoresSaldo(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Apostadores con Saldo');
        const data = await ReportService.reporteApostadoresSaldo();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                ...d,
                saldo_actual: ConsoleUtils.formatCurrency(d.saldo_actual)
            }));

            ConsoleUtils.showTable(formatted, ['ID', 'Documento', 'Tipo', 'Nombre', 'Ciudad', 'Saldo', 'Verificado']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Apostadores con Saldo',
                    ['ID', 'Documento', 'Tipo', 'Nombre Completo', 'Ciudad', 'Saldo', 'Verificado'],
                    data,
                    'apostadores_saldo_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteMetodosPago(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Métodos de Pago');
        const data = await ReportService.reporteMetodosPago();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Descripción', 'Comisión %', 'Activo']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Métodos de Pago Disponibles',
                    ['ID', 'Nombre', 'Descripción', 'Comisión', 'Activo'],
                    data,
                    'metodos_pago_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    // REPORTES INTERMEDIOS

    private static async reporteApuestasPorDeporte(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Apuestas por Deporte');
        const data = await ReportService.reporteApuestasPorDeporte();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                deporte: d.deporte,
                total_apuestas: d.total_apuestas,
                monto_total: ConsoleUtils.formatCurrency(d.monto_total_apostado),
                pagado: ConsoleUtils.formatCurrency(d.total_pagado),
                ganadas: d.apuestas_ganadas,
                perdidas: d.apuestas_perdidas
            }));

            ConsoleUtils.showTable(formatted, ['Deporte', 'Apuestas', 'Monto Total', 'Pagado', 'Ganadas', 'Perdidas']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Apuestas por Deporte',
                    ['Deporte', 'Total Apuestas', 'Monto Total', 'Total Pagado', 'Ganadas', 'Perdidas'],
                    data,
                    'apuestas_deporte_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reportePartidosPorLiga(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Partidos por Liga');
        const data = await ReportService.reportePartidosPorLiga();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            ConsoleUtils.showTable(data, ['Liga', 'Deporte', 'País', 'Total', 'Finalizados', 'Programados', 'Prom. Asist.']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Partidos por Liga',
                    ['Liga', 'Deporte', 'País', 'Total Partidos', 'Finalizados', 'Programados', 'Promedio Asistencia'],
                    data,
                    'partidos_liga_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteTransaccionesPorMes(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Transacciones por Mes');
        const data = await ReportService.reporteTransaccionesPorMes();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                mes: d.mes,
                tipo: d.tipo,
                cantidad: d.cantidad_transacciones,
                monto: ConsoleUtils.formatCurrency(d.monto_total),
                comision: ConsoleUtils.formatCurrency(d.comision_total),
                neto: ConsoleUtils.formatCurrency(d.monto_neto_total)
            }));

            ConsoleUtils.showTable(formatted, ['Mes', 'Tipo', 'Cantidad', 'Monto', 'Comisión', 'Neto']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Transacciones por Mes',
                    ['Mes', 'Tipo', 'Cantidad', 'Monto Total', 'Comisión', 'Monto Neto'],
                    data,
                    'transacciones_mes_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteEquiposMasActivos(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Equipos Más Activos');
        const data = await ReportService.reporteEquiposMasActivos();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            ConsoleUtils.showTable(data, ['Equipo', 'País', 'Ciudad', 'Liga', 'Total Partidos', 'Jugados']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Equipos Más Activos',
                    ['Equipo', 'País', 'Ciudad', 'Liga', 'Total Partidos', 'Partidos Jugados'],
                    data,
                    'equipos_activos_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    // REPORTES COMPLEJOS

    private static async reporteTopApostadoresGanancias(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Top Apostadores por Ganancias');
        const data = await ReportService.reporteTopApostadoresGanancias();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                username: d.username,
                nombre: d.nombre_completo,
                ciudad: d.ciudad,
                apuestas: d.total_apuestas,
                apostado: ConsoleUtils.formatCurrency(d.total_apostado || 0),
                ganado: ConsoleUtils.formatCurrency(d.total_ganado || 0),
                balance: ConsoleUtils.formatCurrency(d.balance_neto || 0)
            }));

            ConsoleUtils.showTable(formatted, ['Username', 'Nombre', 'Ciudad', 'Apuestas', 'Apostado', 'Ganado', 'Balance']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Top Apostadores por Ganancias',
                    ['Username', 'Nombre', 'Ciudad', 'Apuestas', 'Apostado', 'Ganado', 'Balance'],
                    data,
                    'top_apostadores_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteCuotasMasRentables(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Cuotas Más Rentables');
        const data = await ReportService.reporteCuotasMasRentables();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                cuota: d.descripcion,
                tipo: d.tipo_apuesta,
                valor: d.valor_cuota,
                veces: d.veces_apostada,
                monto: ConsoleUtils.formatCurrency(d.monto_total_apostado || 0),
                ganadas: d.veces_ganada,
                pagado: ConsoleUtils.formatCurrency(d.total_pagado || 0),
                porcentaje: `${d.porcentaje_acierto}%`
            }));

            ConsoleUtils.showTable(formatted, ['Cuota', 'Tipo', 'Valor', 'Veces', 'Monto', 'Ganadas', 'Pagado', '%']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Cuotas Más Rentables',
                    ['Descripción', 'Tipo', 'Valor', 'Veces Apostada', 'Monto', 'Ganadas', 'Pagado', 'Porcentaje'],
                    data,
                    'cuotas_rentables_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async reporteRendimientoLigas(): Promise<void> {
        ConsoleUtils.showHeader('Reporte: Rendimiento de Ligas');
        const data = await ReportService.reporteRendimientoLigas();

        if (data.length === 0) {
            ConsoleUtils.warning('No hay datos');
        } else {
            const formatted = data.map(d => ({
                liga: d.liga,
                deporte: d.deporte,
                pais: d.pais,
                partidos: d.total_partidos,
                apuestas: d.total_apuestas,
                monto: ConsoleUtils.formatCurrency(d.monto_total_apostado || 0),
                promedio: ConsoleUtils.formatCurrency(d.promedio_apuesta || 0),
                pagado: ConsoleUtils.formatCurrency(d.total_pagado || 0)
            }));

            ConsoleUtils.showTable(formatted, ['Liga', 'Deporte', 'País', 'Partidos', 'Apuestas', 'Monto', 'Promedio', 'Pagado']);
            
            if (ConsoleUtils.confirm('¿Exportar a PDF')) {
                const pdf = await ReportService.generatePDF(
                    'Rendimiento de Ligas',
                    ['Liga', 'Deporte', 'País', 'Partidos', 'Apuestas', 'Monto', 'Promedio', 'Pagado'],
                    data,
                    'rendimiento_ligas_' + Date.now()
                );
                ConsoleUtils.success(`PDF generado: ${pdf}`);
            }
        }

        ConsoleUtils.pause();
    }
}
