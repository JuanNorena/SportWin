import db from '../utils/database';
import { Partido, PartidoCompleto } from '../models';

/**
 * Servicio CRUD para Partidos
 */
export class PartidoService {
    /**
     * Crear nuevo partido
     */
    public static async create(data: Partial<Partido>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Partido 
             (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, estadio, jornada, estado, arbitro, asistencia)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id_partido`,
            [
                data.id_liga,
                data.id_equipo_local,
                data.id_equipo_visitante,
                data.fecha_hora,
                data.estadio,
                data.jornada,
                data.estado || 'programado',
                data.arbitro,
                data.asistencia
            ]
        );
        return result.rows[0].id_partido;
    }

    /**
     * Obtener todos los partidos
     */
    public static async getAll(): Promise<Partido[]> {
        const result = await db.query<Partido>(
            'SELECT * FROM Partido ORDER BY fecha_hora DESC'
        );
        return result.rows;
    }

    /**
     * Obtener partidos completos con información detallada
     */
    public static async getAllComplete(): Promise<PartidoCompleto[]> {
        const result = await db.query<PartidoCompleto>(
            'SELECT * FROM vista_partidos_completos ORDER BY fecha_hora DESC'
        );
        return result.rows;
    }

    /**
     * Obtener partido por ID
     */
    public static async getById(id: number): Promise<Partido | null> {
        const result = await db.query<Partido>(
            'SELECT * FROM Partido WHERE id_partido = $1',
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Obtener partidos por estado
     */
    public static async getByEstado(estado: string): Promise<Partido[]> {
        const result = await db.query<Partido>(
            'SELECT * FROM Partido WHERE estado = $1 ORDER BY fecha_hora',
            [estado]
        );
        return result.rows;
    }

    /**
     * Obtener partidos programados
     */
    public static async getProgramados(): Promise<PartidoCompleto[]> {
        const result = await db.query<PartidoCompleto>(
            `SELECT * FROM vista_partidos_completos 
             WHERE estado = 'programado' AND fecha_hora > CURRENT_TIMESTAMP
             ORDER BY fecha_hora`
        );
        return result.rows;
    }

    /**
     * Obtener partidos finalizados
     */
    public static async getFinalizados(limit: number = 50): Promise<PartidoCompleto[]> {
        const result = await db.query<PartidoCompleto>(
            `SELECT * FROM vista_partidos_completos 
             WHERE estado = 'finalizado'
             ORDER BY fecha_hora DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    /**
     * Obtener partidos por liga
     */
    public static async getByLiga(idLiga: number): Promise<Partido[]> {
        const result = await db.query<Partido>(
            'SELECT * FROM Partido WHERE id_liga = $1 ORDER BY fecha_hora DESC',
            [idLiga]
        );
        return result.rows;
    }

    /**
     * Actualizar estado del partido
     */
    public static async updateEstado(id: number, estado: string): Promise<boolean> {
        const result = await db.query(
            'UPDATE Partido SET estado = $1 WHERE id_partido = $2',
            [estado, id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Actualizar partido
     */
    public static async update(id: number, data: Partial<Partido>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.fecha_hora !== undefined) {
            fields.push(`fecha_hora = $${paramIndex++}`);
            values.push(data.fecha_hora);
        }
        if (data.estadio !== undefined) {
            fields.push(`estadio = $${paramIndex++}`);
            values.push(data.estadio);
        }
        if (data.estado !== undefined) {
            fields.push(`estado = $${paramIndex++}`);
            values.push(data.estado);
        }
        if (data.arbitro !== undefined) {
            fields.push(`arbitro = $${paramIndex++}`);
            values.push(data.arbitro);
        }
        if (data.asistencia !== undefined) {
            fields.push(`asistencia = $${paramIndex++}`);
            values.push(data.asistencia);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        const result = await db.query(
            `UPDATE Partido SET ${fields.join(', ')} WHERE id_partido = $${paramIndex}`,
            values
        );

        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Eliminar partido
     */
    public static async delete(id: number): Promise<boolean> {
        const result = await db.query(
            'DELETE FROM Partido WHERE id_partido = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
