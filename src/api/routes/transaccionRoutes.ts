import { Router, Request, Response } from 'express';
import { TransaccionService } from '../../services/transaccionService';

const router = Router();

/**
 * GET /api/transacciones
 * Obtener todas las transacciones
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const transacciones = await TransaccionService.getAll();
        res.json(transacciones);
    } catch (error: any) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({
            error: 'Error al obtener transacciones',
            message: error.message
        });
    }
});

/**
 * GET /api/transacciones/apostador/:idApostador
 * Obtener transacciones de un apostador
 */
router.get('/apostador/:idApostador', async (req: Request, res: Response) => {
    try {
        const { idApostador } = req.params;
        const transacciones = await TransaccionService.getByApostador(parseInt(idApostador));
        res.json(transacciones);
    } catch (error: any) {
        console.error('Error al obtener transacciones del apostador:', error);
        res.status(500).json({
            error: 'Error al obtener transacciones',
            message: error.message
        });
    }
});

/**
 * GET /api/transacciones/:id
 * Obtener transacción por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const transaccion = await TransaccionService.getById(parseInt(id));
        
        if (!transaccion) {
            return res.status(404).json({
                error: 'Transacción no encontrada'
            });
        }
        
        res.json(transaccion);
    } catch (error: any) {
        console.error('Error al obtener transacción:', error);
        res.status(500).json({
            error: 'Error al obtener transacción',
            message: error.message
        });
    }
});

/**
 * POST /api/transacciones/deposito
 * Crear depósito
 */
router.post('/deposito', async (req: Request, res: Response) => {
    try {
        const { id_apostador, monto, id_metodo_pago, referencia } = req.body;

        if (!id_apostador || !monto || !id_metodo_pago) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: id_apostador, monto, id_metodo_pago'
            });
        }

        // Validar que monto sea positivo
        if (monto <= 0) {
            return res.status(400).json({
                error: 'El monto debe ser mayor a 0'
            });
        }

        const transaccionId = await TransaccionService.createDeposito(
            parseInt(id_apostador),
            parseFloat(monto),
            parseInt(id_metodo_pago),
            referencia
        );

        res.status(201).json({
            message: 'Depósito realizado exitosamente',
            id_transaccion: transaccionId
        });
    } catch (error: any) {
        console.error('Error al crear depósito:', error);
        res.status(500).json({
            error: 'Error al crear depósito',
            message: error.message
        });
    }
});

/**
 * POST /api/transacciones/retiro
 * Crear retiro
 */
router.post('/retiro', async (req: Request, res: Response) => {
    try {
        const { id_apostador, monto, id_metodo_pago, referencia } = req.body;

        if (!id_apostador || !monto || !id_metodo_pago) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: id_apostador, monto, id_metodo_pago'
            });
        }

        // Validar que monto sea positivo
        if (monto <= 0) {
            return res.status(400).json({
                error: 'El monto debe ser mayor a 0'
            });
        }

        const transaccionId = await TransaccionService.createRetiro(
            parseInt(id_apostador),
            parseFloat(monto),
            parseInt(id_metodo_pago),
            referencia
        );

        res.status(201).json({
            message: 'Retiro realizado exitosamente',
            id_transaccion: transaccionId
        });
    } catch (error: any) {
        console.error('Error al crear retiro:', error);
        
        // Manejar error de saldo insuficiente
        if (error.message.includes('Saldo insuficiente')) {
            return res.status(400).json({
                error: 'Saldo insuficiente para realizar el retiro'
            });
        }
        
        res.status(500).json({
            error: 'Error al crear retiro',
            message: error.message
        });
    }
});

export default router;
