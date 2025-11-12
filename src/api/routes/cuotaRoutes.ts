import { Router, Request, Response } from 'express';
import { CuotaService } from '../../services/cuotaService';

const router = Router();

/**
 * GET /api/cuotas
 * Obtener todas las cuotas activas
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const cuotas = await CuotaService.getAll();
        res.json(cuotas);
    } catch (error: any) {
        console.error('Error al obtener cuotas:', error);
        res.status(500).json({
            error: 'Error al obtener cuotas',
            message: error.message
        });
    }
});

/**
 * GET /api/cuotas/partido/:idPartido
 * Obtener cuotas de un partido específico
 */
router.get('/partido/:idPartido', async (req: Request, res: Response) => {
    try {
        const { idPartido } = req.params;
        const cuotas = await CuotaService.getByPartido(parseInt(idPartido));
        res.json(cuotas);
    } catch (error: any) {
        console.error('Error al obtener cuotas del partido:', error);
        res.status(500).json({
            error: 'Error al obtener cuotas del partido',
            message: error.message
        });
    }
});

/**
 * GET /api/cuotas/:id
 * Obtener cuota por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cuota = await CuotaService.getById(parseInt(id));
        
        if (!cuota) {
            return res.status(404).json({
                error: 'Cuota no encontrada'
            });
        }
        
        res.json(cuota);
    } catch (error: any) {
        console.error('Error al obtener cuota:', error);
        res.status(500).json({
            error: 'Error al obtener cuota',
            message: error.message
        });
    }
});

export default router;
