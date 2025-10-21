/**
 * Interfaces de los modelos de datos del sistema
 */

export interface Usuario {
    id_usuario: number;
    username: string;
    password_hash?: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'admin' | 'operador' | 'apostador';
    fecha_creacion: Date;
    ultimo_acceso?: Date;
    activo: boolean;
}

export interface Apostador {
    id_apostador: number;
    id_usuario: number;
    documento: string;
    tipo_documento: 'CC' | 'CE' | 'TI' | 'Pasaporte';
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    pais: string;
    fecha_nacimiento: Date;
    saldo_actual: number;
    fecha_registro: Date;
    verificado: boolean;
}

export interface Deporte {
    id_deporte: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
    activo: boolean;
}

export interface Liga {
    id_liga: number;
    id_deporte: number;
    nombre: string;
    pais?: string;
    temporada?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    activo: boolean;
}

export interface Equipo {
    id_equipo: number;
    id_liga: number;
    nombre: string;
    pais?: string;
    ciudad?: string;
    estadio?: string;
    entrenador?: string;
    fundacion?: number;
    activo: boolean;
}

export interface Partido {
    id_partido: number;
    id_liga: number;
    id_equipo_local: number;
    id_equipo_visitante: number;
    fecha_hora: Date;
    estadio?: string;
    jornada?: number;
    estado: 'programado' | 'en_curso' | 'finalizado' | 'suspendido' | 'cancelado';
    arbitro?: string;
    asistencia?: number;
}

export interface Resultado {
    id_resultado: number;
    id_partido: number;
    goles_local: number;
    goles_visitante: number;
    tarjetas_amarillas_local: number;
    tarjetas_amarillas_visitante: number;
    tarjetas_rojas_local: number;
    tarjetas_rojas_visitante: number;
    corners_local: number;
    corners_visitante: number;
    fecha_actualizacion: Date;
}

export interface TipoApuesta {
    id_tipo_apuesta: number;
    nombre: string;
    descripcion?: string;
    categoria: 'resultado' | 'marcador' | 'jugador' | 'estadistica';
    activo: boolean;
}

export interface Cuota {
    id_cuota: number;
    id_partido: number;
    id_tipo_apuesta: number;
    descripcion: string;
    valor_cuota: number;
    resultado_esperado?: string;
    fecha_creacion: Date;
    fecha_cierre?: Date;
    activo: boolean;
}

export interface Apuesta {
    id_apuesta: number;
    id_apostador: number;
    id_cuota: number;
    monto_apostado: number;
    cuota_aplicada: number;
    ganancia_potencial: number;
    fecha_apuesta: Date;
    estado: 'pendiente' | 'ganada' | 'perdida' | 'cancelada' | 'reembolsada';
    fecha_resolucion?: Date;
    ganancia_real: number;
}

export interface Transaccion {
    id_transaccion: number;
    id_apostador: number;
    id_metodo_pago?: number;
    id_apuesta?: number;
    tipo: 'deposito' | 'retiro' | 'apuesta' | 'ganancia' | 'reembolso';
    monto: number;
    comision: number;
    monto_neto: number;
    fecha_transaccion: Date;
    estado: 'pendiente' | 'completada' | 'rechazada' | 'cancelada';
    referencia?: string;
    descripcion?: string;
}

export interface MetodoPago {
    id_metodo_pago: number;
    nombre: string;
    descripcion?: string;
    comision: number;
    activo: boolean;
}

/**
 * Interfaces para vistas y consultas complejas
 */

export interface PartidoCompleto {
    id_partido: number;
    deporte: string;
    liga: string;
    equipo_local: string;
    equipo_visitante: string;
    fecha_hora: Date;
    estadio?: string;
    estado: string;
    goles_local?: number;
    goles_visitante?: number;
    resultado?: string;
}

export interface ApuestaDetallada {
    id_apuesta: number;
    apostador: string;
    nombre_completo: string;
    deporte: string;
    equipo_local: string;
    equipo_visitante: string;
    fecha_partido: Date;
    tipo_apuesta: string;
    detalle_cuota: string;
    monto_apostado: number;
    cuota_aplicada: number;
    ganancia_potencial: number;
    fecha_apuesta: Date;
    estado: string;
    ganancia_real: number;
}
