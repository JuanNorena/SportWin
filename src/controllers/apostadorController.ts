import { ConsoleUtils } from '../utils/console';
import { ApostadorService } from '../services/apostadorService';
import { AuthService } from '../services/authService';
import { CiudadService, TipoDocumentoService } from '../services/catalogoService';
import db from '../utils/database';

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
                'Eliminar Apostador',
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
                        await this.eliminar();
                        break;
                    case 7:
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

        // Obtener apostadores con JOINs para mostrar nombres en lugar de IDs
        const result = await db.query(
            `SELECT 
                a.id_apostador,
                a.documento,
                u.nombre,
                u.apellido,
                c.nombre as ciudad,
                a.saldo_actual,
                a.verificado
             FROM Apostador a
             LEFT JOIN Usuario u ON a.id_usuario = u.id_usuario
             LEFT JOIN Ciudad c ON a.id_ciudad = c.id_ciudad
             ORDER BY a.id_apostador ASC`
        );

        if (result.rows.length === 0) {
            ConsoleUtils.warning('No hay apostadores registrados');
        } else {
            const data = result.rows.map((a: any) => ({
                id: a.id_apostador,
                nombre: a.nombre || 'N/A',
                apellido: a.apellido || 'N/A',
                documento: a.documento,
                ciudad: a.ciudad || 'N/A',
                saldo: ConsoleUtils.formatCurrency(a.saldo_actual),
                verificado: a.verificado ? 'Sí' : 'No'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Apellido', 'Documento', 'Ciudad', 'Saldo', 'Verificado']);
        }

        ConsoleUtils.pause();
    }

    /**
     * Buscar apostador
     */
    private static async buscar(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Apostador');

        const documento = ConsoleUtils.input('Documento del apostador');
        
        // Buscar con JOIN para obtener nombres
        const result = await db.query(
            `SELECT 
                a.*,
                u.nombre,
                u.apellido,
                u.email,
                td.nombre as tipo_documento_nombre,
                c.nombre as ciudad_nombre,
                d.nombre as departamento,
                p.nombre as pais
             FROM Apostador a
             LEFT JOIN Usuario u ON a.id_usuario = u.id_usuario
             LEFT JOIN TipoDocumento td ON a.id_tipo_documento = td.id_tipo_documento
             LEFT JOIN Ciudad c ON a.id_ciudad = c.id_ciudad
             LEFT JOIN Departamento d ON c.id_departamento = d.id_departamento
             LEFT JOIN Pais p ON d.id_pais = p.id_pais
             WHERE a.documento = $1`,
            [documento]
        );

        if (result.rows.length === 0) {
            ConsoleUtils.error('Apostador no encontrado');
            
            // Mostrar documentos disponibles como sugerencia
            const allDocs = await db.query(
                'SELECT documento FROM Apostador ORDER BY id_apostador LIMIT 10'
            );
            
            if (allDocs.rows.length > 0) {
                console.log();
                ConsoleUtils.info('Documentos disponibles (primeros 10):');
                allDocs.rows.forEach((row: any) => {
                    console.log(`  - ${row.documento}`);
                });
            }
        } else {
            const apostador = result.rows[0];
            console.log();
            ConsoleUtils.info(`ID: ${apostador.id_apostador}`);
            ConsoleUtils.info(`Nombre: ${apostador.nombre || 'N/A'} ${apostador.apellido || ''}`);
            ConsoleUtils.info(`Email: ${apostador.email || 'N/A'}`);
            ConsoleUtils.info(`Documento: ${apostador.documento} (${apostador.tipo_documento_nombre || 'N/A'})`);
            ConsoleUtils.info(`Teléfono: ${apostador.telefono || 'N/A'}`);
            ConsoleUtils.info(`Ciudad: ${apostador.ciudad_nombre || 'N/A'}${apostador.departamento ? ', ' + apostador.departamento : ''}`);
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

        // Mostrar tipos de documento disponibles
        const tiposDoc = await TipoDocumentoService.getAll();
        ConsoleUtils.info('\nTipos de documento disponibles:');
        tiposDoc.forEach(td => console.log(`  - ${td.codigo}: ${td.nombre}`));
        
        const documento = ConsoleUtils.input('\nDocumento');
        const codigoTipoDoc = ConsoleUtils.input('Código de Tipo de Documento (ej: CC, CE, TI)');
        const tipoDoc = await TipoDocumentoService.getByCodigo(codigoTipoDoc);
        
        if (!tipoDoc) {
            ConsoleUtils.error('Tipo de documento no válido');
            ConsoleUtils.pause();
            return;
        }

        const telefono = ConsoleUtils.input('Teléfono', false);
        const direccion = ConsoleUtils.input('Dirección', false);
        
        // Mostrar ciudades disponibles de Colombia
        const ciudades = await CiudadService.getCiudadesCompletasColombias();
        ConsoleUtils.info('\nEjemplos de ciudades disponibles (primeras 10):');
        ciudades.slice(0, 10).forEach(c => console.log(`  - ID ${c.id_ciudad}: ${c.ciudad}, ${c.departamento}`));
        
        const idCiudadStr = ConsoleUtils.input('ID de Ciudad (opcional, deje en blanco para omitir)', false);
        const idCiudad = idCiudadStr ? parseInt(idCiudadStr) : undefined;
        
        const fechaNacimiento = ConsoleUtils.input('Fecha de Nacimiento (YYYY-MM-DD)');

        const id = await ApostadorService.create({
            id_usuario: userId,
            documento,
            id_tipo_documento: tipoDoc.id_tipo_documento,
            telefono: telefono || undefined,
            direccion: direccion || undefined,
            id_ciudad: idCiudad,
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

        ConsoleUtils.info('\nDatos actuales:');
        ConsoleUtils.info(`Documento: ${apostador.documento}`);
        ConsoleUtils.info(`Teléfono: ${apostador.telefono || 'N/A'}`);
        ConsoleUtils.info(`Dirección: ${apostador.direccion || 'N/A'}`);
        console.log();
        ConsoleUtils.info('Deje en blanco para mantener el valor actual');
        
        const documento = ConsoleUtils.input('Nuevo documento', false);
        
        // Opción para cambiar tipo de documento
        let idTipoDocumento = apostador.id_tipo_documento;
        const cambiarTipoDoc = ConsoleUtils.input('¿Cambiar tipo de documento? (s/n)', false);
        
        if (cambiarTipoDoc?.toLowerCase() === 's') {
            const tiposDoc = await TipoDocumentoService.getAll();
            ConsoleUtils.info('\nTipos de documento disponibles:');
            tiposDoc.forEach(td => console.log(`  - ID ${td.id_tipo_documento}: ${td.codigo} - ${td.nombre}`));
            
            const idTipoDocStr = ConsoleUtils.input('Nuevo ID de Tipo de Documento');
            idTipoDocumento = parseInt(idTipoDocStr);
        }
        
        const telefono = ConsoleUtils.input('Nuevo teléfono', false);
        const direccion = ConsoleUtils.input('Nueva dirección', false);
        
        // Opción para cambiar ciudad
        const cambiarCiudad = ConsoleUtils.input('¿Cambiar ciudad? (s/n)', false);
        let idCiudad = apostador.id_ciudad;
        
        if (cambiarCiudad?.toLowerCase() === 's') {
            const ciudades = await CiudadService.getCiudadesCompletasColombias();
            ConsoleUtils.info('\nEjemplos de ciudades disponibles (primeras 10):');
            ciudades.slice(0, 10).forEach(c => console.log(`  - ID ${c.id_ciudad}: ${c.ciudad}, ${c.departamento}`));
            
            const idCiudadStr = ConsoleUtils.input('Nuevo ID de Ciudad');
            idCiudad = parseInt(idCiudadStr);
        }

        const updated = await ApostadorService.update(id, {
            documento: documento || apostador.documento,
            id_tipo_documento: idTipoDocumento,
            telefono: telefono || apostador.telefono,
            direccion: direccion || apostador.direccion,
            id_ciudad: idCiudad
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

    /**
     * Eliminar apostador
     */
    private static async eliminar(): Promise<void> {
        ConsoleUtils.showHeader('Eliminar Apostador');

        const id = ConsoleUtils.inputNumber('ID del apostador a eliminar');

        // Obtener datos básicos del apostador antes de eliminar
        const apostador = await ApostadorService.getById(id);

        if (!apostador) {
            ConsoleUtils.error('Apostador no encontrado');
            ConsoleUtils.pause();
            return;
        }

        ConsoleUtils.info(`Apostador encontrado: ID ${apostador.id_apostador} - Documento: ${apostador.documento}`);
        const confirmar = ConsoleUtils.confirm('¿Está seguro que desea eliminar este apostador');

        if (!confirmar) {
            ConsoleUtils.info('Operación cancelada');
            ConsoleUtils.pause();
            return;
        }

        const deleted = await ApostadorService.delete(id);

        if (deleted) {
            ConsoleUtils.success('Apostador eliminado correctamente');
        } else {
            ConsoleUtils.error('No se pudo eliminar el apostador');
        }

        ConsoleUtils.pause();
    }
}
