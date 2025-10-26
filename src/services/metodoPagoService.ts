import db from '../utils/database';
import { MetodoPago } from '../models';

/**
 * Servicio CRUD para Métodos de Pago
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
     * Obtener método de pago por código
     */
    public static async getByCodigo(codigo: string): Promise<MetodoPago | null> {
        const result = await db.query<MetodoPago>(
            'SELECT * FROM MetodoPago WHERE codigo = $1',
            [codigo]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener métodos de pago por tipo (DEPOSITO, RETIRO, AMBOS)
     */
    public static async getByTipo(tipo: string): Promise<MetodoPago[]> {
        const result = await db.query<MetodoPago>(
            `SELECT * FROM MetodoPago 
             WHERE (tipo_operacion = $1 OR tipo_operacion = 'AMBOS') 
             AND activo = true 
             ORDER BY nombre`,
            [tipo]
        );
        return result.rows;
    }

    /**
     * Obtener métodos de pago para depósitos
     */
    public static async getParaDepositos(): Promise<MetodoPago[]> {
        return this.getByTipo('DEPOSITO');
    }

    /**
     * Obtener métodos de pago para retiros
     */
    public static async getParaRetiros(): Promise<MetodoPago[]> {
        return this.getByTipo('RETIRO');
    }

    /**
     * Crear nuevo método de pago
     */
    public static async create(data: Partial<MetodoPago>): Promise<number> {
        const result = await db.query(
            `INSERT INTO MetodoPago 
             (codigo, nombre, descripcion, comision_porcentaje, tipo_operacion, activo)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_metodo_pago`,
            [
                data.codigo,
                data.nombre,
                data.descripcion,
                data.comision_porcentaje ?? 0,
                data.tipo_operacion ?? 'AMBOS',
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
             SET codigo = COALESCE($1, codigo),
                 nombre = COALESCE($2, nombre),
                 descripcion = COALESCE($3, descripcion),
                 comision_porcentaje = COALESCE($4, comision_porcentaje),
                 tipo_operacion = COALESCE($5, tipo_operacion),
                 activo = COALESCE($6, activo)
             WHERE id_metodo_pago = $7`,
            [
                data.codigo,
                data.nombre,
                data.descripcion,
                data.comision_porcentaje,
                data.tipo_operacion,
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
        return monto * ((metodo.comision_porcentaje || 0) / 100);
    }
}
