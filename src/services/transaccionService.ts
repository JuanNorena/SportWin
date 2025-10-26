import db from '../utils/database';
import { Transaccion } from '../models';

/**
 * Servicio CRUD para Transacciones
 */
export class TransaccionService {
    /**
     * Obtener ID de tipo de transacción por código
     */
    private static async getTipoTransaccionId(codigo: string): Promise<number> {
        const result = await db.query(
            'SELECT id_tipo_transaccion FROM TipoTransaccion WHERE codigo = $1',
            [codigo]
        );
        if (result.rows.length === 0) {
            throw new Error(`Tipo de transacción no encontrado: ${codigo}`);
        }
        return result.rows[0].id_tipo_transaccion;
    }

    /**
     * Obtener ID de estado por código
     */
    private static async getEstadoId(codigo: string, entidad: string = 'TRANSACCION'): Promise<number> {
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
     * Crear depósito
     */
    public static async createDeposito(
        idApostador: number,
        idMetodoPago: number,
        monto: number,
        referencia?: string
    ): Promise<number> {
        return await db.transaction(async (client) => {
            // Obtener comisión del método de pago
            const metodoPagoResult = await client.query(
                'SELECT comision FROM MetodoPago WHERE id_metodo_pago = $1 AND activo = true',
                [idMetodoPago]
            );

            if (metodoPagoResult.rows.length === 0) {
                throw new Error('Método de pago no válido');
            }

            const comision = (monto * metodoPagoResult.rows[0].comision) / 100;
            const montoNeto = monto - comision;

            // Obtener IDs necesarios
            const idTipoDeposito = await this.getTipoTransaccionId('DEPOSITO');
            const idEstadoCompletada = await this.getEstadoId('COMPLETADA');

            // Crear transacción
            const result = await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_metodo_pago, id_tipo_transaccion, monto, comision, monto_neto, id_estado, referencia, descripcion)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Depósito a cuenta')
                 RETURNING id_transaccion`,
                [idApostador, idMetodoPago, idTipoDeposito, monto, comision, montoNeto, idEstadoCompletada, referencia]
            );

            return result.rows[0].id_transaccion;
        });
    }

    /**
     * Crear retiro
     */
    public static async createRetiro(
        idApostador: number,
        idMetodoPago: number,
        monto: number,
        referencia?: string
    ): Promise<number> {
        return await db.transaction(async (client) => {
            // Verificar saldo
            const saldoResult = await client.query(
                'SELECT saldo_actual FROM Apostador WHERE id_apostador = $1',
                [idApostador]
            );

            const saldoActual = saldoResult.rows[0]?.saldo_actual || 0;

            // Obtener comisión
            const metodoPagoResult = await client.query(
                'SELECT comision FROM MetodoPago WHERE id_metodo_pago = $1 AND activo = true',
                [idMetodoPago]
            );

            if (metodoPagoResult.rows.length === 0) {
                throw new Error('Método de pago no válido');
            }

            const comision = (monto * metodoPagoResult.rows[0].comision) / 100;
            const montoNeto = monto + comision;

            if (saldoActual < montoNeto) {
                throw new Error('Saldo insuficiente para el retiro');
            }

            // Obtener IDs necesarios
            const idTipoRetiro = await this.getTipoTransaccionId('RETIRO');
            const idEstadoCompletada = await this.getEstadoId('COMPLETADA');

            // Crear transacción
            const result = await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_metodo_pago, id_tipo_transaccion, monto, comision, monto_neto, id_estado, referencia, descripcion)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Retiro de fondos')
                 RETURNING id_transaccion`,
                [idApostador, idMetodoPago, idTipoRetiro, monto, comision, montoNeto, idEstadoCompletada, referencia]
            );

            return result.rows[0].id_transaccion;
        });
    }

    /**
     * Obtener todas las transacciones
     */
    public static async getAll(): Promise<Transaccion[]> {
        const result = await db.query<Transaccion>(
            'SELECT * FROM Transaccion ORDER BY fecha_transaccion DESC'
        );
        return result.rows;
    }

    /**
     * Obtener transacción por ID
     */
    public static async getById(id: number): Promise<Transaccion | null> {
        const result = await db.query<Transaccion>(
            'SELECT * FROM Transaccion WHERE id_transaccion = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener transacciones por apostador
     */
    public static async getByApostador(idApostador: number): Promise<Transaccion[]> {
        const result = await db.query<Transaccion>(
            'SELECT * FROM Transaccion WHERE id_apostador = $1 ORDER BY fecha_transaccion DESC',
            [idApostador]
        );
        return result.rows;
    }

    /**
     * Obtener transacciones por tipo
     */
    public static async getByTipo(codigoTipo: string): Promise<Transaccion[]> {
        const result = await db.query<Transaccion>(
            `SELECT t.* FROM Transaccion t
             JOIN TipoTransaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
             WHERE tt.codigo = $1
             ORDER BY t.fecha_transaccion DESC`,
            [codigoTipo]
        );
        return result.rows;
    }

    /**
     * Obtener historial financiero del apostador
     */
    public static async getHistorialFinanciero(idApostador: number): Promise<any> {
        const result = await db.query(
            `SELECT 
                SUM(CASE WHEN tt.codigo = 'DEPOSITO' THEN t.monto_neto ELSE 0 END) as total_depositos,
                SUM(CASE WHEN tt.codigo = 'RETIRO' THEN t.monto_neto ELSE 0 END) as total_retiros,
                SUM(CASE WHEN tt.codigo = 'APUESTA' THEN t.monto_neto ELSE 0 END) as total_apostado,
                SUM(CASE WHEN tt.codigo = 'GANANCIA' THEN t.monto_neto ELSE 0 END) as total_ganancias,
                COUNT(*) as total_transacciones
             FROM Transaccion t
             JOIN TipoTransaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
             JOIN Estado e ON t.id_estado = e.id_estado
             WHERE t.id_apostador = $1 AND e.codigo = 'COMPLETADA' AND e.entidad = 'TRANSACCION'`,
            [idApostador]
        );
        return result.rows[0];
    }
}
