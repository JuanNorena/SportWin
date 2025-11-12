// Tipos de usuario y autenticación
export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  id_rol: number;
}

export interface Apostador {
  id_apostador: number;
  id_usuario: number;
  documento: string;
  id_tipo_documento: number;
  telefono?: string;
  direccion?: string;
  id_ciudad?: number;
  fecha_nacimiento: string;
  saldo_actual: number;
  fecha_registro: string;
  verificado: boolean;
}

// Tipos de partidos y apuestas
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
  fecha_inicio?: string;
  fecha_fin?: string;
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
  fecha_hora: string;
  id_estadio?: number;
  jornada?: number;
  id_estado?: number;
  id_arbitro?: number;
  asistencia?: number;
}

export interface PartidoCompleto {
  id_partido: number;
  deporte: string;
  liga: string;
  equipo_local: string;
  equipo_visitante: string;
  fecha_hora: string;
  estadio?: string;
  estado?: string;
  arbitro?: string;
  goles_local?: number;
  goles_visitante?: number;
  resultado?: string;
}

export interface Cuota {
  id_cuota: number;
  id_partido: number;
  id_tipo_apuesta: number;
  descripcion: string;
  valor_cuota: number;
  resultado_esperado?: string;
  fecha_creacion: string;
  fecha_cierre?: string;
  activo: boolean;
}

export interface Apuesta {
  id_apuesta: number;
  id_apostador: number;
  id_cuota: number;
  monto_apostado: number;
  cuota_aplicada: number;
  ganancia_potencial: number;
  fecha_apuesta: string;
  id_estado?: number;
  fecha_resolucion?: string;
  ganancia_real: number;
}

// Tipos de transacciones
export interface Transaccion {
  id_transaccion: number;
  id_apostador: number;
  id_metodo_pago?: number;
  id_apuesta?: number;
  id_tipo_transaccion: number;
  monto: number;
  comision: number;
  monto_neto: number;
  fecha_transaccion: string;
  id_estado?: number;
  referencia?: string;
  descripcion?: string;
}

// Tipo para métodos de pago
export interface MetodoPago {
  id_metodo_pago: number;
  nombre: string;
  descripcion?: string;
  comision: number; // Porcentaje de comisión (ej: 2.50 para 2.5%)
  activo: boolean;
}

// Tipos detallados (vistas de la base de datos)
export interface ApuestaDetallada {
  id_apuesta: number;
  apostador: string;
  deporte: string;
  liga: string;
  partido: string;
  tipo_apuesta: string;
  descripcion_cuota: string;
  monto_apostado: number;
  cuota_aplicada: number;
  ganancia_potencial: number;
  fecha_apuesta: string;
  estado: string;
  fecha_resolucion?: string;
  ganancia_real?: number;
}

export interface TransaccionDetallada {
  id_transaccion: number;
  apostador: string;
  tipo: string;
  metodo_pago?: string;
  partido?: string;
  monto: number;
  comision: number;
  monto_neto: number;
  fecha: string;
  estado: string;
  referencia?: string;
  descripcion?: string;
}

export interface CuotaDetallada {
  id_cuota: number;
  partido: string;
  tipo_apuesta: string;
  descripcion: string;
  valor_cuota: number;
  resultado_esperado?: string;
  activo: boolean;
}

// Respuestas de la API
export interface LoginResponse {
  message: string;
  user: User;
  apostador?: Apostador;
}

export interface RegisterResponse {
  message: string;
  user: User;
  apostador_id?: number;
}

export interface ApiError {
  error: string;
  message?: string;
}
