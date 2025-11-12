import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { PartidoCompleto } from '../types';

export const PartidosPage: React.FC = () => {
  const navigate = useNavigate();
  const [partidos, setPartidos] = useState<PartidoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'programados' | 'finalizados'>('programados');

  useEffect(() => {
    const loadPartidos = async () => {
      setLoading(true);
      setError('');

      try {
        let data: PartidoCompleto[];
        
        if (filtro === 'programados') {
          data = await apiService.getPartidosProgramados();
        } else if (filtro === 'finalizados') {
          data = await apiService.getPartidosFinalizados(20);
        } else {
          data = await apiService.getPartidos(true) as PartidoCompleto[];
        }

        setPartidos(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Error al cargar partidos');
      } finally {
        setLoading(false);
      }
    };

    loadPartidos();
  }, [filtro]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Partidos</h1>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFiltro('programados')}
            className={filtro === 'programados' ? 'btn-primary' : 'btn-secondary'}
          >
            Próximos
          </button>
          <button
            onClick={() => setFiltro('finalizados')}
            className={filtro === 'finalizados' ? 'btn-primary' : 'btn-secondary'}
          >
            Finalizados
          </button>
          <button
            onClick={() => setFiltro('todos')}
            className={filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}
          >
            Todos
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
          <p className="text-gray-600">Cargando partidos...</p>
        </div>
      ) : partidos.length === 0 ? (
        <div className="text-center py-12 border border-gray-300">
          <p className="text-gray-600">No hay partidos disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {partidos.map((partido) => (
            <div
              key={partido.id_partido}
              className="border border-gray-300 p-6 hover:border-black transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">{partido.liga} · {partido.deporte}</p>
                  <p className="text-sm text-gray-600">{formatDate(partido.fecha_hora)}</p>
                </div>
                {partido.estado && (
                  <span className="text-sm px-3 py-1 border border-black">
                    {partido.estado}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 items-center mb-4">
                <div className="text-right">
                  <p className="font-bold text-lg">{partido.equipo_local}</p>
                </div>
                
                <div className="text-center">
                  {partido.goles_local !== undefined && partido.goles_visitante !== undefined ? (
                    <p className="text-3xl font-bold">
                      {partido.goles_local} - {partido.goles_visitante}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold">VS</p>
                  )}
                </div>
                
                <div className="text-left">
                  <p className="font-bold text-lg">{partido.equipo_visitante}</p>
                </div>
              </div>

              {partido.estadio && (
                <p className="text-sm text-gray-600 text-center">
                  📍 {partido.estadio}
                </p>
              )}

              {filtro === 'programados' && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <button 
                    onClick={() => navigate(`/partidos/${partido.id_partido}`)}
                    className="btn-primary w-full"
                  >
                    Ver Cuotas y Apostar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
