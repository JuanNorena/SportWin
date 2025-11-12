import axios, { type AxiosInstance } from 'axios';
import type {
  User,
  Apostador,
  Partido,
  PartidoCompleto,
  Deporte,
  Liga,
  Equipo,
  LoginResponse,
  RegisterResponse,
  MetodoPago,
  CuotaDetallada,
  ApuestaDetallada,
  TransaccionDetallada,
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== AUTH ====================
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  async register(data: {
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    documento?: string;
    id_tipo_documento?: number;
    telefono?: string;
    direccion?: string;
    id_ciudad?: number;
    fecha_nacimiento?: string;
  }): Promise<RegisterResponse> {
    const response = await this.api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>('/auth/me');
    return response.data;
  }

  // ==================== APOSTADORES ====================
  async getApostadores(): Promise<Apostador[]> {
    const response = await this.api.get<Apostador[]>('/apostadores');
    return response.data;
  }

  async getApostadorById(id: number): Promise<Apostador> {
    const response = await this.api.get<Apostador>(`/apostadores/${id}`);
    return response.data;
  }

  async getApostadorSaldo(id: number): Promise<{ id_apostador: number; saldo_actual: number }> {
    const response = await this.api.get<{ id_apostador: number; saldo_actual: number }>(
      `/apostadores/${id}/saldo`
    );
    return response.data;
  }

  // ==================== PARTIDOS ====================
  async getPartidos(completo: boolean = false): Promise<Partido[] | PartidoCompleto[]> {
    const response = await this.api.get<Partido[] | PartidoCompleto[]>(
      `/partidos?completo=${completo}`
    );
    return response.data;
  }

  async getPartidosProgramados(): Promise<PartidoCompleto[]> {
    const response = await this.api.get<PartidoCompleto[]>('/partidos/programados');
    return response.data;
  }

  async getPartidosFinalizados(limit: number = 50): Promise<PartidoCompleto[]> {
    const response = await this.api.get<PartidoCompleto[]>(
      `/partidos/finalizados?limit=${limit}`
    );
    return response.data;
  }

  async getPartidoById(id: number): Promise<Partido> {
    const response = await this.api.get<Partido>(`/partidos/${id}`);
    return response.data;
  }

  async createPartido(data: Partial<Partido>): Promise<{ message: string; id: number }> {
    const response = await this.api.post<{ message: string; id: number }>(
      '/partidos',
      data
    );
    return response.data;
  }

  async updatePartido(
    id: number,
    data: Partial<Partido>
  ): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>(`/partidos/${id}`, data);
    return response.data;
  }

  async deletePartido(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/partidos/${id}`);
    return response.data;
  }

  // ==================== CATÁLOGOS ====================
  async getDeportes(): Promise<Deporte[]> {
    const response = await this.api.get<Deporte[]>('/catalogos/deportes');
    return response.data;
  }

  async getLigas(): Promise<Liga[]> {
    const response = await this.api.get<Liga[]>('/catalogos/ligas');
    return response.data;
  }

  async getEquipos(): Promise<Equipo[]> {
    const response = await this.api.get<Equipo[]>('/catalogos/equipos');
    return response.data;
  }

  async getRoles(): Promise<{ id_rol: number; nombre: string }[]> {
    const response = await this.api.get<{ id_rol: number; nombre: string }[]>('/catalogos/roles');
    return response.data;
  }

  async getTiposDocumento(): Promise<{ id_tipo_documento: number; nombre: string; codigo: string }[]> {
    const response = await this.api.get<{ id_tipo_documento: number; nombre: string; codigo: string }[]>('/catalogos/tipos-documento');
    return response.data;
  }

  async getMetodosPago(): Promise<MetodoPago[]> {
    const response = await this.api.get<MetodoPago[]>('/catalogos/metodos-pago');
    return response.data;
  }

  // ==================== CUOTAS ====================
  async getCuotas(): Promise<CuotaDetallada[]> {
    const response = await this.api.get<CuotaDetallada[]>('/cuotas');
    return response.data;
  }

  async getCuotasByPartido(idPartido: number): Promise<CuotaDetallada[]> {
    const response = await this.api.get<CuotaDetallada[]>(`/cuotas/partido/${idPartido}`);
    return response.data;
  }

  async getCuotaById(id: number): Promise<CuotaDetallada> {
    const response = await this.api.get<CuotaDetallada>(`/cuotas/${id}`);
    return response.data;
  }

  // ==================== APUESTAS ====================
  async getApuestas(): Promise<ApuestaDetallada[]> {
    const response = await this.api.get<ApuestaDetallada[]>('/apuestas');
    return response.data;
  }

  async getApuestasByApostador(idApostador: number): Promise<ApuestaDetallada[]> {
    const response = await this.api.get<ApuestaDetallada[]>(`/apuestas/apostador/${idApostador}`);
    return response.data;
  }

  async getApuestaById(id: number): Promise<ApuestaDetallada> {
    const response = await this.api.get<ApuestaDetallada>(`/apuestas/${id}`);
    return response.data;
  }

  async createApuesta(data: {
    id_apostador: number;
    id_cuota: number;
    monto_apostado: number;
  }): Promise<{ message: string; id_apuesta: number }> {
    const response = await this.api.post<{ message: string; id_apuesta: number }>(
      '/apuestas',
      data
    );
    return response.data;
  }

  // ==================== TRANSACCIONES ====================
  async getTransacciones(): Promise<TransaccionDetallada[]> {
    const response = await this.api.get<TransaccionDetallada[]>('/transacciones');
    return response.data;
  }

  async getTransaccionesByApostador(idApostador: number): Promise<TransaccionDetallada[]> {
    const response = await this.api.get<TransaccionDetallada[]>(`/transacciones/apostador/${idApostador}`);
    return response.data;
  }

  async getTransaccionById(id: number): Promise<TransaccionDetallada> {
    const response = await this.api.get<TransaccionDetallada>(`/transacciones/${id}`);
    return response.data;
  }

  async createDeposito(data: {
    id_apostador: number;
    monto: number;
    id_metodo_pago: number;
    referencia?: string;
  }): Promise<{ message: string; id_transaccion: number }> {
    const response = await this.api.post<{ message: string; id_transaccion: number }>(
      '/transacciones/deposito',
      data
    );
    return response.data;
  }

  async createRetiro(data: {
    id_apostador: number;
    monto: number;
    id_metodo_pago: number;
    referencia?: string;
  }): Promise<{ message: string; id_transaccion: number }> {
    const response = await this.api.post<{ message: string; id_transaccion: number }>(
      '/transacciones/retiro',
      data
    );
    return response.data;
  }

  // ==================== REPORTES ====================
  async ejecutarReporte(reporteId: string, parametros: Record<string, string>): Promise<{
    columns: string[];
    rows: Record<string, unknown>[];
  }> {
    const response = await this.api.post<{
      columns: string[];
      rows: Record<string, unknown>[];
    }>('/reportes/ejecutar', {
      reporteId,
      parametros,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
