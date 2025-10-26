import { ConsoleUtils } from '../utils/console';
import { EquipoService } from '../services/equipoService';
import { LigaService } from '../services/ligaService';
import { PaisService, CiudadService, EstadioService, EntrenadorService } from '../services/catalogoService';
import { Equipo } from '../models';

/**
 * Controlador para gestionar Equipos
 */
export class EquipoController {
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todos los equipos',
                'Listar por liga',
                'Buscar por nombre',
                'Buscar por ID',
                'Crear nuevo equipo',
                'Actualizar equipo',
                'Desactivar equipo',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Equipos', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.listarPorLiga();
                        break;
                    case 3:
                        await this.buscarPorNombre();
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

    private static async listar(): Promise<void> {
        const equipos = await EquipoService.getAllCompletos();
        
        if (equipos.length === 0) {
            ConsoleUtils.info('No hay equipos registrados');
        } else {
            ConsoleUtils.showTable(equipos, ['id_equipo', 'nombre', 'liga_nombre', 'pais_nombre', 'ciudad_nombre', 'entrenador_nombre']);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarPorLiga(): Promise<void> {
        const ligas = await LigaService.getAll();
        ConsoleUtils.showTable(ligas, ['id_liga', 'nombre']);
        
        const idLiga = parseInt(ConsoleUtils.input('ID de la liga'));
        const equipos = await EquipoService.getByLiga(idLiga);
        
        if (equipos.length === 0) {
            ConsoleUtils.info('No hay equipos en esta liga');
        } else {
            ConsoleUtils.showTable(equipos, ['id_equipo', 'nombre', 'fundacion', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async buscarPorNombre(): Promise<void> {
        const nombre = ConsoleUtils.input('Nombre del equipo (búsqueda parcial)');
        const equipos = await EquipoService.buscarPorNombre(nombre);
        
        if (equipos.length === 0) {
            ConsoleUtils.info('No se encontraron equipos');
        } else {
            ConsoleUtils.showTable(equipos, ['id_equipo', 'nombre', 'id_liga', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async buscarPorId(): Promise<void> {
        const id = parseInt(ConsoleUtils.input('ID del equipo'));
        const equipo = await EquipoService.getById(id);
        
        if (equipo) {
            ConsoleUtils.showTable([equipo], ['id_equipo', 'nombre', 'id_liga', 'fundacion', 'activo']);
        } else {
            ConsoleUtils.error('Equipo no encontrado');
        }
        
        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nuevo Equipo ===');
        
        const ligas = await LigaService.getAll();
        ConsoleUtils.showTable(ligas, ['id_liga', 'nombre']);
        const id_liga = parseInt(ConsoleUtils.input('ID de la liga'));
        
        const nombre = ConsoleUtils.input('Nombre del equipo');
        
        const paises = await PaisService.getAll();
        ConsoleUtils.showTable(paises, ['id_pais', 'nombre']);
        const idPaisStr = ConsoleUtils.input('ID del país (Enter para omitir)', false);
        const id_pais = idPaisStr ? parseInt(idPaisStr) : undefined;
        
        const fundacionStr = ConsoleUtils.input('Año de fundación (Enter para omitir)', false);
        const fundacion = fundacionStr ? parseInt(fundacionStr) : undefined;
        
        const data: Partial<Equipo> = {
            id_liga,
            nombre,
            id_pais,
            fundacion,
            activo: true
        };
        
        const id = await EquipoService.create(data);
        ConsoleUtils.success(`Equipo creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizar(): Promise<void> {
        const equipos = await EquipoService.getAll();
        ConsoleUtils.showTable(equipos, ['id_equipo', 'nombre', 'id_liga']);
        
        const id = parseInt(ConsoleUtils.input('ID del equipo a actualizar'));
        const equipo = await EquipoService.getById(id);
        
        if (!equipo) {
            ConsoleUtils.error('Equipo no encontrado');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info(`=== Actualizar Equipo: ${equipo.nombre} ===`);
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const nombre = ConsoleUtils.input(`Nombre [${equipo.nombre}]`, false) || undefined;
        
        const data: Partial<Equipo> = { nombre };
        const success = await EquipoService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Equipo actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el equipo');
        }
        
        ConsoleUtils.pause();
    }

    private static async desactivar(): Promise<void> {
        const equipos = await EquipoService.getAll();
        ConsoleUtils.showTable(equipos, ['id_equipo', 'nombre', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID del equipo a desactivar'));
        
        if (ConsoleUtils.confirm('¿Está seguro de desactivar este equipo?')) {
            const success = await EquipoService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Equipo desactivado exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar el equipo');
            }
        }
        
        ConsoleUtils.pause();
    }
}
