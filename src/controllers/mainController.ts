import { ConsoleUtils } from '../utils/console';
import { AuthService } from '../services/authService';
import { ApostadorController } from './apostadorController';
import { PartidoController } from './partidoController';
import { ApuestaController } from './apuestaController';
import { TransaccionController } from './transaccionController';
import { ReportController } from './reportController';

/**
 * Controlador Principal de la Aplicación
 */
export class MainController {
    /**
     * Iniciar aplicación
     */
    public static async start(): Promise<void> {
        ConsoleUtils.showHeader('SPORTWIN - Sistema de Apuestas Deportivas');
        ConsoleUtils.info('Bienvenido al sistema');
        console.log();

        // Login obligatorio
        const user = await this.login();
        
        if (!user) {
            ConsoleUtils.error('No se pudo iniciar sesión');
            return;
        }

        ConsoleUtils.success(`Bienvenido ${user.nombre} ${user.apellido} (${user.rol})`);
        ConsoleUtils.pause();

        // Menú principal
        await this.mainMenu();
    }

    /**
     * Login
     */
    private static async login(): Promise<any> {
        let attempts = 0;
        const MAX_ATTEMPTS = 3;

        while (attempts < MAX_ATTEMPTS) {
            ConsoleUtils.showHeader('Inicio de Sesión');
            
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
                        ConsoleUtils.pause();
                    }
                }
            } catch (error) {
                ConsoleUtils.error('Error al iniciar sesión');
                attempts++;
            }
        }

        ConsoleUtils.error('Máximo de intentos alcanzado');
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
                    AuthService.logout();
                    ConsoleUtils.success('Sesión cerrada');
                    ConsoleUtils.pause();
                    await this.start();
                    return;
                case 7:
                    exit = true;
                    break;
            }
        }

        ConsoleUtils.info('Gracias por usar SportWin');
    }
}
