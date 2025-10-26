import db from '../utils/database';
import { Apostador } from '../models';

/**
 * Servicio CRUD para Apostadores
 */
export class ApostadorService {
    /**
     * Crear nuevo apostador
     */
    public static async create(data: Partial<Apostador>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Apostador 
             (id_usuario, documento, id_tipo_documento, telefono, direccion, id_ciudad, fecha_nacimiento, verificado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id_apostador`,
            [
                data.id_usuario,
                data.documento,
                data.id_tipo_documento,
                data.telefono,
                data.direccion,
                data.id_ciudad,
                data.fecha_nacimiento,
                data.verificado || false
            ]
        );
        return result.rows[0].id_apostador;
    }

    /**
     * Obtener todos los apostadores
     */
    public static async getAll(): Promise<Apostador[]> {
        const result = await db.query<Apostador>(
            `SELECT * FROM Apostador ORDER BY fecha_registro DESC`
        );
        return result.rows;
    }

    /**
     * Obtener apostador por ID
     */
    public static async getById(id: number): Promise<Apostador | null> {
        const result = await db.query<Apostador>(
            'SELECT * FROM Apostador WHERE id_apostador = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener apostador por documento
     */
    public static async getByDocumento(documento: string): Promise<Apostador | null> {
        const result = await db.query<Apostador>(
            'SELECT * FROM Apostador WHERE documento = $1',
            [documento]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener apostador por ID de usuario
     */
    public static async getByUserId(userId: number): Promise<Apostador | null> {
        const result = await db.query<Apostador>(
            'SELECT * FROM Apostador WHERE id_usuario = $1',
            [userId]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Actualizar apostador
     */
    public static async update(id: number, data: Partial<Apostador>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.telefono !== undefined) {
            fields.push(`telefono = $${paramIndex++}`);
            values.push(data.telefono);
        }
        if (data.direccion !== undefined) {
            fields.push(`direccion = $${paramIndex++}`);
            values.push(data.direccion);
        }
        if (data.id_ciudad !== undefined) {
            fields.push(`id_ciudad = $${paramIndex++}`);
            values.push(data.id_ciudad);
        }
        if (data.verificado !== undefined) {
            fields.push(`verificado = $${paramIndex++}`);
            values.push(data.verificado);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        const result = await db.query(
            `UPDATE Apostador SET ${fields.join(', ')} WHERE id_apostador = $${paramIndex}`,
            values
        );

        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar apostador
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Apostador WHERE id_apostador = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Obtener saldo del apostador
     */
    public static async getSaldo(id: number): Promise<number> {
        const result = await db.query(
            'SELECT saldo_actual FROM Apostador WHERE id_apostador = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0].saldo_actual : 0;
    }

    /**
     * Actualizar saldo (usado internamente por triggers)
     */
    public static async updateSaldo(id: number, nuevoSaldo: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Apostador SET saldo_actual = $1 WHERE id_apostador = $2',
            [nuevoSaldo, id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
