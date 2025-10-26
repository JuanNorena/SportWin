import db from '../utils/database';
import { Pais, Departamento, Ciudad, Estado, Rol, TipoDocumento, TipoTransaccion, Entrenador, Arbitro, Estadio } from '../models';

/**
 * Servicio para tablas de catálogo
 */

// ============================================
// PAÍS
// ============================================
export class PaisService {
    public static async getAll(): Promise<Pais[]> {
        const result = await db.query<Pais>('SELECT * FROM Pais WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Pais | null> {
        const result = await db.query<Pais>('SELECT * FROM Pais WHERE id_pais = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByCodigoISO(codigo: string): Promise<Pais | null> {
        const result = await db.query<Pais>('SELECT * FROM Pais WHERE codigo_iso = $1', [codigo]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

// ============================================
// DEPARTAMENTO
// ============================================
export class DepartamentoService {
    public static async getAll(): Promise<Departamento[]> {
        const result = await db.query<Departamento>('SELECT * FROM Departamento WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Departamento | null> {
        const result = await db.query<Departamento>('SELECT * FROM Departamento WHERE id_departamento = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByPais(idPais: number): Promise<Departamento[]> {
        const result = await db.query<Departamento>(
            'SELECT * FROM Departamento WHERE id_pais = $1 AND activo = true ORDER BY nombre',
            [idPais]
        );
        return result.rows;
    }
}

// ============================================
// CIUDAD
// ============================================
export class CiudadService {
    public static async getAll(): Promise<Ciudad[]> {
        const result = await db.query<Ciudad>('SELECT * FROM Ciudad WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Ciudad | null> {
        const result = await db.query<Ciudad>('SELECT * FROM Ciudad WHERE id_ciudad = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByDepartamento(idDepartamento: number): Promise<Ciudad[]> {
        const result = await db.query<Ciudad>(
            'SELECT * FROM Ciudad WHERE id_departamento = $1 AND activo = true ORDER BY nombre',
            [idDepartamento]
        );
        return result.rows;
    }

    public static async getCiudadesCompletasColombias(): Promise<any[]> {
        const result = await db.query(
            `SELECT c.id_ciudad, c.nombre as ciudad, d.nombre as departamento, p.nombre as pais
             FROM Ciudad c
             JOIN Departamento d ON c.id_departamento = d.id_departamento
             JOIN Pais p ON d.id_pais = p.id_pais
             WHERE p.codigo_iso = 'COL' AND c.activo = true
             ORDER BY c.nombre`
        );
        return result.rows;
    }
}

// ============================================
// ESTADO
// ============================================
export class EstadoService {
    public static async getAll(): Promise<Estado[]> {
        const result = await db.query<Estado>('SELECT * FROM Estado WHERE activo = true ORDER BY entidad, nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Estado | null> {
        const result = await db.query<Estado>('SELECT * FROM Estado WHERE id_estado = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByEntidad(entidad: string): Promise<Estado[]> {
        const result = await db.query<Estado>(
            'SELECT * FROM Estado WHERE entidad = $1 AND activo = true ORDER BY nombre',
            [entidad]
        );
        return result.rows;
    }

    public static async getIdByCodigo(codigo: string, entidad: string): Promise<number> {
        const result = await db.query(
            'SELECT id_estado FROM Estado WHERE codigo = $1 AND entidad = $2',
            [codigo, entidad]
        );
        if (result.rows.length === 0) {
            throw new Error(`Estado no encontrado: ${codigo} (${entidad})`);
        }
        return result.rows[0].id_estado;
    }
}

// ============================================
// ROL
// ============================================
export class RolService {
    public static async getAll(): Promise<Rol[]> {
        const result = await db.query<Rol>('SELECT * FROM Rol WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Rol | null> {
        const result = await db.query<Rol>('SELECT * FROM Rol WHERE id_rol = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByNombre(nombre: string): Promise<Rol | null> {
        const result = await db.query<Rol>('SELECT * FROM Rol WHERE nombre = $1', [nombre]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

// ============================================
// TIPO DOCUMENTO
// ============================================
export class TipoDocumentoService {
    public static async getAll(): Promise<TipoDocumento[]> {
        const result = await db.query<TipoDocumento>('SELECT * FROM TipoDocumento WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<TipoDocumento | null> {
        const result = await db.query<TipoDocumento>('SELECT * FROM TipoDocumento WHERE id_tipo_documento = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByCodigo(codigo: string): Promise<TipoDocumento | null> {
        const result = await db.query<TipoDocumento>('SELECT * FROM TipoDocumento WHERE codigo = $1', [codigo]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

// ============================================
// TIPO TRANSACCIÓN
// ============================================
export class TipoTransaccionService {
    public static async getAll(): Promise<TipoTransaccion[]> {
        const result = await db.query<TipoTransaccion>('SELECT * FROM TipoTransaccion WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<TipoTransaccion | null> {
        const result = await db.query<TipoTransaccion>('SELECT * FROM TipoTransaccion WHERE id_tipo_transaccion = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getByCodigo(codigo: string): Promise<TipoTransaccion | null> {
        const result = await db.query<TipoTransaccion>('SELECT * FROM TipoTransaccion WHERE codigo = $1', [codigo]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

// ============================================
// ENTRENADOR
// ============================================
export class EntrenadorService {
    public static async getAll(): Promise<Entrenador[]> {
        const result = await db.query<Entrenador>('SELECT * FROM Entrenador WHERE activo = true ORDER BY apellido, nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Entrenador | null> {
        const result = await db.query<Entrenador>('SELECT * FROM Entrenador WHERE id_entrenador = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getConPais(): Promise<any[]> {
        const result = await db.query(
            `SELECT e.*, p.nombre as pais
             FROM Entrenador e
             LEFT JOIN Pais p ON e.id_pais = p.id_pais
             WHERE e.activo = true
             ORDER BY e.apellido, e.nombre`
        );
        return result.rows;
    }

    public static async create(data: Partial<Entrenador>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Entrenador (nombre, apellido, id_pais, fecha_nacimiento, licencia, experiencia_años, foto_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id_entrenador`,
            [data.nombre, data.apellido, data.id_pais, data.fecha_nacimiento, data.licencia, data.experiencia_años, data.foto_url]
        );
        return result.rows[0].id_entrenador;
    }
}

// ============================================
// ÁRBITRO
// ============================================
export class ArbitroService {
    public static async getAll(): Promise<Arbitro[]> {
        const result = await db.query<Arbitro>('SELECT * FROM Arbitro WHERE activo = true ORDER BY apellido, nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Arbitro | null> {
        const result = await db.query<Arbitro>('SELECT * FROM Arbitro WHERE id_arbitro = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getConPais(): Promise<any[]> {
        const result = await db.query(
            `SELECT a.*, p.nombre as pais
             FROM Arbitro a
             LEFT JOIN Pais p ON a.id_pais = p.id_pais
             WHERE a.activo = true
             ORDER BY a.apellido, a.nombre`
        );
        return result.rows;
    }

    public static async create(data: Partial<Arbitro>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Arbitro (nombre, apellido, id_pais, fecha_nacimiento, categoria, años_experiencia, foto_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id_arbitro`,
            [data.nombre, data.apellido, data.id_pais, data.fecha_nacimiento, data.categoria, data.años_experiencia, data.foto_url]
        );
        return result.rows[0].id_arbitro;
    }
}

// ============================================
// ESTADIO
// ============================================
export class EstadioService {
    public static async getAll(): Promise<Estadio[]> {
        const result = await db.query<Estadio>('SELECT * FROM Estadio WHERE activo = true ORDER BY nombre');
        return result.rows;
    }

    public static async getById(id: number): Promise<Estadio | null> {
        const result = await db.query<Estadio>('SELECT * FROM Estadio WHERE id_estadio = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    public static async getConCiudad(): Promise<any[]> {
        const result = await db.query(
            `SELECT e.*, c.nombre as ciudad, d.nombre as departamento, p.nombre as pais
             FROM Estadio e
             LEFT JOIN Ciudad c ON e.id_ciudad = c.id_ciudad
             LEFT JOIN Departamento d ON c.id_departamento = d.id_departamento
             LEFT JOIN Pais p ON d.id_pais = p.id_pais
             WHERE e.activo = true
             ORDER BY e.nombre`
        );
        return result.rows;
    }

    public static async create(data: Partial<Estadio>): Promise<number> {
        const result = await db.query(
            `INSERT INTO Estadio (nombre, id_ciudad, direccion, capacidad, año_construccion, tipo_cesped, techado, foto_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id_estadio`,
            [data.nombre, data.id_ciudad, data.direccion, data.capacidad, data.año_construccion, data.tipo_cesped, data.techado, data.foto_url]
        );
        return result.rows[0].id_estadio;
    }
}
