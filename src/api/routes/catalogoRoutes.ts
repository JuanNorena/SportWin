import { Router, Request, Response } from 'express';
import { DeporteService } from '../../services/deporteService';
import { LigaService } from '../../services/ligaService';
import { EquipoService } from '../../services/equipoService';

const router = Router();

// ============================================
// DEPORTES - CRUD Completo
// ============================================

// GET - Listar todos los deportes
router.get('/deportes', async (req: Request, res: Response) => {
    try {
        const deportes = await DeporteService.getAll();
        res.json(deportes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener deporte por ID
router.get('/deportes/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deporte = await DeporteService.getById(id);
        
        if (!deporte) {
            return res.status(404).json({ error: 'Deporte no encontrado' });
        }
        
        res.json(deporte);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear nuevo deporte
router.post('/deportes', async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, icono, activo } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        
        const id = await DeporteService.create({
            nombre,
            descripcion,
            icono,
            activo: activo ?? true
        });
        
        res.status(201).json({ id, message: 'Deporte creado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar deporte
router.put('/deportes/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, descripcion, icono, activo } = req.body;
        
        const success = await DeporteService.update(id, {
            nombre,
            descripcion,
            icono,
            activo
        });
        
        if (!success) {
            return res.status(404).json({ error: 'Deporte no encontrado' });
        }
        
        res.json({ message: 'Deporte actualizado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar deporte
router.delete('/deportes/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const success = await DeporteService.delete(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Deporte no encontrado o no se pudo eliminar' });
        }
        
        res.json({ message: 'Deporte eliminado exitosamente' });
    } catch (error: any) {
        // Manejar errores de foreign key constraint
        if (error.code === '23503') {
            let errorMessage = 'No se puede eliminar este deporte porque tiene registros relacionados';
            
            if (error.table === 'liga') {
                errorMessage = 'No se puede eliminar este deporte porque tiene ligas asociadas. Elimine primero las ligas relacionadas.';
            }
            
            return res.status(409).json({ 
                error: errorMessage,
                detail: 'Este deporte está siendo utilizado en otras tablas del sistema',
                code: 'FOREIGN_KEY_VIOLATION'
            });
        }
        
        res.status(500).json({ error: error.message || 'Error al eliminar deporte' });
    }
});

// ============================================
// LIGAS - CRUD Completo
// ============================================

// GET - Listar todas las ligas
router.get('/ligas', async (req: Request, res: Response) => {
    try {
        const ligas = await LigaService.getAllCompletas();
        res.json(ligas);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener liga por ID
router.get('/ligas/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const liga = await LigaService.getById(id);
        
        if (!liga) {
            return res.status(404).json({ error: 'Liga no encontrada' });
        }
        
        res.json(liga);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener ligas por deporte
router.get('/ligas/deporte/:idDeporte', async (req: Request, res: Response) => {
    try {
        const idDeporte = parseInt(req.params.idDeporte);
        const ligas = await LigaService.getByDeporte(idDeporte);
        res.json(ligas);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear nueva liga
router.post('/ligas', async (req: Request, res: Response) => {
    try {
        const { id_deporte, nombre, id_pais, temporada, fecha_inicio, fecha_fin, activo } = req.body;
        
        if (!id_deporte || !nombre) {
            return res.status(400).json({ error: 'El deporte y nombre son requeridos' });
        }
        
        const id = await LigaService.create({
            id_deporte,
            nombre,
            id_pais,
            temporada,
            fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : undefined,
            fecha_fin: fecha_fin ? new Date(fecha_fin) : undefined,
            activo: activo ?? true
        });
        
        res.status(201).json({ id, message: 'Liga creada exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar liga
router.put('/ligas/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { id_deporte, nombre, id_pais, temporada, fecha_inicio, fecha_fin, activo } = req.body;
        
        const success = await LigaService.update(id, {
            id_deporte,
            nombre,
            id_pais,
            temporada,
            fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : undefined,
            fecha_fin: fecha_fin ? new Date(fecha_fin) : undefined,
            activo
        });
        
        if (!success) {
            return res.status(404).json({ error: 'Liga no encontrada' });
        }
        
        res.json({ message: 'Liga actualizada exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar liga
router.delete('/ligas/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const success = await LigaService.delete(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Liga no encontrada o no se pudo eliminar' });
        }
        
        res.json({ message: 'Liga eliminada exitosamente' });
    } catch (error: any) {
        // Manejar errores de foreign key constraint
        if (error.code === '23503') {
            let errorMessage = 'No se puede eliminar esta liga porque tiene registros relacionados';
            
            if (error.table === 'equipo') {
                errorMessage = 'No se puede eliminar esta liga porque tiene equipos asociados. Elimine primero los equipos de esta liga.';
            } else if (error.table === 'partido') {
                errorMessage = 'No se puede eliminar esta liga porque tiene partidos programados. Elimine primero los partidos de esta liga.';
            }
            
            return res.status(409).json({ 
                error: errorMessage,
                detail: 'Esta liga está siendo utilizada en otras tablas del sistema',
                code: 'FOREIGN_KEY_VIOLATION'
            });
        }
        
        res.status(500).json({ error: error.message || 'Error al eliminar liga' });
    }
});

// ============================================
// EQUIPOS - CRUD Completo
// ============================================

// GET - Listar todos los equipos
router.get('/equipos', async (req: Request, res: Response) => {
    try {
        const equipos = await EquipoService.getAllCompletos();
        res.json(equipos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener equipo por ID
router.get('/equipos/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const equipo = await EquipoService.getById(id);
        
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.json(equipo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener equipos por liga
router.get('/equipos/liga/:idLiga', async (req: Request, res: Response) => {
    try {
        const idLiga = parseInt(req.params.idLiga);
        const equipos = await EquipoService.getByLiga(idLiga);
        res.json(equipos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear nuevo equipo
router.post('/equipos', async (req: Request, res: Response) => {
    try {
        const { id_liga, nombre, id_pais, id_ciudad, id_estadio, id_entrenador, fundacion, logo_url, activo } = req.body;
        
        if (!id_liga || !nombre) {
            return res.status(400).json({ error: 'La liga y nombre son requeridos' });
        }
        
        const id = await EquipoService.create({
            id_liga,
            nombre,
            id_pais,
            id_ciudad,
            id_estadio,
            id_entrenador,
            fundacion,
            logo_url,
            activo: activo ?? true
        });
        
        res.status(201).json({ id, message: 'Equipo creado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar equipo
router.put('/equipos/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { id_liga, nombre, id_pais, id_ciudad, id_estadio, id_entrenador, fundacion, logo_url, activo } = req.body;
        
        const success = await EquipoService.update(id, {
            id_liga,
            nombre,
            id_pais,
            id_ciudad,
            id_estadio,
            id_entrenador,
            fundacion,
            logo_url,
            activo
        });
        
        if (!success) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.json({ message: 'Equipo actualizado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar equipo
router.delete('/equipos/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const success = await EquipoService.delete(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Equipo no encontrado o no se pudo eliminar' });
        }
        
        res.json({ message: 'Equipo eliminado exitosamente' });
    } catch (error: any) {
        // Manejar errores de foreign key constraint
        if (error.code === '23503') {
            let errorMessage = 'No se puede eliminar este equipo porque tiene registros relacionados';
            
            if (error.table === 'partido') {
                if (error.constraint === 'partido_id_equipo_local_fkey') {
                    errorMessage = 'No se puede eliminar este equipo porque tiene partidos programados como equipo local. Elimine primero los partidos donde participa.';
                } else if (error.constraint === 'partido_id_equipo_visitante_fkey') {
                    errorMessage = 'No se puede eliminar este equipo porque tiene partidos programados como equipo visitante. Elimine primero los partidos donde participa.';
                } else {
                    errorMessage = 'No se puede eliminar este equipo porque tiene partidos programados. Elimine primero los partidos donde participa.';
                }
            }
            
            return res.status(409).json({ 
                error: errorMessage,
                detail: 'Este equipo está siendo utilizado en otras tablas del sistema',
                code: 'FOREIGN_KEY_VIOLATION'
            });
        }
        
        res.status(500).json({ error: error.message || 'Error al eliminar equipo' });
    }
});

// Roles
router.get('/roles', async (req: Request, res: Response) => {
    try {
        const { RolService } = await import('../../services/catalogoService');
        const roles = await RolService.getAll();
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Tipos de documento
router.get('/tipos-documento', async (req: Request, res: Response) => {
    try {
        const { TipoDocumentoService } = await import('../../services/catalogoService');
        const tipos = await TipoDocumentoService.getAll();
        res.json(tipos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Métodos de pago
router.get('/metodos-pago', async (req: Request, res: Response) => {
    try {
        const { MetodoPagoService } = await import('../../services/metodoPagoService');
        const metodos = await MetodoPagoService.getAll();
        res.json(metodos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Países
router.get('/paises', async (req: Request, res: Response) => {
    try {
        const { PaisService } = await import('../../services/catalogoService');
        const paises = await PaisService.getAll();
        res.json(paises);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Ciudades
router.get('/ciudades', async (req: Request, res: Response) => {
    try {
        const { CiudadService } = await import('../../services/catalogoService');
        const ciudades = await CiudadService.getAll();
        res.json(ciudades);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Estadios
router.get('/estadios', async (req: Request, res: Response) => {
    try {
        const { EstadioService } = await import('../../services/catalogoService');
        const estadios = await EstadioService.getAll();
        res.json(estadios);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Apostadores (para reportes y selects)
router.get('/apostadores', async (req: Request, res: Response) => {
    try {
        const { ApostadorService } = await import('../../services/apostadorService');
        const apostadores = await ApostadorService.getAll();
        res.json(apostadores);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Estados por entidad
router.get('/estados/:entidad', async (req: Request, res: Response) => {
    try {
        const { EstadoService } = await import('../../services/catalogoService');
        const entidad = req.params.entidad.toUpperCase();
        const estados = await EstadoService.getByEntidad(entidad);
        res.json(estados);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
