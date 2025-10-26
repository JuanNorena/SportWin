import { ConsoleUtils } from '../utils/console';
import { TipoApuestaService } from '../services/tipoApuestaService';
import { TipoApuesta } from '../models';

/**
 * Controlador para gestionar Tipos de Apuesta
 */
export class TipoApuestaController {
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todos los tipos',
                'Listar por categoría',
                'Buscar por ID',
                'Crear nuevo tipo',
                'Actualizar tipo',
                'Desactivar tipo',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Tipos de Apuesta', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.listarPorCategoria();
                        break;
                    case 3:
                        await this.buscarPorId();
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
        const tipos = await TipoApuestaService.getAll();
        
        if (tipos.length === 0) {
            ConsoleUtils.info('No hay tipos de apuesta registrados');
        } else {
            ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'codigo', 'nombre', 'descripcion', 'categoria', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarPorCategoria(): Promise<void> {
        const categoria = ConsoleUtils.input('Categoría (ej: resultado, marcador, jugador, estadistica)');
        const tipos = await TipoApuestaService.getByCategoria(categoria);
        
        if (tipos.length === 0) {
            ConsoleUtils.info('No hay tipos de apuesta en esta categoría');
        } else {
            ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'codigo', 'nombre', 'descripcion', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async buscarPorId(): Promise<void> {
        const id = parseInt(ConsoleUtils.input('ID del tipo de apuesta'));
        const tipo = await TipoApuestaService.getById(id);
        
        if (tipo) {
            ConsoleUtils.showTable([tipo], ['id_tipo_apuesta', 'codigo', 'nombre', 'descripcion', 'categoria', 'activo']);
        } else {
            ConsoleUtils.error('Tipo de apuesta no encontrado');
        }
        
        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nuevo Tipo de Apuesta ===');
        
        const codigo = ConsoleUtils.input('Código (ej: 1X2, OVER_UNDER)');
        const nombre = ConsoleUtils.input('Nombre');
        const descripcion = ConsoleUtils.input('Descripción (Enter para omitir)', false) || undefined;
        const categoria = ConsoleUtils.input('Categoría (Enter para omitir)', false) || undefined;
        
        const data: Partial<TipoApuesta> = {
            codigo,
            nombre,
            descripcion,
            categoria,
            activo: true
        };
        
        const id = await TipoApuestaService.create(data);
        ConsoleUtils.success(`Tipo de apuesta creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizar(): Promise<void> {
        const tipos = await TipoApuestaService.getAll();
        ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'codigo', 'nombre', 'categoria']);
        
        const id = parseInt(ConsoleUtils.input('ID del tipo a actualizar'));
        const tipo = await TipoApuestaService.getById(id);
        
        if (!tipo) {
            ConsoleUtils.error('Tipo de apuesta no encontrado');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info(`=== Actualizar: ${tipo.nombre} ===`);
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const nombre = ConsoleUtils.input(`Nombre [${tipo.nombre}]`, false) || undefined;
        const descripcion = ConsoleUtils.input(`Descripción [${tipo.descripcion || 'N/A'}]`, false) || undefined;
        
        const data: Partial<TipoApuesta> = { nombre, descripcion };
        const success = await TipoApuestaService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Tipo de apuesta actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar');
        }
        
        ConsoleUtils.pause();
    }

    private static async desactivar(): Promise<void> {
        const tipos = await TipoApuestaService.getAll();
        ConsoleUtils.showTable(tipos, ['id_tipo_apuesta', 'codigo', 'nombre', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID del tipo a desactivar'));
        
        if (ConsoleUtils.confirm('¿Está seguro de desactivar este tipo de apuesta?')) {
            const success = await TipoApuestaService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Tipo de apuesta desactivado exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar');
            }
        }
        
        ConsoleUtils.pause();
    }
}
