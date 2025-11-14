import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Deporte, Liga, Apostador } from '../types';

interface ReporteResultado {
  columns: string[];
  rows: Record<string, unknown>[];
}

interface ReporteParametro {
  nombre: string;
  tipo: 'text' | 'number' | 'date' | 'select';
  dataSource?: 'deportes' | 'ligas' | 'apostadores' | 'meses' | 'estados_apuesta' | 'tipos_transaccion';
  opciones?: { value: string; label: string }[];
  placeholder?: string;
}

interface Reporte {
  id: string;
  categoria: 'simple' | 'intermedio' | 'avanzado';
  nombre: string;
  descripcion: string;
  parametros?: ReporteParametro[];
}

const reportes: Reporte[] = [
  // CONSULTAS SIMPLES
  {
    id: 'partidos_por_mes',
    categoria: 'simple',
    nombre: 'Partidos jugados en un mes',
    descripcion: 'Lista todos los partidos finalizados en un mes específico',
    parametros: [
      {
        nombre: 'mes',
        tipo: 'select',
        dataSource: 'meses',
      },
      {
        nombre: 'anio',
        tipo: 'number',
        placeholder: '2024',
      },
    ],
  },
  {
    id: 'apostadores_activos',
    categoria: 'simple',
    nombre: 'Apostadores con saldo mayor a un monto',
    descripcion: 'Lista apostadores con saldo actual mayor al monto especificado',
    parametros: [
      {
        nombre: 'monto',
        tipo: 'number',
        placeholder: 'Ej: 100000',
      },
    ],
  },
  {
    id: 'ligas_por_deporte',
    categoria: 'simple',
    nombre: 'Ligas de un deporte',
    descripcion: 'Muestra todas las ligas disponibles para un deporte específico',
    parametros: [
      {
        nombre: 'id_deporte',
        tipo: 'select',
        dataSource: 'deportes',
      },
    ],
  },
  {
    id: 'partidos_por_liga',
    categoria: 'simple',
    nombre: 'Partidos de una liga',
    descripcion: 'Lista todos los partidos programados para una liga específica',
    parametros: [
      {
        nombre: 'id_liga',
        tipo: 'select',
        dataSource: 'ligas',
      },
    ],
  },

  // CONSULTAS INTERMEDIAS
  {
    id: 'apuestas_por_estado',
    categoria: 'intermedio',
    nombre: 'Resumen de apuestas por estado',
    descripcion: 'Estadísticas de apuestas agrupadas por estado (Ganada, Perdida, Pendiente)',
    parametros: [
      {
        nombre: 'estado',
        tipo: 'select',
        dataSource: 'estados_apuesta',
      },
    ],
  },
  {
    id: 'top_apostadores',
    categoria: 'intermedio',
    nombre: 'Top apostadores por monto total apostado',
    descripcion: 'Ranking de apostadores ordenados por el monto total de apuestas',
    parametros: [
      {
        nombre: 'limite',
        tipo: 'number',
        placeholder: 'Ej: 10',
      },
    ],
  },
  {
    id: 'partidos_con_resultados',
    categoria: 'intermedio',
    nombre: 'Partidos finalizados con resultados',
    descripcion: 'Muestra partidos finalizados con goles y resultado del ganador',
    parametros: [
      {
        nombre: 'fecha_inicio',
        tipo: 'date',
        placeholder: 'Fecha inicio',
      },
      {
        nombre: 'fecha_fin',
        tipo: 'date',
        placeholder: 'Fecha fin',
      },
    ],
  },
  {
    id: 'transacciones_por_tipo',
    categoria: 'intermedio',
    nombre: 'Total de transacciones por tipo',
    descripcion: 'Suma de montos agrupados por tipo de transacción (Depósito, Retiro, etc.)',
    parametros: [
      {
        nombre: 'tipo',
        tipo: 'select',
        dataSource: 'tipos_transaccion',
      },
    ],
  },
  {
    id: 'apuestas_por_deporte',
    categoria: 'intermedio',
    nombre: 'Estadísticas de apuestas por deporte',
    descripcion: 'Total de apuestas, monto apostado y ganancias agrupado por deporte',
    parametros: [
      {
        nombre: 'id_deporte',
        tipo: 'select',
        dataSource: 'deportes',
      },
    ],
  },
  // CONSULTAS AVANZADAS
  {
    id: 'rentabilidad_apostadores',
    categoria: 'avanzado',
    nombre: 'Rentabilidad de apostadores',
    descripcion: 'Análisis completo: total apostado, ganado, perdido y rentabilidad por apostador',
    parametros: [
      {
        nombre: 'fecha_inicio',
        tipo: 'date',
        placeholder: 'Fecha inicio',
      },
      {
        nombre: 'fecha_fin',
        tipo: 'date',
        placeholder: 'Fecha fin',
      },
    ],
  },
  {
    id: 'analisis_flujo_efectivo',
    categoria: 'avanzado',
    nombre: 'Análisis de flujo de efectivo mensual',
    descripcion: 'Ingresos vs egresos con balance neto y usuarios activos por mes',
    parametros: [
      {
        nombre: 'anio',
        tipo: 'number',
        placeholder: '2024',
      },
    ],
  },
  {
    id: 'rendimiento_por_liga',
    categoria: 'avanzado',
    nombre: 'Rendimiento de la casa por liga',
    descripcion: 'Análisis financiero completo por liga: total apostado, pagado y margen de ganancia',
    parametros: [
      {
        nombre: 'id_liga',
        tipo: 'select',
        dataSource: 'ligas',
      },
      {
        nombre: 'fecha_inicio',
        tipo: 'date',
      },
      {
        nombre: 'fecha_fin',
        tipo: 'date',
      },
    ],
  },
  {
    id: 'patron_apuestas_usuario',
    categoria: 'avanzado',
    nombre: 'Patrón de comportamiento de apostadores',
    descripcion: 'Análisis de preferencias: deportes favoritos, horarios, tipos de apuesta y rendimiento',
    parametros: [
      {
        nombre: 'limite',
        tipo: 'number',
        placeholder: 'Top N apostadores (ej: 20)',
      },
    ],
  },
  {
    id: 'efectividad_cuotas',
    categoria: 'avanzado',
    nombre: 'Efectividad de cuotas por deporte',
    descripcion: 'Análisis de precisión de cuotas: tasa de acierto, margen real vs esperado',
    parametros: [
      {
        nombre: 'id_deporte',
        tipo: 'select',
        dataSource: 'deportes',
      },
    ],
  },
];

export const ReportesPage = () => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [parametros, setParametros] = useState<{ [key: string]: string }>({});
  const [resultado, setResultado] = useState<ReporteResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para datos dinámicos
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [apostadores, setApostadores] = useState<Apostador[]>([]);

  // Cargar datos de catálogos al montar el componente
  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      const [deportesData, ligasData, apostadoresData] = await Promise.all([
        apiService.getDeportes(),
        apiService.getLigas(),
        apiService.getApostadores(),
      ]);
      setDeportes(deportesData);
      setLigas(ligasData);
      setApostadores(apostadoresData);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  const getOpcionesSelect = (dataSource: string): { value: string; label: string }[] => {
    switch (dataSource) {
      case 'deportes':
        return deportes.map((d) => ({ value: String(d.id_deporte), label: d.nombre }));
      case 'ligas':
        return ligas.map((l) => ({ value: String(l.id_liga), label: l.nombre }));
      case 'apostadores':
        return apostadores.map((a) => ({ 
          value: String(a.id_apostador), 
          label: `${a.documento} - ${a.id_apostador}` 
        }));
      case 'meses':
        return [
          { value: '1', label: 'Enero' },
          { value: '2', label: 'Febrero' },
          { value: '3', label: 'Marzo' },
          { value: '4', label: 'Abril' },
          { value: '5', label: 'Mayo' },
          { value: '6', label: 'Junio' },
          { value: '7', label: 'Julio' },
          { value: '8', label: 'Agosto' },
          { value: '9', label: 'Septiembre' },
          { value: '10', label: 'Octubre' },
          { value: '11', label: 'Noviembre' },
          { value: '12', label: 'Diciembre' },
        ];
      case 'estados_apuesta':
        return [
          { value: 'Pendiente', label: 'Pendiente' },
          { value: 'Ganada', label: 'Ganada' },
          { value: 'Perdida', label: 'Perdida' },
          { value: 'Cancelada', label: 'Cancelada' },
        ];
      case 'tipos_transaccion':
        return [
          { value: 'DEPOSITO', label: 'Depósito' },
          { value: 'RETIRO', label: 'Retiro' },
          { value: 'APUESTA', label: 'Apuesta' },
          { value: 'GANANCIA', label: 'Ganancia' },
          { value: 'REEMBOLSO', label: 'Reembolso' },
        ];
      default:
        return [];
    }
  };

  const handleSeleccionarReporte = (reporte: Reporte) => {
    setReporteSeleccionado(reporte);
    setParametros({});
    setResultado(null);
    setError('');
  };

  const handleParametroChange = (nombre: string, valor: string) => {
    setParametros((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const handleConsultar = async () => {
    if (!reporteSeleccionado) return;

    // Validar que todos los parámetros estén completos
    if (reporteSeleccionado.parametros) {
      for (const param of reporteSeleccionado.parametros) {
        if (!parametros[param.nombre]) {
          setError(`Por favor complete el campo: ${param.nombre}`);
          return;
        }
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.ejecutarReporte(reporteSeleccionado.id, parametros);
      setResultado(response);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Error al ejecutar la consulta');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800';
      case 'avanzado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'simple':
        return 'Simple';
      case 'intermedio':
        return 'Intermedio';
      case 'avanzado':
        return 'Avanzado';
      default:
        return categoria;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Reportes y Consultas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Panel izquierdo - Lista de reportes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 max-h-[600px] lg:max-h-[800px] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Consultas Disponibles</h2>

            {/* Consultas Simples */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-green-700 mb-2 uppercase">
                Consultas Simples
              </h3>
              {reportes
                .filter((r) => r.categoria === 'simple')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-2 sm:p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-medium break-words">{reporte.nombre}</div>
                  </button>
                ))}
            </div>

            {/* Consultas Intermedias */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-yellow-700 mb-2 uppercase">
                Consultas Intermedias
              </h3>
              {reportes
                .filter((r) => r.categoria === 'intermedio')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-2 sm:p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-medium break-words">{reporte.nombre}</div>
                  </button>
                ))}
            </div>

            {/* Consultas Avanzadas */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-red-700 mb-2 uppercase">
                Consultas Avanzadas
              </h3>
              {reportes
                .filter((r) => r.categoria === 'avanzado')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-2 sm:p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-medium break-words">{reporte.nombre}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario y resultados */}
        <div className="lg:col-span-2">
          {reporteSeleccionado ? (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Encabezado del reporte */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoriaColor(
                      reporteSeleccionado.categoria
                    )}`}
                  >
                    {getCategoriaLabel(reporteSeleccionado.categoria)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{reporteSeleccionado.nombre}</h2>
                <p className="text-gray-600">{reporteSeleccionado.descripcion}</p>
              </div>

              {/* Formulario de parámetros */}
              {reporteSeleccionado.parametros && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Parámetros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reporteSeleccionado.parametros.map((param) => (
                      <div key={param.nombre}>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 capitalize break-words">
                          {param.nombre.replace('_', ' ')}
                        </label>
                        {param.tipo === 'select' ? (
                          <select
                            value={parametros[param.nombre] || ''}
                            onChange={(e) =>
                              handleParametroChange(param.nombre, e.target.value)
                            }
                            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccione...</option>
                            {(param.dataSource
                              ? getOpcionesSelect(param.dataSource)
                              : param.opciones || []
                            ).map((opcion) => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={param.tipo}
                            value={parametros[param.nombre] || ''}
                            onChange={(e) =>
                              handleParametroChange(param.nombre, e.target.value)
                            }
                            placeholder={param.placeholder}
                            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón consultar */}
              <button
                onClick={handleConsultar}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Consultando...' : 'Ejecutar Consulta'}
              </button>

              {/* Mensajes de error */}
              {error && (
                <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded break-words">
                  {error}
                </div>
              )}

              {/* Resultados */}
              {resultado && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">
                    Resultados ({resultado.rows.length} registros)
                  </h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          {resultado.columns.map((col) => (
                            <th
                              key={col}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {resultado.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {resultado.columns.map((col) => (
                              <td
                                key={col}
                                className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900"
                              >
                                {row[col] !== null && row[col] !== undefined
                                  ? String(row[col])
                                  : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {resultado.rows.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                      No se encontraron resultados para los parámetros especificados
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <svg
                    className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-base sm:text-lg">Seleccione una consulta de la lista</p>
                  <p className="text-xs sm:text-sm mt-2">
                    Tenemos {reportes.length} consultas disponibles organizadas por complejidad
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
