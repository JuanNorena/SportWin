import db from '../utils/database';
import { TipoApuesta } from '../models';

/**
 * Servicio CRUD para Tipos de Apuesta
 */
export class TipoApuestaService {
    /**
     * Obtener todos los tipos de apuesta activos
     */
    public static async getAll(): Promise<TipoApuesta[]> {
        const result = await db.query<TipoApuesta>(
            'SELECT * FROM TipoApuesta WHERE activo = true ORDER BY nombre'
        );
        return result.rows;
    }

    /**
     * Obtener tipo de apuesta por ID
     */
    public static async getById(id: number): Promise<TipoApuesta | null> {
        const result = await db.query<TipoApuesta>(
            'SELECT * FROM TipoApuesta WHERE id_tipo_apuesta = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener tipo de apuesta por código
     */
    public static async getByCodigo(codigo: string): Promise<TipoApuesta | null> {
        const result = await db.query<TipoApuesta>(
            'SELECT * FROM TipoApuesta WHERE codigo = $1',
            [codigo]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener tipos de apuesta por categoría
     */
    public static async getByCategoria(categoria: string): Promise<TipoApuesta[]> {
        const result = await db.query<TipoApuesta>(
            'SELECT * FROM TipoApuesta WHERE categoria = $1 AND activo = true ORDER BY nombre',
            [categoria]
        );
        return result.rows;
    }

    /**
     * Crear nuevo tipo de apuesta
     */
    public static async create(data: Partial<TipoApuesta>): Promise<number> {
        const result = await db.query(
            `INSERT INTO TipoApuesta (codigo, nombre, descripcion, categoria, activo)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_tipo_apuesta`,
            [
                data.codigo,
                data.nombre,
                data.descripcion,
                data.categoria,
                data.activo ?? true
            ]
        );
        return result.rows[0].id_tipo_apuesta;
    }

    /**
     * Actualizar tipo de apuesta
     */
    public static async update(id: number, data: Partial<TipoApuesta>): Promise<boolean> {
        const result = await db.query(
            `UPDATE TipoApuesta 
             SET codigo = COALESCE($1, codigo),
                 nombre = COALESCE($2, nombre),
                 descripcion = COALESCE($3, descripcion),
                 categoria = COALESCE($4, categoria),
                 activo = COALESCE($5, activo)
             WHERE id_tipo_apuesta = $6`,
            [data.codigo, data.nombre, data.descripcion, data.categoria, data.activo, id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar tipo de apuesta (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE TipoApuesta SET activo = false WHERE id_tipo_apuesta = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar tipo de apuesta (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM TipoApuesta WHERE id_tipo_apuesta = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
