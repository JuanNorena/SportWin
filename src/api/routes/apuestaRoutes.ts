import { Router, Request, Response } from 'express';
import { ApuestaService } from '../../services/apuestaService';

const router = Router();

/**
 * GET /api/apuestas
 * Obtener todas las apuestas con información completa
 * Retorna apuestas con nombres de apostador, partido, equipos, liga y estado
 * en lugar de solo IDs para facilitar la visualización
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const apuestas = await ApuestaService.getAllDetailed();
        res.json(apuestas);
    } catch (error: any) {
        console.error('Error al obtener apuestas:', error);
        res.status(500).json({
            error: 'Error al obtener apuestas',
            message: error.message
        });
    }
});

/**
 * GET /api/apuestas/apostador/:idApostador
 * Obtener apuestas de un apostador
 */
router.get('/apostador/:idApostador', async (req: Request, res: Response) => {
    try {
        const { idApostador } = req.params;
        const apuestas = await ApuestaService.getByApostador(parseInt(idApostador));
        res.json(apuestas);
    } catch (error: any) {
        console.error('Error al obtener apuestas del apostador:', error);
        res.status(500).json({
            error: 'Error al obtener apuestas',
            message: error.message
        });
    }
});

/**
 * GET /api/apuestas/:id
 * Obtener apuesta por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const apuesta = await ApuestaService.getById(parseInt(id));
        
        if (!apuesta) {
            return res.status(404).json({
                error: 'Apuesta no encontrada'
            });
        }
        
        res.json(apuesta);
    } catch (error: any) {
        console.error('Error al obtener apuesta:', error);
        res.status(500).json({
            error: 'Error al obtener apuesta',
            message: error.message
        });
    }
});

/**
 * POST /api/apuestas
 * Crear nueva apuesta
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id_apostador, id_cuota, monto_apostado } = req.body;

        if (!id_apostador || !id_cuota || !monto_apostado) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: id_apostador, id_cuota, monto_apostado'
            });
        }

        // Validar que monto_apostado sea positivo
        if (monto_apostado <= 0) {
            return res.status(400).json({
                error: 'El monto apostado debe ser mayor a 0'
            });
        }

        const apuestaId = await ApuestaService.create(
            parseInt(id_apostador),
            parseInt(id_cuota),
            parseFloat(monto_apostado)
        );

        res.status(201).json({
            message: 'Apuesta creada exitosamente',
            id_apuesta: apuestaId
        });
    } catch (error: any) {
        console.error('Error al crear apuesta:', error);
        
        // Manejar errores específicos
        if (error.message.includes('Saldo insuficiente')) {
            return res.status(400).json({
                error: 'Saldo insuficiente para realizar la apuesta'
            });
        }
        
        if (error.message.includes('Cuota no válida')) {
            return res.status(400).json({
                error: 'La cuota seleccionada no es válida o está inactiva'
            });
        }
        
        if (error.message.includes('no acepta apuestas')) {
            return res.status(400).json({
                error: 'El partido ya no acepta apuestas'
            });
        }
        
        res.status(500).json({
            error: 'Error al crear apuesta',
            message: error.message
        });
    }
});

export default router;
