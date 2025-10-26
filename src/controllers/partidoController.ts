import { ConsoleUtils } from '../utils/console';
import { PartidoService } from '../services/partidoService';
import db from '../utils/database';

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
        
        // Buscar con JOINs para obtener nombres
        const result = await db.query(
            `SELECT 
                p.*,
                est.nombre as estado_nombre,
                esta.nombre as estadio_nombre,
                arb.nombre || ' ' || arb.apellido as arbitro_nombre,
                el.nombre as equipo_local,
                ev.nombre as equipo_visitante,
                l.nombre as liga
             FROM Partido p
             LEFT JOIN Estado est ON p.id_estado = est.id_estado
             LEFT JOIN Estadio esta ON p.id_estadio = esta.id_estadio
             LEFT JOIN Arbitro arb ON p.id_arbitro = arb.id_arbitro
             LEFT JOIN Equipo el ON p.id_equipo_local = el.id_equipo
             LEFT JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
             LEFT JOIN Liga l ON p.id_liga = l.id_liga
             WHERE p.id_partido = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            ConsoleUtils.error('Partido no encontrado');
        } else {
            const partido = result.rows[0];
            console.log();
            ConsoleUtils.info(`ID: ${partido.id_partido}`);
            ConsoleUtils.info(`Liga: ${partido.liga}`);
            ConsoleUtils.info(`Partido: ${partido.equipo_local} vs ${partido.equipo_visitante}`);
            ConsoleUtils.info(`Fecha: ${ConsoleUtils.formatDate(partido.fecha_hora)}`);
            ConsoleUtils.info(`Estado: ${partido.estado_nombre}`);
            ConsoleUtils.info(`Estadio: ${partido.estadio_nombre || 'N/A'}`);
            ConsoleUtils.info(`Árbitro: ${partido.arbitro_nombre || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Partido');

        const idLiga = ConsoleUtils.inputNumber('ID de la Liga');
        const idEquipoLocal = ConsoleUtils.inputNumber('ID del Equipo Local');
        const idEquipoVisitante = ConsoleUtils.inputNumber('ID del Equipo Visitante');
        const fechaHora = ConsoleUtils.input('Fecha y Hora (YYYY-MM-DD HH:MM)');
        
        // Opcionalmente asignar estadio
        const conEstadio = ConsoleUtils.input('¿Asignar estadio? (s/n)', false);
        let idEstadio: number | undefined;
        if (conEstadio?.toLowerCase() === 's') {
            idEstadio = ConsoleUtils.inputNumber('ID del Estadio');
        }
        
        // Opcionalmente asignar árbitro
        const conArbitro = ConsoleUtils.input('¿Asignar árbitro? (s/n)', false);
        let idArbitro: number | undefined;
        if (conArbitro?.toLowerCase() === 's') {
            idArbitro = ConsoleUtils.inputNumber('ID del Árbitro');
        }

        // Obtener ID del estado PROGRAMADO
        const estadoResult = await db.query(
            'SELECT id_estado FROM Estado WHERE codigo = $1 AND entidad = $2',
            ['PROGRAMADO', 'PARTIDO']
        );

        const id = await PartidoService.create({
            id_liga: idLiga,
            id_equipo_local: idEquipoLocal,
            id_equipo_visitante: idEquipoVisitante,
            fecha_hora: new Date(fechaHora),
            id_estadio: idEstadio,
            id_arbitro: idArbitro,
            id_estado: estadoResult.rows[0].id_estado
        });

        ConsoleUtils.success(`Partido creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizarEstado(): Promise<void> {
        ConsoleUtils.showHeader('Actualizar Estado de Partido');

        const id = ConsoleUtils.inputNumber('ID del partido');
        
        // Mostrar estados disponibles
        const estadosResult = await db.query(
            'SELECT id_estado, nombre, codigo FROM Estado WHERE entidad = $1 AND activo = true',
            ['PARTIDO']
        );
        
        ConsoleUtils.info('Estados disponibles:');
        estadosResult.rows.forEach((e: any) => console.log(`  - ID ${e.id_estado}: ${e.nombre} (${e.codigo})`));
        
        const idEstado = ConsoleUtils.inputNumber('ID del nuevo estado');

        const updated = await PartidoService.updateEstado(id, idEstado);

        if (updated) {
            ConsoleUtils.success('Estado actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el estado');
        }

        ConsoleUtils.pause();
    }
}
