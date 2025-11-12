import db from '../utils/database';
import { Apuesta, ApuestaDetallada, Cuota } from '../models';

/**
 * Servicio CRUD para Apuestas
 */
export class ApuestaService {
    /**
     * Obtener ID de estado por código
     */
    private static async getEstadoId(codigo: string, entidad: string = 'APUESTA'): Promise<number> {
        const result = await db.query(
            'SELECT id_estado FROM Estado WHERE codigo = $1 AND entidad = $2',
            [codigo, entidad]
        );
        if (result.rows.length === 0) {
            throw new Error(`Estado no encontrado: ${codigo}`);
        }
        return result.rows[0].id_estado;
    }

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

            // Verificar que el partido no haya comenzado (buscar estado PROGRAMADO)
            const partidoResult = await client.query(
                `SELECT p.id_estado, e.codigo 
                 FROM Partido p
                 JOIN Estado e ON p.id_estado = e.id_estado
                 WHERE p.id_partido = $1`,
                [cuota.id_partido]
            );

            if (partidoResult.rows[0]?.codigo !== 'PROGRAMADO') {
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

            // Obtener ID del estado PENDIENTE para apuesta
            const idEstadoPendiente = await this.getEstadoId('PENDIENTE', 'APUESTA');
            const idEstadoCompletada = await this.getEstadoId('COMPLETADA', 'TRANSACCION');
            const idTipoApuesta = await client.query(
                'SELECT id_tipo_transaccion FROM TipoTransaccion WHERE codigo = $1',
                ['APUESTA']
            );

            // Crear la apuesta
            const apuestaResult = await client.query(
                `INSERT INTO Apuesta 
                 (id_apostador, id_cuota, monto_apostado, cuota_aplicada, ganancia_potencial, id_estado)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id_apuesta`,
                [idApostador, idCuota, montoApostado, cuota.valor_cuota, montoApostado * cuota.valor_cuota, idEstadoPendiente]
            );

            const idApuesta = apuestaResult.rows[0].id_apuesta;

            // Registrar transacción de apuesta
            await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_apuesta, id_tipo_transaccion, monto, comision, monto_neto, id_estado, descripcion)
                 VALUES ($1, $2, $3, $4, 0, $4, $5, 'Apuesta realizada')`,
                [idApostador, idApuesta, idTipoApuesta.rows[0].id_tipo_transaccion, montoApostado, idEstadoCompletada]
            );

            // ✅ ACTUALIZAR EL SALDO DEL APOSTADOR (restar el monto apostado)
            await client.query(
                'UPDATE Apostador SET saldo_actual = saldo_actual - $1 WHERE id_apostador = $2',
                [montoApostado, idApostador]
            );

            console.log('✅ Apuesta creada:', {
                id_apuesta: idApuesta,
                id_apostador: idApostador,
                monto_apostado: montoApostado,
                cuota_aplicada: cuota.valor_cuota,
                ganancia_potencial: montoApostado * cuota.valor_cuota
            });

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
    public static async getByEstado(codigoEstado: string): Promise<Apuesta[]> {
        const result = await db.query<Apuesta>(
            `SELECT a.* FROM Apuesta a
             JOIN Estado e ON a.id_estado = e.id_estado
             WHERE e.codigo = $1 AND e.entidad = 'APUESTA'
             ORDER BY a.fecha_apuesta DESC`,
            [codigoEstado]
        );
        return result.rows;
    }

    /**
     * Obtener apuestas pendientes
     */
    public static async getPendientes(): Promise<ApuestaDetallada[]> {
        const result = await db.query<ApuestaDetallada>(
            `SELECT * FROM vista_apuestas_detalladas 
             WHERE estado = 'Pendiente'
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
                `SELECT a.* FROM Apuesta a
                 JOIN Estado e ON a.id_estado = e.id_estado
                 WHERE a.id_apuesta = $1 AND e.codigo = 'PENDIENTE' AND e.entidad = 'APUESTA'`,
                [id]
            );

            if (apuestaResult.rows.length === 0) {
                throw new Error('Apuesta no encontrada o ya resuelta');
            }

            const apuesta = apuestaResult.rows[0];
            const gananciaReal = ganada ? apuesta.ganancia_potencial : 0;
            
            // Obtener ID del estado correspondiente
            const idEstado = await this.getEstadoId(ganada ? 'GANADA' : 'PERDIDA', 'APUESTA');
            const idEstadoCompletada = await this.getEstadoId('COMPLETADA', 'TRANSACCION');
            const idTipoGanancia = await client.query(
                'SELECT id_tipo_transaccion FROM TipoTransaccion WHERE codigo = $1',
                ['GANANCIA']
            );

            // Actualizar apuesta
            await client.query(
                `UPDATE Apuesta 
                 SET id_estado = $1, ganancia_real = $2, fecha_resolucion = CURRENT_TIMESTAMP 
                 WHERE id_apuesta = $3`,
                [idEstado, gananciaReal, id]
            );

            // Si ganó, registrar transacción de ganancia
            if (ganada) {
                await client.query(
                    `INSERT INTO Transaccion 
                     (id_apostador, id_apuesta, id_tipo_transaccion, monto, comision, monto_neto, id_estado, descripcion)
                     VALUES ($1, $2, $3, $4, 0, $4, $5, 'Ganancia de apuesta')`,
                    [apuesta.id_apostador, id, idTipoGanancia.rows[0].id_tipo_transaccion, gananciaReal, idEstadoCompletada]
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
                `SELECT a.* FROM Apuesta a
                 JOIN Estado e ON a.id_estado = e.id_estado
                 WHERE a.id_apuesta = $1 AND e.codigo = 'PENDIENTE' AND e.entidad = 'APUESTA'`,
                [id]
            );

            if (apuestaResult.rows.length === 0) {
                throw new Error('Apuesta no encontrada o ya resuelta');
            }

            const apuesta = apuestaResult.rows[0];

            // Obtener IDs de estado
            const idEstadoCancelada = await this.getEstadoId('CANCELADA', 'APUESTA');
            const idEstadoCompletada = await this.getEstadoId('COMPLETADA', 'TRANSACCION');
            const idTipoReembolso = await client.query(
                'SELECT id_tipo_transaccion FROM TipoTransaccion WHERE codigo = $1',
                ['REEMBOLSO']
            );

            // Actualizar apuesta
            await client.query(
                `UPDATE Apuesta 
                 SET id_estado = $1, fecha_resolucion = CURRENT_TIMESTAMP 
                 WHERE id_apuesta = $2`,
                [idEstadoCancelada, id]
            );

            // Registrar reembolso
            await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_apuesta, id_tipo_transaccion, monto, comision, monto_neto, id_estado, descripcion)
                 VALUES ($1, $2, $3, $4, 0, $4, $5, 'Reembolso de apuesta cancelada')`,
                [apuesta.id_apostador, id, idTipoReembolso.rows[0].id_tipo_transaccion, apuesta.monto_apostado, idEstadoCompletada]
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
                COUNT(CASE WHEN e.codigo = 'GANADA' THEN 1 END) as apuestas_ganadas,
                COUNT(CASE WHEN e.codigo = 'PERDIDA' THEN 1 END) as apuestas_perdidas,
                COUNT(CASE WHEN e.codigo = 'PENDIENTE' THEN 1 END) as apuestas_pendientes,
                SUM(a.monto_apostado) as total_apostado,
                SUM(CASE WHEN e.codigo = 'GANADA' THEN a.ganancia_real ELSE 0 END) as total_ganado,
                SUM(CASE WHEN e.codigo = 'PERDIDA' THEN a.monto_apostado ELSE 0 END) as total_perdido
             FROM Apuesta a
             JOIN Estado e ON a.id_estado = e.id_estado
             WHERE a.id_apostador = $1 AND e.entidad = 'APUESTA'`,
            [idApostador]
        );
        return result.rows[0];
    }
}
