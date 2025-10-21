# Documentación Técnica - SportWin

## 📐 Modelo Entidad-Relación

### Diagrama Textual del Modelo ER

```
┌─────────────┐         ┌──────────────┐
│   Usuario   │────────▶│  Apostador   │
└─────────────┘  1:1    └──────────────┘
                              │
                              │ 1:N
                              ▼
                        ┌──────────────┐
                        │  Transaccion │
                        └──────────────┘
                              │
                              │ N:1
                              ▼
                        ┌──────────────┐
                        │ MetodoPago   │
                        └──────────────┘

┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Deporte   │────────▶│     Liga     │────────▶│    Equipo    │
└─────────────┘  1:N    └──────────────┘  1:N    └──────────────┘
                              │                          │
                              │ 1:N                      │
                              ▼                          │
                        ┌──────────────┐                 │
                        │   Partido    │◀────────────────┘
                        └──────────────┘      2:N
                              │
                         ┌────┴────┐
                    1:1  │         │ 1:N
                         ▼         ▼
                  ┌──────────┐  ┌──────────┐
                  │Resultado │  │  Cuota   │
                  └──────────┘  └──────────┘
                                     │
                                     │ N:1
                                     ▼
                               ┌─────────────┐
                               │ TipoApuesta │
                               └─────────────┘
                                     │
                                     │ 1:N
                                     ▼
                               ┌─────────────┐
                               │   Apuesta   │◀─────────┐
                               └─────────────┘          │
                                     │                  │
                                     │ 1:N              │ N:1
                                     ▼                  │
                               ┌─────────────┐          │
                               │ Transaccion │──────────┘
                               └─────────────┘
```

## 📋 Descripción de Entidades

### 1. Usuario
**Propósito:** Almacenar credenciales y roles de acceso al sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_usuario | SERIAL | PK | Identificador único |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Nombre de usuario |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| nombre | VARCHAR(100) | NOT NULL | Nombre real |
| apellido | VARCHAR(100) | NOT NULL | Apellido |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Correo electrónico |
| rol | VARCHAR(20) | CHECK, NOT NULL | admin/operador/apostador |
| fecha_creacion | TIMESTAMP | DEFAULT NOW | Fecha de registro |
| ultimo_acceso | TIMESTAMP | NULL | Último login |
| activo | BOOLEAN | DEFAULT TRUE | Estado de la cuenta |

### 2. Apostador
**Propósito:** Información detallada de los clientes que realizan apuestas

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_apostador | SERIAL | PK | Identificador único |
| id_usuario | INTEGER | FK(Usuario), UNIQUE | Referencia a usuario |
| documento | VARCHAR(20) | UNIQUE, NOT NULL | Documento de identidad |
| tipo_documento | VARCHAR(10) | CHECK, NOT NULL | CC/CE/TI/Pasaporte |
| telefono | VARCHAR(20) | NULL | Número de contacto |
| direccion | VARCHAR(200) | NULL | Dirección física |
| ciudad | VARCHAR(100) | NULL | Ciudad de residencia |
| pais | VARCHAR(100) | DEFAULT 'Colombia' | País |
| fecha_nacimiento | DATE | NOT NULL | Fecha de nacimiento |
| saldo_actual | DECIMAL(15,2) | DEFAULT 0.00 | Saldo disponible |
| fecha_registro | TIMESTAMP | DEFAULT NOW | Fecha de registro |
| verificado | BOOLEAN | DEFAULT FALSE | Cuenta verificada |

### 3. Deporte
**Propósito:** Catálogo de deportes disponibles para apuestas

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_deporte | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del deporte |
| descripcion | TEXT | NULL | Descripción |
| icono | VARCHAR(50) | NULL | Emoji o ícono |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

### 4. Liga
**Propósito:** Competiciones y torneos deportivos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_liga | SERIAL | PK | Identificador único |
| id_deporte | INTEGER | FK(Deporte) | Deporte de la liga |
| nombre | VARCHAR(100) | NOT NULL | Nombre de la liga |
| pais | VARCHAR(100) | NULL | País de la liga |
| temporada | VARCHAR(20) | NULL | Temporada actual |
| fecha_inicio | DATE | NULL | Inicio de temporada |
| fecha_fin | DATE | NULL | Fin de temporada |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

### 5. Equipo
**Propósito:** Equipos que participan en las competiciones

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_equipo | SERIAL | PK | Identificador único |
| id_liga | INTEGER | FK(Liga) | Liga a la que pertenece |
| nombre | VARCHAR(100) | NOT NULL | Nombre del equipo |
| pais | VARCHAR(100) | NULL | País del equipo |
| ciudad | VARCHAR(100) | NULL | Ciudad sede |
| estadio | VARCHAR(100) | NULL | Estadio local |
| entrenador | VARCHAR(100) | NULL | Entrenador actual |
| fundacion | INTEGER | NULL | Año de fundación |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

### 6. Partido
**Propósito:** Eventos deportivos sobre los cuales se puede apostar

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_partido | SERIAL | PK | Identificador único |
| id_liga | INTEGER | FK(Liga) | Liga del partido |
| id_equipo_local | INTEGER | FK(Equipo) | Equipo local |
| id_equipo_visitante | INTEGER | FK(Equipo) | Equipo visitante |
| fecha_hora | TIMESTAMP | NOT NULL | Fecha y hora |
| estadio | VARCHAR(100) | NULL | Lugar del partido |
| jornada | INTEGER | NULL | Número de jornada |
| estado | VARCHAR(20) | CHECK, DEFAULT | programado/en_curso/finalizado |
| arbitro | VARCHAR(100) | NULL | Árbitro principal |
| asistencia | INTEGER | NULL | Número de asistentes |

**Constraint:** `id_equipo_local != id_equipo_visitante`

### 7. Resultado
**Propósito:** Resultados finales y estadísticas de partidos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_resultado | SERIAL | PK | Identificador único |
| id_partido | INTEGER | FK(Partido), UNIQUE | Partido asociado |
| goles_local | INTEGER | DEFAULT 0 | Goles equipo local |
| goles_visitante | INTEGER | DEFAULT 0 | Goles equipo visitante |
| tarjetas_amarillas_local | INTEGER | DEFAULT 0 | Tarjetas amarillas local |
| tarjetas_amarillas_visitante | INTEGER | DEFAULT 0 | Tarjetas amarillas visitante |
| tarjetas_rojas_local | INTEGER | DEFAULT 0 | Tarjetas rojas local |
| tarjetas_rojas_visitante | INTEGER | DEFAULT 0 | Tarjetas rojas visitante |
| corners_local | INTEGER | DEFAULT 0 | Corners equipo local |
| corners_visitante | INTEGER | DEFAULT 0 | Corners equipo visitante |
| fecha_actualizacion | TIMESTAMP | DEFAULT NOW | Última actualización |

### 8. TipoApuesta
**Propósito:** Catálogo de tipos de apuestas disponibles

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_tipo_apuesta | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del tipo |
| descripcion | TEXT | NULL | Descripción detallada |
| categoria | VARCHAR(30) | CHECK | resultado/marcador/jugador/estadistica |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

### 9. Cuota
**Propósito:** Odds/cuotas para cada tipo de apuesta en cada partido

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_cuota | SERIAL | PK | Identificador único |
| id_partido | INTEGER | FK(Partido) | Partido asociado |
| id_tipo_apuesta | INTEGER | FK(TipoApuesta) | Tipo de apuesta |
| descripcion | VARCHAR(100) | NOT NULL | Descripción de la cuota |
| valor_cuota | DECIMAL(6,2) | CHECK >= 1.00 | Valor de la cuota |
| resultado_esperado | VARCHAR(100) | NULL | Resultado que se apuesta |
| fecha_creacion | TIMESTAMP | DEFAULT NOW | Fecha de creación |
| fecha_cierre | TIMESTAMP | NULL | Fecha de cierre |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

### 10. Apuesta
**Propósito:** Apuestas realizadas por los apostadores

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_apuesta | SERIAL | PK | Identificador único |
| id_apostador | INTEGER | FK(Apostador) | Apostador que realizó |
| id_cuota | INTEGER | FK(Cuota) | Cuota apostada |
| monto_apostado | DECIMAL(15,2) | CHECK > 0 | Monto de la apuesta |
| cuota_aplicada | DECIMAL(6,2) | NOT NULL | Cuota al momento |
| ganancia_potencial | DECIMAL(15,2) | NOT NULL | Ganancia si gana |
| fecha_apuesta | TIMESTAMP | DEFAULT NOW | Fecha de apuesta |
| estado | VARCHAR(20) | CHECK, DEFAULT | pendiente/ganada/perdida |
| fecha_resolucion | TIMESTAMP | NULL | Fecha de resolución |
| ganancia_real | DECIMAL(15,2) | DEFAULT 0.00 | Ganancia efectiva |

### 11. Transaccion
**Propósito:** Registro de todas las transacciones financieras

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_transaccion | SERIAL | PK | Identificador único |
| id_apostador | INTEGER | FK(Apostador) | Apostador involucrado |
| id_metodo_pago | INTEGER | FK(MetodoPago), NULL | Método usado |
| id_apuesta | INTEGER | FK(Apuesta), NULL | Apuesta relacionada |
| tipo | VARCHAR(20) | CHECK, NOT NULL | deposito/retiro/apuesta/ganancia |
| monto | DECIMAL(15,2) | NOT NULL | Monto bruto |
| comision | DECIMAL(15,2) | DEFAULT 0.00 | Comisión aplicada |
| monto_neto | DECIMAL(15,2) | NOT NULL | Monto neto |
| fecha_transaccion | TIMESTAMP | DEFAULT NOW | Fecha de transacción |
| estado | VARCHAR(20) | CHECK, DEFAULT | pendiente/completada/rechazada |
| referencia | VARCHAR(100) | NULL | Referencia externa |
| descripcion | TEXT | NULL | Descripción |

### 12. MetodoPago
**Propósito:** Métodos de pago y retiro disponibles

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_metodo_pago | SERIAL | PK | Identificador único |
| nombre | VARCHAR(50) | NOT NULL | Nombre del método |
| descripcion | TEXT | NULL | Descripción |
| comision | DECIMAL(5,2) | DEFAULT 0.00 | Comisión porcentual |
| activo | BOOLEAN | DEFAULT TRUE | Estado |

## 🔗 Relaciones del Modelo

### Cardinalidades

1. **Usuario → Apostador**: 1:1 (Un usuario puede ser un apostador)
2. **Apostador → Apuesta**: 1:N (Un apostador puede tener múltiples apuestas)
3. **Apostador → Transaccion**: 1:N (Un apostador tiene múltiples transacciones)
4. **Deporte → Liga**: 1:N (Un deporte tiene múltiples ligas)
5. **Liga → Equipo**: 1:N (Una liga tiene múltiples equipos)
6. **Liga → Partido**: 1:N (Una liga tiene múltiples partidos)
7. **Equipo → Partido**: N:M (Un equipo participa en múltiples partidos)
8. **Partido → Resultado**: 1:1 (Un partido tiene un resultado)
9. **Partido → Cuota**: 1:N (Un partido tiene múltiples cuotas)
10. **TipoApuesta → Cuota**: 1:N (Un tipo tiene múltiples cuotas)
11. **Cuota → Apuesta**: 1:N (Una cuota puede ser apostada múltiples veces)
12. **Apuesta → Transaccion**: 1:N (Una apuesta genera transacciones)
13. **MetodoPago → Transaccion**: 1:N (Un método se usa en múltiples transacciones)

## 🔄 Triggers y Funciones

### Trigger: actualizar_saldo_apostador

**Propósito:** Actualizar automáticamente el saldo del apostador cuando se registra una transacción completada.

**Eventos:** AFTER INSERT ON Transaccion

**Lógica:**
```sql
IF NEW.estado = 'completada' THEN
    IF NEW.tipo IN ('deposito', 'ganancia', 'reembolso') THEN
        saldo += NEW.monto_neto
    ELSIF NEW.tipo IN ('retiro', 'apuesta') THEN
        saldo -= NEW.monto_neto
    END IF
END IF
```

### Trigger: calcular_ganancia_potencial

**Propósito:** Calcular automáticamente la ganancia potencial al crear una apuesta.

**Eventos:** BEFORE INSERT ON Apuesta

**Lógica:**
```sql
NEW.ganancia_potencial := NEW.monto_apostado * NEW.cuota_aplicada
```

## 📊 Vistas del Sistema

### Vista: vista_partidos_completos

**Propósito:** Facilitar consultas de partidos con toda la información relacionada.

**Columnas:**
- id_partido
- deporte
- liga
- equipo_local
- equipo_visitante
- fecha_hora
- estadio
- estado
- goles_local
- goles_visitante
- resultado (calculado)

**Query:**
```sql
SELECT 
    p.id_partido,
    d.nombre AS deporte,
    l.nombre AS liga,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    p.fecha_hora,
    p.estadio,
    p.estado,
    r.goles_local,
    r.goles_visitante,
    CASE 
        WHEN r.goles_local > r.goles_visitante THEN el.nombre
        WHEN r.goles_visitante > r.goles_local THEN ev.nombre
        ELSE 'Empate'
    END AS resultado
FROM Partido p
JOIN Liga l ON p.id_liga = l.id_liga
JOIN Deporte d ON l.id_deporte = d.id_deporte
JOIN Equipo el ON p.id_equipo_local = el.id_equipo
JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
LEFT JOIN Resultado r ON p.id_partido = r.id_partido
```

### Vista: vista_apuestas_detalladas

**Propósito:** Consultas completas de apuestas con información del apostador y partido.

**Columnas:**
- id_apuesta
- apostador (username)
- nombre_completo
- deporte
- equipo_local
- equipo_visitante
- fecha_partido
- tipo_apuesta
- detalle_cuota
- monto_apostado
- cuota_aplicada
- ganancia_potencial
- fecha_apuesta
- estado
- ganancia_real

## 🔍 Índices Optimizados

### Índices en Usuario
```sql
CREATE INDEX idx_usuario_username ON Usuario(username);
CREATE INDEX idx_usuario_email ON Usuario(email);
CREATE INDEX idx_usuario_rol ON Usuario(rol);
```

### Índices en Apostador
```sql
CREATE INDEX idx_apostador_documento ON Apostador(documento);
CREATE INDEX idx_apostador_usuario ON Apostador(id_usuario);
```

### Índices en Partido
```sql
CREATE INDEX idx_partido_fecha ON Partido(fecha_hora);
CREATE INDEX idx_partido_estado ON Partido(estado);
CREATE INDEX idx_partido_liga ON Partido(id_liga);
CREATE INDEX idx_partido_equipos ON Partido(id_equipo_local, id_equipo_visitante);
```

### Índices en Apuesta
```sql
CREATE INDEX idx_apuesta_apostador ON Apuesta(id_apostador);
CREATE INDEX idx_apuesta_fecha ON Apuesta(fecha_apuesta);
CREATE INDEX idx_apuesta_estado ON Apuesta(estado);
```

### Índices en Transacción
```sql
CREATE INDEX idx_transaccion_apostador ON Transaccion(id_apostador);
CREATE INDEX idx_transaccion_fecha ON Transaccion(fecha_transaccion);
CREATE INDEX idx_transaccion_tipo ON Transaccion(tipo);
```

### Índices en Cuota
```sql
CREATE INDEX idx_cuota_partido ON Cuota(id_partido);
CREATE INDEX idx_cuota_tipo ON Cuota(id_tipo_apuesta);
```

## 🛡️ Reglas de Integridad

### Restricciones de Dominio

1. **Usuario.rol**: CHECK (rol IN ('admin', 'operador', 'apostador'))
2. **Apostador.tipo_documento**: CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'Pasaporte'))
3. **Partido.estado**: CHECK (estado IN ('programado', 'en_curso', 'finalizado', 'suspendido', 'cancelado'))
4. **TipoApuesta.categoria**: CHECK (categoria IN ('resultado', 'marcador', 'jugador', 'estadistica'))
5. **Cuota.valor_cuota**: CHECK (valor_cuota >= 1.00)
6. **Apuesta.monto_apostado**: CHECK (monto_apostado > 0)
7. **Apuesta.estado**: CHECK (estado IN ('pendiente', 'ganada', 'perdida', 'cancelada', 'reembolsada'))
8. **Transaccion.tipo**: CHECK (tipo IN ('deposito', 'retiro', 'apuesta', 'ganancia', 'reembolso'))
9. **Transaccion.estado**: CHECK (estado IN ('pendiente', 'completada', 'rechazada', 'cancelada'))

### Restricciones de Integridad Referencial

- Todas las FK con **ON DELETE CASCADE**
- Garantiza eliminación en cascada de registros dependientes
- Mantiene consistencia automática

### Restricciones de Entidad

1. **Partido**: `id_equipo_local != id_equipo_visitante`
2. **Resultado**: UNIQUE constraint en `id_partido`
3. **Usuario**: UNIQUE en `username` y `email`
4. **Apostador**: UNIQUE en `documento` y `id_usuario`

---

**Documentación Técnica - SportWin v1.0**
