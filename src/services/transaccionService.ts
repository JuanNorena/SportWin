import db from '../utils/database';
import { Transaccion } from '../models';

/**
 * Servicio CRUD para Transacciones
 */
export class TransaccionService {
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

            // Crear transacción
            const result = await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_metodo_pago, tipo, monto, comision, monto_neto, estado, referencia, descripcion)
                 VALUES ($1, $2, 'deposito', $3, $4, $5, 'completada', $6, 'Depósito a cuenta')
                 RETURNING id_transaccion`,
                [idApostador, idMetodoPago, monto, comision, montoNeto, referencia]
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

            // Crear transacción
            const result = await client.query(
                `INSERT INTO Transaccion 
                 (id_apostador, id_metodo_pago, tipo, monto, comision, monto_neto, estado, referencia, descripcion)
                 VALUES ($1, $2, 'retiro', $3, $4, $5, 'completada', $6, 'Retiro de fondos')
                 RETURNING id_transaccion`,
                [idApostador, idMetodoPago, monto, comision, montoNeto, referencia]
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
    public static async getByTipo(tipo: string): Promise<Transaccion[]> {
        const result = await db.query<Transaccion>(
            'SELECT * FROM Transaccion WHERE tipo = $1 ORDER BY fecha_transaccion DESC',
            [tipo]
        );
        return result.rows;
    }

    /**
     * Obtener historial financiero del apostador
     */
    public static async getHistorialFinanciero(idApostador: number): Promise<any> {
        const result = await db.query(
            `SELECT 
                SUM(CASE WHEN tipo = 'deposito' THEN monto_neto ELSE 0 END) as total_depositos,
                SUM(CASE WHEN tipo = 'retiro' THEN monto_neto ELSE 0 END) as total_retiros,
                SUM(CASE WHEN tipo = 'apuesta' THEN monto_neto ELSE 0 END) as total_apostado,
                SUM(CASE WHEN tipo = 'ganancia' THEN monto_neto ELSE 0 END) as total_ganancias,
                COUNT(*) as total_transacciones
             FROM Transaccion
             WHERE id_apostador = $1 AND estado = 'completada'`,
            [idApostador]
        );
        return result.rows[0];
    }
}
