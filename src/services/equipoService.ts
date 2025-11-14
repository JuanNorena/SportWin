import db from '../utils/database';
import { Equipo } from '../models';

/**
 * Servicio CRUD para Equipos
 */
export class EquipoService {
    /**
     * Obtener todos los equipos (activos e inactivos)
     */
    public static async getAll(): Promise<Equipo[]> {
        const result = await db.query<Equipo>(
            'SELECT * FROM Equipo ORDER BY nombre'
        );
        return result.rows;
    }

    /**
     * Obtener equipo por ID
     */
    public static async getById(id: number): Promise<Equipo | null> {
        const result = await db.query<Equipo>(
            'SELECT * FROM Equipo WHERE id_equipo = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener equipos por liga
     */
    public static async getByLiga(idLiga: number): Promise<Equipo[]> {
        const result = await db.query<Equipo>(
            'SELECT * FROM Equipo WHERE id_liga = $1 AND activo = true ORDER BY nombre',
            [idLiga]
        );
        return result.rows;
    }

    /**
     * Obtener equipos por país
     */
    public static async getByPais(idPais: number): Promise<Equipo[]> {
        const result = await db.query<Equipo>(
            'SELECT * FROM Equipo WHERE id_pais = $1 AND activo = true ORDER BY nombre',
            [idPais]
        );
        return result.rows;
    }

    /**
     * Obtener equipos con información completa (JOIN)
     * Retorna equipos con nombres legibles de liga, país, ciudad, estadio y entrenador
     * en lugar de solo IDs, facilitando la visualización en el frontend
     */
    public static async getAllCompletos(): Promise<any[]> {
        const sql = `
            SELECT 
                e.id_equipo,
                e.nombre AS equipo_nombre,
                e.fundacion,
                e.logo_url,
                e.activo,
                -- Información de la liga
                e.id_liga,
                l.nombre AS liga_nombre,
                -- Información del país
                e.id_pais,
                p.nombre AS pais_nombre,
                -- Información de la ciudad
                e.id_ciudad,
                c.nombre AS ciudad_nombre,
                -- Información del estadio
                e.id_estadio,
                est.nombre AS estadio_nombre,
                -- Información del entrenador
                e.id_entrenador,
                ent.nombre || ' ' || ent.apellido AS entrenador_nombre
            FROM Equipo e
            INNER JOIN Liga l ON e.id_liga = l.id_liga
            LEFT JOIN Pais p ON e.id_pais = p.id_pais
            LEFT JOIN Ciudad c ON e.id_ciudad = c.id_ciudad
            LEFT JOIN Estadio est ON e.id_estadio = est.id_estadio
            LEFT JOIN Entrenador ent ON e.id_entrenador = ent.id_entrenador
            ORDER BY e.nombre ASC
        `;
        
        const result = await db.query(sql);
        return result.rows;
    }

    /**
     * Buscar equipos por nombre
     */
    public static async buscarPorNombre(nombre: string): Promise<Equipo[]> {
        const result = await db.query<Equipo>(
            'SELECT * FROM Equipo WHERE nombre ILIKE $1 AND activo = true ORDER BY nombre',
            [`%${nombre}%`]
        );
        return result.rows;
    }

    /**
     * Crear nuevo equipo
     */
    public static async create(data: Partial<Equipo>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Equipo 
             (id_liga, nombre, id_pais, id_ciudad, id_estadio, id_entrenador, fundacion, logo_url, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id_equipo`,
            [
                data.id_liga,
                data.nombre,
                data.id_pais,
                data.id_ciudad,
                data.id_estadio,
                data.id_entrenador,
                data.fundacion,
                data.logo_url,
                data.activo ?? true
            ]
        );
        return result.rows[0].id_equipo;
    }

    /**
     * Actualizar equipo
     */
    public static async update(id: number, data: Partial<Equipo>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Equipo 
             SET id_liga = COALESCE($1, id_liga),
                 nombre = COALESCE($2, nombre),
                 id_pais = COALESCE($3, id_pais),
                 id_ciudad = COALESCE($4, id_ciudad),
                 id_estadio = COALESCE($5, id_estadio),
                 id_entrenador = COALESCE($6, id_entrenador),
                 fundacion = COALESCE($7, fundacion),
                 logo_url = COALESCE($8, logo_url),
                 activo = COALESCE($9, activo)
             WHERE id_equipo = $10`,
            [
                data.id_liga,
                data.nombre,
                data.id_pais,
                data.id_ciudad,
                data.id_estadio,
                data.id_entrenador,
                data.fundacion,
                data.logo_url,
                data.activo,
                id
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Desactivar equipo (soft delete)
     */
    public static async desactivar(id: number): Promise<boolean> {
        const result = await db.query(
            'UPDATE Equipo SET activo = false WHERE id_equipo = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar equipo (hard delete)
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Equipo WHERE id_equipo = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
