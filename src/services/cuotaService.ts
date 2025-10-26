import db from '../utils/database';
import { Cuota } from '../models';

/**
 * Servicio CRUD para Cuotas
 */
export class CuotaService {
    /**
     * Obtener todas las cuotas activas
     */
    public static async getAll(): Promise<Cuota[]> {
        const result = await db.query<Cuota>(
            'SELECT * FROM Cuota WHERE activo = true ORDER BY id_cuota DESC'
        );
        return result.rows;
    }

    /**
     * Obtener cuota por ID
     */
    public static async getById(id: number): Promise<Cuota | null> {
        const result = await db.query<Cuota>(
            'SELECT * FROM Cuota WHERE id_cuota = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener cuotas por partido
     */
    public static async getByPartido(idPartido: number): Promise<Cuota[]> {
        const result = await db.query<Cuota>(
            'SELECT * FROM Cuota WHERE id_partido = $1 AND activo = true ORDER BY id_tipo_apuesta',
            [idPartido]
        );
        return result.rows;
    }

    /**
     * Obtener cuotas por tipo de apuesta
     */
    public static async getByTipoApuesta(idTipoApuesta: number): Promise<Cuota[]> {
        const result = await db.query<Cuota>(
            'SELECT * FROM Cuota WHERE id_tipo_apuesta = $1 AND activo = true ORDER BY id_partido DESC',
            [idTipoApuesta]
        );
        return result.rows;
    }

    /**
     * Obtener cuotas por partido y tipo de apuesta
     */
    public static async getByPartidoYTipo(idPartido: number, idTipoApuesta: number): Promise<Cuota[]> {
        const result = await db.query<Cuota>(
            'SELECT * FROM Cuota WHERE id_partido = $1 AND id_tipo_apuesta = $2 AND activo = true',
            [idPartido, idTipoApuesta]
        );
        return result.rows;
    }

    /**
     * Obtener cuotas con información completa (JOIN)
     */
    public static async getAllCompletas(): Promise<any[]> {
        const result = await db.query(
            `SELECT c.*, 
                    p.fecha_hora,
                    el.nombre as equipo_local,
                    ev.nombre as equipo_visitante,
                    ta.nombre as tipo_apuesta_nombre,
                    ta.codigo as tipo_apuesta_codigo,
                    l.nombre as liga_nombre
             FROM Cuota c
             JOIN Partido p ON c.id_partido = p.id_partido
             JOIN Equipo el ON p.id_equipo_local = el.id_equipo
             JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
             JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
             JOIN Liga l ON p.id_liga = l.id_liga
             WHERE c.activo = true
             ORDER BY p.fecha_hora DESC, ta.nombre`
        );
        return result.rows;
    }

    /**
     * Obtener cuotas completas por partido
     */
    public static async getCompletasByPartido(idPartido: number): Promise<any[]> {
        const result = await db.query(
            `SELECT c.*, 
                    ta.nombre as tipo_apuesta_nombre,
                    ta.codigo as tipo_apuesta_codigo,
                    ta.descripcion as tipo_apuesta_descripcion
             FROM Cuota c
             JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
             WHERE c.id_partido = $1 AND c.activo = true
             ORDER BY ta.nombre`,
            [idPartido]
        );
        return result.rows;
    }

    /**
     * Crear nueva cuota
     */
    public static async create(data: Partial<Cuota>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Cuota 
             (id_partido, id_tipo_apuesta, valor_cuota, resultado_prediccion, activo)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_cuota`,
            [
                data.id_partido,
                data.id_tipo_apuesta,
                data.valor_cuota,
                data.resultado_prediccion,
                data.activo ?? true
            ]
        );
        return result.rows[0].id_cuota;
    }

    /**
     * Actualizar cuota
     */
    public static async update(id: number, data: Partial<Cuota>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Cuota 
             SET id_partido = COALESCE($1, id_partido),
                 id_tipo_apuesta = COALESCE($2, id_tipo_apuesta),
                 valor_cuota = COALESCE($3, valor_cuota),
                 resultado_prediccion = COALESCE($4, resultado_prediccion),
                 activo = COALESCE($5, activo)
             WHERE id_cuota = $6`,
            [
                data.id_partido,
                data.id_tipo_apuesta,
                data.valor_cuota,
                data.resultado_prediccion,
                data.activo,
                id
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar cuota (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Cuota SET activo = false WHERE id_cuota = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar todas las cuotas de un partido
     */
    public static async desactivarByPartido(idPartido: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Cuota SET activo = false WHERE id_partido = $1',
            [idPartido]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar cuota (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Cuota WHERE id_cuota = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
