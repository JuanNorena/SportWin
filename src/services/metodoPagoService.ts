import db from '../utils/database';
import { MetodoPago } from '../models';

/**
 * Servicio CRUD para Métodos de Pago
 * Estructura real de la tabla: id_metodo_pago, nombre, descripcion, comision, activo
 */
export class MetodoPagoService {
    /**
     * Obtener todos los métodos de pago activos
     */
    public static async getAll(): Promise<MetodoPago[]> {
        const result = await db.query<MetodoPago>(
            'SELECT * FROM MetodoPago WHERE activo = true ORDER BY nombre'
        );
        return result.rows;
    }

    /**
     * Obtener método de pago por ID
     */
    public static async getById(id: number): Promise<MetodoPago | null> {
        const result = await db.query<MetodoPago>(
            'SELECT * FROM MetodoPago WHERE id_metodo_pago = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Crear nuevo método de pago
     */
    public static async create(data: Partial<MetodoPago>): Promise<number> {
        const result = await db.query(
            `INSERT INTO MetodoPago 
             (nombre, descripcion, comision, activo)
             VALUES ($1, $2, $3, $4)
             RETURNING id_metodo_pago`,
            [
                data.nombre,
                data.descripcion,
                data.comision ?? 0,
                data.activo ?? true
            ]
        );
        return result.rows[0].id_metodo_pago;
    }

    /**
     * Actualizar método de pago
     */
    public static async update(id: number, data: Partial<MetodoPago>): Promise<boolean> {
        const result = await db.query(
            `UPDATE MetodoPago 
             SET nombre = COALESCE($1, nombre),
                 descripcion = COALESCE($2, descripcion),
                 comision = COALESCE($3, comision),
                 activo = COALESCE($4, activo)
             WHERE id_metodo_pago = $5`,
            [
                data.nombre,
                data.descripcion,
                data.comision,
                data.activo,
                id
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar método de pago (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE MetodoPago SET activo = false WHERE id_metodo_pago = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar método de pago (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM MetodoPago WHERE id_metodo_pago = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Calcular comisión
     */
    public static async calcularComision(idMetodoPago: number, monto: number): Promise<number> {
        const metodo = await this.getById(idMetodoPago);
        if (!metodo) {
            throw new Error('Método de pago no encontrado');
        }
        // La comisión está guardada como porcentaje decimal (ej: 2.50 para 2.5%)
        return monto * ((metodo.comision || 0) / 100);
    }
}
