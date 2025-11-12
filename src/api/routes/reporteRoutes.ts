import { Router } from 'express';
import { ejecutarReporte } from '../../controllers/reporteController';

const router = Router();

// POST /api/reportes/ejecutar - Ejecutar un reporte con parámetros
router.post('/ejecutar', ejecutarReporte);

export default router;
