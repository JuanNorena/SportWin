# 📊 RESUMEN EJECUTIVO DEL PROYECTO SPORTWIN

## 🎯 Cumplimiento de Requisitos

### ✅ Requisitos Académicos Cumplidos

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| **Lenguaje de Programación** | ✅ CUMPLIDO | TypeScript (compilado a JavaScript) |
| **Base de Datos** | ✅ CUMPLIDO | PostgreSQL (local, puerto 5432) |
| **Mínimo 10 Entidades Fuertes** | ✅ CUMPLIDO | 12 entidades implementadas |
| **CRUD Completo** | ✅ CUMPLIDO | Crear, Leer, Actualizar, Eliminar en todas las entidades principales |
| **10 Reportes** | ✅ CUMPLIDO | 3 simples, 4 intermedios, 3 complejos |
| **Exportación a PDF** | ✅ CUMPLIDO | Todos los reportes exportables |
| **Sistema de Login** | ✅ CUMPLIDO | Autenticación con bcrypt, roles de usuario |
| **Datos Realistas** | ✅ CUMPLIDO | Datos coherentes de ligas, equipos, partidos reales |
| **Interfaz de Usuario** | ✅ CUMPLIDO | Aplicación de consola interactiva |

## 📋 Entidades del Sistema (12 en total)

### Entidades Fuertes
1. **Usuario** - Sistema de autenticación y roles
2. **Apostador** - Clientes que realizan apuestas
3. **Deporte** - Catálogo de deportes disponibles
4. **Liga** - Competiciones deportivas
5. **Equipo** - Equipos participantes
6. **Partido** - Eventos deportivos
7. **Resultado** - Marcadores de partidos
8. **TipoApuesta** - Tipos de apuestas disponibles
9. **Cuota** - Odds/probabilidades de apuestas
10. **Apuesta** - Apuestas realizadas por usuarios
11. **Transaccion** - Movimientos financieros
12. **MetodoPago** - Formas de pago y retiro

## 📊 Reportes Implementados

### 1. Reportes Simples (Consultas a una sola tabla)

#### Reporte 1: Listado de Deportes
```sql
SELECT id_deporte, nombre, descripcion, activo 
FROM Deporte 
ORDER BY nombre
```
**Complejidad:** Baja
**Propósito:** Mostrar catálogo de deportes disponibles

#### Reporte 2: Apostadores con Saldo
```sql
SELECT id_apostador, documento, tipo_documento, ciudad, saldo_actual, verificado
FROM Apostador a
JOIN Usuario u ON a.id_usuario = u.id_usuario
ORDER BY saldo_actual DESC
```
**Complejidad:** Baja
**Propósito:** Listar apostadores ordenados por saldo

#### Reporte 3: Métodos de Pago
```sql
SELECT id_metodo_pago, nombre, descripcion, comision, activo
FROM MetodoPago
ORDER BY nombre
```
**Complejidad:** Baja
**Propósito:** Catálogo de métodos de pago disponibles

---

### 2. Reportes Intermedios (Consultas multitabla con operaciones)

#### Reporte 4: Apuestas por Deporte
**Operaciones:** COUNT, SUM, GROUP BY, JOINs múltiples
```sql
SELECT 
    d.nombre as deporte,
    COUNT(a.id_apuesta) as total_apuestas,
    SUM(a.monto_apostado) as monto_total_apostado,
    SUM(CASE WHEN a.estado = 'ganada' THEN a.ganancia_real ELSE 0 END) as total_pagado,
    COUNT(CASE WHEN a.estado = 'ganada' THEN 1 END) as apuestas_ganadas,
    COUNT(CASE WHEN a.estado = 'perdida' THEN 1 END) as apuestas_perdidas
FROM Apuesta a
JOIN Cuota c ON a.id_cuota = c.id_cuota
JOIN Partido p ON c.id_partido = p.id_partido
JOIN Liga l ON p.id_liga = l.id_liga
JOIN Deporte d ON l.id_deporte = d.id_deporte
GROUP BY d.nombre
ORDER BY monto_total_apostado DESC
```

#### Reporte 5: Partidos por Liga
**Operaciones:** COUNT, AVG, GROUP BY, HAVING, JOINs, LEFT JOIN
```sql
SELECT 
    l.nombre as liga,
    d.nombre as deporte,
    l.pais,
    COUNT(p.id_partido) as total_partidos,
    COUNT(CASE WHEN p.estado = 'finalizado' THEN 1 END) as partidos_finalizados,
    COUNT(CASE WHEN p.estado = 'programado' THEN 1 END) as partidos_programados,
    AVG(p.asistencia) as promedio_asistencia
FROM Liga l
JOIN Deporte d ON l.id_deporte = d.id_deporte
LEFT JOIN Partido p ON l.id_liga = p.id_liga
GROUP BY l.nombre, d.nombre, l.pais
HAVING COUNT(p.id_partido) > 0
ORDER BY total_partidos DESC
```

#### Reporte 6: Transacciones por Mes
**Operaciones:** TO_CHAR, SUM, COUNT, GROUP BY, WHERE
```sql
SELECT 
    TO_CHAR(fecha_transaccion, 'YYYY-MM') as mes,
    tipo,
    COUNT(*) as cantidad_transacciones,
    SUM(monto) as monto_total,
    SUM(comision) as comision_total,
    SUM(monto_neto) as monto_neto_total
FROM Transaccion
WHERE estado = 'completada'
GROUP BY TO_CHAR(fecha_transaccion, 'YYYY-MM'), tipo
ORDER BY mes DESC, tipo
```

#### Reporte 7: Equipos Más Activos
**Operaciones:** COUNT DISTINCT, LEFT JOIN, GROUP BY, HAVING, LIMIT
```sql
SELECT 
    e.nombre as equipo,
    e.pais,
    e.ciudad,
    l.nombre as liga,
    COUNT(DISTINCT p.id_partido) as total_partidos,
    COUNT(DISTINCT CASE WHEN p.estado = 'finalizado' THEN p.id_partido END) as partidos_jugados
FROM Equipo e
JOIN Liga l ON e.id_liga = l.id_liga
LEFT JOIN Partido p ON (e.id_equipo = p.id_equipo_local OR e.id_equipo = p.id_equipo_visitante)
GROUP BY e.nombre, e.pais, e.ciudad, l.nombre
HAVING COUNT(DISTINCT p.id_partido) > 0
ORDER BY total_partidos DESC
LIMIT 20
```

---

### 3. Reportes Complejos (Con subconsultas)

#### Reporte 8: Top Apostadores por Ganancias
**Complejidad:** Alta - Múltiples subconsultas correlacionadas
```sql
SELECT 
    a.id_apostador,
    u.username,
    CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
    a.ciudad,
    (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as total_apuestas,
    (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') as apuestas_ganadas,
    (SELECT SUM(monto_apostado) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as total_apostado,
    (SELECT SUM(ganancia_real) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') as total_ganado,
    (SELECT SUM(ganancia_real) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador AND ap.estado = 'ganada') - 
    (SELECT SUM(monto_apostado) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) as balance_neto,
    a.saldo_actual
FROM Apostador a
JOIN Usuario u ON a.id_usuario = u.id_usuario
WHERE (SELECT COUNT(*) FROM Apuesta ap WHERE ap.id_apostador = a.id_apostador) > 0
ORDER BY balance_neto DESC
LIMIT 10
```

#### Reporte 9: Cuotas Más Rentables
**Complejidad:** Alta - Subconsultas en SELECT y WHERE, cálculos complejos
```sql
SELECT 
    c.id_cuota,
    c.descripcion,
    ta.nombre as tipo_apuesta,
    c.valor_cuota,
    (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) as veces_apostada,
    (SELECT SUM(monto_apostado) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) as monto_total_apostado,
    (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada') as veces_ganada,
    (SELECT SUM(ganancia_real) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada') as total_pagado,
    CASE 
        WHEN (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) > 0 
        THEN ROUND((SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota AND a.estado = 'ganada')::NUMERIC * 100 / 
             (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota), 2)
        ELSE 0
    END as porcentaje_acierto
FROM Cuota c
JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
WHERE (SELECT COUNT(*) FROM Apuesta a WHERE a.id_cuota = c.id_cuota) > 0
ORDER BY veces_apostada DESC, monto_total_apostado DESC
LIMIT 20
```

#### Reporte 10: Rendimiento de Ligas
**Complejidad:** Alta - Subconsultas complejas con múltiples JOINs anidados
```sql
SELECT 
    l.id_liga,
    l.nombre as liga,
    d.nombre as deporte,
    l.pais,
    (SELECT COUNT(DISTINCT p.id_partido) FROM Partido p WHERE p.id_liga = l.id_liga) as total_partidos,
    (SELECT COUNT(*) FROM Apuesta a 
     JOIN Cuota c ON a.id_cuota = c.id_cuota
     JOIN Partido p ON c.id_partido = p.id_partido
     WHERE p.id_liga = l.id_liga) as total_apuestas,
    (SELECT SUM(a.monto_apostado) FROM Apuesta a 
     JOIN Cuota c ON a.id_cuota = c.id_cuota
     JOIN Partido p ON c.id_partido = p.id_partido
     WHERE p.id_liga = l.id_liga) as monto_total_apostado,
    (SELECT AVG(a.monto_apostado) FROM Apuesta a 
     JOIN Cuota c ON a.id_cuota = c.id_cuota
     JOIN Partido p ON c.id_partido = p.id_partido
     WHERE p.id_liga = l.id_liga) as promedio_apuesta,
    (SELECT SUM(a.ganancia_real) FROM Apuesta a 
     JOIN Cuota c ON a.id_cuota = c.id_cuota
     JOIN Partido p ON c.id_partido = p.id_partido
     WHERE p.id_liga = l.id_liga AND a.estado = 'ganada') as total_pagado
FROM Liga l
JOIN Deporte d ON l.id_deporte = d.id_deporte
WHERE (SELECT COUNT(*) FROM Apuesta a 
       JOIN Cuota c ON a.id_cuota = c.id_cuota
       JOIN Partido p ON c.id_partido = p.id_partido
       WHERE p.id_liga = l.id_liga) > 0
ORDER BY monto_total_apostado DESC
```

## 🔧 Funcionalidades Implementadas

### Módulo de Autenticación
- ✅ Login con validación de usuario y contraseña
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Roles de usuario (admin, operador, apostador)
- ✅ Sesión persistente durante la ejecución

### Módulo de Apostadores (CRUD Completo)
- ✅ **Crear:** Registro de nuevos apostadores
- ✅ **Leer:** Listar todos, buscar por documento, consultar saldo
- ✅ **Actualizar:** Modificar información de contacto
- ✅ **Eliminar:** Eliminar apostador del sistema

### Módulo de Partidos (CRUD Completo)
- ✅ **Crear:** Registro de nuevos partidos
- ✅ **Leer:** Listar programados/finalizados, buscar por ID
- ✅ **Actualizar:** Cambiar estado, modificar información
- ✅ **Eliminar:** Eliminar partido

### Módulo de Apuestas (CRUD Completo)
- ✅ **Crear:** Realizar nueva apuesta con validación de saldo
- ✅ **Leer:** Ver todas las apuestas, mis apuestas, estadísticas
- ✅ **Actualizar:** Resolver apuesta (ganada/perdida)
- ✅ **Eliminar:** Cancelar apuesta con reembolso

### Módulo de Transacciones
- ✅ Depósitos con cálculo automático de comisiones
- ✅ Retiros con validación de saldo
- ✅ Historial completo de transacciones
- ✅ Resumen financiero por apostador

### Módulo de Reportes
- ✅ 10 reportes con diferentes niveles de complejidad
- ✅ Visualización en tablas formateadas
- ✅ Exportación a PDF con diseño profesional
- ✅ Datos formateados (moneda, fechas)

## 🛡️ Características de Seguridad

1. **Autenticación Segura**
   - Contraseñas hasheadas con bcrypt (10 rounds)
   - Validación de credenciales contra base de datos

2. **Integridad de Datos**
   - Triggers para actualización automática de saldos
   - Transacciones ACID para operaciones financieras
   - Validaciones de negocio en servicios

3. **Restricciones de Base de Datos**
   - CHECK constraints en campos críticos
   - UNIQUE constraints para evitar duplicados
   - Foreign Keys con ON DELETE CASCADE

## 📂 Archivos del Proyecto

### Scripts SQL
- `database/01_schema.sql` - Esquema completo con triggers y vistas
- `database/02_seed.sql` - Datos realistas de prueba

### Código TypeScript
- `src/index.ts` - Punto de entrada
- `src/controllers/` - 6 controladores (Main, Apostador, Partido, Apuesta, Transacción, Reporte)
- `src/services/` - 6 servicios (Auth, Apostador, Partido, Apuesta, Transacción, Reporte)
- `src/models/` - Interfaces TypeScript
- `src/utils/` - Utilidades (Database, Console)

### Documentación
- `README_PROYECTO.md` - Manual de usuario completo
- `DOCUMENTACION_TECNICA.md` - Documentación técnica detallada
- `RESUMEN_PROYECTO.md` - Este documento

### Configuración
- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración TypeScript
- `.env` - Variables de entorno
- `install.ps1` - Script de instalación automática

## 📊 Estadísticas del Proyecto

- **Líneas de Código:** ~3,500 líneas
- **Archivos TypeScript:** 13
- **Archivos SQL:** 2
- **Tablas de BD:** 12
- **Vistas:** 2
- **Triggers:** 2
- **Funciones:** 2
- **Índices:** 15
- **Reportes:** 10

## 🎓 Observaciones Adicionales Cumplidas

- ✅ **Reportes con diferentes complejidades claramente diferenciadas**
- ✅ **Sistema de login implementado con roles**
- ✅ **Datos realistas** (equipos reales, ligas reales, nombres coherentes)
- ✅ **Documentos/comprobantes generados en PDF**
- ✅ **Interfaz de consola intuitiva con colores y tablas**

## 🚀 Cómo Ejecutar

### Instalación Automática
```powershell
.\install.ps1
```

### Instalación Manual
```powershell
# 1. Instalar dependencias
npm install

# 2. Crear base de datos
psql -h localhost -p 5432 -U postgres -d SportWin -f database/01_schema.sql

# 3. Cargar datos
psql -h localhost -p 5432 -U postgres -d SportWin -f database/02_seed.sql

# 4. Compilar
npm run build

# 5. Ejecutar
npm start
```

## 📞 Soporte

Para más información, consulte:
- `README_PROYECTO.md` - Guía completa de uso
- `DOCUMENTACION_TECNICA.md` - Detalles técnicos del modelo

---

**SportWin v1.0** - Sistema Profesional de Apuestas Deportivas
Desarrollado para la materia de Bases de Datos - Octavo Semestre
© 2025
