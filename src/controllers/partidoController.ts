import { ConsoleUtils } from '../utils/console';
import { PartidoService } from '../services/partidoService';

/**
 * Controlador de Partidos
 */
export class PartidoController {
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Partidos Programados',
                'Listar Partidos Finalizados',
                'Buscar Partido',
                'Crear Partido',
                'Actualizar Estado',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Partidos', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarProgramados();
                        break;
                    case 2:
                        await this.listarFinalizados();
                        break;
                    case 3:
                        await this.buscar();
                        break;
                    case 4:
                        await this.crear();
                        break;
                    case 5:
                        await this.actualizarEstado();
                        break;
                    case 6:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarProgramados(): Promise<void> {
        ConsoleUtils.showHeader('Partidos Programados');
        const partidos = await PartidoService.getProgramados();

        if (partidos.length === 0) {
            ConsoleUtils.warning('No hay partidos programados');
        } else {
            const data = partidos.map(p => ({
                id: p.id_partido,
                deporte: p.deporte,
                liga: p.liga,
                partido: `${p.equipo_local} vs ${p.equipo_visitante}`,
                fecha: ConsoleUtils.formatDate(p.fecha_hora),
                estadio: p.estadio || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Deporte', 'Liga', 'Partido', 'Fecha', 'Estadio']);
        }

        ConsoleUtils.pause();
    }

    private static async listarFinalizados(): Promise<void> {
        ConsoleUtils.showHeader('Partidos Finalizados');
        const partidos = await PartidoService.getFinalizados(20);

        if (partidos.length === 0) {
            ConsoleUtils.warning('No hay partidos finalizados');
        } else {
            const data = partidos.map(p => ({
                id: p.id_partido,
                deporte: p.deporte,
                partido: `${p.equipo_local} vs ${p.equipo_visitante}`,
                resultado: `${p.goles_local || 0} - ${p.goles_visitante || 0}`,
                fecha: ConsoleUtils.formatDate(p.fecha_hora)
            }));

            ConsoleUtils.showTable(data, ['ID', 'Deporte', 'Partido', 'Resultado', 'Fecha']);
        }

        ConsoleUtils.pause();
    }

    private static async buscar(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Partido');

        const id = ConsoleUtils.inputNumber('ID del partido');
        const partido = await PartidoService.getById(id);

        if (!partido) {
            ConsoleUtils.error('Partido no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${partido.id_partido}`);
            ConsoleUtils.info(`Fecha: ${ConsoleUtils.formatDate(partido.fecha_hora)}`);
            ConsoleUtils.info(`Estado: ${partido.estado}`);
            ConsoleUtils.info(`Estadio: ${partido.estadio || 'N/A'}`);
            ConsoleUtils.info(`Árbitro: ${partido.arbitro || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Partido');

        const idLiga = ConsoleUtils.inputNumber('ID de la Liga');
        const idEquipoLocal = ConsoleUtils.inputNumber('ID del Equipo Local');
        const idEquipoVisitante = ConsoleUtils.inputNumber('ID del Equipo Visitante');
        const fechaHora = ConsoleUtils.input('Fecha y Hora (YYYY-MM-DD HH:MM)');
        const estadio = ConsoleUtils.input('Estadio', false);
        const arbitro = ConsoleUtils.input('Árbitro', false);

        const id = await PartidoService.create({
            id_liga: idLiga,
            id_equipo_local: idEquipoLocal,
            id_equipo_visitante: idEquipoVisitante,
            fecha_hora: new Date(fechaHora),
            estadio: estadio || undefined,
            arbitro: arbitro || undefined,
            estado: 'programado'
        });

        ConsoleUtils.success(`Partido creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizarEstado(): Promise<void> {
        ConsoleUtils.showHeader('Actualizar Estado de Partido');

        const id = ConsoleUtils.inputNumber('ID del partido');
        ConsoleUtils.info('Estados: programado, en_curso, finalizado, suspendido, cancelado');
        const estado = ConsoleUtils.input('Nuevo estado');

        const updated = await PartidoService.updateEstado(id, estado);

        if (updated) {
            ConsoleUtils.success('Estado actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el estado');
        }

        ConsoleUtils.pause();
    }
}
