import db from '../utils/database';
import { Deporte } from '../models';

/**
 * Servicio CRUD para Deportes
 */
export class DeporteService {
    /**
     * Obtener todos los deportes (activos e inactivos)
     */
    public static async getAll(): Promise<Deporte[]> {
        const result = await db.query<Deporte>(
            'SELECT * FROM Deporte ORDER BY nombre'
        );
        return result.rows;
    }

    /**
     * Obtener deporte por ID
     */
    public static async getById(id: number): Promise<Deporte | null> {
        const result = await db.query<Deporte>(
            'SELECT * FROM Deporte WHERE id_deporte = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener deporte por nombre
     */
    public static async getByNombre(nombre: string): Promise<Deporte | null> {
        const result = await db.query<Deporte>(
            'SELECT * FROM Deporte WHERE nombre = $1',
            [nombre]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Crear nuevo deporte
     */
    public static async create(data: Partial<Deporte>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Deporte (nombre, descripcion, icono, activo)
             VALUES ($1, $2, $3, $4)
             RETURNING id_deporte`,
            [data.nombre, data.descripcion, data.icono, data.activo ?? true]
        );
        return result.rows[0].id_deporte;
    }

    /**
     * Actualizar deporte
     */
    public static async update(id: number, data: Partial<Deporte>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Deporte 
             SET nombre = COALESCE($1, nombre),
                 descripcion = COALESCE($2, descripcion),
                 icono = COALESCE($3, icono),
                 activo = COALESCE($4, activo)
             WHERE id_deporte = $5`,
            [data.nombre, data.descripcion, data.icono, data.activo, id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar deporte (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Deporte SET activo = false WHERE id_deporte = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar deporte (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Deporte WHERE id_deporte = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
