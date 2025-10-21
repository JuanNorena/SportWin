import { ConsoleUtils } from '../utils/console';
import { ApuestaService } from '../services/apuestaService';

/**
 * Controlador de Apuestas
 */
export class ApuestaController {
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Apuestas',
                'Mis Apuestas',
                'Crear Apuesta',
                'Resolver Apuesta',
                'Cancelar Apuesta',
                'Ver Estadísticas',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Apuestas', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.misApuestas();
                        break;
                    case 3:
                        await this.crear();
                        break;
                    case 4:
                        await this.resolver();
                        break;
                    case 5:
                        await this.cancelar();
                        break;
                    case 6:
                        await this.estadisticas();
                        break;
                    case 7:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listar(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Apuestas');
        const apuestas = await ApuestaService.getAllDetailed();

        if (apuestas.length === 0) {
            ConsoleUtils.warning('No hay apuestas registradas');
        } else {
            const data = apuestas.slice(0, 20).map(a => ({
                id: a.id_apuesta,
                apostador: a.apostador,
                partido: `${a.equipo_local} vs ${a.equipo_visitante}`,
                monto: ConsoleUtils.formatCurrency(a.monto_apostado),
                cuota: a.cuota_aplicada.toFixed(2),
                estado: a.estado
            }));

            ConsoleUtils.showTable(data, ['ID', 'Apostador', 'Partido', 'Monto', 'Cuota', 'Estado']);
        }

        ConsoleUtils.pause();
    }

    private static async misApuestas(): Promise<void> {
        ConsoleUtils.showHeader('Mis Apuestas');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const apuestas = await ApuestaService.getByApostador(idApostador);

        if (apuestas.length === 0) {
            ConsoleUtils.warning('No tiene apuestas registradas');
        } else {
            const data = apuestas.map(a => ({
                id: a.id_apuesta,
                partido: `${a.equipo_local} vs ${a.equipo_visitante}`,
                tipo: a.tipo_apuesta,
                monto: ConsoleUtils.formatCurrency(a.monto_apostado),
                potencial: ConsoleUtils.formatCurrency(a.ganancia_potencial),
                estado: a.estado,
                ganancia: ConsoleUtils.formatCurrency(a.ganancia_real)
            }));

            ConsoleUtils.showTable(data, ['ID', 'Partido', 'Tipo', 'Monto', 'Potencial', 'Estado', 'Ganancia']);
        }

        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nueva Apuesta');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const idCuota = ConsoleUtils.inputNumber('ID de la cuota');
        const montoApostado = ConsoleUtils.inputNumber('Monto a apostar', 1000);

        const id = await ApuestaService.create(idApostador, idCuota, montoApostado);

        ConsoleUtils.success(`Apuesta creada exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async resolver(): Promise<void> {
        ConsoleUtils.showHeader('Resolver Apuesta');

        const id = ConsoleUtils.inputNumber('ID de la apuesta');
        const ganada = ConsoleUtils.confirm('¿La apuesta fue ganada');

        const resolved = await ApuestaService.resolver(id, ganada);

        if (resolved) {
            ConsoleUtils.success(`Apuesta resuelta como ${ganada ? 'GANADA' : 'PERDIDA'}`);
        } else {
            ConsoleUtils.error('No se pudo resolver la apuesta');
        }

        ConsoleUtils.pause();
    }

    private static async cancelar(): Promise<void> {
        ConsoleUtils.showHeader('Cancelar Apuesta');

        const id = ConsoleUtils.inputNumber('ID de la apuesta');
        
        if (!ConsoleUtils.confirm('¿Está seguro de cancelar esta apuesta')) {
            return;
        }

        const cancelled = await ApuestaService.cancelar(id);

        if (cancelled) {
            ConsoleUtils.success('Apuesta cancelada y monto reembolsado');
        } else {
            ConsoleUtils.error('No se pudo cancelar la apuesta');
        }

        ConsoleUtils.pause();
    }

    private static async estadisticas(): Promise<void> {
        ConsoleUtils.showHeader('Estadísticas de Apuestas');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const stats = await ApuestaService.getEstadisticas(idApostador);

        console.log();
        ConsoleUtils.info(`Total de Apuestas: ${stats.total_apuestas}`);
        ConsoleUtils.info(`Apuestas Ganadas: ${stats.apuestas_ganadas}`);
        ConsoleUtils.info(`Apuestas Perdidas: ${stats.apuestas_perdidas}`);
        ConsoleUtils.info(`Apuestas Pendientes: ${stats.apuestas_pendientes}`);
        ConsoleUtils.info(`Total Apostado: ${ConsoleUtils.formatCurrency(stats.total_apostado || 0)}`);
        ConsoleUtils.info(`Total Ganado: ${ConsoleUtils.formatCurrency(stats.total_ganado || 0)}`);
        ConsoleUtils.info(`Total Perdido: ${ConsoleUtils.formatCurrency(stats.total_perdido || 0)}`);

        const balance = (stats.total_ganado || 0) - (stats.total_apostado || 0);
        if (balance >= 0) {
            ConsoleUtils.success(`Balance: +${ConsoleUtils.formatCurrency(balance)}`);
        } else {
            ConsoleUtils.error(`Balance: ${ConsoleUtils.formatCurrency(balance)}`);
        }

        ConsoleUtils.pause();
    }
}
