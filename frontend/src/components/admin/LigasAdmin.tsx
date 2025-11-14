import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Liga, Deporte } from '../../types';

interface LigaCompleta extends Liga {
  deporte_nombre?: string;
  pais_nombre?: string;
}

export const LigasAdmin = () => {
  const [ligas, setLigas] = useState<LigaCompleta[]>([]);
  const [filteredLigas, setFilteredLigas] = useState<LigaCompleta[]>([]);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [paises, setPaises] = useState<{ id_pais: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDeporte, setFilterDeporte] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    nombre: '',
    id_deporte: 0,
    id_pais: 0,
    temporada: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = ligas;

    if (filterStatus === 'active') {
      filtered = filtered.filter((l) => l.activo);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((l) => !l.activo);
    }

    if (filterDeporte > 0) {
      filtered = filtered.filter((l) => l.id_deporte === filterDeporte);
    }

    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.nombre.toLowerCase().includes(search) ||
          (l.temporada && l.temporada.toLowerCase().includes(search)) ||
          (l.deporte_nombre && l.deporte_nombre.toLowerCase().includes(search)) ||
          (l.pais_nombre && l.pais_nombre.toLowerCase().includes(search))
      );
    }

    setFilteredLigas(filtered);
  }, [ligas, searchText, filterDeporte, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ligasData, deportesData, paisesData] = await Promise.all([
        apiService.getLigas(),
        apiService.getDeportes(),
        apiService.getPaises(),
      ]);
      setLigas(ligasData as LigaCompleta[]);
      setDeportes(deportesData);
      setPaises(paisesData);
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
    
    try {
      const dataToSend = {
        ...formData,
        id_deporte: formData.id_deporte || undefined,
        id_pais: formData.id_pais || undefined,
        temporada: formData.temporada || undefined,
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
      };

      if (editingId) {
        await apiService.updateLiga(editingId, dataToSend);
      } else {
        await apiService.createLiga(dataToSend);
      }
      
      await loadData();
      handleCancel();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
    }
  };

  const handleEdit = (liga: LigaCompleta) => {
    setEditingId(liga.id_liga);
    setFormData({
      nombre: liga.nombre,
      id_deporte: liga.id_deporte || 0,
      id_pais: liga.id_pais || 0,
      temporada: liga.temporada || '',
      fecha_inicio: liga.fecha_inicio ? new Date(liga.fecha_inicio).toISOString().split('T')[0] : '',
      fecha_fin: liga.fecha_fin ? new Date(liga.fecha_fin).toISOString().split('T')[0] : '',
      activo: liga.activo ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta liga?')) return;
    
    try {
      await apiService.deleteLiga(id);
      await loadData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      
      if (axiosError.response?.status === 409) {
        const errorMsg = axiosError.response.data?.error || 'No se puede eliminar esta liga porque tiene datos relacionados';
        setError(`⚠️ ${errorMsg}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
        setError(errorMessage);
      }
    }
  };

  const handleToggleStatus = async (liga: LigaCompleta) => {
    try {
      await apiService.updateLiga(liga.id_liga, {
        ...liga,
        activo: !liga.activo,
      });
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado';
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      id_deporte: 0,
      id_pais: 0,
      temporada: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: true,
    });
  };

  if (loading && ligas.length === 0) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Ligas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva Liga'}
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
                placeholder="Buscar por nombre, temporada..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deporte
              </label>
              <select
                value={filterDeporte}
                onChange={(e) => setFilterDeporte(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Todos</option>
                {deportes.map((d) => (
                  <option key={d.id_deporte} value={d.id_deporte}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Liga' : 'Nueva Liga'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Liga BetPlay"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deporte *
                </label>
                <select
                  required
                  value={formData.id_deporte}
                  onChange={(e) => setFormData({ ...formData, id_deporte: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Seleccione un deporte</option>
                  {deportes.map((deporte) => (
                    <option key={deporte.id_deporte} value={deporte.id_deporte}>
                      {deporte.icono} {deporte.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <select
                  value={formData.id_pais}
                  onChange={(e) => setFormData({ ...formData, id_pais: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Sin país específico</option>
                  {paises.map((pais) => (
                    <option key={pais.id_pais} value={pais.id_pais}>
                      {pais.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporada
                </label>
                <input
                  type="text"
                  value={formData.temporada}
                  onChange={(e) => setFormData({ ...formData, temporada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 2024-2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Activo
              </label>
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
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deporte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                País
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temporada
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
            {filteredLigas.map((liga) => (
              <tr key={liga.id_liga} className={`hover:bg-gray-50 ${!liga.activo ? 'bg-gray-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {liga.id_liga}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {liga.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {liga.deporte_nombre || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {liga.pais_nombre || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {liga.temporada || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      liga.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {liga.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(liga)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(liga)}
                    className={`${
                      liga.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {liga.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(liga.id_liga)}
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

      {filteredLigas.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {ligas.length === 0 
            ? 'No hay ligas registradas. Crea una para comenzar.'
            : 'No se encontraron ligas con los filtros aplicados.'
          }
        </div>
      )}
    </div>
  );
};
