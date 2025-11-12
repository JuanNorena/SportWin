import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        res.json({ message: 'Reportes endpoint' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
