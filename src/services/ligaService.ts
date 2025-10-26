import db from '../utils/database';
import { Liga } from '../models';

/**
 * Servicio CRUD para Ligas
 */
export class LigaService {
    /**
     * Obtener todas las ligas activas
     */
    public static async getAll(): Promise<Liga[]> {
        const result = await db.query<Liga>(
            'SELECT * FROM Liga WHERE activo = true ORDER BY nombre'
        );
        return result.rows;
    }

    /**
     * Obtener liga por ID
     */
    public static async getById(id: number): Promise<Liga | null> {
        const result = await db.query<Liga>(
            'SELECT * FROM Liga WHERE id_liga = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener ligas por deporte
     */
    public static async getByDeporte(idDeporte: number): Promise<Liga[]> {
        const result = await db.query<Liga>(
            'SELECT * FROM Liga WHERE id_deporte = $1 AND activo = true ORDER BY nombre',
            [idDeporte]
        );
        return result.rows;
    }

    /**
     * Obtener ligas por país
     */
    public static async getByPais(idPais: number): Promise<Liga[]> {
        const result = await db.query<Liga>(
            'SELECT * FROM Liga WHERE id_pais = $1 AND activo = true ORDER BY nombre',
            [idPais]
        );
        return result.rows;
    }

    /**
     * Obtener ligas con información completa (JOIN)
     */
    public static async getAllCompletas(): Promise<any[]> {
        const result = await db.query(
            `SELECT l.*, d.nombre as deporte_nombre, p.nombre as pais_nombre
             FROM Liga l
             JOIN Deporte d ON l.id_deporte = d.id_deporte
             LEFT JOIN Pais p ON l.id_pais = p.id_pais
             WHERE l.activo = true
             ORDER BY l.nombre`
        );
        return result.rows;
    }

    /**
     * Crear nueva liga
     */
    public static async create(data: Partial<Liga>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Liga (id_deporte, nombre, id_pais, temporada, fecha_inicio, fecha_fin, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id_liga`,
            [
                data.id_deporte,
                data.nombre,
                data.id_pais,
                data.temporada,
                data.fecha_inicio,
                data.fecha_fin,
                data.activo ?? true
            ]
        );
        return result.rows[0].id_liga;
    }

    /**
     * Actualizar liga
     */
    public static async update(id: number, data: Partial<Liga>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Liga 
             SET id_deporte = COALESCE($1, id_deporte),
                 nombre = COALESCE($2, nombre),
                 id_pais = COALESCE($3, id_pais),
                 temporada = COALESCE($4, temporada),
                 fecha_inicio = COALESCE($5, fecha_inicio),
                 fecha_fin = COALESCE($6, fecha_fin),
                 activo = COALESCE($7, activo)
             WHERE id_liga = $8`,
            [
                data.id_deporte,
                data.nombre,
                data.id_pais,
                data.temporada,
                data.fecha_inicio,
                data.fecha_fin,
                data.activo,
                id
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar liga (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Liga SET activo = false WHERE id_liga = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar liga (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Liga WHERE id_liga = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
