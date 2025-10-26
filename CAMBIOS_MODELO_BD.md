# CAMBIOS REALIZADOS AL MODELO RELACIONAL DE SPORTWIN

## Fecha: 25 de octubre de 2025

## Resumen de Cambios Solicitados por la Profesora

### 1. ✅ **Tabla TipoTransaccion** (Extraída de Transaccion)
- **Antes**: La tabla `Transaccion` tenía un campo `tipo VARCHAR(20)` con valores hardcodeados
- **Ahora**: Se creó la tabla `TipoTransaccion` con:
  - `id_tipo_transaccion` (PK)
  - `nombre`, `codigo`, `descripcion`
  - `afecta_saldo` (suma/resta/neutro) - para determinar cómo impacta el saldo
  - La tabla `Transaccion` ahora usa `id_tipo_transaccion` como FK

### 2. ✅ **Tablas de Estado** (Separadas por Entidad)
- **Antes**: Campos VARCHAR con CHECK constraints en cada tabla
- **Ahora**: Se crearon 3 tablas específicas:
  - `EstadoPartido` - Estados para partidos (programado, en_curso, finalizado, etc.)
  - `EstadoApuesta` - Estados para apuestas (pendiente, ganada, perdida, etc.)
  - `EstadoTransaccion` - Estados para transacciones (pendiente, completada, rechazada, etc.)
- Cada tabla tiene: `id`, `nombre`, `codigo`, `descripcion`, `activo`

### 3. ✅ **Tabla TipoDocumento**
- **Antes**: Campo `tipo_documento VARCHAR(10)` con CHECK constraint en `Apostador`
- **Ahora**: Tabla `TipoDocumento` con:
  - `id_tipo_documento` (PK)
  - `nombre`, `codigo`, `descripcion`
  - Ejemplos: CC, CE, TI, Pasaporte, DNI
- La tabla `Apostador` ahora usa `id_tipo_documento` como FK

### 4. ✅ **Tabla Ciudad y Estado (Departamento)**
- **Antes**: Campos VARCHAR simples en `Apostador`, `Equipo`, `Liga`
- **Ahora**: Estructura jerárquica:
  - `Pais` → `Estado` (Departamento/Provincia) → `Ciudad`
  - La tabla `Apostador` usa `id_ciudad` FK
  - La tabla `Liga` usa `id_pais` FK
  - La tabla `Equipo` usa `id_pais` e `id_ciudad` FK

### 5. ✅ **Tabla Pais**
- Catálogo de países con:
  - `id_pais` (PK)
  - `nombre`, `codigo_iso`, `codigo_telefono`
  - Usada por: Liga, Estado, Equipo, Entrenador, Arbitro

### 6. ✅ **Tabla Rol**
- **Antes**: Campo `rol VARCHAR(20)` con CHECK constraint en `Usuario`
- **Ahora**: Tabla `Rol` con:
  - `id_rol` (PK)
  - `nombre`, `descripcion`, `permisos`
  - Roles: admin, operador, apostador
- La tabla `Usuario` ahora usa `id_rol` como FK

### 7. ✅ **Tabla Estadio**
- **Antes**: Campo VARCHAR simple en `Partido` y `Equipo`
- **Ahora**: Tabla `Estadio` completa con:
  - `id_estadio` (PK)
  - `nombre`, `id_ciudad`, `direccion`, `capacidad`
  - `año_construccion`, `tipo_cesped`, `techado`, `foto_url`
- Usada por: `Partido` (id_estadio) y `Equipo` (id_estadio)

### 8. ✅ **Tabla Arbitro**
- **Antes**: Campo VARCHAR simple en `Partido`
- **Ahora**: Tabla `Arbitro` completa con:
  - `id_arbitro` (PK)
  - `nombre`, `apellido`, `id_pais`, `fecha_nacimiento`
  - `categoria`, `años_experiencia`, `foto_url`
- La tabla `Partido` ahora usa `id_arbitro` como FK

### 9. ✅ **Tabla Entrenador**
- **Antes**: Campo VARCHAR simple en `Equipo`
- **Ahora**: Tabla `Entrenador` completa con:
  - `id_entrenador` (PK)
  - `nombre`, `apellido`, `id_pais`, `fecha_nacimiento`
  - `licencia`, `experiencia_años`, `foto_url`
- La tabla `Equipo` ahora usa `id_entrenador` como FK

---

## Cambios Adicionales en el Schema

### Índices Actualizados
- Se actualizaron todos los índices para usar las nuevas FK en lugar de campos VARCHAR
- Nuevos índices agregados para las tablas de catálogo

### Vistas Actualizadas
- `vista_partidos_completos`: Ahora incluye joins con Estadio, EstadoPartido, Arbitro
- `vista_apuestas_detalladas`: Ahora usa EstadoApuesta

### Triggers Mejorados
- `actualizar_saldo_apostador()`: Actualizado para usar las nuevas tablas:
  - Lee de `EstadoTransaccion` para verificar si está completada
  - Lee de `TipoTransaccion` para saber si afecta_saldo (suma/resta/neutro)

---

## Archivos Modificados

### 1. `database/01_schema.sql`
- Schema completamente actualizado con las 9 nuevas tablas
- Todas las FK actualizadas
- Índices y vistas actualizadas
- Triggers actualizados

### 2. `database/02_seed_new.sql` (NUEVO)
- Archivo nuevo con datos de prueba para todas las nuevas tablas
- Incluye:
  - 10 países
  - 18 estados/departamentos
  - 20 ciudades
  - 3 roles
  - 5 tipos de documento
  - 6 tipos de transacción
  - 6 estados de partido
  - 5 estados de apuesta
  - 5 estados de transacción
  - 22 entrenadores
  - 12 árbitros
  - 22 estadios
  - Todos los datos anteriores adaptados

---

## Cómo Aplicar los Cambios

### Opción 1: Recrear la Base de Datos (Recomendado)

```sql
-- 1. Conectarse a postgres (base de datos por defecto)
-- 2. Eliminar la base de datos actual
DROP DATABASE "SportWin";

-- 3. Crear la base de datos nuevamente
CREATE DATABASE "SportWin"
    WITH 
    ENCODING = 'UTF8'
    OWNER = postgres;

-- 4. Conectarse a SportWin
-- 5. Ejecutar 01_schema.sql
-- 6. Ejecutar 02_seed_new.sql
```

### Opción 2: Migración (Más complejo)

Si quieres mantener datos existentes, necesitarías crear scripts de migración para cada tabla.

---

## Diagrama de Relaciones Actualizado

### Nuevas Relaciones Agregadas:

```
Pais (1) ─→ (N) Estado
Estado (1) ─→ (N) Ciudad
Ciudad (1) ─→ (N) Apostador
Ciudad (1) ─→ (N) Equipo
Ciudad (1) ─→ (N) Estadio

Pais (1) ─→ (N) Liga
Pais (1) ─→ (N) Equipo
Pais (1) ─→ (N) Entrenador
Pais (1) ─→ (N) Arbitro

Rol (1) ─→ (N) Usuario
TipoDocumento (1) ─→ (N) Apostador
TipoTransaccion (1) ─→ (N) Transaccion

EstadoPartido (1) ─→ (N) Partido
EstadoApuesta (1) ─→ (N) Apuesta
EstadoTransaccion (1) ─→ (N) Transaccion

Estadio (1) ─→ (N) Partido
Estadio (1) ─→ (N) Equipo
Arbitro (1) ─→ (N) Partido
Entrenador (1) ─→ (N) Equipo
```

---

## Ventajas del Nuevo Modelo

1. **Mayor Normalización**: Eliminación de redundancia de datos
2. **Facilidad de Mantenimiento**: Cambios centralizados en tablas de catálogo
3. **Integridad Referencial**: FK garantizan consistencia de datos
4. **Escalabilidad**: Fácil agregar nuevos países, ciudades, estados, etc.
5. **Reportes Mejorados**: Joins más ricos con información completa
6. **Auditoría**: Mejor trazabilidad con tablas de estado

---

## Próximos Pasos

1. ✅ Recrear la base de datos con el nuevo schema
2. ⏳ Actualizar los Services de TypeScript para usar las nuevas tablas
3. ⏳ Actualizar los Controllers para manejar las nuevas FK
4. ⏳ Actualizar las consultas SQL en el código
5. ⏳ Probar todas las funcionalidades

---

## Notas Importantes

- El archivo original `02_seed.sql` se mantiene como respaldo
- El nuevo archivo es `02_seed_new.sql` con todos los datos actualizados
- Los triggers y funciones fueron actualizados para trabajar con las nuevas tablas
- Se mantiene compatibilidad con la aplicación existente (solo requiere actualizar las consultas)
