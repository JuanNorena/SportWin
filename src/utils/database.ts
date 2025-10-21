import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del Pool de Conexiones a PostgreSQL
 */
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'SportWin',
    max: 20, // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Clase para manejar la conexión a la base de datos
 */
export class Database {
    private static instance: Database;
    private connected: boolean = false;

    private constructor() {
        // No hacer nada en el constructor
    }

    /**
     * Patrón Singleton - Obtener instancia única
     */
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Inicializar y probar conexión a la base de datos
     */
    public async initialize(): Promise<void> {
        if (this.connected) {
            return;
        }
        
        try {
            const client = await pool.connect();
            console.log('✓ Conexión exitosa a PostgreSQL');
            console.log(`✓ Base de datos: ${process.env.DB_NAME}`);
            client.release();
            this.connected = true;
        } catch (error) {
            console.error('Error al conectar a PostgreSQL:', error);
            throw error;
        }
    }

    /**
     * Ejecutar una consulta SQL
     */
    public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const start = Date.now();
        try {
            const result = await pool.query<T>(text, params);
            const duration = Date.now() - start;
            
            if (process.env.NODE_ENV === 'development') {
                console.log(`Query ejecutado en ${duration}ms`);
            }
            
            return result;
        } catch (error) {
            console.error('Error en query:', error);
            throw error;
        }
    }

    /**
     * Obtener un cliente del pool para transacciones
     */
    public async getClient(): Promise<PoolClient> {
        return await pool.connect();
    }

    /**
     * Ejecutar una transacción
     */
    public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Cerrar todas las conexiones
     */
    public async close(): Promise<void> {
        await pool.end();
        console.log('Pool de conexiones cerrado');
    }
}

export default Database.getInstance();
