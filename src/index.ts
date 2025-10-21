import { MainController } from './controllers/mainController';
import { Database } from './utils/database';

/**
 * Punto de entrada de la aplicación SportWin
 */
async function main() {
    try {
        console.log('');
        console.log('================================================');
        console.log('  SPORTWIN - Sistema de Apuestas Deportivas');
        console.log('================================================');
        console.log('');
        
        // Inicializar conexión a base de datos
        const db = Database.getInstance();
        await db.initialize();
        
        console.log('');

        // Iniciar aplicación
        await MainController.start();

        // Cerrar conexión
        await db.close();
        
        console.log('');
        console.log('¡Hasta pronto!');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('Error fatal en la aplicación:', error);
        console.error('');
        process.exit(1);
    }
}

// Ejecutar aplicación
main();
