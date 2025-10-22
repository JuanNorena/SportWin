import { ConsoleUtils } from '../utils/console';
import { TransaccionService } from '../services/transaccionService';
import { ApostadorService } from '../services/apostadorService';
import db from '../utils/database';

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
        console.log();

        // Mostrar lista de apostadores
        ConsoleUtils.info('=== APOSTADORES DISPONIBLES ===');
        const apostadores = await db.query(
            `SELECT a.id_apostador, u.nombre, u.apellido, a.documento, a.saldo_actual
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             ORDER BY a.id_apostador`
        );

        if (apostadores.rows.length === 0) {
            ConsoleUtils.error('No hay apostadores registrados');
            ConsoleUtils.pause();
            return;
        }

        const apostadoresData = apostadores.rows.map(a => ({
            id: a.id_apostador,
            nombre: `${a.nombre} ${a.apellido}`,
            documento: a.documento,
            saldo: ConsoleUtils.formatCurrency(a.saldo_actual)
        }));

        ConsoleUtils.showTable(apostadoresData, ['ID', 'Nombre', 'Documento', 'Saldo']);
        console.log();
        ConsoleUtils.warning('IMPORTANTE: Use el ID (columna ID), NO el número de documento/cédula');
        console.log();

        const buscarPor = ConsoleUtils.showMenu('¿Cómo desea buscar al apostador?', [
            'Por ID (columna ID de la tabla)',
            'Por Documento/Cédula'
        ]);

        let apostadorExiste;

        if (buscarPor === 1) {
            const idApostador = ConsoleUtils.inputNumber('ID del apostador (columna ID)', 1);
            apostadorExiste = apostadores.rows.find(a => a.id_apostador === idApostador);
        } else {
            const documento = ConsoleUtils.input('Número de documento/cédula');
            apostadorExiste = apostadores.rows.find(a => a.documento === documento);
        }

        if (!apostadorExiste) {
            ConsoleUtils.error('No se encontró el apostador');
            ConsoleUtils.pause();
            return;
        }

        const idApostador = apostadorExiste.id_apostador;

        console.log();
        ConsoleUtils.info('=== MÉTODOS DE PAGO DISPONIBLES ===');
        
        // Mostrar métodos de pago
        const metodosPago = await db.query(
            `SELECT id_metodo_pago, nombre, descripcion, comision
             FROM MetodoPago
             WHERE activo = true
             ORDER BY id_metodo_pago`
        );

        const metodosData = metodosPago.rows.map(m => ({
            id: m.id_metodo_pago,
            método: m.nombre,
            descripción: m.descripcion,
            comisión: `${m.comision}%`
        }));

        ConsoleUtils.showTable(metodosData, ['ID', 'Método', 'Descripción', 'Comisión']);
        console.log();

        const idMetodoPago = ConsoleUtils.inputNumber('ID del método de pago', 1);

        // Verificar que el método de pago existe
        const metodoExiste = metodosPago.rows.find(m => m.id_metodo_pago === idMetodoPago);
        if (!metodoExiste) {
            ConsoleUtils.error('El ID del método de pago no existe');
            ConsoleUtils.pause();
            return;
        }

        const monto = ConsoleUtils.inputNumber('Monto a depositar', 1000);
        const referencia = ConsoleUtils.input('Referencia (opcional)', false);

        // Calcular comisión
        const comision = (monto * metodoExiste.comision) / 100;
        const montoNeto = monto - comision;

        console.log();
        ConsoleUtils.info(`Monto bruto: ${ConsoleUtils.formatCurrency(monto)}`);
        ConsoleUtils.info(`Comisión (${metodoExiste.comision}%): ${ConsoleUtils.formatCurrency(comision)}`);
        ConsoleUtils.info(`Monto neto a acreditar: ${ConsoleUtils.formatCurrency(montoNeto)}`);
        console.log();

        const confirmar = ConsoleUtils.confirm('¿Confirmar depósito?');
        if (!confirmar) {
            ConsoleUtils.warning('Depósito cancelado');
            ConsoleUtils.pause();
            return;
        }

        const id = await TransaccionService.createDeposito(
            idApostador,
            idMetodoPago,
            monto,
            referencia || undefined
        );

        ConsoleUtils.success(`¡Depósito realizado exitosamente!`);
        ConsoleUtils.info(`ID de transacción: ${id}`);
        ConsoleUtils.info(`Nuevo saldo: ${ConsoleUtils.formatCurrency(apostadorExiste.saldo_actual + montoNeto)}`);
        ConsoleUtils.pause();
    }

    private static async retiro(): Promise<void> {
        ConsoleUtils.showHeader('Realizar Retiro');
        console.log();

        // Mostrar lista de apostadores con saldo
        ConsoleUtils.info('=== APOSTADORES CON SALDO DISPONIBLE ===');
        const apostadores = await db.query(
            `SELECT a.id_apostador, u.nombre, u.apellido, a.documento, a.saldo_actual
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             WHERE a.saldo_actual > 0
             ORDER BY a.id_apostador`
        );

        if (apostadores.rows.length === 0) {
            ConsoleUtils.error('No hay apostadores con saldo disponible');
            ConsoleUtils.pause();
            return;
        }

        const apostadoresData = apostadores.rows.map(a => ({
            id: a.id_apostador,
            nombre: `${a.nombre} ${a.apellido}`,
            documento: a.documento,
            saldo: ConsoleUtils.formatCurrency(a.saldo_actual)
        }));

        ConsoleUtils.showTable(apostadoresData, ['ID', 'Nombre', 'Documento', 'Saldo']);
        console.log();
        ConsoleUtils.warning('IMPORTANTE: Use el ID (columna ID), NO el número de documento/cédula');
        console.log();

        const buscarPor = ConsoleUtils.showMenu('¿Cómo desea buscar al apostador?', [
            'Por ID (columna ID de la tabla)',
            'Por Documento/Cédula'
        ]);

        let apostadorExiste;

        if (buscarPor === 1) {
            const idApostador = ConsoleUtils.inputNumber('ID del apostador (columna ID)', 1);
            apostadorExiste = apostadores.rows.find(a => a.id_apostador === idApostador);
        } else {
            const documento = ConsoleUtils.input('Número de documento/cédula');
            apostadorExiste = apostadores.rows.find(a => a.documento === documento);
        }

        if (!apostadorExiste) {
            ConsoleUtils.error('No se encontró el apostador o no tiene saldo');
            ConsoleUtils.pause();
            return;
        }

        const idApostador = apostadorExiste.id_apostador;

        console.log();
        ConsoleUtils.info(`Saldo disponible: ${ConsoleUtils.formatCurrency(apostadorExiste.saldo_actual)}`);
        console.log();

        ConsoleUtils.info('=== MÉTODOS DE PAGO DISPONIBLES ===');
        
        // Mostrar métodos de pago
        const metodosPago = await db.query(
            `SELECT id_metodo_pago, nombre, descripcion, comision
             FROM MetodoPago
             WHERE activo = true
             ORDER BY id_metodo_pago`
        );

        const metodosData = metodosPago.rows.map(m => ({
            id: m.id_metodo_pago,
            método: m.nombre,
            descripción: m.descripcion,
            comisión: `${m.comision}%`
        }));

        ConsoleUtils.showTable(metodosData, ['ID', 'Método', 'Descripción', 'Comisión']);
        console.log();

        const idMetodoPago = ConsoleUtils.inputNumber('ID del método de pago', 1);

        // Verificar que el método de pago existe
        const metodoExiste = metodosPago.rows.find(m => m.id_metodo_pago === idMetodoPago);
        if (!metodoExiste) {
            ConsoleUtils.error('El ID del método de pago no existe');
            ConsoleUtils.pause();
            return;
        }

        const monto = ConsoleUtils.inputNumber('Monto a retirar', 1000);

        // Verificar saldo suficiente
        if (monto > apostadorExiste.saldo_actual) {
            ConsoleUtils.error('Saldo insuficiente');
            ConsoleUtils.pause();
            return;
        }

        const referencia = ConsoleUtils.input('Referencia (opcional)', false);

        // Calcular comisión
        const comision = (monto * metodoExiste.comision) / 100;
        const montoNeto = monto - comision;

        console.log();
        ConsoleUtils.info(`Monto bruto: ${ConsoleUtils.formatCurrency(monto)}`);
        ConsoleUtils.info(`Comisión (${metodoExiste.comision}%): ${ConsoleUtils.formatCurrency(comision)}`);
        ConsoleUtils.info(`Monto neto a recibir: ${ConsoleUtils.formatCurrency(montoNeto)}`);
        ConsoleUtils.info(`Nuevo saldo: ${ConsoleUtils.formatCurrency(apostadorExiste.saldo_actual - monto)}`);
        console.log();

        const confirmar = ConsoleUtils.confirm('¿Confirmar retiro?');
        if (!confirmar) {
            ConsoleUtils.warning('Retiro cancelado');
            ConsoleUtils.pause();
            return;
        }

        const id = await TransaccionService.createRetiro(
            idApostador,
            idMetodoPago,
            monto,
            referencia || undefined
        );

        ConsoleUtils.success(`¡Retiro realizado exitosamente!`);
        ConsoleUtils.info(`ID de transacción: ${id}`);
        ConsoleUtils.pause();
    }

    private static async historial(): Promise<void> {
        ConsoleUtils.showHeader('Historial de Transacciones');
        console.log();

        // Mostrar lista de apostadores
        ConsoleUtils.info('=== APOSTADORES DISPONIBLES ===');
        const apostadores = await db.query(
            `SELECT a.id_apostador, u.nombre, u.apellido, a.documento
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             ORDER BY a.id_apostador`
        );

        const apostadoresData = apostadores.rows.map(a => ({
            id: a.id_apostador,
            nombre: `${a.nombre} ${a.apellido}`,
            documento: a.documento
        }));

        ConsoleUtils.showTable(apostadoresData, ['ID', 'Nombre', 'Documento']);
        console.log();
        ConsoleUtils.warning('IMPORTANTE: Use el ID (columna ID), NO el número de documento/cédula');
        console.log();

        const buscarPor = ConsoleUtils.showMenu('¿Cómo desea buscar al apostador?', [
            'Por ID (columna ID de la tabla)',
            'Por Documento/Cédula'
        ]);

        let apostadorExiste;

        if (buscarPor === 1) {
            const idApostador = ConsoleUtils.inputNumber('ID del apostador (columna ID)', 1);
            apostadorExiste = apostadores.rows.find(a => a.id_apostador === idApostador);
        } else {
            const documento = ConsoleUtils.input('Número de documento/cédula');
            apostadorExiste = apostadores.rows.find(a => a.documento === documento);
        }

        if (!apostadorExiste) {
            ConsoleUtils.error('No se encontró el apostador');
            ConsoleUtils.pause();
            return;
        }

        const idApostador = apostadorExiste.id_apostador;
        
        const transacciones = await TransaccionService.getByApostador(idApostador);

        console.log();
        if (transacciones.length === 0) {
            ConsoleUtils.warning('No hay transacciones registradas para este apostador');
        } else {
            ConsoleUtils.success(`Se encontraron ${transacciones.length} transacciones`);
            console.log();
            
            const data = transacciones.slice(0, 20).map(t => ({
                id: t.id_transaccion,
                tipo: t.tipo,
                monto: ConsoleUtils.formatCurrency(t.monto),
                comisión: ConsoleUtils.formatCurrency(t.comision),
                neto: ConsoleUtils.formatCurrency(t.monto_neto),
                fecha: ConsoleUtils.formatDate(t.fecha_transaccion),
                estado: t.estado
            }));

            ConsoleUtils.showTable(data, ['ID', 'Tipo', 'Monto', 'Comisión', 'Neto', 'Fecha', 'Estado']);
            
            if (transacciones.length > 20) {
                ConsoleUtils.info(`(Mostrando 20 de ${transacciones.length} transacciones)`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async historialFinanciero(): Promise<void> {
        ConsoleUtils.showHeader('Historial Financiero');
        console.log();

        // Mostrar lista de apostadores
        ConsoleUtils.info('=== APOSTADORES DISPONIBLES ===');
        const apostadores = await db.query(
            `SELECT a.id_apostador, u.nombre, u.apellido, a.documento, a.saldo_actual
             FROM Apostador a
             JOIN Usuario u ON a.id_usuario = u.id_usuario
             ORDER BY a.id_apostador`
        );

        const apostadoresData = apostadores.rows.map(a => ({
            id: a.id_apostador,
            nombre: `${a.nombre} ${a.apellido}`,
            documento: a.documento,
            saldo: ConsoleUtils.formatCurrency(a.saldo_actual)
        }));

        ConsoleUtils.showTable(apostadoresData, ['ID', 'Nombre', 'Documento', 'Saldo']);
        console.log();
        ConsoleUtils.warning('IMPORTANTE: Use el ID (columna ID), NO el número de documento/cédula');
        console.log();

        const buscarPor = ConsoleUtils.showMenu('¿Cómo desea buscar al apostador?', [
            'Por ID (columna ID de la tabla)',
            'Por Documento/Cédula'
        ]);

        let apostadorExiste;

        if (buscarPor === 1) {
            const idApostador = ConsoleUtils.inputNumber('ID del apostador (columna ID)', 1);
            apostadorExiste = apostadores.rows.find(a => a.id_apostador === idApostador);
        } else {
            const documento = ConsoleUtils.input('Número de documento/cédula');
            apostadorExiste = apostadores.rows.find(a => a.documento === documento);
        }

        if (!apostadorExiste) {
            ConsoleUtils.error('No se encontró el apostador');
            ConsoleUtils.pause();
            return;
        }

        const idApostador = apostadorExiste.id_apostador;
        const historial = await TransaccionService.getHistorialFinanciero(idApostador);

        console.log();
        ConsoleUtils.info('=== RESUMEN FINANCIERO ===');
        console.log();
        ConsoleUtils.info(`💰 Total Depósitos: ${ConsoleUtils.formatCurrency(historial.total_depositos || 0)}`);
        ConsoleUtils.info(`💸 Total Retiros: ${ConsoleUtils.formatCurrency(historial.total_retiros || 0)}`);
        ConsoleUtils.info(`🎲 Total Apostado: ${ConsoleUtils.formatCurrency(historial.total_apostado || 0)}`);
        ConsoleUtils.info(`🏆 Total Ganancias: ${ConsoleUtils.formatCurrency(historial.total_ganancias || 0)}`);
        ConsoleUtils.info(`📊 Total Transacciones: ${historial.total_transacciones}`);
        console.log();

        const balance = (historial.total_depositos || 0) - (historial.total_retiros || 0) + (historial.total_ganancias || 0) - (historial.total_apostado || 0);
        if (balance >= 0) {
            ConsoleUtils.success(`Balance neto: ${ConsoleUtils.formatCurrency(balance)}`);
        } else {
            ConsoleUtils.error(`Balance neto: ${ConsoleUtils.formatCurrency(balance)}`);
        }

        ConsoleUtils.pause();
    }
}
