import { ConsoleUtils } from '../utils/console';
import { TransaccionService } from '../services/transaccionService';

/**
 * Controlador de Transacciones
 */
export class TransaccionController {
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Realizar Depósito',
                'Realizar Retiro',
                'Ver Historial',
                'Ver Historial Financiero',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Transacciones', options);

            try {
                switch (choice) {
                    case 1:
                        await this.deposito();
                        break;
                    case 2:
                        await this.retiro();
                        break;
                    case 3:
                        await this.historial();
                        break;
                    case 4:
                        await this.historialFinanciero();
                        break;
                    case 5:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async deposito(): Promise<void> {
        ConsoleUtils.showHeader('Realizar Depósito');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const idMetodoPago = ConsoleUtils.inputNumber('ID del método de pago (1-7)');
        const monto = ConsoleUtils.inputNumber('Monto a depositar', 1000);
        const referencia = ConsoleUtils.input('Referencia (opcional)', false);

        const id = await TransaccionService.createDeposito(
            idApostador,
            idMetodoPago,
            monto,
            referencia || undefined
        );

        ConsoleUtils.success(`Depósito realizado exitosamente. ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async retiro(): Promise<void> {
        ConsoleUtils.showHeader('Realizar Retiro');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const idMetodoPago = ConsoleUtils.inputNumber('ID del método de pago (1-7)');
        const monto = ConsoleUtils.inputNumber('Monto a retirar', 1000);
        const referencia = ConsoleUtils.input('Referencia (opcional)', false);

        const id = await TransaccionService.createRetiro(
            idApostador,
            idMetodoPago,
            monto,
            referencia || undefined
        );

        ConsoleUtils.success(`Retiro realizado exitosamente. ID: ${id}`);
        ConsoleUtils.pause();
    }

    private static async historial(): Promise<void> {
        ConsoleUtils.showHeader('Historial de Transacciones');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const transacciones = await TransaccionService.getByApostador(idApostador);

        if (transacciones.length === 0) {
            ConsoleUtils.warning('No hay transacciones registradas');
        } else {
            const data = transacciones.slice(0, 20).map(t => ({
                id: t.id_transaccion,
                tipo: t.tipo,
                monto: ConsoleUtils.formatCurrency(t.monto),
                comision: ConsoleUtils.formatCurrency(t.comision),
                neto: ConsoleUtils.formatCurrency(t.monto_neto),
                fecha: ConsoleUtils.formatDate(t.fecha_transaccion),
                estado: t.estado
            }));

            ConsoleUtils.showTable(data, ['ID', 'Tipo', 'Monto', 'Comisión', 'Neto', 'Fecha', 'Estado']);
        }

        ConsoleUtils.pause();
    }

    private static async historialFinanciero(): Promise<void> {
        ConsoleUtils.showHeader('Historial Financiero');

        const idApostador = ConsoleUtils.inputNumber('ID del apostador');
        const historial = await TransaccionService.getHistorialFinanciero(idApostador);

        console.log();
        ConsoleUtils.info(`Total Depósitos: ${ConsoleUtils.formatCurrency(historial.total_depositos || 0)}`);
        ConsoleUtils.info(`Total Retiros: ${ConsoleUtils.formatCurrency(historial.total_retiros || 0)}`);
        ConsoleUtils.info(`Total Apostado: ${ConsoleUtils.formatCurrency(historial.total_apostado || 0)}`);
        ConsoleUtils.info(`Total Ganancias: ${ConsoleUtils.formatCurrency(historial.total_ganancias || 0)}`);
        ConsoleUtils.info(`Total Transacciones: ${historial.total_transacciones}`);

        ConsoleUtils.pause();
    }
}
