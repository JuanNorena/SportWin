import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { PartidoCompleto, CuotaDetallada } from '../types';

export const PartidoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apostador, isAuthenticated, refreshSaldo } = useAuth();
  
  const [partido, setPartido] = useState<PartidoCompleto | null>(null);
  const [cuotas, setCuotas] = useState<CuotaDetallada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [selectedCuota, setSelectedCuota] = useState<CuotaDetallada | null>(null);
  const [montoApuesta, setMontoApuesta] = useState('');
  const [apuestaLoading, setApuestaLoading] = useState(false);

  useEffect(() => {
    const loadPartidoDetail = async () => {
      if (!id) return;

      try {
        const data = await apiService.getPartidoById(parseInt(id));
        setPartido(data as unknown as PartidoCompleto);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Error al cargar partido');
      }
    };

    const loadCuotas = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const data = await apiService.getCuotasByPartido(parseInt(id));
        setCuotas(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Error al cargar cuotas');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPartidoDetail();
      loadCuotas();
    }
  }, [id]);

  const handleApostar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !apostador) {
      setError('Debe iniciar sesión para realizar una apuesta');
      return;
    }

    if (!selectedCuota) {
      setError('Debe seleccionar una cuota');
      return;
    }

    const monto = parseFloat(montoApuesta);
    if (monto <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (monto > apostador.saldo_actual) {
      setError('Saldo insuficiente para realizar la apuesta');
      return;
    }

    setApuestaLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.createApuesta({
        id_apostador: apostador.id_apostador,
        id_cuota: selectedCuota.id_cuota,
        monto_apostado: monto,
      });

      setSuccessMessage('¡Apuesta realizada exitosamente!');
      setMontoApuesta('');
      setSelectedCuota(null);
      
      // Actualizar el saldo del apostador
      await refreshSaldo();
      
      // Redirigir a mis apuestas después de 2 segundos
      setTimeout(() => {
        navigate('/apuestas');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al realizar apuesta');
    } finally {
      setApuestaLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      dateStyle: 'full',
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

  const getCuotaValue = (cuota: CuotaDetallada): number => {
    return typeof cuota.valor_cuota === 'string' 
      ? parseFloat(cuota.valor_cuota) 
      : cuota.valor_cuota;
  };

  const calcularGanancia = () => {
    if (!selectedCuota || !montoApuesta) return 0;
    const monto = parseFloat(montoApuesta);
    if (isNaN(monto)) return 0;
    return monto * getCuotaValue(selectedCuota);
  };

  // Agrupar cuotas por tipo
  const cuotasPorTipo = cuotas.reduce((acc, cuota) => {
    const tipo = cuota.tipo_apuesta;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(cuota);
    return acc;
  }, {} as Record<string, CuotaDetallada[]>);

  if (!partido && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Partido no encontrado</p>
        <button onClick={() => navigate('/partidos')} className="btn-primary mt-4">
          Volver a Partidos
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/partidos')} className="btn-secondary mb-6">
        ← Volver a Partidos
      </button>

      {partido && (
        <div className="border-2 border-black p-6 mb-8">
          <div className="mb-4">
            <p className="text-sm text-gray-600">{partido.liga} · {partido.deporte}</p>
            <p className="text-sm text-gray-600">{formatDate(partido.fecha_hora)}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div className="text-right">
              <p className="font-bold text-2xl">{partido.equipo_local}</p>
            </div>
            
            <div className="text-center">
              {partido.goles_local !== undefined && partido.goles_visitante !== undefined ? (
                <p className="text-4xl font-bold">
                  {partido.goles_local} - {partido.goles_visitante}
                </p>
              ) : (
                <p className="text-3xl font-bold">VS</p>
              )}
            </div>
            
            <div className="text-left">
              <p className="font-bold text-2xl">{partido.equipo_visitante}</p>
            </div>
          </div>

          {partido.estadio && (
            <p className="text-center text-gray-600">📍 {partido.estadio}</p>
          )}

          {partido.estado && (
            <div className="text-center mt-4">
              <span className="text-sm px-4 py-2 border border-black font-medium">
                {partido.estado}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-600 text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-600 text-green-600">
          {successMessage}
        </div>
      )}

      {/* Cuotas disponibles */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Cuotas Disponibles</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando cuotas...</p>
          </div>
        ) : cuotas.length === 0 ? (
          <div className="text-center py-12 border border-gray-300">
            <p className="text-gray-600">No hay cuotas disponibles para este partido</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(cuotasPorTipo).map(([tipo, cuotasTipo]) => (
              <div key={tipo} className="border border-gray-300 p-4">
                <h3 className="font-bold text-lg mb-3">{tipo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cuotasTipo.map((cuota) => (
                    <button
                      key={cuota.id_cuota}
                      onClick={() => {
                        if (isAuthenticated) {
                          setSelectedCuota(cuota);
                          setError('');
                        } else {
                          setError('Debe iniciar sesión para apostar');
                        }
                      }}
                      disabled={!cuota.activo}
                      className={`p-4 border-2 transition-all text-left ${
                        selectedCuota?.id_cuota === cuota.id_cuota
                          ? 'border-black bg-black text-white'
                          : cuota.activo
                          ? 'border-gray-300 hover:border-black'
                          : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <p className="text-sm mb-1">{cuota.descripcion}</p>
                      {cuota.resultado_esperado && (
                        <p className="text-xs mb-2 opacity-75">{cuota.resultado_esperado}</p>
                      )}
                      <p className="text-2xl font-bold">{getCuotaValue(cuota).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario de apuesta */}
      {isAuthenticated && apostador && selectedCuota && (
        <div className="border-2 border-black p-6 sticky bottom-0 bg-white">
          <h2 className="text-2xl font-bold mb-4">Realizar Apuesta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cuota Seleccionada</p>
              <p className="font-bold">{selectedCuota.tipo_apuesta}</p>
              <p className="text-sm text-gray-600">{selectedCuota.descripcion}</p>
              <p className="text-2xl font-bold mt-2">{getCuotaValue(selectedCuota).toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Tu Saldo</p>
              <p className="text-2xl font-bold">{formatCurrency(apostador.saldo_actual)}</p>
            </div>
          </div>

          <form onSubmit={handleApostar} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Monto a Apostar</label>
              <input
                type="number"
                value={montoApuesta}
                onChange={(e) => setMontoApuesta(e.target.value)}
                required
                min="1000"
                max={apostador.saldo_actual}
                step="1000"
                disabled={apuestaLoading}
                placeholder="Ingrese el monto"
              />
              <p className="text-sm text-gray-600 mt-1">
                Monto mínimo: $1,000 · Máximo: {formatCurrency(apostador.saldo_actual)}
              </p>
            </div>

            {montoApuesta && parseFloat(montoApuesta) > 0 && (
              <div className="border border-gray-300 p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-1">Ganancia Potencial</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(calcularGanancia())}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  = {montoApuesta} × {getCuotaValue(selectedCuota).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={apuestaLoading || !montoApuesta}
                className="btn-primary flex-1"
              >
                {apuestaLoading ? 'Procesando...' : 'Confirmar Apuesta'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCuota(null);
                  setMontoApuesta('');
                  setError('');
                }}
                disabled={apuestaLoading}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAuthenticated && (
        <div className="border border-gray-300 p-6 text-center">
          <p className="text-gray-600 mb-4">Inicia sesión para realizar apuestas</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Iniciar Sesión
          </button>
        </div>
      )}
    </div>
  );
};
