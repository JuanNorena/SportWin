import { Request, Response } from 'express';
import { ejecutarReporteSQL } from '../services/reporteService';

export const ejecutarReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reporteId, parametros } = req.body;

    if (!reporteId) {
      res.status(400).json({ error: 'reporteId es requerido' });
      return;
    }

    const resultado = await ejecutarReporteSQL(reporteId, parametros || {});
    res.json(resultado);
  } catch (error) {
    console.error('Error al ejecutar reporte:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error al ejecutar el reporte' 
    });
  }
};
