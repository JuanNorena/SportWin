import { ConsoleUtils } from '../utils/console';
import { CuotaService } from '../services/cuotaService';
import { PartidoService } from '../services/partidoService';
import { TipoApuestaService } from '../services/tipoApuestaService';
import { Cuota } from '../models';

/**
 * Controlador para gestionar Cuotas
 */
export class CuotaController {
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todas las cuotas',
                'Listar por partido',
                'Listar por tipo de apuesta',
                'Crear nueva cuota',
                'Actualizar cuota',
                'Desactivar cuota',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Cuotas', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.listarPorPartido();
                        break;
                    case 3:
                        await this.listarPorTipo();
                        break;
                    case 4:
                        await this.crear();
                        break;
                    case 5:
                        await this.actualizar();
                        break;
                    case 6:
                        await this.desactivar();
                        break;
                    case 7:
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
        const cuotas = await CuotaService.getAllCompletas();
        
        if (cuotas.length === 0) {
            ConsoleUtils.info('No hay cuotas registradas');
        } else {
            ConsoleUtils.showTable(cuotas, [
                'id_cuota', 'equipo_local', 'equipo_visitante', 
                'tipo_apuesta_nombre', 'valor_cuota', 'activo'
            ]);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarPorPartido(): Promise<void> {
        const partidos = await PartidoService.getAll();
        ConsoleUtils.showTable(partidos, ['id_partido', 'id_liga', 'fecha_hora']);
        
        const idPartido = parseInt(ConsoleUtils.input('ID del partido'));
        const cuotas = await CuotaService.getCompletasByPartido(idPartido);
        
        if (cuotas.length === 0) {
            ConsoleUtils.info('No hay cuotas para este partido');
        } else {
            ConsoleUtils.showTable(cuotas, ['id_cuota', 'tipo_apuesta_nombre', 'valor_cuota', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarPorTipo(): Promise<void> {
        const tipos = await TipoApuestaService.getAll();
        ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'nombre']);
        
        const idTipo = parseInt(ConsoleUtils.input('ID del tipo de apuesta'));
        const cuotas = await CuotaService.getByTipoApuesta(idTipo);
        
        if (cuotas.length === 0) {
            ConsoleUtils.info('No hay cuotas para este tipo de apuesta');
        } else {
            ConsoleUtils.showTable(cuotas, ['id_cuota', 'id_partido', 'valor_cuota', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nueva Cuota ===');
        
        const partidos = await PartidoService.getAll();
        ConsoleUtils.showTable(partidos, ['id_partido', 'fecha_hora']);
        const id_partido = parseInt(ConsoleUtils.input('ID del partido'));
        
        const tipos = await TipoApuestaService.getAll();
        ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'nombre']);
        const id_tipo_apuesta = parseInt(ConsoleUtils.input('ID del tipo de apuesta'));
        
        const valor_cuota = parseFloat(ConsoleUtils.input('Valor de la cuota (ej: 1.85)'));
        const resultado_prediccion = ConsoleUtils.input('Resultado predicción (Enter para omitir)', false) || undefined;
        
        const data: Partial<Cuota> = {
            id_partido,
            id_tipo_apuesta,
            valor_cuota,
            resultado_prediccion,
            activo: true
        };
        
        const id = await CuotaService.create(data);
        ConsoleUtils.success(`Cuota creada exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizar(): Promise<void> {
        const cuotas = await CuotaService.getAll();
        ConsoleUtils.showTable(cuotas, ['id_cuota', 'id_partido', 'id_tipo_apuesta', 'valor_cuota']);
        
        const id = parseInt(ConsoleUtils.input('ID de la cuota a actualizar'));
        const cuota = await CuotaService.getById(id);
        
        if (!cuota) {
            ConsoleUtils.error('Cuota no encontrada');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info('=== Actualizar Cuota ===');
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const valorStr = ConsoleUtils.input(`Valor cuota [${cuota.valor_cuota}]`, false);
        const valor_cuota = valorStr ? parseFloat(valorStr) : undefined;
        
        const data: Partial<Cuota> = { valor_cuota };
        const success = await CuotaService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Cuota actualizada exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar la cuota');
        }
        
        ConsoleUtils.pause();
    }

    private static async desactivar(): Promise<void> {
        const cuotas = await CuotaService.getAll();
        ConsoleUtils.showTable(cuotas, ['id_cuota', 'id_partido', 'valor_cuota', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID de la cuota a desactivar'));
        
        if (ConsoleUtils.confirm('¿Está seguro de desactivar esta cuota?')) {
            const success = await CuotaService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Cuota desactivada exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar la cuota');
            }
        }
        
        ConsoleUtils.pause();
    }
}
