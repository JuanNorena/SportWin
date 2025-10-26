-- ============================================
-- SISTEMA DE APUESTAS DEPORTIVAS - SPORTWIN
-- Script de Creación de Esquema
-- Base de Datos: PostgreSQL
-- ============================================

-- Eliminar tablas si existen (para recrear)
DROP TABLE IF EXISTS Transaccion CASCADE;
DROP TABLE IF EXISTS Apuesta CASCADE;
DROP TABLE IF EXISTS Cuota CASCADE;
DROP TABLE IF EXISTS TipoApuesta CASCADE;
DROP TABLE IF EXISTS Resultado CASCADE;
DROP TABLE IF EXISTS Partido CASCADE;
DROP TABLE IF EXISTS Equipo CASCADE;
DROP TABLE IF EXISTS Liga CASCADE;
DROP TABLE IF EXISTS Deporte CASCADE;
DROP TABLE IF EXISTS Apostador CASCADE;
DROP TABLE IF EXISTS MetodoPago CASCADE;
DROP TABLE IF EXISTS Usuario CASCADE;
DROP TABLE IF EXISTS TipoTransaccion CASCADE;
DROP TABLE IF EXISTS Estado CASCADE;
DROP TABLE IF EXISTS TipoDocumento CASCADE;
DROP TABLE IF EXISTS Departamento CASCADE;
DROP TABLE IF EXISTS Ciudad CASCADE;
DROP TABLE IF EXISTS Pais CASCADE;
DROP TABLE IF EXISTS Rol CASCADE;
DROP TABLE IF EXISTS Estadio CASCADE;
DROP TABLE IF EXISTS Arbitro CASCADE;
DROP TABLE IF EXISTS Entrenador CASCADE;

-- ============================================
-- TABLAS CATÁLOGO (Nuevas tablas de referencia)
-- ============================================

-- ============================================
-- TABLA: Pais
-- Descripción: Catálogo de países
-- ============================================
CREATE TABLE Pais (
    id_pais SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    codigo_iso VARCHAR(3) UNIQUE NOT NULL,
    codigo_telefono VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Departamento
-- Descripción: Departamentos/Estados/Provincias
-- ============================================
CREATE TABLE Departamento (
    id_departamento SERIAL PRIMARY KEY,
    id_pais INTEGER REFERENCES Pais(id_pais) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_pais, nombre)
);

-- ============================================
-- TABLA: Ciudad
-- Descripción: Ciudades
-- ============================================
CREATE TABLE Ciudad (
    id_ciudad SERIAL PRIMARY KEY,
    id_departamento INTEGER REFERENCES Departamento(id_departamento) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(id_departamento, nombre)
);

-- ============================================
-- TABLA: Estado
-- Descripción: Estados genéricos para diferentes entidades (Partido, Apuesta, Transacción, etc.)
-- ============================================
CREATE TABLE Estado (
    id_estado SERIAL PRIMARY KEY,
    entidad VARCHAR(50) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(entidad, codigo)
);

-- ============================================
-- TABLA: Rol
-- Descripción: Roles de usuario en el sistema
-- ============================================
CREATE TABLE Rol (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: TipoDocumento
-- Descripción: Tipos de documentos de identidad
-- ============================================
CREATE TABLE TipoDocumento (
    id_tipo_documento SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: TipoTransaccion
-- Descripción: Tipos de transacciones financieras
-- ============================================
CREATE TABLE TipoTransaccion (
    id_tipo_transaccion SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    afecta_saldo VARCHAR(20) CHECK (afecta_saldo IN ('suma', 'resta', 'neutro')),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Entrenador
-- Descripción: Entrenadores de equipos deportivos
-- ============================================
CREATE TABLE Entrenador (
    id_entrenador SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_pais INTEGER REFERENCES Pais(id_pais),
    fecha_nacimiento DATE,
    licencia VARCHAR(50),
    experiencia_años INTEGER,
    foto_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Arbitro
-- Descripción: Árbitros de eventos deportivos
-- ============================================
CREATE TABLE Arbitro (
    id_arbitro SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_pais INTEGER REFERENCES Pais(id_pais),
    fecha_nacimiento DATE,
    categoria VARCHAR(50),
    años_experiencia INTEGER,
    foto_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Estadio
-- Descripción: Estadios donde se realizan los partidos
-- ============================================
CREATE TABLE Estadio (
    id_estadio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    id_ciudad INTEGER REFERENCES Ciudad(id_ciudad),
    direccion VARCHAR(200),
    capacidad INTEGER,
    año_construccion INTEGER,
    tipo_cesped VARCHAR(50),
    techado BOOLEAN DEFAULT FALSE,
    foto_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Usuario
-- Descripción: Usuarios del sistema con acceso
-- ============================================
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    id_rol INTEGER REFERENCES Rol(id_rol),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: MetodoPago
-- Descripción: Métodos de pago disponibles
-- ============================================
CREATE TABLE MetodoPago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    comision DECIMAL(5,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Apostador
-- Descripción: Clientes que realizan apuestas
-- ============================================
CREATE TABLE Apostador (
    id_apostador SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    documento VARCHAR(20) UNIQUE NOT NULL,
    id_tipo_documento INTEGER REFERENCES TipoDocumento(id_tipo_documento),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    id_ciudad INTEGER REFERENCES Ciudad(id_ciudad),
    fecha_nacimiento DATE NOT NULL,
    saldo_actual DECIMAL(15,2) DEFAULT 0.00,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verificado BOOLEAN DEFAULT FALSE
);

-- ============================================
-- TABLA: Deporte
-- Descripción: Tipos de deportes disponibles
-- ============================================
CREATE TABLE Deporte (
    id_deporte SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Liga
-- Descripción: Ligas y competiciones deportivas
-- ============================================
CREATE TABLE Liga (
    id_liga SERIAL PRIMARY KEY,
    id_deporte INTEGER REFERENCES Deporte(id_deporte) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    id_pais INTEGER REFERENCES Pais(id_pais),
    temporada VARCHAR(20),
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Equipo
-- Descripción: Equipos participantes
-- ============================================
CREATE TABLE Equipo (
    id_equipo SERIAL PRIMARY KEY,
    id_liga INTEGER REFERENCES Liga(id_liga) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    id_pais INTEGER REFERENCES Pais(id_pais),
    id_ciudad INTEGER REFERENCES Ciudad(id_ciudad),
    id_estadio INTEGER REFERENCES Estadio(id_estadio),
    id_entrenador INTEGER REFERENCES Entrenador(id_entrenador),
    fundacion INTEGER,
    logo_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Partido
-- Descripción: Eventos deportivos
-- ============================================
CREATE TABLE Partido (
    id_partido SERIAL PRIMARY KEY,
    id_liga INTEGER REFERENCES Liga(id_liga) ON DELETE CASCADE,
    id_equipo_local INTEGER REFERENCES Equipo(id_equipo),
    id_equipo_visitante INTEGER REFERENCES Equipo(id_equipo),
    fecha_hora TIMESTAMP NOT NULL,
    id_estadio INTEGER REFERENCES Estadio(id_estadio),
    jornada INTEGER,
    id_estado INTEGER REFERENCES Estado(id_estado),
    id_arbitro INTEGER REFERENCES Arbitro(id_arbitro),
    asistencia INTEGER,
    CONSTRAINT diferentes_equipos CHECK (id_equipo_local != id_equipo_visitante)
);

-- ============================================
-- TABLA: Resultado
-- Descripción: Resultados de los partidos
-- ============================================
CREATE TABLE Resultado (
    id_resultado SERIAL PRIMARY KEY,
    id_partido INTEGER UNIQUE REFERENCES Partido(id_partido) ON DELETE CASCADE,
    goles_local INTEGER DEFAULT 0,
    goles_visitante INTEGER DEFAULT 0,
    tarjetas_amarillas_local INTEGER DEFAULT 0,
    tarjetas_amarillas_visitante INTEGER DEFAULT 0,
    tarjetas_rojas_local INTEGER DEFAULT 0,
    tarjetas_rojas_visitante INTEGER DEFAULT 0,
    corners_local INTEGER DEFAULT 0,
    corners_visitante INTEGER DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: TipoApuesta
-- Descripción: Tipos de apuestas disponibles
-- ============================================
CREATE TABLE TipoApuesta (
    id_tipo_apuesta SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(30) CHECK (categoria IN ('resultado', 'marcador', 'jugador', 'estadistica')),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Cuota
-- Descripción: Cuotas/odds para cada tipo de apuesta
-- ============================================
CREATE TABLE Cuota (
    id_cuota SERIAL PRIMARY KEY,
    id_partido INTEGER REFERENCES Partido(id_partido) ON DELETE CASCADE,
    id_tipo_apuesta INTEGER REFERENCES TipoApuesta(id_tipo_apuesta),
    descripcion VARCHAR(100) NOT NULL,
    valor_cuota DECIMAL(6,2) NOT NULL CHECK (valor_cuota >= 1.00),
    resultado_esperado VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: Apuesta
-- Descripción: Apuestas realizadas por los apostadores
-- ============================================
CREATE TABLE Apuesta (
    id_apuesta SERIAL PRIMARY KEY,
    id_apostador INTEGER REFERENCES Apostador(id_apostador),
    id_cuota INTEGER REFERENCES Cuota(id_cuota),
    monto_apostado DECIMAL(15,2) NOT NULL CHECK (monto_apostado > 0),
    cuota_aplicada DECIMAL(6,2) NOT NULL,
    ganancia_potencial DECIMAL(15,2) NOT NULL,
    fecha_apuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_estado INTEGER REFERENCES Estado(id_estado),
    fecha_resolucion TIMESTAMP,
    ganancia_real DECIMAL(15,2) DEFAULT 0.00
);

-- ============================================
-- TABLA: Transaccion
-- Descripción: Transacciones financieras (depósitos, retiros, ganancias)
-- ============================================
CREATE TABLE Transaccion (
    id_transaccion SERIAL PRIMARY KEY,
    id_apostador INTEGER REFERENCES Apostador(id_apostador),
    id_metodo_pago INTEGER REFERENCES MetodoPago(id_metodo_pago),
    id_apuesta INTEGER REFERENCES Apuesta(id_apuesta),
    id_tipo_transaccion INTEGER REFERENCES TipoTransaccion(id_tipo_transaccion),
    monto DECIMAL(15,2) NOT NULL,
    comision DECIMAL(15,2) DEFAULT 0.00,
    monto_neto DECIMAL(15,2) NOT NULL,
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_estado INTEGER REFERENCES Estado(id_estado),
    referencia VARCHAR(100),
    descripcion TEXT
);

-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================

-- Índices para Usuario
CREATE INDEX idx_usuario_username ON Usuario(username);
CREATE INDEX idx_usuario_email ON Usuario(email);
CREATE INDEX idx_usuario_rol ON Usuario(id_rol);

-- Índices para Apostador
CREATE INDEX idx_apostador_documento ON Apostador(documento);
CREATE INDEX idx_apostador_usuario ON Apostador(id_usuario);
CREATE INDEX idx_apostador_ciudad ON Apostador(id_ciudad);

-- Índices para Partido
CREATE INDEX idx_partido_fecha ON Partido(fecha_hora);
CREATE INDEX idx_partido_estado ON Partido(id_estado);
CREATE INDEX idx_partido_liga ON Partido(id_liga);
CREATE INDEX idx_partido_equipos ON Partido(id_equipo_local, id_equipo_visitante);
CREATE INDEX idx_partido_estadio ON Partido(id_estadio);
CREATE INDEX idx_partido_arbitro ON Partido(id_arbitro);

-- Índices para Apuesta
CREATE INDEX idx_apuesta_apostador ON Apuesta(id_apostador);
CREATE INDEX idx_apuesta_fecha ON Apuesta(fecha_apuesta);
CREATE INDEX idx_apuesta_estado ON Apuesta(id_estado);

-- Índices para Transacción
CREATE INDEX idx_transaccion_apostador ON Transaccion(id_apostador);
CREATE INDEX idx_transaccion_fecha ON Transaccion(fecha_transaccion);
CREATE INDEX idx_transaccion_tipo ON Transaccion(id_tipo_transaccion);
CREATE INDEX idx_transaccion_estado ON Transaccion(id_estado);

-- Índices para Estado (tabla genérica)
CREATE INDEX idx_estado_entidad ON Estado(entidad);
CREATE INDEX idx_estado_codigo ON Estado(codigo);

-- Índices para Cuota
CREATE INDEX idx_cuota_partido ON Cuota(id_partido);
CREATE INDEX idx_cuota_tipo ON Cuota(id_tipo_apuesta);

-- ============================================
-- VISTAS para facilitar consultas comunes
-- ============================================

-- Vista: Partidos con información completa
CREATE OR REPLACE VIEW vista_partidos_completos AS
SELECT 
    p.id_partido,
    d.nombre AS deporte,
    l.nombre AS liga,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    p.fecha_hora,
    e.nombre AS estadio,
    est.nombre AS estado,
    arb.nombre || ' ' || arb.apellido AS arbitro,
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
LEFT JOIN Estadio e ON p.id_estadio = e.id_estadio
LEFT JOIN Estado est ON p.id_estado = est.id_estado
LEFT JOIN Arbitro arb ON p.id_arbitro = arb.id_arbitro
LEFT JOIN Resultado r ON p.id_partido = r.id_partido;

-- Vista: Apuestas con información detallada
CREATE OR REPLACE VIEW vista_apuestas_detalladas AS
SELECT 
    a.id_apuesta,
    u.username AS apostador,
    u.nombre || ' ' || u.apellido AS nombre_completo,
    d.nombre AS deporte,
    el.nombre AS equipo_local,
    ev.nombre AS equipo_visitante,
    p.fecha_hora AS fecha_partido,
    ta.nombre AS tipo_apuesta,
    c.descripcion AS detalle_cuota,
    a.monto_apostado,
    a.cuota_aplicada,
    a.ganancia_potencial,
    a.fecha_apuesta,
    est.nombre AS estado,
    a.ganancia_real
FROM Apuesta a
JOIN Apostador ap ON a.id_apostador = ap.id_apostador
JOIN Usuario u ON ap.id_usuario = u.id_usuario
JOIN Cuota c ON a.id_cuota = c.id_cuota
JOIN TipoApuesta ta ON c.id_tipo_apuesta = ta.id_tipo_apuesta
JOIN Partido p ON c.id_partido = p.id_partido
JOIN Liga l ON p.id_liga = l.id_liga
JOIN Deporte d ON l.id_deporte = d.id_deporte
JOIN Equipo el ON p.id_equipo_local = el.id_equipo
JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo
LEFT JOIN Estado est ON a.id_estado = est.id_estado;

-- Vista: Transacciones con información detallada
CREATE OR REPLACE VIEW vista_transacciones_detalladas AS
SELECT 
    t.id_transaccion,
    t.id_apostador,
    u.username AS apostador,
    u.nombre || ' ' || u.apellido AS nombre_completo,
    tt.nombre AS tipo_transaccion,
    tt.codigo AS tipo_codigo,
    mp.nombre AS metodo_pago,
    t.monto,
    t.comision,
    t.monto_neto,
    t.fecha_transaccion,
    est.nombre AS estado,
    est.codigo AS estado_codigo,
    t.referencia,
    t.descripcion,
    a.saldo_actual AS saldo_actual_apostador
FROM Transaccion t
JOIN Apostador a ON t.id_apostador = a.id_apostador
JOIN Usuario u ON a.id_usuario = u.id_usuario
JOIN TipoTransaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
JOIN Estado est ON t.id_estado = est.id_estado
LEFT JOIN MetodoPago mp ON t.id_metodo_pago = mp.id_metodo_pago
ORDER BY t.fecha_transaccion DESC;

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función: Actualizar saldo del apostador después de transacción
CREATE OR REPLACE FUNCTION actualizar_saldo_apostador()
RETURNS TRIGGER AS $$
DECLARE
    estado_completada INTEGER;
    afecta_saldo_tipo VARCHAR(20);
BEGIN
    -- Obtener el ID del estado "completada" para transacciones
    SELECT id_estado INTO estado_completada
    FROM Estado
    WHERE entidad = 'TRANSACCION' AND codigo = 'COMPLETADA'
    LIMIT 1;
    
    -- Verificar si la transacción está completada
    IF NEW.id_estado = estado_completada THEN
        -- Obtener cómo afecta el saldo este tipo de transacción
        SELECT afecta_saldo INTO afecta_saldo_tipo
        FROM TipoTransaccion
        WHERE id_tipo_transaccion = NEW.id_tipo_transaccion;
        
        -- Actualizar saldo según el tipo
        IF afecta_saldo_tipo = 'suma' THEN
            UPDATE Apostador 
            SET saldo_actual = saldo_actual + NEW.monto_neto
            WHERE id_apostador = NEW.id_apostador;
        ELSIF afecta_saldo_tipo = 'resta' THEN
            UPDATE Apostador 
            SET saldo_actual = saldo_actual - NEW.monto_neto
            WHERE id_apostador = NEW.id_apostador;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar saldo al insertar transacción
CREATE TRIGGER trigger_actualizar_saldo
AFTER INSERT ON Transaccion
FOR EACH ROW
EXECUTE FUNCTION actualizar_saldo_apostador();

-- Función: Calcular ganancia potencial
CREATE OR REPLACE FUNCTION calcular_ganancia_potencial()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ganancia_potencial := NEW.monto_apostado * NEW.cuota_aplicada;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calcular ganancia al insertar apuesta
CREATE TRIGGER trigger_calcular_ganancia
BEFORE INSERT ON Apuesta
FOR EACH ROW
EXECUTE FUNCTION calcular_ganancia_potencial();

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE Usuario IS 'Usuarios del sistema con credenciales de acceso';
COMMENT ON TABLE Apostador IS 'Clientes registrados que realizan apuestas';
COMMENT ON TABLE Deporte IS 'Catálogo de deportes disponibles para apostar';
COMMENT ON TABLE Liga IS 'Ligas y competiciones deportivas';
COMMENT ON TABLE Equipo IS 'Equipos participantes en las competiciones';
COMMENT ON TABLE Partido IS 'Eventos deportivos programados';
COMMENT ON TABLE Resultado IS 'Resultados finales de los partidos';
COMMENT ON TABLE TipoApuesta IS 'Tipos de apuestas disponibles';
COMMENT ON TABLE Cuota IS 'Cuotas/odds ofrecidas para cada apuesta';
COMMENT ON TABLE Apuesta IS 'Apuestas realizadas por los apostadores';
COMMENT ON TABLE Transaccion IS 'Registro de todas las transacciones financieras';
COMMENT ON TABLE MetodoPago IS 'Métodos de pago y retiro disponibles';

-- ============================================
-- FIN DEL SCRIPT DE ESQUEMA
-- ============================================
