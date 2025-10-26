import { ConsoleUtils } from '../utils/console';
import { MetodoPagoService } from '../services/metodoPagoService';
import { MetodoPago } from '../models';

/**
 * Controlador para gestionar Métodos de Pago
 */
export class MetodoPagoController {
    public static async menu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const options = [
                'Listar todos los métodos',
                'Listar para depósitos',
                'Listar para retiros',
                'Buscar por ID',
                'Crear nuevo método',
                'Actualizar método',
                'Desactivar método',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Métodos de Pago', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.listarParaDepositos();
                        break;
                    case 3:
                        await this.listarParaRetiros();
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
        const metodos = await MetodoPagoService.getAll();
        
        if (metodos.length === 0) {
            ConsoleUtils.info('No hay métodos de pago registrados');
        } else {
            ConsoleUtils.showTable(metodos, ['id_metodo_pago', 'codigo', 'nombre', 'comision_porcentaje', 'tipo_operacion', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarParaDepositos(): Promise<void> {
        const metodos = await MetodoPagoService.getParaDepositos();
        
        if (metodos.length === 0) {
            ConsoleUtils.info('No hay métodos disponibles para depósitos');
        } else {
            ConsoleUtils.showTable(metodos, ['id_metodo_pago', 'codigo', 'nombre', 'comision_porcentaje', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async listarParaRetiros(): Promise<void> {
        const metodos = await MetodoPagoService.getParaRetiros();
        
        if (metodos.length === 0) {
            ConsoleUtils.info('No hay métodos disponibles para retiros');
        } else {
            ConsoleUtils.showTable(metodos, ['id_metodo_pago', 'codigo', 'nombre', 'comision_porcentaje', 'activo']);
        }
        
        ConsoleUtils.pause();
    }

    private static async buscarPorId(): Promise<void> {
        const id = parseInt(ConsoleUtils.input('ID del método de pago'));
        const metodo = await MetodoPagoService.getById(id);
        
        if (metodo) {
            ConsoleUtils.showTable([metodo], ['id_metodo_pago', 'codigo', 'nombre', 'descripcion', 'comision_porcentaje', 'tipo_operacion', 'activo']);
        } else {
            ConsoleUtils.error('Método de pago no encontrado');
        }
        
        ConsoleUtils.pause();
    }

    private static async crear(): Promise<void> {
        ConsoleUtils.info('=== Nuevo Método de Pago ===');
        
        const codigo = ConsoleUtils.input('Código (ej: TARJETA, PSE, EFECTY)');
        const nombre = ConsoleUtils.input('Nombre');
        const descripcion = ConsoleUtils.input('Descripción (Enter para omitir)', false) || undefined;
        
        const comisionStr = ConsoleUtils.input('Comisión porcentaje (Enter para 0)', false);
        const comision_porcentaje = comisionStr ? parseFloat(comisionStr) : 0;
        
        const tipoOptions = ['DEPOSITO', 'RETIRO', 'AMBOS'];
        const tipoChoice = ConsoleUtils.showMenu('Tipo de operación', tipoOptions);
        const tipo_operacion = tipoOptions[tipoChoice - 1];
        
        const data: Partial<MetodoPago> = {
            codigo,
            nombre,
            descripcion,
            comision_porcentaje,
            tipo_operacion,
            activo: true
        };
        
        const id = await MetodoPagoService.create(data);
        ConsoleUtils.success(`Método de pago creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async actualizar(): Promise<void> {
        const metodos = await MetodoPagoService.getAll();
        ConsoleUtils.showTable(metodos, ['id_metodo_pago', 'codigo', 'nombre', 'comision_porcentaje']);
        
        const id = parseInt(ConsoleUtils.input('ID del método a actualizar'));
        const metodo = await MetodoPagoService.getById(id);
        
        if (!metodo) {
            ConsoleUtils.error('Método de pago no encontrado');
            ConsoleUtils.pause();
            return;
        }
        
        ConsoleUtils.info(`=== Actualizar: ${metodo.nombre} ===`);
        ConsoleUtils.info('Presiona Enter para mantener el valor actual');
        
        const nombre = ConsoleUtils.input(`Nombre [${metodo.nombre}]`, false) || undefined;
        const comisionStr = ConsoleUtils.input(`Comisión % [${metodo.comision_porcentaje || 0}]`, false);
        const comision_porcentaje = comisionStr ? parseFloat(comisionStr) : undefined;
        
        const data: Partial<MetodoPago> = { nombre, comision_porcentaje };
        const success = await MetodoPagoService.update(id, data);
        
        if (success) {
            ConsoleUtils.success('Método de pago actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar');
        }
        
        ConsoleUtils.pause();
    }

    private static async desactivar(): Promise<void> {
        const metodos = await MetodoPagoService.getAll();
        ConsoleUtils.showTable(metodos, ['id_metodo_pago', 'codigo', 'nombre', 'activo']);
        
        const id = parseInt(ConsoleUtils.input('ID del método a desactivar'));
        
        if (ConsoleUtils.confirm('¿Está seguro de desactivar este método de pago?')) {
            const success = await MetodoPagoService.desactivar(id);
            
            if (success) {
                ConsoleUtils.success('Método de pago desactivado exitosamente');
            } else {
                ConsoleUtils.error('No se pudo desactivar');
            }
        }
        
        ConsoleUtils.pause();
    }
}
