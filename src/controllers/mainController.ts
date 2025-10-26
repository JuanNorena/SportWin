import { ConsoleUtils } from '../utils/console';
import { AuthService } from '../services/authService';
import { ApostadorController } from './apostadorController';
import { PartidoController } from './partidoController';
import { ApuestaController } from './apuestaController';
import { TransaccionController } from './transaccionController';
import { ReportController } from './reportController';
import { CatalogoController } from './catalogoController';
import { TipoDocumentoService, CiudadService } from '../services/catalogoService';
import db from '../utils/database';

/**
 * Controlador Principal de la Aplicación
 */
export class MainController {
    /**
     * Iniciar aplicación
     */
    public static async start(): Promise<void> {
        ConsoleUtils.showHeader('SPORTWIN - Sistema de Apuestas Deportivas');
        ConsoleUtils.info('Bienvenido al sistema de apuestas deportivas');
        console.log();

        // Menú de autenticación (Login/Registro)
        const user = await this.authenticationMenu();
        
        if (!user) {
            ConsoleUtils.error('No se pudo acceder al sistema');
            return;
        }

        ConsoleUtils.success(`¡Bienvenido ${user.nombre} ${user.apellido}!`);
        ConsoleUtils.info(`Rol: ${user.rol}`);
        ConsoleUtils.pause();

        // Menú principal
        await this.mainMenu();
    }

    /**
     * Menú de autenticación (Login o Registro)
     */
    private static async authenticationMenu(): Promise<any> {
        let authenticated = false;
        let user = null;

        while (!authenticated) {
            ConsoleUtils.showHeader('Sistema de Autenticación');
            
            const options = [
                'Iniciar Sesión',
                'Registrarse',
                'Salir'
            ];

            const choice = ConsoleUtils.showMenu('¿Qué deseas hacer?', options);

            switch (choice) {
                case 1:
                    user = await this.login();
                    if (user) {
                        authenticated = true;
                    }
                    break;
                case 2:
                    const registered = await this.register();
                    if (registered) {
                        ConsoleUtils.success('¡Registro exitoso! Ahora puedes iniciar sesión');
                        ConsoleUtils.pause();
                    }
                    break;
                case 3:
                    return null;
            }
        }

        return user;
    }

    /**
     * Registro de nuevo usuario
     */
    private static async register(): Promise<boolean> {
        try {
            ConsoleUtils.showHeader('Registro de Nuevo Usuario');
            console.log();

            // Solicitar datos del usuario
            const username = ConsoleUtils.input('Nombre de usuario (único)');
            
            // Verificar que el username no exista
            const existingUser = await db.query(
                'SELECT id_usuario FROM Usuario WHERE username = $1',
                [username]
            );

            if (existingUser.rows.length > 0) {
                ConsoleUtils.error('El nombre de usuario ya está en uso');
                ConsoleUtils.pause();
                return false;
            }

            const password = ConsoleUtils.input('Contraseña');
            const passwordConfirm = ConsoleUtils.input('Confirmar contraseña');

            if (password !== passwordConfirm) {
                ConsoleUtils.error('Las contraseñas no coinciden');
                ConsoleUtils.pause();
                return false;
            }

            if (password.length < 6) {
                ConsoleUtils.error('La contraseña debe tener al menos 6 caracteres');
                ConsoleUtils.pause();
                return false;
            }

            const nombre = ConsoleUtils.input('Nombre');
            const apellido = ConsoleUtils.input('Apellido');
            const email = ConsoleUtils.input('Email');

            // Verificar que el email no exista
            const existingEmail = await db.query(
                'SELECT id_usuario FROM Usuario WHERE email = $1',
                [email]
            );

            if (existingEmail.rows.length > 0) {
                ConsoleUtils.error('El email ya está registrado');
                ConsoleUtils.pause();
                return false;
            }

            console.log();
            ConsoleUtils.info('Selecciona el tipo de cuenta:');
            const roleOptions = [
                'Apostador (usuario normal)',
                'Operador (gestión de eventos)',
                'Administrador (acceso completo)'
            ];

            const roleChoice = ConsoleUtils.showMenu('Tipo de cuenta', roleOptions);
            let rol: 'admin' | 'operador' | 'apostador';

            switch (roleChoice) {
                case 1:
                    rol = 'apostador';
                    break;
                case 2:
                    rol = 'operador';
                    break;
                case 3:
                    rol = 'admin';
                    break;
                default:
                    rol = 'apostador';
            }

            // Crear usuario
            const userId = await AuthService.createUser(
                username,
                password,
                nombre,
                apellido,
                email,
                rol
            );

            ConsoleUtils.success(`Usuario creado exitosamente con ID: ${userId}`);

            // Si es apostador, crear también el registro de Apostador
            if (rol === 'apostador') {
                console.log();
                ConsoleUtils.info('Información adicional para apostadores:');
                
                const documento = ConsoleUtils.input('Número de documento');
                
                // Mostrar tipos de documento disponibles
                const tiposDoc = await TipoDocumentoService.getAll();
                ConsoleUtils.showTable(tiposDoc, ['id_tipo_documento', 'nombre', 'codigo']);
                
                const idTipoDocString = ConsoleUtils.input('ID del tipo de documento');
                const id_tipo_documento = parseInt(idTipoDocString);

                const telefono = ConsoleUtils.input('Teléfono');
                const direccion = ConsoleUtils.input('Dirección');
                
                // Mostrar ciudades de Colombia
                const ciudades = await CiudadService.getCiudadesCompletasColombias();
                ConsoleUtils.showTable(ciudades, ['id_ciudad', 'ciudad', 'departamento', 'pais']);
                
                const idCiudadString = ConsoleUtils.input('ID de la ciudad');
                const id_ciudad = parseInt(idCiudadString);
                
                const fechaNacimiento = ConsoleUtils.input('Fecha de nacimiento (YYYY-MM-DD)');

                // Crear apostador
                await db.query(
                    `INSERT INTO Apostador 
                     (id_usuario, documento, id_tipo_documento, telefono, direccion, id_ciudad, fecha_nacimiento, verificado)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [userId, documento, id_tipo_documento, telefono, direccion, id_ciudad, fechaNacimiento, false]
                );

                ConsoleUtils.success('¡Perfil de apostador creado!');
            }

            console.log();
            return true;

        } catch (error: any) {
            console.log();
            ConsoleUtils.error('Error al registrar usuario: ' + error.message);
            ConsoleUtils.pause();
            return false;
        }
    }

    /**
     * Login
     */
    private static async login(): Promise<any> {
        let attempts = 0;
        const MAX_ATTEMPTS = 3;

        while (attempts < MAX_ATTEMPTS) {
            ConsoleUtils.showHeader('Inicio de Sesión');
            console.log();
            
            const username = ConsoleUtils.input('Usuario');
            const password = ConsoleUtils.input('Contraseña');

            try {
                const user = await AuthService.login(username, password);
                
                if (user) {
                    return user;
                } else {
                    attempts++;
                    ConsoleUtils.error(`Credenciales incorrectas. Intento ${attempts}/${MAX_ATTEMPTS}`);
                    
                    if (attempts < MAX_ATTEMPTS) {
                        const retry = ConsoleUtils.confirm('¿Deseas intentar nuevamente?');
                        if (!retry) {
                            return null;
                        }
                    }
                }
            } catch (error: any) {
                ConsoleUtils.error('Error al iniciar sesión: ' + error.message);
                attempts++;
                
                if (attempts < MAX_ATTEMPTS) {
                    const retry = ConsoleUtils.confirm('¿Deseas intentar nuevamente?');
                    if (!retry) {
                        return null;
                    }
                }
            }
        }

        ConsoleUtils.error('Máximo de intentos alcanzado');
        ConsoleUtils.pause();
        return null;
    }

    /**
     * Menú principal
     */
    private static async mainMenu(): Promise<void> {
        let exit = false;

        while (!exit) {
            const user = AuthService.getCurrentUser();
            
            if (!user) {
                break;
            }

            const options = [
                'Gestión de Apostadores',
                'Gestión de Partidos',
                'Gestión de Apuestas',
                'Transacciones',
                'Reportes',
                'Catálogos del Sistema',
                'Cerrar Sesión',
                'Salir'
            ];

            const choice = ConsoleUtils.showMenu('Menú Principal', options);

            switch (choice) {
                case 1:
                    await ApostadorController.menu();
                    break;
                case 2:
                    await PartidoController.menu();
                    break;
                case 3:
                    await ApuestaController.menu();
                    break;
                case 4:
                    await TransaccionController.menu();
                    break;
                case 5:
                    await ReportController.menu();
                    break;
                case 6:
                    await CatalogoController.menu();
                    break;
                case 7:
                    AuthService.logout();
                    ConsoleUtils.success('Sesión cerrada');
                    ConsoleUtils.pause();
                    await this.start();
                    return;
                case 8:
                    exit = true;
                    break;
            }
        }

        ConsoleUtils.info('Gracias por usar SportWin');
    }
}
