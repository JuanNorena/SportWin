import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { Deporte } from '../../types';

export const DeportesAdmin = () => {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [filteredDeportes, setFilteredDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    activo: true,
  });

  useEffect(() => {
    loadDeportes();
  }, []);

  useEffect(() => {
    // Aplicar filtros cada vez que cambien los deportes, el texto de búsqueda o el estado
    let filtered = deportes;

    // Filtrar por estado
    if (filterStatus === 'active') {
      filtered = filtered.filter((d) => d.activo);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((d) => !d.activo);
    }

    // Filtrar por texto de búsqueda
    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.nombre.toLowerCase().includes(search) ||
          (d.descripcion && d.descripcion.toLowerCase().includes(search))
      );
    }

    setFilteredDeportes(filtered);
  }, [deportes, searchText, filterStatus]);

  const loadDeportes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDeportes();
      setDeportes(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar deportes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await apiService.updateDeporte(editingId, formData);
      } else {
        await apiService.createDeporte(formData);
      }
      
      await loadDeportes();
      handleCancel();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
    }
  };

  const handleEdit = (deporte: Deporte) => {
    setEditingId(deporte.id_deporte);
    setFormData({
      nombre: deporte.nombre,
      descripcion: deporte.descripcion || '',
      icono: deporte.icono || '',
      activo: deporte.activo ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este deporte?')) return;
    
    try {
      await apiService.deleteDeporte(id);
      await loadDeportes();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string; detail?: string } } };
      
      // Si es un error de foreign key (409), mostrar mensaje descriptivo
      if (axiosError.response?.status === 409) {
        const errorMsg = axiosError.response.data?.error || 'No se puede eliminar este deporte porque tiene datos relacionados';
        setError(`⚠️ ${errorMsg}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
        setError(errorMessage);
      }
    }
  };

  const handleToggleStatus = async (deporte: Deporte) => {
    try {
      await apiService.updateDeporte(deporte.id_deporte, {
        ...deporte,
        activo: !deporte.activo,
      });
      await loadDeportes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado del deporte';
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      icono: '',
      activo: true,
    });
  };

  if (loading && deportes.length === 0) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Deportes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Deporte'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filtros */}
      {!showForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            {editingId ? 'Editar Deporte' : 'Nuevo Deporte'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Fútbol"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Icono
                </label>
                <input
                  type="text"
                  value={formData.icono}
                  onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: ⚽"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descripción del deporte"
              />
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
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
            {filteredDeportes.map((deporte) => (
              <tr key={deporte.id_deporte} className={`hover:bg-gray-50 ${!deporte.activo ? 'bg-gray-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deporte.id_deporte}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-2xl">
                  {deporte.icono || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deporte.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {deporte.descripcion || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      deporte.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {deporte.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(deporte)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(deporte)}
                    className={`${
                      deporte.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                    }`}
                    title={deporte.activo ? 'Desactivar' : 'Activar'}
                  >
                    {deporte.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(deporte.id_deporte)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDeportes.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          {deportes.length === 0 
            ? 'No hay deportes registrados. Crea uno para comenzar.'
            : 'No se encontraron deportes con los filtros aplicados.'
          }
        </div>
      )}
    </div>
  );
};
