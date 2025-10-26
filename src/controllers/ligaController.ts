import { ConsoleUtils } from '../utils/console';
import { LigaService } from '../services/ligaService';
import { DeporteService } from '../services/deporteService';
import { PaisService } from '../services/catalogoService';
import { Liga } from '../models';

/**
 * Controlador para gestionar Ligas
 */
export class LigaController {
    /**
     * Menú principal de ligas
     */
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todas las ligas',
                'Listar por deporte',
                'Listar por país',
                'Buscar liga por ID',
                'Crear nueva liga',
                'Actualizar liga',
                'Desactivar liga',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Ligas', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.listarPorDeporte();
                        break;
                    case 3:
                        await this.listarPorPais();
                        break;
                    case 4:
                        await this.buscarPorId();
                        break;
                    case 5:
                        await this.crear();
                        break;
                    case 6:
                        await this.actualizar();
                        break;
                    case 7:
                        await this.desactivar();
                        break;
                    case 8:
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
     * Listar todas las ligas
     */
    private static async listar(): Promise<void> {
        const ligas = await LigaService.getAllCompletas();
        
        if (ligas.length === 0) {
            ConsoleUtils.info('No hay ligas registradas');
        } else {
            ConsoleUtils.showTable(ligas, ['id_liga', 'nombre', 'deporte_nombre', 'pais_nombre', 'temporada', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Listar ligas por deporte
     */
    private static async listarPorDeporte(): Promise<void> {
        const deportes = await DeporteService.getAll();
        ConsoleUtils.showTable(deportes, ['id_deporte', 'nombre']);
        
        const idDeporte = parseInt(ConsoleUtils.input('ID del deporte'));
        const ligas = await LigaService.getByDeporte(idDeporte);
        
        if (ligas.length === 0) {
            ConsoleUtils.info('No hay ligas para este deporte');
        } else {
            ConsoleUtils.showTable(ligas, ['id_liga', 'nombre', 'temporada', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Listar ligas por país
     */
    private static async listarPorPais(): Promise<void> {
        const paises = await PaisService.getAll();
        ConsoleUtils.showTable(paises, ['id_pais', 'nombre']);
        
        const idPais = parseInt(ConsoleUtils.input('ID del país'));
        const ligas = await LigaService.getByPais(idPais);
        
        if (ligas.length === 0) {
            ConsoleUtils.info('No hay ligas para este país');
        } else {
            ConsoleUtils.showTable(ligas, ['id_liga', 'nombre', 'temporada', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Buscar liga por ID
     */
    private static async buscarPorId(): Promise<void> {
        const id = parseInt(ConsoleUtils.input('ID de la liga'));
        const liga = await LigaService.getById(id);
        
        if (liga) {
            ConsoleUtils.showTable([liga], ['id_liga', 'nombre', 'id_deporte', 'id_pais', 'temporada', 'activo']);
        } else {
            ConsoleUtils.error('Liga no encontrada');
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Crear nueva liga
     */
    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nueva Liga ===');
        
        // Mostrar deportes disponibles
        const deportes = await DeporteService.getAll();
        ConsoleUtils.showTable(deportes, ['id_deporte', 'nombre']);
        const id_deporte = parseInt(ConsoleUtils.input('ID del deporte'));
        
        const nombre = ConsoleUtils.input('Nombre de la liga');
        
        // Mostrar países disponibles
        const paises = await PaisService.getAll();
        ConsoleUtils.showTable(paises, ['id_pais', 'nombre']);
        const idPaisString = ConsoleUtils.input('ID del país (Enter para omitir)', false);
        const id_pais = idPaisString ? parseInt(idPaisString) : undefined;
        
        const temporada = ConsoleUtils.input('Temporada (ej: 2024/2025)', false) || undefined;
        const fechaInicioString = ConsoleUtils.input('Fecha inicio (YYYY-MM-DD, Enter para omitir)', false);
        const fecha_inicio = fechaInicioString ? new Date(fechaInicioString) : undefined;
        const fechaFinString = ConsoleUtils.input('Fecha fin (YYYY-MM-DD, Enter para omitir)', false);
        const fecha_fin = fechaFinString ? new Date(fechaFinString) : undefined;
        
        const data: Partial<Liga> = {
            id_deporte,
            nombre,
            id_pais,
            temporada,
            fecha_inicio,
            fecha_fin,
            activo: true
        };
        
        const id = await LigaService.create(data);
        ConsoleUtils.success(`Liga creada exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    /**
     * Actualizar liga
     */
    private static async actualizar(): Promise<void> {
        const ligas = await LigaService.getAllCompletas();
        ConsoleUtils.showTable(ligas, ['id_liga', 'nombre', 'deporte_nombre', 'pais_nombre', 'temporada']);
        
        const id = parseInt(ConsoleUtils.input('ID de la liga a actualizar'));
        const liga = await LigaService.getById(id);
        
        if (!liga) {
            ConsoleUtils.error('Liga no encontrada');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info(`=== Actualizar Liga: ${liga.nombre} ===`);
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const nombre = ConsoleUtils.input(`Nombre [${liga.nombre}]`, false) || undefined;
        const temporada = ConsoleUtils.input(`Temporada [${liga.temporada || 'N/A'}]`, false) || undefined;
        
        const data: Partial<Liga> = {
            nombre,
            temporada
        };
        
        const success = await LigaService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Liga actualizada exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar la liga');
        }
        
        ConsoleUtils.pause();
    }

    /**
     * Desactivar liga
     */
    private static async desactivar(): Promise<void> {
        const ligas = await LigaService.getAll();
        ConsoleUtils.showTable(ligas, ['id_liga', 'nombre', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID de la liga a desactivar'));
        
        const confirm = ConsoleUtils.confirm('¿Está seguro de desactivar esta liga?');
        
        if (confirm) {
            const success = await LigaService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Liga desactivada exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar la liga');
            }
        }
        
        ConsoleUtils.pause();
    }
}
