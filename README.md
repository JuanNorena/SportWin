# SportWin - Sistema de Apuestas Deportivas

## 📋 Descripción del Proyecto

SportWin es un sistema completo de gestión de apuestas deportivas desarrollado en TypeScript para ser ejecutado desde consola. El sistema permite a los usuarios gestionar apuestas, partidos, transacciones financieras y generar reportes detallados en formato PDF.

## 🎯 Características Principales

### Requisitos Cumplidos

✅ **10+ Entidades Fuertes en el Modelo ER:**
- Usuario
- Apostador
- Deporte
- Liga
- Equipo
- Partido
- Resultado
- TipoApuesta
- Cuota
- Apuesta
- Transaccion
- MetodoPago

✅ **CRUD Completo:** Registro, modificación, eliminación y consulta para todas las entidades principales

✅ **10 Reportes:**
- **3 Simples:** Deportes, Apostadores con Saldo, Métodos de Pago
- **4 Intermedios:** Apuestas por Deporte, Partidos por Liga, Transacciones por Mes, Equipos Más Activos
- **3 Complejos:** Top Apostadores, Cuotas Rentables, Rendimiento de Ligas
- **Exportables a PDF** ✅

✅ **Sistema de Login** con autenticación de usuario y contraseña

✅ **Datos Realistas** en la base de datos con ejemplos coherentes

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **ORM/Conexión:** node-pg (nativo)
- **Generación PDF:** PDFKit
- **Interfaz de Consola:** readline-sync, chalk, cli-table3
- **Seguridad:** bcrypt (hash de contraseñas)

## 📁 Estructura del Proyecto

```
SportWin/
├── database/
│   ├── 01_schema.sql          # Esquema de base de datos
│   └── 02_seed.sql            # Datos de ejemplo
├── src/
│   ├── controllers/           # Controladores de la aplicación
│   │   ├── mainController.ts
│   │   ├── apostadorController.ts
│   │   ├── partidoController.ts
│   │   ├── apuestaController.ts
│   │   ├── transaccionController.ts
│   │   └── reportController.ts
│   ├── services/              # Lógica de negocio
│   │   ├── authService.ts
│   │   ├── apostadorService.ts
│   │   ├── partidoService.ts
│   │   ├── apuestaService.ts
│   │   ├── transaccionService.ts
│   │   └── reportService.ts
│   ├── models/                # Interfaces y modelos
│   │   └── index.ts
│   ├── utils/                 # Utilidades
│   │   ├── database.ts
│   │   └── console.ts
│   └── index.ts               # Punto de entrada
├── .env                       # Variables de entorno
├── package.json
├── tsconfig.json
└── README_PROYECTO.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **Node.js** (v18 o superior)
2. **PostgreSQL** (v12 o superior)
3. **npm** o **yarn**

### Paso 1: Clonar e Instalar Dependencias

```powershell
# Navegar al directorio del proyecto
cd "c:\Universidad\Octavo Semestre\Bases\SportWin"

# Instalar dependencias
npm install
```

### Paso 2: Configurar Base de Datos

La base de datos ya está configurada con los siguientes parámetros:
- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** postgres
- **Contraseña:** Animacion3d*
- **Base de Datos:** SportWin

### Paso 3: Crear Esquema y Cargar Datos

```powershell
# Crear esquema de base de datos
psql -h localhost -p 5432 -U postgres -d SportWin -f database/01_schema.sql

# Cargar datos de ejemplo
psql -h localhost -p 5432 -U postgres -d SportWin -f database/02_seed.sql

# Opciones adicionales (nuevo seed file y scripts npm)
# Re-crear la base de datos y aplicar schema (utiliza el script npm db:recreate)
# PGPASSWORD='sebas031800' npm run db:recreate

# Cargar datos con 02_seed_new.sql (utiliza el script npm db:seed:new)
# PGPASSWORD='sebas031800' npm run db:seed:new
```

### Paso 4: Compilar TypeScript

```powershell
npm run build
```

### Paso 5: Ejecutar la Aplicación

```powershell
# Modo desarrollo (con ts-node)
npm run dev

# Modo producción
npm start
```

## 👤 Usuarios de Prueba

El sistema incluye usuarios de prueba con la contraseña: **password123**

### Administrador
- **Usuario:** admin
- **Rol:** admin

### Operador
- **Usuario:** operador1
- **Rol:** operador

### Apostadores
- **Usuario:** jperez, amartinez, llopez, mgarcia, crojas, shernandez, dramirez, pcastro
- **Rol:** apostador

## 📊 Funcionalidades del Sistema

### 1. Gestión de Apostadores
- Crear nuevo apostador
- Listar apostadores
- Buscar por documento
- Actualizar información
- Consultar saldo

### 2. Gestión de Partidos
- Listar partidos programados
- Listar partidos finalizados
- Crear nuevo partido
- Actualizar estado del partido
- Consultar información detallada

### 3. Gestión de Apuestas
- Crear apuesta
- Ver mis apuestas
- Resolver apuesta (ganada/perdida)
- Cancelar apuesta
- Consultar estadísticas

### 4. Transacciones
- Realizar depósito
- Realizar retiro
- Ver historial de transacciones
- Consultar historial financiero

### 5. Reportes

#### Reportes Simples
1. **Listado de Deportes:** Consulta directa a la tabla Deporte
2. **Apostadores con Saldo:** Listado de apostadores ordenados por saldo
3. **Métodos de Pago:** Catálogo de métodos de pago disponibles

#### Reportes Intermedios
4. **Apuestas por Deporte:** Estadísticas agrupadas con SUM, COUNT, GROUP BY
5. **Partidos por Liga:** Análisis con AVG, HAVING, múltiples JOINs
6. **Transacciones por Mes:** Agrupación temporal con TO_CHAR
7. **Equipos Más Activos:** Consulta con COUNT DISTINCT y LIMIT

#### Reportes Complejos (con Subconsultas)
8. **Top Apostadores por Ganancias:** Múltiples subconsultas correlacionadas
9. **Cuotas Más Rentables:** Subconsultas con cálculos de porcentajes
10. **Rendimiento de Ligas:** Análisis complejo con subconsultas en SELECT

## 🗄️ Modelo de Datos

### Entidades Principales

- **Usuario:** Autenticación y roles del sistema
- **Apostador:** Información de clientes
- **Deporte:** Catálogo de deportes
- **Liga:** Competiciones deportivas
- **Equipo:** Equipos participantes
- **Partido:** Eventos deportivos
- **Resultado:** Marcadores de partidos
- **TipoApuesta:** Tipos de apuestas disponibles
- **Cuota:** Odds/cuotas de apuestas
- **Apuesta:** Apuestas realizadas
- **Transaccion:** Movimientos financieros
- **MetodoPago:** Formas de pago

### Características del Modelo

- **Integridad Referencial:** Todas las FK con ON DELETE CASCADE
- **Triggers Automáticos:** Actualización de saldos y cálculos
- **Vistas Materializadas:** Para consultas complejas frecuentes
- **Índices Optimizados:** En columnas de búsqueda frecuente

## 📝 Funciones y Triggers

### Triggers Implementados

1. **actualizar_saldo_apostador()**: Actualiza automáticamente el saldo al registrar transacciones
2. **calcular_ganancia_potencial()**: Calcula la ganancia antes de insertar apuesta

### Vistas

1. **vista_partidos_completos**: Información completa de partidos con equipos y ligas
2. **vista_apuestas_detalladas**: Apuestas con toda la información relacionada

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rounds)
- Validación de permisos por rol
- Transacciones ACID para operaciones críticas
- Validación de datos en servicios

## 📄 Exportación de Reportes

Todos los reportes pueden ser exportados a PDF con:
- Encabezado personalizado
- Fecha de generación
- Datos formateados
- Paginación automática
- Pie de página

Los PDF se guardan en la carpeta `reports/`

## 🎨 Interfaz de Consola

La interfaz utiliza:
- **Colores** para mejor visualización (chalk)
- **Tablas formateadas** para datos (cli-table3)
- **Menús intuitivos** con validación
- **Mensajes claros** de éxito/error

## 📊 Ejemplos de Datos

La base de datos incluye:
- 10 usuarios (admin, operador, apostadores)
- 8 apostadores con saldos realistas
- 5 deportes populares
- 8 ligas internacionales
- 22 equipos de diferentes países
- 15 partidos (programados y finalizados)
- 10 tipos de apuestas
- 27 cuotas activas
- 14 apuestas de ejemplo
- 24 transacciones completadas

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
```powershell
# Verificar que PostgreSQL está corriendo
Get-Service -Name postgresql*

# Si no está corriendo, iniciarlo
Start-Service postgresql-x64-14
```

### Error al compilar TypeScript
```powershell
# Limpiar y reinstalar
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
npm run build
```

### Error de permisos en base de datos
```sql
-- Otorgar permisos al usuario postgres
GRANT ALL PRIVILEGES ON DATABASE "SportWin" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

## 📚 Documentación Adicional

### Comandos Útiles

```powershell
# Compilar
npm run build

# Desarrollo
npm run dev

# Producción
npm start

# Crear schema
npm run db:setup

# Cargar datos
npm run db:seed
```

### Estructura de Menús

```
Menú Principal
├── Gestión de Apostadores
│   ├── Listar
│   ├── Buscar
│   ├── Crear
│   ├── Actualizar
│   └── Ver Saldo
├── Gestión de Partidos
│   ├── Programados
│   ├── Finalizados
│   ├── Buscar
│   ├── Crear
│   └── Actualizar Estado
├── Gestión de Apuestas
│   ├── Listar
│   ├── Mis Apuestas
│   ├── Crear
│   ├── Resolver
│   ├── Cancelar
│   └── Estadísticas
├── Transacciones
│   ├── Depósito
│   ├── Retiro
│   ├── Historial
│   └── Historial Financiero
└── Reportes
    ├── Simples (1-3)
    ├── Intermedios (4-7)
    └── Complejos (8-10)
```

## 👥 Autores

**Proyecto desarrollado para la materia de Bases de Datos**
- Universidad
- Octavo Semestre
- 2025

## 📄 Licencia

Este proyecto es de uso académico.

## 🔄 Actualizaciones Futuras

Posibles mejoras:
- [ ] Interfaz web (React/Vue)
- [ ] API REST
- [ ] Notificaciones en tiempo real
- [ ] Dashboard con gráficas
- [ ] Integración con APIs deportivas reales
- [ ] Sistema de bonos y promociones
- [ ] Multiples idiomas
- [ ] Modo oscuro en consola

---

**SportWin** - Sistema Profesional de Apuestas Deportivas 🏆⚽🏀
