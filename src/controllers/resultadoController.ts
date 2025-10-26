import { ConsoleUtils } from '../utils/console';
import { ResultadoService } from '../services/resultadoService';
import { PartidoService } from '../services/partidoService';
import { Resultado } from '../models';

/**
 * Controlador para gestionar Resultados
 */
export class ResultadoController {
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todos los resultados',
                'Buscar resultado por partido',
                'Registrar resultado',
                'Actualizar resultado',
                'Eliminar resultado',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Resultados', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.buscarPorPartido();
                        break;
                    case 3:
                        await this.crear();
                        break;
                    case 4:
                        await this.actualizar();
                        break;
                    case 5:
                        await this.eliminar();
                        break;
                    case 6:
                        exit = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error('Error: ' + error.message);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listar(): Promise<void> {
        const resultados = await ResultadoService.getAllCompletos();
        
        if (resultados.length === 0) {
            ConsoleUtils.info('No hay resultados registrados');
        } else {
            ConsoleUtils.showTable(resultados, [
                'id_resultado', 'equipo_local', 'equipo_visitante', 
                'goles_local', 'goles_visitante', 'fecha_hora', 'liga_nombre'
            ]);
        }
        
        ConsoleUtils.pause();
    }

    private static async buscarPorPartido(): Promise<void> {
        const idPartido = parseInt(ConsoleUtils.input('ID del partido'));
        const resultado = await ResultadoService.getByPartido(idPartido);
        
        if (resultado) {
            ConsoleUtils.showTable([resultado], [
                'id_resultado', 'id_partido', 
                'goles_local', 'goles_visitante',
                'tarjetas_amarillas_local', 'tarjetas_amarillas_visitante',
                'tarjetas_rojas_local', 'tarjetas_rojas_visitante'
            ]);
        } else {
            ConsoleUtils.error('No se encontró resultado para este partido');
        }
        
        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Registrar Resultado ===');
        
        // Mostrar partidos disponibles
        const partidos = await PartidoService.getAll();
        ConsoleUtils.showTable(partidos, ['id_partido', 'id_liga', 'fecha_hora', 'id_estado']);
        
        const id_partido = parseInt(ConsoleUtils.input('ID del partido'));
        
        // Verificar si ya existe resultado
        const existe = await ResultadoService.existeResultado(id_partido);
        if (existe) {
            ConsoleUtils.error('Este partido ya tiene un resultado registrado. Use actualizar en su lugar.');
            ConsoleUtils.pause();
            return;
        }
        
        const goles_local = parseInt(ConsoleUtils.input('Goles equipo local'));
        const goles_visitante = parseInt(ConsoleUtils.input('Goles equipo visitante'));
        
        const tarjetas_amarillas_local = parseInt(ConsoleUtils.input('Tarjetas amarillas local (Enter para 0)', false) || '0');
        const tarjetas_amarillas_visitante = parseInt(ConsoleUtils.input('Tarjetas amarillas visitante (Enter para 0)', false) || '0');
        const tarjetas_rojas_local = parseInt(ConsoleUtils.input('Tarjetas rojas local (Enter para 0)', false) || '0');
        const tarjetas_rojas_visitante = parseInt(ConsoleUtils.input('Tarjetas rojas visitante (Enter para 0)', false) || '0');
        
        const data: Partial<Resultado> = {
            id_partido,
            goles_local,
            goles_visitante,
            tarjetas_amarillas_local,
            tarjetas_amarillas_visitante,
            tarjetas_rojas_local,
            tarjetas_rojas_visitante
        };
        
        const id = await ResultadoService.create(data);
        ConsoleUtils.success(`Resultado registrado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizar(): Promise<void> {
        const resultados = await ResultadoService.getAllCompletos();
        ConsoleUtils.showTable(resultados, ['id_resultado', 'equipo_local', 'equipo_visitante', 'goles_local', 'goles_visitante']);
        
        const id = parseInt(ConsoleUtils.input('ID del resultado a actualizar'));
        const resultado = await ResultadoService.getById(id);
        
        if (!resultado) {
            ConsoleUtils.error('Resultado no encontrado');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info('=== Actualizar Resultado ===');
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const golesLocalStr = ConsoleUtils.input(`Goles local [${resultado.goles_local}]`, false);
        const goles_local = golesLocalStr ? parseInt(golesLocalStr) : undefined;
        
        const golesVisitanteStr = ConsoleUtils.input(`Goles visitante [${resultado.goles_visitante}]`, false);
        const goles_visitante = golesVisitanteStr ? parseInt(golesVisitanteStr) : undefined;
        
        const data: Partial<Resultado> = { goles_local, goles_visitante };
        const success = await ResultadoService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Resultado actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el resultado');
        }
        
        ConsoleUtils.pause();
    }

    private static async eliminar(): Promise<void> {
        const resultados = await ResultadoService.getAll();
        ConsoleUtils.showTable(resultados, ['id_resultado', 'id_partido', 'goles_local', 'goles_visitante']);
        
        const id = parseInt(ConsoleUtils.input('ID del resultado a eliminar'));
        
        if (ConsoleUtils.confirm('¿Está seguro de eliminar este resultado?')) {
            const success = await ResultadoService.delete(id);
            
            if (success) {
                ConsoleUtils.success('Resultado eliminado exitosamente');
            } else {
                ConsoleUtils.error('No se pudo eliminar el resultado');
            }
        }
        
        ConsoleUtils.pause();
    }
}
