# CRUD Completo por Entidad

Este documento confirma que las siguientes entidades tienen las 4 operaciones CRUD implementadas:

## 1. Apostador ✅
**Servicio:** `ApostadorService`
**Controlador:** `ApostadorController`

Operaciones disponibles:
- ✅ **Crear** - `create()` - Menú: "Crear Apostador"
- ✅ **Leer** - `getAll()`, `getById()`, `getByDocumento()` - Menú: "Listar Apostadores", "Buscar Apostador"
- ✅ **Actualizar** - `update()` - Menú: "Actualizar Apostador"
- ✅ **Eliminar** - `delete()` - Menú: "Eliminar Apostador"

## 2. Deporte ✅
**Servicio:** `DeporteService`
**Controlador:** `DeporteController`

Operaciones disponibles:
- ✅ **Crear** - `create()` - Menú: "Crear nuevo deporte"
- ✅ **Leer** - `getAll()`, `getById()`, `getByNombre()` - Menú: "Listar todos los deportes", "Buscar deporte por ID"
- ✅ **Actualizar** - `update()` - Menú: "Actualizar deporte"
- ✅ **Eliminar** - `delete()` - Menú: "Eliminar deporte"

## 3. Liga ✅
**Servicio:** `LigaService`
**Controlador:** `LigaController`

Operaciones disponibles:
- ✅ **Crear** - `create()` - Menú: "Crear nueva liga"
- ✅ **Leer** - `getAll()`, `getById()`, `getByDeporte()`, `getByPais()`, `getAllCompletas()` - Menú: "Listar todas las ligas", "Listar por deporte", "Listar por país", "Buscar liga por ID"
- ✅ **Actualizar** - `update()` - Menú: "Actualizar liga"
- ✅ **Eliminar** - `delete()` - Menú: "Eliminar liga"

## 4. Equipo ✅
**Servicio:** `EquipoService`
**Controlador:** `EquipoController`

Operaciones disponibles:
- ✅ **Crear** - `create()` - Menú: "Crear nuevo equipo"
- ✅ **Leer** - `getAll()`, `getById()`, `getByLiga()`, `getByPais()`, `getAllCompletos()`, `buscarPorNombre()` - Menú: "Listar todos los equipos", "Listar por liga", "Buscar por nombre", "Buscar por ID"
- ✅ **Actualizar** - `update()` - Menú: "Actualizar equipo"
- ✅ **Eliminar** - `delete()` - Menú: "Eliminar equipo"

---

## Notas Técnicas

### Soft Delete vs Hard Delete
Todos los servicios tienen implementado:
- **Hard Delete**: Método `delete()` que elimina permanentemente el registro de la base de datos
- **Soft Delete**: Método `desactivar()` que marca el registro como inactivo (campo `activo = false`)

### Validaciones
Las operaciones de eliminación incluyen:
- Confirmación del usuario antes de eliminar
- Verificación de existencia del registro
- Manejo de errores en caso de registros relacionados (integridad referencial)
- Mensajes informativos sobre el resultado de la operación

### Acceso desde Menú Principal
Para acceder a estos CRUDs desde el menú principal:
1. Iniciar sesión
2. Seleccionar:
   - **Apostadores**: "Gestión de Apostadores"
   - **Deportes**: Requiere agregar al menú principal (actualmente solo accesible vía código)
   - **Ligas**: Requiere agregar al menú principal (actualmente solo accesible vía código)
   - **Equipos**: Requiere agregar al menú principal (actualmente solo accesible vía código)

### Mejoras Implementadas
- Todos los métodos de eliminación muestran una tabla con los registros disponibles antes de solicitar el ID
- Confirmación explícita con advertencia de que la acción no se puede deshacer
- Mensajes claros sobre errores relacionados con integridad referencial
- Opción de cancelar la operación en cualquier momento
