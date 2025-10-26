import db from '../utils/database';
import { Resultado } from '../models';

/**
 * Servicio CRUD para Resultados
 */
export class ResultadoService {
    /**
     * Obtener todos los resultados
     */
    public static async getAll(): Promise<Resultado[]> {
        const result = await db.query<Resultado>(
            'SELECT * FROM Resultado ORDER BY id_resultado DESC'
        );
        return result.rows;
    }

    /**
     * Obtener resultado por ID
     */
    public static async getById(id: number): Promise<Resultado | null> {
        const result = await db.query<Resultado>(
            'SELECT * FROM Resultado WHERE id_resultado = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener resultado por partido
     */
    public static async getByPartido(idPartido: number): Promise<Resultado | null> {
        const result = await db.query<Resultado>(
            'SELECT * FROM Resultado WHERE id_partido = $1',
            [idPartido]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener resultados con información completa (JOIN)
     */
    public static async getAllCompletos(): Promise<any[]> {
        const result = await db.query(
            `SELECT r.*, 
                    p.fecha_hora,
                    el.nombre as equipo_local,
                    ev.nombre as equipo_visitante,
                    l.nombre as liga_nombre
             FROM Resultado r
             JOIN Partido p ON r.id_partido = p.id_partido
             JOIN Equipo el ON p.id_equipo_local = el.id_equipo
             JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
             JOIN Liga l ON p.id_liga = l.id_liga
             ORDER BY p.fecha_hora DESC`
        );
        return result.rows;
    }

    /**
     * Verificar si un partido ya tiene resultado
     */
    public static async existeResultado(idPartido: number): Promise<boolean> {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM Resultado WHERE id_partido = $1',
            [idPartido]
        );
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Crear nuevo resultado
     */
    public static async create(data: Partial<Resultado>): Promise<number> {
        // Verificar que el partido no tenga ya un resultado
        const existe = await this.existeResultado(data.id_partido!);
        if (existe) {
            throw new Error('El partido ya tiene un resultado registrado');
        }

        const result = await db.query(
            `INSERT INTO Resultado 
             (id_partido, goles_local, goles_visitante, puntos_local, puntos_visitante, 
              tarjetas_amarillas_local, tarjetas_amarillas_visitante, 
              tarjetas_rojas_local, tarjetas_rojas_visitante)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id_resultado`,
            [
                data.id_partido,
                data.goles_local,
                data.goles_visitante,
                data.puntos_local,
                data.puntos_visitante,
                data.tarjetas_amarillas_local,
                data.tarjetas_amarillas_visitante,
                data.tarjetas_rojas_local,
                data.tarjetas_rojas_visitante
            ]
        );
        return result.rows[0].id_resultado;
    }

    /**
     * Actualizar resultado
     */
    public static async update(id: number, data: Partial<Resultado>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Resultado 
             SET goles_local = COALESCE($1, goles_local),
                 goles_visitante = COALESCE($2, goles_visitante),
                 puntos_local = COALESCE($3, puntos_local),
                 puntos_visitante = COALESCE($4, puntos_visitante),
                 tarjetas_amarillas_local = COALESCE($5, tarjetas_amarillas_local),
                 tarjetas_amarillas_visitante = COALESCE($6, tarjetas_amarillas_visitante),
                 tarjetas_rojas_local = COALESCE($7, tarjetas_rojas_local),
                 tarjetas_rojas_visitante = COALESCE($8, tarjetas_rojas_visitante)
             WHERE id_resultado = $9`,
            [
                data.goles_local,
                data.goles_visitante,
                data.puntos_local,
                data.puntos_visitante,
                data.tarjetas_amarillas_local,
                data.tarjetas_amarillas_visitante,
                data.tarjetas_rojas_local,
                data.tarjetas_rojas_visitante,
                id
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Actualizar resultado por ID de partido
     */
    public static async updateByPartido(idPartido: number, data: Partial<Resultado>): Promise<boolean> {
        const result = await db.query(
            `UPDATE Resultado 
             SET goles_local = COALESCE($1, goles_local),
                 goles_visitante = COALESCE($2, goles_visitante),
                 puntos_local = COALESCE($3, puntos_local),
                 puntos_visitante = COALESCE($4, puntos_visitante),
                 tarjetas_amarillas_local = COALESCE($5, tarjetas_amarillas_local),
                 tarjetas_amarillas_visitante = COALESCE($6, tarjetas_amarillas_visitante),
                 tarjetas_rojas_local = COALESCE($7, tarjetas_rojas_local),
                 tarjetas_rojas_visitante = COALESCE($8, tarjetas_rojas_visitante)
             WHERE id_partido = $9`,
            [
                data.goles_local,
                data.goles_visitante,
                data.puntos_local,
                data.puntos_visitante,
                data.tarjetas_amarillas_local,
                data.tarjetas_amarillas_visitante,
                data.tarjetas_rojas_local,
                data.tarjetas_rojas_visitante,
                idPartido
            ]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar resultado
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Resultado WHERE id_resultado = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar resultado por ID de partido
     */
    public static async deleteByPartido(idPartido: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Resultado WHERE id_partido = $1',
            [idPartido]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
