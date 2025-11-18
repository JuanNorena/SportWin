import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del Pool de Conexiones a PostgreSQL.
 *
 * Se instancia un `Pool` con la configuración leída desde variables de
 * entorno (`process.env`). Esto permite un manejo eficiente de conexiones en
 * producción y evita abrir/ cerrar conexiones por cada query.
 *
 * Notas:
 * - `max`: límite de conexiones concurrentes, ajustar según capacidad del DB.
 * - `idleTimeoutMillis`: tiempo que una conexión puede estar inactiva antes de
 *   cerrarla; ayuda a liberar recursos.
 * - `connectionTimeoutMillis`: tiempo máximo para establecer una conexión.
 */
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'sebas031800'),
    database: process.env.DB_NAME || 'SportWin',
    max: 20, // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Database
 *
 * Clase wrapper que implementa un patrón Singleton para gestionar un pool de
 * conexiones a PostgreSQL, ejecutar queries y manejar transacciones. Provee
 * métodos de conveniencia y seguridad para el uso del pool en la aplicación.
 *
 * Uso (resumen):
 * - Inicialización: llamar `await Database.getInstance().initialize()` al
 *   bootstrap de la aplicación para validar la conexión.
 * - Ejecutar query: llamar `await db.query('SELECT ...', [params])`.
 * - Transacciones: usar `db.transaction(async (client) => { ... })` donde
 *   `client` es `PoolClient` para ejecutar múltiples queries atómicos.
 *
 * Comportamiento:
 * - `initialize()` conecta y verifica la conexión una única vez por proceso.
 * - `query()` delega en `pool.query` y registra duración en NODE_ENV=development.
 * - `getClient()` devuelve un cliente para consultas con transacción.
 * - `transaction()` ejecuta la callback dentro de un BEGIN/COMMIT/ROLLBACK.
 */
export class Database {
    private static instance: Database;
    private connected: boolean = false;

    private constructor() {
        // El constructor es privado en el patrón Singleton. No inicializa el pool
        // ya que la creación del `pool` se hace en el módulo y `initialize` se
        // encarga de verificar la conexión.
    }

    /**
     * Patrón Singleton - Obtener instancia única.
     *
     * Devuelve la única instancia de `Database` en la ejecución del proceso.
     * Este patrón evita crear múltiples wrappers alrededor del mismo pool y
     * facilita el acceso centralizado al cliente de base de datos.
     *
     * @returns La instancia única de `Database`.
     *
     * Ejemplo:
     * ```ts
     * const db = Database.getInstance();
     * await db.initialize();
     * ```
     */
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Inicializar y probar conexión a la base de datos.
     *
     * Este método conecta con la base de datos (a través del pool) y hace una
     * pequeña verificación (conexión + release) para confirmar que las
     * credenciales y la red están correctas. Está diseñado para ser idempotente
     * (si ya se inicializó no ejecutará múltiples conexiones).
     *
     * Errores:
     * - Lanza la excepción emitida por `pg` si la conexión falla.
     *
     * Ejemplo:
     * ```ts
     * const db = Database.getInstance();
     * await db.initialize();
     * ```
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
     * Ejecutar una consulta SQL.
     *
     * @template T Tipo de resultado por fila, por defecto `any`.
     * @param text - Consulta SQL o query parametrizado (preferible usar
     *               placeholders `$1, $2, ...`).
     * @param params - Array de parámetros que sustituyen los placeholders en la query.
     *
     * @returns Promise<QueryResult<T>> objeto con `rows` y `fields`.
     *
     * Notas de rendimiento y seguridad:
     * - Use placeholders + `params` para prevenir inyección SQL.
     * - La función registra la duración de ejecución si `NODE_ENV === 'development'`.
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
     * Obtener un cliente del pool para transacciones.
     *
     * Se utiliza cuando se desea ejecutar múltiples consultas dentro de un
     * bloque `BEGIN/COMMIT/ROLLBACK` o cuando se necesita un control más fino
     * (por ejemplo, settting de `lock`s o ejecución de múltiples sentencias con
     * el mismo contexto de cliente).
     *
     * Ejemplo:
     * ```ts
     * const client = await db.getClient();
     * try {
     *   await client.query('BEGIN');
     *   await client.query('...');
     *   await client.query('COMMIT');
     * } catch (e) {
     *   await client.query('ROLLBACK');
     *   throw e;
     * } finally {
     *   client.release();
     * }
     * ```
     */
    public async getClient(): Promise<PoolClient> {
        return await pool.connect();
    }

    /**
     * Ejecutar una transacción.
     *
     * Este helper abstrae el patrón `BEGIN/COMMIT/ROLLBACK`: obtiene un cliente,
     * inicia la transacción, ejecuta la callback y ejecuta `COMMIT` o `ROLLBACK`
     * según corresponda. La callback recibe el `client` para ejecutar queries.
     *
     * @example
     * ```ts
     * await db.transaction(async (client) => {
     *   await client.query('INSERT INTO cuenta(... ) VALUES(...)');
     *   await client.query('UPDATE ...');
     * });
     * ```
     *
     * @param callback - Función asíncrona que recibe el `PoolClient`.
     * @returns El resultado devuelto por la callback.
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
     * Cerrar todas las conexiones del pool.
     *
     * Este método debe usarse para detener la aplicación y liberar recursos.
     * Llamar `close()` garantiza que el proceso no quedará con conexiones
     * abiertas a la base de datos.
     */
    public async close(): Promise<void> {
        await pool.end();
        console.log('Pool de conexiones cerrado');
    }
}

/**
 * Exportación por defecto de la instancia Singleton de Database.
 *
 * Nota: Aunque el objeto está exportado, es buena práctica llamar a
 * `await db.initialize()` antes de ejecutar consultas en el arranque de la app
 * para garantizar que la conectividad es correcta.
 */
export default Database.getInstance();
