import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Partido, Liga, Equipo } from '../../types';

interface PartidoExtendido extends Partido {
  liga_nombre?: string;
  equipo_local?: string;
  equipo_visitante?: string;
  estado_nombre?: string;
}

export const PartidosAdmin = () => {
  const [partidos, setPartidos] = useState<PartidoExtendido[]>([]);
  const [filteredPartidos, setFilteredPartidos] = useState<PartidoExtendido[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [estadios, setEstadios] = useState<{ id_estadio: number; nombre: string }[]>([]);
  const [estados, setEstados] = useState<{ id_estado: number; nombre: string; codigo: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterLiga, setFilterLiga] = useState<number>(0);
  const [filterEstado, setFilterEstado] = useState<number>(0);
  const [formData, setFormData] = useState({
    id_liga: 0,
    id_equipo_local: 0,
    id_equipo_visitante: 0,
    fecha_hora: '',
    id_estadio: 0,
    jornada: '',
    id_estado: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = partidos;

    if (filterLiga > 0) {
      filtered = filtered.filter((p) => p.id_liga === filterLiga);
    }

    if (filterEstado > 0) {
      filtered = filtered.filter((p) => p.id_estado === filterEstado);
    }

    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.equipo_local && p.equipo_local.toLowerCase().includes(search)) ||
          (p.equipo_visitante && p.equipo_visitante.toLowerCase().includes(search)) ||
          (p.liga_nombre && p.liga_nombre.toLowerCase().includes(search))
      );
    }

    setFilteredPartidos(filtered);
  }, [partidos, searchText, filterLiga, filterEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partidosData, ligasData, equiposData, estadiosData, estadosData] = await Promise.all([
        apiService.getPartidos(),
        apiService.getLigas(),
        apiService.getEquipos(),
        apiService.getEstadios(),
        apiService.getEstadosByEntidad('PARTIDO'),
      ]);
      setPartidos(partidosData as PartidoExtendido[]);
      setLigas(ligasData);
      setEquipos(equiposData);
      setEstadios(estadiosData);
      setEstados(estadosData);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.id_equipo_local === formData.id_equipo_visitante) {
      setError('El equipo local y visitante deben ser diferentes');
      return;
    }

    try {
      const dataToSend = {
        id_liga: formData.id_liga || undefined,
        id_equipo_local: formData.id_equipo_local || undefined,
        id_equipo_visitante: formData.id_equipo_visitante || undefined,
        fecha_hora: formData.fecha_hora || undefined,
        id_estadio: formData.id_estadio || undefined,
        jornada: formData.jornada ? parseInt(formData.jornada) : undefined,
        id_estado: formData.id_estado || undefined,
      };

      if (editingId) {
        await apiService.updatePartido(editingId, dataToSend);
      } else {
        // Para crear, asignar estado PROGRAMADO por defecto si no se seleccionó
        if (!dataToSend.id_estado) {
          const estadoProgramado = estados.find(e => e.codigo === 'PROGRAMADO');
          if (estadoProgramado) {
            dataToSend.id_estado = estadoProgramado.id_estado;
          }
        }
        await apiService.createPartido(dataToSend);
      }
      
      await loadData();
      handleCancel();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
    }
  };

  const handleEdit = (partido: PartidoExtendido) => {
    setEditingId(partido.id_partido);
    setFormData({
      id_liga: partido.id_liga || 0,
      id_equipo_local: partido.id_equipo_local || 0,
      id_equipo_visitante: partido.id_equipo_visitante || 0,
      fecha_hora: partido.fecha_hora ? new Date(partido.fecha_hora).toISOString().slice(0, 16) : '',
      id_estadio: partido.id_estadio || 0,
      jornada: partido.jornada ? partido.jornada.toString() : '',
      id_estado: partido.id_estado || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este partido?')) return;
    
    try {
      await apiService.deletePartido(id);
      await loadData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      
      if (axiosError.response?.status === 409) {
        const errorMsg = axiosError.response.data?.error || 'No se puede eliminar este partido porque tiene datos relacionados';
        setError(`⚠️ ${errorMsg}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
        setError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      id_liga: 0,
      id_equipo_local: 0,
      id_equipo_visitante: 0,
      fecha_hora: '',
      id_estadio: 0,
      jornada: '',
      id_estado: 0,
    });
  };

  const getEquipoNombre = (id: number | null | undefined) => {
    if (!id) return '—';
    const equipo = equipos.find(e => e.id_equipo === id);
    return equipo?.nombre || '—';
  };

  const getLigaNombre = (id: number | null | undefined) => {
    if (!id) return '—';
    const liga = ligas.find(l => l.id_liga === id);
    return liga?.nombre || '—';
  };

  const getEstadoNombre = (id: number | null | undefined) => {
    if (!id) return '—';
    const estado = estados.find(e => e.id_estado === id);
    return estado?.nombre || '—';
  };

  if (loading && partidos.length === 0) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Partidos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Partido'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filtros */}
      {!showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por equipos o liga..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liga
              </label>
              <select
                value={filterLiga}
                onChange={(e) => setFilterLiga(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Todas</option>
                {ligas.map((l) => (
                  <option key={l.id_liga} value={l.id_liga}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Todos</option>
                {estados.map((est) => (
                  <option key={est.id_estado} value={est.id_estado}>
                    {est.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Partido' : 'Nuevo Partido'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liga *
                </label>
                <select
                  required
                  value={formData.id_liga}
                  onChange={(e) => setFormData({ ...formData, id_liga: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione una liga</option>
                  {ligas.map((liga) => (
                    <option key={liga.id_liga} value={liga.id_liga}>
                      {liga.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipo Local *
                </label>
                <select
                  required
                  value={formData.id_equipo_local}
                  onChange={(e) => setFormData({ ...formData, id_equipo_local: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione equipo local</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id_equipo} value={equipo.id_equipo}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipo Visitante *
                </label>
                <select
                  required
                  value={formData.id_equipo_visitante}
                  onChange={(e) => setFormData({ ...formData, id_equipo_visitante: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione equipo visitante</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id_equipo} value={equipo.id_equipo}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estadio
                </label>
                <select
                  value={formData.id_estadio}
                  onChange={(e) => setFormData({ ...formData, id_estadio: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Sin estadio</option>
                  {estadios.map((estadio) => (
                    <option key={estadio.id_estadio} value={estadio.id_estadio}>
                      {estadio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jornada
                </label>
                <input
                  type="number"
                  value={formData.jornada}
                  onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 10"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.id_estado}
                  onChange={(e) => setFormData({ ...formData, id_estado: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione estado</option>
                  {estados.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPartidos.map((partido) => (
              <tr key={partido.id_partido} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {partido.id_partido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getLigaNombre(partido.id_liga)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getEquipoNombre(partido.id_equipo_local)} vs {getEquipoNombre(partido.id_equipo_visitante)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partido.fecha_hora ? new Date(partido.fecha_hora).toLocaleString('es-ES') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getEstadoNombre(partido.id_estado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(partido)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(partido.id_partido)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPartidos.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {partidos.length === 0 
            ? 'No hay partidos registrados. Crea uno para comenzar.'
            : 'No se encontraron partidos con los filtros aplicados.'
          }
        </div>
      )}
    </div>
  );
};
