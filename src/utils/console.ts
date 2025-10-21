import * as readlineSync from 'readline-sync';
import chalk from 'chalk';

/**
 * Utilidades para la interfaz de consola
 */
export class ConsoleUtils {
    /**
     * Limpiar consola
     */
    public static clear(): void {
        console.clear();
    }

    /**
     * Mostrar encabezado
     */
    public static showHeader(title: string): void {
        this.clear();
        console.log(chalk.cyan('═'.repeat(80)));
        console.log(chalk.cyan.bold(`  ${title.toUpperCase()}`));
        console.log(chalk.cyan('═'.repeat(80)));
        console.log();
    }

    /**
     * Mostrar mensaje de éxito
     */
    public static success(message: string): void {
        console.log(chalk.green(`✓ ${message}`));
    }

    /**
     * Mostrar mensaje de error
     */
    public static error(message: string): void {
        console.log(chalk.red(`✗ ${message}`));
    }

    /**
     * Mostrar mensaje de advertencia
     */
    public static warning(message: string): void {
        console.log(chalk.yellow(`⚠ ${message}`));
    }

    /**
     * Mostrar información
     */
    public static info(message: string): void {
        console.log(chalk.blue(`ℹ ${message}`));
    }

    /**
     * Pausar ejecución
     */
    public static pause(): void {
        console.log();
        readlineSync.question(chalk.gray('Presione ENTER para continuar...'));
    }

    /**
     * Mostrar menú y obtener opción
     */
    public static showMenu(title: string, options: string[]): number {
        this.showHeader(title);
        
        options.forEach((option, index) => {
            console.log(chalk.white(`  ${index + 1}. ${option}`));
        });
        console.log();
        
        const choice = readlineSync.questionInt(chalk.yellow('Seleccione una opción: '), {
            limit: [1, options.length],
            limitMessage: chalk.red('Opción inválida. Intente nuevamente.')
        });
        
        return choice;
    }

    /**
     * Solicitar entrada de texto
     */
    public static input(prompt: string, required: boolean = true): string {
        const value = readlineSync.question(chalk.yellow(`${prompt}: `));
        
        if (required && !value.trim()) {
            this.error('Este campo es obligatorio');
            return this.input(prompt, required);
        }
        
        return value.trim();
    }

    /**
     * Solicitar entrada de número
     */
    public static inputNumber(prompt: string, min?: number, max?: number): number {
        const value = readlineSync.questionFloat(chalk.yellow(`${prompt}: `));
        
        if (min !== undefined && value < min) {
            this.error(`El valor debe ser mayor o igual a ${min}`);
            return this.inputNumber(prompt, min, max);
        }
        
        if (max !== undefined && value > max) {
            this.error(`El valor debe ser menor o igual a ${max}`);
            return this.inputNumber(prompt, min, max);
        }
        
        return value;
    }

    /**
     * Solicitar confirmación
     */
    public static confirm(prompt: string): boolean {
        const result = readlineSync.keyInYN(chalk.yellow(`${prompt}?`));
        return result === true;
    }

    /**
     * Mostrar tabla simple
     */
    public static showTable(data: any[], headers?: string[]): void {
        if (data.length === 0) {
            this.warning('No hay datos para mostrar');
            return;
        }

        const Table = require('cli-table3');
        
        const tableHeaders = headers || Object.keys(data[0]);
        const table = new Table({
            head: tableHeaders.map(h => chalk.cyan(h)),
            style: { head: [], border: [] }
        });

        data.forEach(row => {
            const values = tableHeaders.map(header => {
                const key = header.toLowerCase().replace(/ /g, '_');
                return row[key] !== undefined && row[key] !== null ? String(row[key]) : 'N/A';
            });
            table.push(values);
        });

        console.log(table.toString());
    }

    /**
     * Formatear moneda
     */
    public static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Formatear fecha
     */
    public static formatDate(date: Date | string): string {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
