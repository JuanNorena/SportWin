import { Router, Request, Response } from 'express';
import { PartidoService } from '../../services/partidoService';

const router = Router();

/**
 * GET /api/partidos
 * Obtener todos los partidos
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { completo } = req.query;
        
        if (completo === 'true') {
            const partidos = await PartidoService.getAllComplete();
            res.json(partidos);
        } else {
            const partidos = await PartidoService.getAll();
            res.json(partidos);
        }
    } catch (error: any) {
        console.error('Error al obtener partidos:', error);
        res.status(500).json({
            error: 'Error al obtener partidos',
            message: error.message
        });
    }
});

/**
 * GET /api/partidos/programados
 * Obtener partidos programados
 */
router.get('/programados', async (req: Request, res: Response) => {
    try {
        const partidos = await PartidoService.getProgramados();
        res.json(partidos);
    } catch (error: any) {
        console.error('Error al obtener partidos programados:', error);
        res.status(500).json({
            error: 'Error al obtener partidos programados',
            message: error.message
        });
    }
});

/**
 * GET /api/partidos/finalizados
 * Obtener partidos finalizados
 */
router.get('/finalizados', async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const partidos = await PartidoService.getFinalizados(limit);
        res.json(partidos);
    } catch (error: any) {
        console.error('Error al obtener partidos finalizados:', error);
        res.status(500).json({
            error: 'Error al obtener partidos finalizados',
            message: error.message
        });
    }
});

/**
 * GET /api/partidos/:id
 * Obtener partido por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const partido = await PartidoService.getById(parseInt(id));
        
        if (!partido) {
            return res.status(404).json({
                error: 'Partido no encontrado'
            });
        }
        
        res.json(partido);
    } catch (error: any) {
        console.error('Error al obtener partido:', error);
        res.status(500).json({
            error: 'Error al obtener partido',
            message: error.message
        });
    }
});

/**
 * POST /api/partidos
 * Crear nuevo partido
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const partidoId = await PartidoService.create(req.body);
        res.status(201).json({
            message: 'Partido creado exitosamente',
            id: partidoId
        });
    } catch (error: any) {
        console.error('Error al crear partido:', error);
        res.status(500).json({
            error: 'Error al crear partido',
            message: error.message
        });
    }
});

/**
 * PUT /api/partidos/:id
 * Actualizar partido
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await PartidoService.update(parseInt(id), req.body);
        
        if (!success) {
            return res.status(404).json({
                error: 'Partido no encontrado o sin cambios'
            });
        }
        
        res.json({
            message: 'Partido actualizado exitosamente'
        });
    } catch (error: any) {
        console.error('Error al actualizar partido:', error);
        res.status(500).json({
            error: 'Error al actualizar partido',
            message: error.message
        });
    }
});

/**
 * DELETE /api/partidos/:id
 * Eliminar partido
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await PartidoService.delete(parseInt(id));
        
        if (!success) {
            return res.status(404).json({
                error: 'Partido no encontrado'
            });
        }
        
        res.json({
            message: 'Partido eliminado exitosamente'
        });
    } catch (error: any) {
        console.error('Error al eliminar partido:', error);
        res.status(500).json({
            error: 'Error al eliminar partido',
            message: error.message
        });
    }
});

export default router;
