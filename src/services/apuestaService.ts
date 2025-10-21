import db from '../utils/database';
import { Apuesta, ApuestaDetallada, Cuota } from '../models';

/**
 * Servicio CRUD para Apuestas
 */
export class ApuestaService {
    /**
     * Crear nueva apuesta
     */
    public static async create(
        idApostador: number,
        idCuota: number,
        montoApostado: number
    ): Promise<number> {
        return await db.transaction(async (client) => {
            // Obtener la cuota actual
            const cuotaResult = await client.query<Cuota>(
                'SELECT * FROM Cuota WHERE id_cuota = $1 AND activo = true',
                [idCuota]
            );

            if (cuotaResult.rows.length === 0) {
                throw new Error('Cuota no válida o inactiva');
            }

            const cuota = cuotaResult.rows[0];

            // Verificar que el partido no haya comenzado
            const partidoResult = await client.query(
                'SELECT estado FROM Partido WHERE id_partido = $1',
                [cuota.id_partido]
            );

            if (partidoResult.rows[0]?.estado !== 'programado') {
                throw new Error('El partido ya no acepta apuestas');
            }

            // Verificar saldo del apostador
            const saldoResult = await client.query(
                'SELECT saldo_actual FROM Apostador WHERE id_apostador = $1',
                [idApostador]
            );

            const saldoActual = saldoResult.rows[0]?.saldo_actual || 0;

            if (saldoActual < montoApostado) {
                throw new Error('Saldo insuficiente');
            }

            // Crear la apuesta
            const apuestaResult = await client.query(
                `INSERT INTO Apuesta 
                 (id_apostador, id_cuota, monto_apostado, cuota_aplicada, ganancia_potencial, estado)
                 VALUES ($1, $2, $3, $4, $5, 'pendiente')
                 RETURNING id_apuesta`,
                [idApostador, idCuota, montoApostado, cuota.valor_cuota, montoApostado * cuota.valor_cuota]
            );

            const idApuesta = apuestaResult.rows[0].id_apuesta;

            // Registrar transacción de apuesta
            await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_apuesta, tipo, monto, comision, monto_neto, estado, descripcion)
                 VALUES ($1, $2, 'apuesta', $3, 0, $3, 'completada', 'Apuesta realizada')`,
                [idApostador, idApuesta, montoApostado]
            );

            return idApuesta;
        });
    }

    /**
     * Obtener todas las apuestas
     */
    public static async getAll(): Promise<Apuesta[]> {
        const result = await db.query<Apuesta>(
            'SELECT * FROM Apuesta ORDER BY fecha_apuesta DESC'
        );
        return result.rows;
    }

    /**
     * Obtener apuestas detalladas
     */
    public static async getAllDetailed(): Promise<ApuestaDetallada[]> {
        const result = await db.query<ApuestaDetallada>(
            'SELECT * FROM vista_apuestas_detalladas ORDER BY fecha_apuesta DESC'
        );
        return result.rows;
    }

    /**
     * Obtener apuesta por ID
     */
    public static async getById(id: number): Promise<Apuesta | null> {
        const result = await db.query<Apuesta>(
            'SELECT * FROM Apuesta WHERE id_apuesta = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener apuestas por apostador
     */
    public static async getByApostador(idApostador: number): Promise<ApuestaDetallada[]> {
        const result = await db.query<ApuestaDetallada>(
            `SELECT * FROM vista_apuestas_detalladas 
             WHERE apostador = (SELECT username FROM Usuario u 
                               JOIN Apostador a ON u.id_usuario = a.id_usuario 
                               WHERE a.id_apostador = $1)
             ORDER BY fecha_apuesta DESC`,
            [idApostador]
        );
        return result.rows;
    }

    /**
     * Obtener apuestas por estado
     */
    public static async getByEstado(estado: string): Promise<Apuesta[]> {
        const result = await db.query<Apuesta>(
            'SELECT * FROM Apuesta WHERE estado = $1 ORDER BY fecha_apuesta DESC',
            [estado]
        );
        return result.rows;
    }

    /**
     * Obtener apuestas pendientes
     */
    public static async getPendientes(): Promise<ApuestaDetallada[]> {
        const result = await db.query<ApuestaDetallada>(
            `SELECT * FROM vista_apuestas_detalladas 
             WHERE estado = 'pendiente'
             ORDER BY fecha_apuesta DESC`
        );
        return result.rows;
    }

    /**
     * Resolver apuesta (marcar como ganada o perdida)
     */
    public static async resolver(id: number, ganada: boolean): Promise<boolean> {
        return await db.transaction(async (client) => {
            // Obtener información de la apuesta
            const apuestaResult = await client.query<Apuesta>(
                'SELECT * FROM Apuesta WHERE id_apuesta = $1 AND estado = \'pendiente\'',
                [id]
            );

            if (apuestaResult.rows.length === 0) {
                throw new Error('Apuesta no encontrada o ya resuelta');
            }

            const apuesta = apuestaResult.rows[0];
            const nuevoEstado = ganada ? 'ganada' : 'perdida';
            const gananciaReal = ganada ? apuesta.ganancia_potencial : 0;

            // Actualizar apuesta
            await client.query(
                `UPDATE Apuesta 
                 SET estado = $1, ganancia_real = $2, fecha_resolucion = CURRENT_TIMESTAMP 
                 WHERE id_apuesta = $3`,
                [nuevoEstado, gananciaReal, id]
            );

            // Si ganó, registrar transacción de ganancia
            if (ganada) {
                await client.query(
                    `INSERT INTO Transaccion 
                     (id_apostador, id_apuesta, tipo, monto, comision, monto_neto, estado, descripcion)
                     VALUES ($1, $2, 'ganancia', $3, 0, $3, 'completada', 'Ganancia de apuesta')`,
                    [apuesta.id_apostador, id, gananciaReal]
                );
            }

            return true;
        });
    }

    /**
     * Cancelar apuesta
     */
    public static async cancelar(id: number): Promise<boolean> {
        return await db.transaction(async (client) => {
            // Obtener información de la apuesta
            const apuestaResult = await client.query<Apuesta>(
                'SELECT * FROM Apuesta WHERE id_apuesta = $1 AND estado = \'pendiente\'',
                [id]
            );

            if (apuestaResult.rows.length === 0) {
                throw new Error('Apuesta no encontrada o ya resuelta');
            }

            const apuesta = apuestaResult.rows[0];

            // Actualizar apuesta
            await client.query(
                `UPDATE Apuesta 
                 SET estado = 'cancelada', fecha_resolucion = CURRENT_TIMESTAMP 
                 WHERE id_apuesta = $1`,
                [id]
            );

            // Registrar reembolso
            await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_apuesta, tipo, monto, comision, monto_neto, estado, descripcion)
                 VALUES ($1, $2, 'reembolso', $3, 0, $3, 'completada', 'Reembolso de apuesta cancelada')`,
                [apuesta.id_apostador, id, apuesta.monto_apostado]
            );

            return true;
        });
    }

    /**
     * Obtener estadísticas de apuestas por apostador
     */
    public static async getEstadisticas(idApostador: number): Promise<any> {
        const result = await db.query(
            `SELECT 
                COUNT(*) as total_apuestas,
                COUNT(CASE WHEN estado = 'ganada' THEN 1 END) as apuestas_ganadas,
                COUNT(CASE WHEN estado = 'perdida' THEN 1 END) as apuestas_perdidas,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as apuestas_pendientes,
                SUM(monto_apostado) as total_apostado,
                SUM(CASE WHEN estado = 'ganada' THEN ganancia_real ELSE 0 END) as total_ganado,
                SUM(CASE WHEN estado = 'perdida' THEN monto_apostado ELSE 0 END) as total_perdido
             FROM Apuesta
             WHERE id_apostador = $1`,
            [idApostador]
        );
        return result.rows[0];
    }
}
