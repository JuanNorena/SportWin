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
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'operador', 'apostador')),
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
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'Pasaporte')),
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Colombia',
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
    pais VARCHAR(100),
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
    pais VARCHAR(100),
    ciudad VARCHAR(100),
    estadio VARCHAR(100),
    entrenador VARCHAR(100),
    fundacion INTEGER,
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
    estadio VARCHAR(100),
    jornada INTEGER,
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'finalizado', 'suspendido', 'cancelado')),
    arbitro VARCHAR(100),
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
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'ganada', 'perdida', 'cancelada', 'reembolsada')),
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
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('deposito', 'retiro', 'apuesta', 'ganancia', 'reembolso')),
    monto DECIMAL(15,2) NOT NULL,
    comision DECIMAL(15,2) DEFAULT 0.00,
    monto_neto DECIMAL(15,2) NOT NULL,
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('pendiente', 'completada', 'rechazada', 'cancelada')),
    referencia VARCHAR(100),
    descripcion TEXT
);

-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================

-- Índices para Usuario
CREATE INDEX idx_usuario_username ON Usuario(username);
CREATE INDEX idx_usuario_email ON Usuario(email);
CREATE INDEX idx_usuario_rol ON Usuario(rol);

-- Índices para Apostador
CREATE INDEX idx_apostador_documento ON Apostador(documento);
CREATE INDEX idx_apostador_usuario ON Apostador(id_usuario);

-- Índices para Partido
CREATE INDEX idx_partido_fecha ON Partido(fecha_hora);
CREATE INDEX idx_partido_estado ON Partido(estado);
CREATE INDEX idx_partido_liga ON Partido(id_liga);
CREATE INDEX idx_partido_equipos ON Partido(id_equipo_local, id_equipo_visitante);

-- Índices para Apuesta
CREATE INDEX idx_apuesta_apostador ON Apuesta(id_apostador);
CREATE INDEX idx_apuesta_fecha ON Apuesta(fecha_apuesta);
CREATE INDEX idx_apuesta_estado ON Apuesta(estado);

-- Índices para Transacción
CREATE INDEX idx_transaccion_apostador ON Transaccion(id_apostador);
CREATE INDEX idx_transaccion_fecha ON Transaccion(fecha_transaccion);
CREATE INDEX idx_transaccion_tipo ON Transaccion(tipo);

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
LEFT JOIN Resultado r ON p.id_partido = r.id_partido;

-- Vista: Apuestas con información detallada
-- CORRECCIÓN: Usar u.nombre y u.apellido en lugar de ap.nombre y ap.apellido
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
    a.estado,
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
JOIN Equipo ev ON p.id_equipo_visitante = ev.id_equipo;

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función: Actualizar saldo del apostador después de transacción
CREATE OR REPLACE FUNCTION actualizar_saldo_apostador()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completada' THEN
        IF NEW.tipo IN ('deposito', 'ganancia', 'reembolso') THEN
            UPDATE Apostador 
            SET saldo_actual = saldo_actual + NEW.monto_neto
            WHERE id_apostador = NEW.id_apostador;
        ELSIF NEW.tipo IN ('retiro', 'apuesta') THEN
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
