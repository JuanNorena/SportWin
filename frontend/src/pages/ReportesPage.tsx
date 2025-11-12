import { useState } from 'react';
import { apiService } from '../services/api';

interface ReporteResultado {
  columns: string[];
  rows: Record<string, unknown>[];
}

interface Reporte {
  id: string;
  categoria: 'simple' | 'intermedio' | 'avanzado';
  nombre: string;
  descripcion: string;
  parametros?: {
    nombre: string;
    tipo: 'text' | 'number' | 'date' | 'select';
    opciones?: { value: string; label: string }[];
    placeholder?: string;
  }[];
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
        opciones: [
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
        ],
      },
      {
        nombre: 'anio',
        tipo: 'number',
        placeholder: '2024',
      },
    ],
  },
  {
    id: 'equipos_por_liga',
    categoria: 'simple',
    nombre: 'Equipos de una liga',
    descripcion: 'Muestra todos los equipos que pertenecen a una liga específica',
    parametros: [
      {
        nombre: 'liga',
        tipo: 'text',
        placeholder: 'Ej: Liga BetPlay, Premier League',
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
        opciones: [
          { value: 'Pendiente', label: 'Pendiente' },
          { value: 'Ganada', label: 'Ganada' },
          { value: 'Perdida', label: 'Perdida' },
          { value: 'Cancelada', label: 'Cancelada' },
        ],
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
        opciones: [
          { value: 'DEPOSITO', label: 'Depósito' },
          { value: 'RETIRO', label: 'Retiro' },
          { value: 'APUESTA', label: 'Apuesta' },
          { value: 'GANANCIA', label: 'Ganancia' },
          { value: 'REEMBOLSO', label: 'Reembolso' },
        ],
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
    id: 'cuotas_populares',
    categoria: 'avanzado',
    nombre: 'Cuotas más populares por liga',
    descripcion: 'Tipos de apuesta más utilizados con tasa de éxito y ganancias promedio',
    parametros: [
      {
        nombre: 'liga',
        tipo: 'text',
        placeholder: 'Ej: Premier League',
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
];

export const ReportesPage = () => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [parametros, setParametros] = useState<{ [key: string]: string }>({});
  const [resultado, setResultado] = useState<ReporteResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reportes y Consultas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Lista de reportes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Consultas Disponibles</h2>

            {/* Consultas Simples */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2 uppercase">
                Consultas Simples
              </h3>
              {reportes
                .filter((r) => r.categoria === 'simple')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium">{reporte.nombre}</div>
                  </button>
                ))}
            </div>

            {/* Consultas Intermedias */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-yellow-700 mb-2 uppercase">
                Consultas Intermedias
              </h3>
              {reportes
                .filter((r) => r.categoria === 'intermedio')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium">{reporte.nombre}</div>
                  </button>
                ))}
            </div>

            {/* Consultas Avanzadas */}
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2 uppercase">
                Consultas Avanzadas
              </h3>
              {reportes
                .filter((r) => r.categoria === 'avanzado')
                .map((reporte) => (
                  <button
                    key={reporte.id}
                    onClick={() => handleSeleccionarReporte(reporte)}
                    className={`w-full text-left p-3 rounded mb-2 transition ${
                      reporteSeleccionado?.id === reporte.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium">{reporte.nombre}</div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {param.nombre.replace('_', ' ')}
                        </label>
                        {param.tipo === 'select' ? (
                          <select
                            value={parametros[param.nombre] || ''}
                            onChange={(e) =>
                              handleParametroChange(param.nombre, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccione...</option>
                            {param.opciones?.map((opcion) => (
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Consultando...' : 'Ejecutar Consulta'}
              </button>

              {/* Mensajes de error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Resultados */}
              {resultado && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Resultados ({resultado.rows.length} registros)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          {resultado.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                                className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
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
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron resultados para los parámetros especificados
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                  <p className="text-lg">Seleccione una consulta de la lista</p>
                  <p className="text-sm mt-2">
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
