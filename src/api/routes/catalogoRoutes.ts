import { Router, Request, Response } from 'express';
import { DeporteService } from '../../services/deporteService';
import { LigaService } from '../../services/ligaService';
import { EquipoService } from '../../services/equipoService';

const router = Router();

// Deportes
router.get('/deportes', async (req: Request, res: Response) => {
    try {
        const deportes = await DeporteService.getAll();
        res.json(deportes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Ligas
router.get('/ligas', async (req: Request, res: Response) => {
    try {
        const ligas = await LigaService.getAll();
        res.json(ligas);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Equipos
router.get('/equipos', async (req: Request, res: Response) => {
    try {
        const equipos = await EquipoService.getAll();
        res.json(equipos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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

export default router;
