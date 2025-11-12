import { Router, Request, Response } from 'express';
import { ApostadorService } from '../../services/apostadorService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const apostadores = await ApostadorService.getAll();
        res.json(apostadores);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const apostador = await ApostadorService.getById(parseInt(req.params.id));
        if (!apostador) return res.status(404).json({ error: 'No encontrado' });
        res.json(apostador);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
