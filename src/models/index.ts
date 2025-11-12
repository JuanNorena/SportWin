/**
 * Interfaces de los modelos de datos del sistema
 */

// ============================================
// TABLAS CATÁLOGO
// ============================================

export interface Pais {
    id_pais: number;
    nombre: string;
    codigo_iso: string;
    codigo_telefono?: string;
    activo: boolean;
}

export interface Departamento {
    id_departamento: number;
    id_pais: number;
    nombre: string;
    codigo?: string;
    activo: boolean;
}

export interface Ciudad {
    id_ciudad: number;
    id_departamento: number;
    nombre: string;
    codigo_postal?: string;
    activo: boolean;
}

export interface Estado {
    id_estado: number;
    entidad: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
    activo: boolean;
}

export interface Rol {
    id_rol: number;
    nombre: string;
    descripcion?: string;
    permisos?: string;
    activo: boolean;
}

export interface TipoDocumento {
    id_tipo_documento: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    activo: boolean;
}

export interface TipoTransaccion {
    id_tipo_transaccion: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    afecta_saldo: 'suma' | 'resta' | 'neutro';
    activo: boolean;
}

export interface Entrenador {
    id_entrenador: number;
    nombre: string;
    apellido: string;
    id_pais?: number;
    fecha_nacimiento?: Date;
    licencia?: string;
    experiencia_años?: number;
    foto_url?: string;
    activo: boolean;
}

export interface Arbitro {
    id_arbitro: number;
    nombre: string;
    apellido: string;
    id_pais?: number;
    fecha_nacimiento?: Date;
    categoria?: string;
    años_experiencia?: number;
    foto_url?: string;
    activo: boolean;
}

export interface Estadio {
    id_estadio: number;
    nombre: string;
    id_ciudad?: number;
    direccion?: string;
    capacidad?: number;
    año_construccion?: number;
    tipo_cesped?: string;
    techado: boolean;
    foto_url?: string;
    activo: boolean;
}

// ============================================
// TABLAS PRINCIPALES
// ============================================

export interface Usuario {
    id_usuario: number;
    username: string;
    password_hash?: string;
    nombre: string;
    apellido: string;
    email: string;
    id_rol: number;
    fecha_creacion: Date;
    ultimo_acceso?: Date;
    activo: boolean;
}

export interface Apostador {
    id_apostador: number;
    id_usuario: number;
    documento: string;
    id_tipo_documento: number;
    telefono?: string;
    direccion?: string;
    id_ciudad?: number;
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
    id_pais?: number;
    temporada?: string;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    activo: boolean;
}

export interface Equipo {
    id_equipo: number;
    id_liga: number;
    nombre: string;
    id_pais?: number;
    id_ciudad?: number;
    id_estadio?: number;
    id_entrenador?: number;
    fundacion?: number;
    logo_url?: string;
    activo: boolean;
}

export interface Partido {
    id_partido: number;
    id_liga: number;
    id_equipo_local: number;
    id_equipo_visitante: number;
    fecha_hora: Date;
    id_estadio?: number;
    jornada?: number;
    id_estado: number;
    id_arbitro?: number;
    asistencia?: number;
}

export interface Resultado {
    id_resultado: number;
    id_partido: number;
    goles_local: number;
    goles_visitante: number;
    puntos_local?: number;
    puntos_visitante?: number;
    tarjetas_amarillas_local: number;
    tarjetas_amarillas_visitante: number;
    tarjetas_rojas_local: number;
    tarjetas_rojas_visitante: number;
    corners_local?: number;
    corners_visitante?: number;
    fecha_actualizacion?: Date;
}

export interface TipoApuesta {
    id_tipo_apuesta: number;
    codigo?: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    activo: boolean;
}

export interface Cuota {
    id_cuota: number;
    id_partido: number;
    id_tipo_apuesta: number;
    descripcion?: string;
    valor_cuota: number;
    resultado_esperado?: string;
    resultado_prediccion?: string;
    fecha_creacion?: Date;
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
    id_estado: number;
    fecha_resolucion?: Date;
    ganancia_real: number;
}

export interface Transaccion {
    id_transaccion: number;
    id_apostador: number;
    id_metodo_pago?: number;
    id_apuesta?: number;
    id_tipo_transaccion: number;
    monto: number;
    comision: number;
    monto_neto: number;
    fecha_transaccion: Date;
    id_estado: number;
    referencia?: string;
    descripcion?: string;
}

export interface MetodoPago {
    id_metodo_pago: number;
    nombre: string;
    descripcion?: string;
    comision: number;  // Porcentaje de comisión (ej: 2.50 para 2.5%)
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
