import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Database } from '../utils/database';

// Importar routers
import authRouter from './routes/authRoutes';
import apostadorRouter from './routes/apostadorRoutes';
import partidoRouter from './routes/partidoRoutes';
import cuotaRouter from './routes/cuotaRoutes';
import apuestaRouter from './routes/apuestaRoutes';
import transaccionRouter from './routes/transaccionRoutes';
import catalogoRouter from './routes/catalogoRoutes';
import reportRouter from './routes/reportRoutes';

/**
 * Servidor API REST para SportWin
 */
export class APIServer {
    private app: Application;
    private port: number;

    constructor(port: number = 3000) {
        this.app = express();
        this.port = port;
        this.configureMiddleware();
        this.configureRoutes();
        this.configureErrorHandling();
    }

    /**
     * Configurar middleware
     */
    private configureMiddleware(): void {
        // CORS - permitir peticiones desde el frontend
        this.app.use(cors({
            origin: 'http://localhost:5173', // URL del frontend Vite
            credentials: true
        }));

        // Parser JSON
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Logger simple
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Configurar rutas
     */
    private configureRoutes(): void {
        // Ruta de prueba
        this.app.get('/', (req: Request, res: Response) => {
            res.json({
                message: 'API SportWin',
                version: '1.0.0',
                endpoints: {
                    auth: '/api/auth',
                    apostadores: '/api/apostadores',
                    partidos: '/api/partidos',
                    cuotas: '/api/cuotas',
                    apuestas: '/api/apuestas',
                    transacciones: '/api/transacciones',
                    catalogos: '/api/catalogos',
                    reportes: '/api/reportes'
                }
            });
        });

        // Configurar routers
        this.app.use('/api/auth', authRouter);
        this.app.use('/api/apostadores', apostadorRouter);
        this.app.use('/api/partidos', partidoRouter);
        this.app.use('/api/cuotas', cuotaRouter);
        this.app.use('/api/apuestas', apuestaRouter);
        this.app.use('/api/transacciones', transaccionRouter);
        this.app.use('/api/catalogos', catalogoRouter);
        this.app.use('/api/reportes', reportRouter);
    }

    /**
     * Configurar manejo de errores
     */
    private configureErrorHandling(): void {
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Error:', err);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: err.message
            });
        });
    }

    /**
     * Iniciar servidor
     */
    public async start(): Promise<void> {
        try {
            // Inicializar base de datos
            const db = Database.getInstance();
            await db.initialize();
            console.log('✓ Conexión a base de datos establecida');

            // Iniciar servidor
            this.app.listen(this.port, () => {
                console.log('');
                console.log('================================================');
                console.log('  SPORTWIN API REST');
                console.log('================================================');
                console.log(`  Puerto: ${this.port}`);
                console.log(`  URL: http://localhost:${this.port}`);
                console.log('================================================');
                console.log('');
            });
        } catch (error) {
            console.error('Error al iniciar servidor:', error);
            process.exit(1);
        }
    }

    /**
     * Obtener instancia de Express
     */
    public getApp(): Application {
        return this.app;
    }
}

// Crear y exportar instancia del servidor
export default APIServer;
