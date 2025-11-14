import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { ApuestaDetallada } from '../types';

export const ApuestasPage: React.FC = () => {
  const { apostador, loading: authLoading } = useAuth();
  const [apuestas, setApuestas] = useState<ApuestaDetallada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'ganadas' | 'perdidas'>('todas');

  useEffect(() => {
    const loadApuestas = async () => {
      if (!apostador) return;

      setLoading(true);
      setError('');

      try {
        const data = await apiService.getApuestasByApostador(apostador.id_apostador);
        setApuestas(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Error al cargar apuestas');
      } finally {
        setLoading(false);
      }
    };

    if (apostador) {
      loadApuestas();
    }
  }, [apostador]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper para convertir valores numéricos que vienen como string desde la BD
  const toNumber = (value: number | string): number => {
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  const apuestasFiltradas = apuestas.filter(apuesta => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendientes') return apuesta.estado === 'Pendiente';
    if (filtro === 'ganadas') return apuesta.estado === 'Ganada';
    if (filtro === 'perdidas') return apuesta.estado === 'Perdida';
    return true;
  });

  // Calcular estadísticas
  const totalApostado = apuestas.reduce((sum, a) => sum + toNumber(a.monto_apostado), 0);
  const totalGanado = apuestas
    .filter(a => a.estado === 'Ganada')
    .reduce((sum, a) => sum + toNumber(a.ganancia_real || 0), 0);
  const totalPerdido = apuestas
    .filter(a => a.estado === 'Perdida')
    .reduce((sum, a) => sum + toNumber(a.monto_apostado), 0);
  const pendientes = apuestas.filter(a => a.estado === 'Pendiente').length;
  const ganadas = apuestas.filter(a => a.estado === 'Ganada').length;
  const perdidas = apuestas.filter(a => a.estado === 'Perdida').length;

  // Mostrar loading mientras se carga la autenticación
  if (authLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!apostador) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Debe iniciar sesión para ver sus apuestas</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Mis Apuestas</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="border border-gray-300 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Apostado</p>
            <p className="text-base sm:text-xl md:text-2xl font-bold break-words">{formatCurrency(totalApostado)}</p>
          </div>
          <div className="border border-green-600 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Ganado</p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-green-600 break-words">{formatCurrency(totalGanado)}</p>
            <p className="text-xs text-gray-600">{ganadas} apuestas</p>
          </div>
          <div className="border border-red-600 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Perdido</p>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-red-600 break-words">{formatCurrency(totalPerdido)}</p>
            <p className="text-xs text-gray-600">{perdidas} apuestas</p>
          </div>
          <div className="border border-gray-300 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-base sm:text-xl md:text-2xl font-bold">{pendientes}</p>
            <p className="text-xs text-gray-600">apuestas activas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setFiltro('todas')}
            className={`${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'} text-xs sm:text-sm px-3 py-2`}
          >
            Todas ({apuestas.length})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`${filtro === 'pendientes' ? 'btn-primary' : 'btn-secondary'} text-xs sm:text-sm px-3 py-2`}
          >
            Pendientes ({pendientes})
          </button>
          <button
            onClick={() => setFiltro('ganadas')}
            className={`${filtro === 'ganadas' ? 'btn-primary' : 'btn-secondary'} text-xs sm:text-sm px-3 py-2`}
          >
            Ganadas ({ganadas})
          </button>
          <button
            onClick={() => setFiltro('perdidas')}
            className={`${filtro === 'perdidas' ? 'btn-primary' : 'btn-secondary'} text-xs sm:text-sm px-3 py-2`}
          >
            Perdidas ({perdidas})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-600 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando apuestas...</p>
        </div>
      ) : apuestasFiltradas.length === 0 ? (
        <div className="text-center py-12 border border-gray-300">
          <p className="text-gray-600">
            {filtro === 'todas' 
              ? 'No tienes apuestas registradas' 
              : `No tienes apuestas ${filtro}`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {apuestasFiltradas.map((apuesta) => (
            <div
              key={apuesta.id_apuesta}
              className={`border p-4 sm:p-6 ${
                apuesta.estado === 'Ganada' 
                  ? 'border-green-600 bg-green-50' 
                  : apuesta.estado === 'Perdida' 
                  ? 'border-red-600 bg-red-50' 
                  : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {apuesta.liga} · {apuesta.deporte}
                  </p>
                  <p className="font-bold text-sm sm:text-base md:text-lg mb-1 break-words">{apuesta.partido}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatDate(apuesta.fecha_apuesta)}
                  </p>
                </div>
                <span
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1 border font-medium whitespace-nowrap ${
                    apuesta.estado === 'Ganada'
                      ? 'border-green-600 text-green-600'
                      : apuesta.estado === 'Perdida'
                      ? 'border-red-600 text-red-600'
                      : 'border-gray-600 text-gray-600'
                  }`}
                >
                  {apuesta.estado}
                </span>
              </div>

              <div className="border-t border-gray-300 pt-3 sm:pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Tipo de Apuesta</p>
                    <p className="font-medium text-sm sm:text-base break-words">{apuesta.tipo_apuesta}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{apuesta.descripcion_cuota}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Monto</p>
                      <p className="font-bold text-xs sm:text-sm break-words">{formatCurrency(toNumber(apuesta.monto_apostado))}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Cuota</p>
                      <p className="font-bold text-xs sm:text-sm">{toNumber(apuesta.cuota_aplicada).toFixed(2)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 mb-1 break-words">
                        {apuesta.estado === 'Ganada' ? 'Ganancia' : 'Posible'}
                      </p>
                      <p className={`font-bold text-xs sm:text-sm break-words ${
                        apuesta.estado === 'Ganada' ? 'text-green-600' : ''
                      }`}>
                        {formatCurrency(
                          apuesta.estado === 'Ganada' && apuesta.ganancia_real
                            ? toNumber(apuesta.ganancia_real)
                            : toNumber(apuesta.ganancia_potencial)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {apuesta.fecha_resolucion && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      Resuelta el {formatDate(apuesta.fecha_resolucion)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
