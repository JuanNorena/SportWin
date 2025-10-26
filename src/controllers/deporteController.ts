import { ConsoleUtils } from '../utils/console';
import { DeporteService } from '../services/deporteService';
import { Deporte } from '../models';

/**
 * Controlador para gestionar Deportes
 */
export class DeporteController {
    /**
     * Menú principal de deportes
     */
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todos los deportes',
                'Buscar deporte por ID',
                'Crear nuevo deporte',
                'Actualizar deporte',
                'Desactivar deporte',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Deportes', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.buscarPorId();
                        break;
                    case 3:
                        await this.crear();
                        break;
                    case 4:
                        await this.actualizar();
                        break;
                    case 5:
                        await this.desactivar();
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

    /**
     * Listar todos los deportes
     */
    private static async listar(): Promise<void> {
        const deportes = await DeporteService.getAll();
        
        if (deportes.length === 0) {
            ConsoleUtils.info('No hay deportes registrados');
        } else {
            ConsoleUtils.showTable(deportes, ['id_deporte', 'nombre', 'descripcion', 'icono', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Buscar deporte por ID
     */
    private static async buscarPorId(): Promise<void> {
        const id = parseInt(ConsoleUtils.input('ID del deporte'));
        const deporte = await DeporteService.getById(id);
        
        if (deporte) {
            ConsoleUtils.showTable([deporte], ['id_deporte', 'nombre', 'descripcion', 'icono', 'activo']);
        } else {
            ConsoleUtils.error('Deporte no encontrado');
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Crear nuevo deporte
     */
    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nuevo Deporte ===');
        
        const nombre = ConsoleUtils.input('Nombre del deporte');
        const descripcion = ConsoleUtils.input('Descripción (Enter para omitir)', false) || undefined;
        const icono = ConsoleUtils.input('Icono (Enter para omitir)', false) || undefined;
        
        const data: Partial<Deporte> = {
            nombre,
            descripcion,
            icono,
            activo: true
        };
        
        const id = await DeporteService.create(data);
        ConsoleUtils.success(`Deporte creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    /**
     * Actualizar deporte
     */
    private static async actualizar(): Promise<void> {
        // Mostrar deportes disponibles
        const deportes = await DeporteService.getAll();
        ConsoleUtils.showTable(deportes, ['id_deporte', 'nombre', 'descripcion', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID del deporte a actualizar'));
        const deporte = await DeporteService.getById(id);
        
        if (!deporte) {
            ConsoleUtils.error('Deporte no encontrado');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info(`=== Actualizar Deporte: ${deporte.nombre} ===`);
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const nombre = ConsoleUtils.input(`Nombre [${deporte.nombre}]`, false) || undefined;
        const descripcion = ConsoleUtils.input(`Descripción [${deporte.descripcion || 'N/A'}]`, false) || undefined;
        const icono = ConsoleUtils.input(`Icono [${deporte.icono || 'N/A'}]`, false) || undefined;
        
        const data: Partial<Deporte> = {
            nombre,
            descripcion,
            icono
        };
        
        const success = await DeporteService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Deporte actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el deporte');
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Desactivar deporte
     */
    private static async desactivar(): Promise<void> {
        const deportes = await DeporteService.getAll();
        ConsoleUtils.showTable(deportes, ['id_deporte', 'nombre', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID del deporte a desactivar'));
        
        const confirm = ConsoleUtils.confirm('¿Está seguro de desactivar este deporte?');
        
        if (confirm) {
            const success = await DeporteService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Deporte desactivado exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar el deporte');
            }
        }
        
        ConsoleUtils.pause();
    }
}
