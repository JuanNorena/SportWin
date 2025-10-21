import { ConsoleUtils } from '../utils/console';
import { ApostadorService } from '../services/apostadorService';
import { AuthService } from '../services/authService';

/**
 * Controlador de Apostadores
 */
export class ApostadorController {
    /**
     * Menú de gestión de apostadores
     */
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Apostadores',
                'Buscar Apostador',
                'Crear Apostador',
                'Actualizar Apostador',
                'Ver Saldo',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Apostadores', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listar();
                        break;
                    case 2:
                        await this.buscar();
                        break;
                    case 3:
                        await this.crear();
                        break;
                    case 4:
                        await this.actualizar();
                        break;
                    case 5:
                        await this.verSaldo();
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

    /**
     * Listar todos los apostadores
     */
    private static async listar(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Apostadores');

        const apostadores = await ApostadorService.getAll();

        if (apostadores.length === 0) {
            ConsoleUtils.warning('No hay apostadores registrados');
        } else {
            const data = apostadores.map(a => ({
                id: a.id_apostador,
                documento: a.documento,
                ciudad: a.ciudad || 'N/A',
                saldo: ConsoleUtils.formatCurrency(a.saldo_actual),
                verificado: a.verificado ? 'Sí' : 'No'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Documento', 'Ciudad', 'Saldo', 'Verificado']);
        }

        ConsoleUtils.pause();
    }

    /**
     * Buscar apostador
     */
    private static async buscar(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Apostador');

        const documento = ConsoleUtils.input('Documento del apostador');
        const apostador = await ApostadorService.getByDocumento(documento);

        if (!apostador) {
            ConsoleUtils.error('Apostador no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${apostador.id_apostador}`);
            ConsoleUtils.info(`Documento: ${apostador.documento} (${apostador.tipo_documento})`);
            ConsoleUtils.info(`Teléfono: ${apostador.telefono || 'N/A'}`);
            ConsoleUtils.info(`Ciudad: ${apostador.ciudad || 'N/A'}`);
            ConsoleUtils.info(`Saldo: ${ConsoleUtils.formatCurrency(apostador.saldo_actual)}`);
            ConsoleUtils.info(`Verificado: ${apostador.verificado ? 'Sí' : 'No'}`);
        }

        ConsoleUtils.pause();
    }

    /**
     * Crear nuevo apostador
     */
    private static async crear(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Apostador');

        // Primero crear usuario
        const username = ConsoleUtils.input('Username');
        const password = ConsoleUtils.input('Contraseña');
        const nombre = ConsoleUtils.input('Nombre');
        const apellido = ConsoleUtils.input('Apellido');
        const email = ConsoleUtils.input('Email');

        const userId = await AuthService.createUser(username, password, nombre, apellido, email, 'apostador');

        // Luego crear apostador
        const documento = ConsoleUtils.input('Documento');
        const tipoDocumento = ConsoleUtils.input('Tipo de Documento (CC/CE/TI/Pasaporte)') as any;
        const telefono = ConsoleUtils.input('Teléfono', false);
        const direccion = ConsoleUtils.input('Dirección', false);
        const ciudad = ConsoleUtils.input('Ciudad', false);
        const fechaNacimiento = ConsoleUtils.input('Fecha de Nacimiento (YYYY-MM-DD)');

        const id = await ApostadorService.create({
            id_usuario: userId,
            documento,
            tipo_documento: tipoDocumento,
            telefono: telefono || undefined,
            direccion: direccion || undefined,
            ciudad: ciudad || undefined,
            pais: 'Colombia',
            fecha_nacimiento: new Date(fechaNacimiento)
        });

        ConsoleUtils.success(`Apostador creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    /**
     * Actualizar apostador
     */
    private static async actualizar(): Promise<void> {
        ConsoleUtils.showHeader('Actualizar Apostador');

        const id = ConsoleUtils.inputNumber('ID del apostador');
        const apostador = await ApostadorService.getById(id);

        if (!apostador) {
            ConsoleUtils.error('Apostador no encontrado');
            ConsoleUtils.pause();
            return;
        }

        ConsoleUtils.info('Deje en blanco para mantener el valor actual');
        
        const telefono = ConsoleUtils.input('Nuevo teléfono', false);
        const direccion = ConsoleUtils.input('Nueva dirección', false);
        const ciudad = ConsoleUtils.input('Nueva ciudad', false);

        const updated = await ApostadorService.update(id, {
            telefono: telefono || apostador.telefono,
            direccion: direccion || apostador.direccion,
            ciudad: ciudad || apostador.ciudad
        });

        if (updated) {
            ConsoleUtils.success('Apostador actualizado exitosamente');
        } else {
            ConsoleUtils.error('No se pudo actualizar el apostador');
        }

        ConsoleUtils.pause();
    }

    /**
     * Ver saldo del apostador
     */
    private static async verSaldo(): Promise<void> {
        ConsoleUtils.showHeader('Consultar Saldo');

        const id = ConsoleUtils.inputNumber('ID del apostador');
        const saldo = await ApostadorService.getSaldo(id);

        ConsoleUtils.success(`Saldo actual: ${ConsoleUtils.formatCurrency(saldo)}`);
        ConsoleUtils.pause();
    }
}
