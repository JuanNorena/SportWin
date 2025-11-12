-- ============================================
-- SCRIPT DE POBLADO COMPLETO - SPORTWIN
-- Base de datos de apuestas deportivas
-- Fecha: 2024-2025
-- ============================================

-- ============================================
-- 1. CATÁLOGOS BASE (Geográficos)
-- ============================================

-- Países
INSERT INTO Pais (nombre, codigo_iso, codigo_telefono, activo) VALUES
('Colombia', 'COL', '+57', TRUE),
('Argentina', 'ARG', '+54', TRUE),
('Brasil', 'BRA', '+55', TRUE),
('España', 'ESP', '+34', TRUE),
('Inglaterra', 'GBR', '+44', TRUE),
('Estados Unidos', 'USA', '+1', TRUE),
('México', 'MEX', '+52', TRUE),
('Chile', 'CHL', '+56', TRUE),
('Uruguay', 'URY', '+598', TRUE),
('Perú', 'PER', '+51', TRUE),
('Alemania', 'DEU', '+49', TRUE),
('Francia', 'FRA', '+33', TRUE),
('Italia', 'ITA', '+39', TRUE),
('Portugal', 'POR', '+351', TRUE),
('Holanda', 'NLD', '+31', TRUE)
ON CONFLICT (codigo_iso) DO NOTHING;

-- Departamentos/Estados
INSERT INTO Departamento (id_pais, nombre, codigo, activo) VALUES
-- Colombia
(1, 'Antioquia', 'ANT', TRUE),
(1, 'Cundinamarca', 'CUN', TRUE),
(1, 'Valle del Cauca', 'VAC', TRUE),
(1, 'Atlántico', 'ATL', TRUE),
(1, 'Bolívar', 'BOL', TRUE),
(1, 'Santander', 'SAN', TRUE),
-- Argentina
(2, 'Buenos Aires', 'BA', TRUE),
(2, 'Córdoba', 'CB', TRUE),
(2, 'Santa Fe', 'SF', TRUE),
-- España
(4, 'Madrid', 'MAD', TRUE),
(4, 'Cataluña', 'CAT', TRUE),
(4, 'Andalucía', 'AND', TRUE),
(4, 'País Vasco', 'PV', TRUE),
-- Inglaterra
(5, 'Greater London', 'GL', TRUE),
(5, 'Greater Manchester', 'GM', TRUE),
(5, 'Merseyside', 'MS', TRUE),
-- Estados Unidos
(6, 'California', 'CA', TRUE),
(6, 'New York', 'NY', TRUE),
(6, 'Florida', 'FL', TRUE),
(6, 'Texas', 'TX', TRUE),
(6, 'Massachusetts', 'MA', TRUE)
ON CONFLICT (id_pais, nombre) DO NOTHING;

-- Ciudades
INSERT INTO Ciudad (id_departamento, nombre, codigo_postal, activo) VALUES
-- Colombia
(1, 'Medellín', '050001', TRUE),
(1, 'Envigado', '055040', TRUE),
(2, 'Bogotá', '110111', TRUE),
(2, 'Soacha', '250001', TRUE),
(3, 'Cali', '760001', TRUE),
(3, 'Palmira', '763001', TRUE),
(4, 'Barranquilla', '080001', TRUE),
(5, 'Cartagena', '130001', TRUE),
(6, 'Bucaramanga', '680001', TRUE),
-- Argentina
(7, 'Buenos Aires', 'C1000', TRUE),
(7, 'La Plata', 'B1900', TRUE),
(8, 'Córdoba', 'X5000', TRUE),
(9, 'Rosario', 'S2000', TRUE),
-- España
(10, 'Madrid', '28001', TRUE),
(11, 'Barcelona', '08001', TRUE),
(12, 'Sevilla', '41001', TRUE),
(12, 'Málaga', '29001', TRUE),
(13, 'Bilbao', '48001', TRUE),
-- Inglaterra
(14, 'Londres', 'SW1A', TRUE),
(15, 'Manchester', 'M1', TRUE),
(16, 'Liverpool', 'L1', TRUE),
-- Estados Unidos
(17, 'Los Angeles', '90001', TRUE),
(17, 'San Francisco', '94102', TRUE),
(18, 'Nueva York', '10001', TRUE),
(19, 'Miami', '33101', TRUE),
(20, 'Dallas', '75201', TRUE),
(21, 'Boston', '02101', TRUE)
ON CONFLICT (id_departamento, nombre) DO NOTHING;

-- ============================================
-- 2. CATÁLOGOS DE SISTEMA
-- ============================================

-- Estados
INSERT INTO Estado (entidad, nombre, codigo, descripcion, activo) VALUES
-- Estados de Partido
('PARTIDO', 'Programado', 'PROGRAMADO', 'Partido aún no iniciado', TRUE),
('PARTIDO', 'En Curso', 'EN_CURSO', 'Partido en desarrollo', TRUE),
('PARTIDO', 'Finalizado', 'FINALIZADO', 'Partido terminado', TRUE),
('PARTIDO', 'Suspendido', 'SUSPENDIDO', 'Partido suspendido temporalmente', TRUE),
('PARTIDO', 'Cancelado', 'CANCELADO', 'Partido cancelado', TRUE),
('PARTIDO', 'Pospuesto', 'POSPUESTO', 'Partido pospuesto', TRUE),
-- Estados de Apuesta
('APUESTA', 'Pendiente', 'PENDIENTE', 'Apuesta en espera de resultado', TRUE),
('APUESTA', 'Ganada', 'GANADA', 'Apuesta ganadora', TRUE),
('APUESTA', 'Perdida', 'PERDIDA', 'Apuesta perdedora', TRUE),
('APUESTA', 'Cancelada', 'CANCELADA', 'Apuesta cancelada', TRUE),
('APUESTA', 'Reembolsada', 'REEMBOLSADA', 'Apuesta reembolsada', TRUE),
-- Estados de Transacción
('TRANSACCION', 'Pendiente', 'PENDIENTE', 'Transacción en proceso', TRUE),
('TRANSACCION', 'Completada', 'COMPLETADA', 'Transacción exitosa', TRUE),
('TRANSACCION', 'Rechazada', 'RECHAZADA', 'Transacción rechazada', TRUE),
('TRANSACCION', 'Cancelada', 'CANCELADA', 'Transacción cancelada', TRUE),
('TRANSACCION', 'En Revisión', 'EN_REVISION', 'Transacción bajo revisión', TRUE)
ON CONFLICT (entidad, codigo) DO NOTHING;

-- Roles
INSERT INTO Rol (nombre, descripcion, permisos, activo) VALUES
('admin', 'Administrador del sistema', 'all', TRUE),
('operador', 'Operador de apuestas', 'read, create, update', TRUE),
('apostador', 'Cliente apostador', 'read, create', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de Documento
INSERT INTO TipoDocumento (nombre, codigo, descripcion, activo) VALUES
('Cédula de Ciudadanía', 'CC', 'Documento de identidad colombiano', TRUE),
('Cédula de Extranjería', 'CE', 'Documento para extranjeros en Colombia', TRUE),
('Tarjeta de Identidad', 'TI', 'Documento para menores de edad', TRUE),
('Pasaporte', 'PA', 'Documento internacional', TRUE),
('DNI', 'DNI', 'Documento Nacional de Identidad', TRUE),
('NIE', 'NIE', 'Número de Identidad de Extranjero (España)', TRUE),
('SSN', 'SSN', 'Social Security Number (USA)', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Tipos de Transacción
INSERT INTO TipoTransaccion (nombre, codigo, descripcion, afecta_saldo, activo) VALUES
('Depósito', 'DEPOSITO', 'Ingreso de dinero a la cuenta', 'suma', TRUE),
('Retiro', 'RETIRO', 'Retiro de dinero de la cuenta', 'resta', TRUE),
('Apuesta', 'APUESTA', 'Pago por realizar una apuesta', 'resta', TRUE),
('Ganancia', 'GANANCIA', 'Ganancia de una apuesta', 'suma', TRUE),
('Reembolso', 'REEMBOLSO', 'Devolución de dinero', 'suma', TRUE),
('Comisión', 'COMISION', 'Cobro de comisión', 'resta', TRUE),
('Bono', 'BONO', 'Bono promocional', 'suma', TRUE),
('Ajuste', 'AJUSTE', 'Ajuste manual de saldo', 'neutro', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Métodos de Pago
INSERT INTO MetodoPago (nombre, descripcion, comision, activo) VALUES
('Tarjeta de Crédito', 'Visa, Mastercard, American Express', 2.50, TRUE),
('Tarjeta de Débito', 'Débito bancario', 1.50, TRUE),
('Transferencia Bancaria', 'Transferencia desde cuenta bancaria', 0.00, TRUE),
('PSE', 'Pagos Seguros en Línea', 1.00, TRUE),
('Efectivo', 'Pago en puntos físicos', 0.00, TRUE),
('Billetera Digital', 'Nequi, Daviplata, etc.', 0.50, TRUE),
('Criptomonedas', 'Bitcoin, Ethereum, USDT', 1.00, TRUE),
('PayPal', 'Plataforma de pagos internacional', 3.00, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. DEPORTES Y COMPETICIONES
-- ============================================

-- Deportes
INSERT INTO Deporte (nombre, descripcion, icono, activo) VALUES
('Fútbol', 'Deporte rey con millones de seguidores', '⚽', TRUE),
('Baloncesto', 'Deporte de canasta con gran popularidad', '🏀', TRUE),
('Tenis', 'Deporte individual o de parejas', '🎾', TRUE),
('Béisbol', 'Deporte popular en América', '⚾', TRUE),
('Fútbol Americano', 'Deporte de contacto muy popular en USA', '🏈', TRUE),
('Volleyball', 'Deporte de equipo con balón', '🏐', TRUE),
('Hockey sobre Hielo', 'Deporte de contacto sobre hielo', '🏒', TRUE),
('Rugby', 'Deporte de contacto con balón ovalado', '🏉', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Ligas
INSERT INTO Liga (id_deporte, nombre, id_pais, temporada, fecha_inicio, fecha_fin, activo) VALUES
-- Fútbol
(1, 'Liga BetPlay', 1, '2024', '2024-01-15', '2024-12-15', TRUE),
(1, 'Premier League', 5, '2024-2025', '2024-08-10', '2025-05-25', TRUE),
(1, 'La Liga', 4, '2024-2025', '2024-08-15', '2025-05-30', TRUE),
(1, 'Serie A', 13, '2024-2025', '2024-08-17', '2025-05-25', TRUE),
(1, 'Bundesliga', 11, '2024-2025', '2024-08-23', '2025-05-17', TRUE),
(1, 'Ligue 1', 12, '2024-2025', '2024-08-16', '2025-05-18', TRUE),
(1, 'Copa Libertadores', 1, '2024', '2024-02-01', '2024-11-30', TRUE),
(1, 'Champions League', 4, '2024-2025', '2024-09-17', '2025-05-31', TRUE),
(1, 'Liga MX', 7, '2024', '2024-01-05', '2024-12-15', TRUE),
-- Baloncesto
(2, 'NBA', 6, '2024-2025', '2024-10-22', '2025-06-15', TRUE),
(2, 'EuroLeague', 4, '2024-2025', '2024-10-03', '2025-05-25', TRUE),
-- Tenis
(3, 'ATP Tour', 1, '2024', '2024-01-01', '2024-12-31', TRUE),
(3, 'WTA Tour', 1, '2024', '2024-01-01', '2024-12-31', TRUE),
-- Béisbol
(4, 'MLB', 6, '2024', '2024-03-28', '2024-10-30', TRUE),
-- Fútbol Americano
(5, 'NFL', 6, '2024-2025', '2024-09-05', '2025-02-09', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. INFRAESTRUCTURA DEPORTIVA
-- ============================================

-- Estadios
INSERT INTO Estadio (nombre, id_ciudad, direccion, capacidad, año_construccion, tipo_cesped, techado, activo) VALUES
-- Colombia
('Estadio Atanasio Girardot', 1, 'Carrera 70 #49-90', 40943, 1953, 'Natural', FALSE, TRUE),
('Estadio El Campín', 3, 'Avenida NQS #57-00', 36343, 1938, 'Natural', FALSE, TRUE),
('Estadio Pascual Guerrero', 5, 'Calle 5 #34-01', 35405, 1937, 'Natural', FALSE, TRUE),
('Estadio Metropolitano Roberto Meléndez', 7, 'Calle 72 #46-30', 46788, 1986, 'Natural', FALSE, TRUE),
-- Argentina
('Estadio Monumental', 10, 'Av. Figueroa Alcorta 7597', 83214, 1938, 'Híbrido', FALSE, TRUE),
('La Bombonera', 10, 'Brandsen 805', 49000, 1940, 'Natural', FALSE, TRUE),
-- España
('Santiago Bernabéu', 14, 'Av. de Concha Espina 1', 81044, 1947, 'Híbrido', TRUE, TRUE),
('Camp Nou', 15, 'C. dAristides Maillol', 99354, 1957, 'Natural', FALSE, TRUE),
('Wanda Metropolitano', 14, 'Av. de Luis Aragonés', 68456, 2017, 'Híbrido', FALSE, TRUE),
('Ramón Sánchez-Pizjuán', 16, 'Calle Sevilla FC', 43883, 1958, 'Natural', FALSE, TRUE),
-- Inglaterra
('Old Trafford', 20, 'Sir Matt Busby Way', 74310, 1910, 'Híbrido', FALSE, TRUE),
('Anfield', 21, 'Anfield Road', 53394, 1884, 'Híbrido', FALSE, TRUE),
('Emirates Stadium', 19, 'Hornsey Road', 60260, 2006, 'Híbrido', FALSE, TRUE),
('Etihad Stadium', 20, 'Ashton New Road', 53400, 2002, 'Híbrido', FALSE, TRUE),
('Stamford Bridge', 19, 'Fulham Road', 40341, 1877, 'Híbrido', FALSE, TRUE),
-- Estados Unidos
('SoFi Stadium', 22, '1001 Stadium Dr', 70240, 2020, 'Artificial', TRUE, TRUE),
('MetLife Stadium', 24, '1 MetLife Stadium Dr', 82500, 2010, 'Artificial', FALSE, TRUE),
('AT&T Stadium', 26, 'One AT&T Way', 80000, 2009, 'Artificial', TRUE, TRUE),
('Mercedes-Benz Stadium', 14, '1 AMB Dr NW', 71000, 2017, 'Artificial', TRUE, TRUE),
('Yankee Stadium', 24, '1 E 161st St', 46537, 2009, 'Natural', FALSE, TRUE),
('TD Garden', 27, '100 Legends Way', 19156, 1995, 'Parquet', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Árbitros
INSERT INTO Arbitro (nombre, apellido, id_pais, fecha_nacimiento, categoria, años_experiencia, activo) VALUES
-- Internacionales
('Pierluigi', 'Collina', 13, '1960-02-13', 'FIFA Elite', 25, TRUE),
('Howard', 'Webb', 5, '1971-07-14', 'FIFA Elite', 20, TRUE),
('Néstor', 'Pitana', 2, '1975-06-17', 'FIFA Elite', 18, TRUE),
('Wilmar', 'Roldán', 1, '1980-01-24', 'FIFA', 15, TRUE),
('Antonio', 'Mateu Lahoz', 4, '1977-03-12', 'FIFA Elite', 19, TRUE),
('Björn', 'Kuipers', 15, '1973-03-28', 'FIFA Elite', 22, TRUE),
('Clément', 'Turpin', 12, '1982-05-16', 'FIFA', 14, TRUE),
('Michael', 'Oliver', 5, '1985-02-20', 'FIFA', 12, TRUE),
('Daniele', 'Orsato', 13, '1975-11-23', 'FIFA Elite', 17, TRUE),
('Felix', 'Brych', 11, '1975-08-03', 'FIFA Elite', 19, TRUE),
-- Colombianos
('Carlos', 'Ortega', 1, '1985-05-15', 'Nacional A', 10, TRUE),
('Nicolás', 'Gallo', 1, '1988-09-22', 'Nacional A', 8, TRUE),
('Wander', 'Mosquera', 1, '1982-11-30', 'Nacional A', 12, TRUE),
('Bismarks', 'Santiago', 1, '1986-07-18', 'Nacional B', 9, TRUE),
('Luis', 'Sánchez', 1, '1990-03-25', 'Nacional B', 6, TRUE)
ON CONFLICT DO NOTHING;

-- Entrenadores
INSERT INTO Entrenador (nombre, apellido, id_pais, fecha_nacimiento, licencia, experiencia_años, activo) VALUES
-- Entrenadores famosos
('Pep', 'Guardiola', 4, '1971-01-18', 'UEFA Pro', 18, TRUE),
('Carlo', 'Ancelotti', 13, '1959-06-10', 'UEFA Pro', 28, TRUE),
('Jürgen', 'Klopp', 11, '1967-06-16', 'UEFA Pro', 24, TRUE),
('Diego', 'Simeone', 2, '1970-04-28', 'UEFA Pro', 15, TRUE),
('Xavi', 'Hernández', 4, '1980-01-25', 'UEFA Pro', 5, TRUE),
('José', 'Mourinho', 14, '1963-01-26', 'UEFA Pro', 25, TRUE),
('Mauricio', 'Pochettino', 2, '1972-03-02', 'UEFA Pro', 14, TRUE),
('Luis', 'Enrique', 4, '1970-05-08', 'UEFA Pro', 13, TRUE),
('Antonio', 'Conte', 13, '1969-07-31', 'UEFA Pro', 12, TRUE),
('Zinedine', 'Zidane', 12, '1972-06-23', 'UEFA Pro', 8, TRUE),
-- Entrenadores colombianos
('Néstor', 'Lorenzo', 2, '1966-02-28', 'CONMEBOL Pro', 10, TRUE),
('Hernán', 'Torres', 1, '1966-03-23', 'CONMEBOL Pro', 15, TRUE),
('Alberto', 'Gamero', 1, '1968-11-11', 'CONMEBOL Pro', 12, TRUE),
('Alexandre', 'Guimarães', 3, '1959-03-13', 'CONMEBOL Pro', 20, TRUE),
('Arturo', 'Reyes', 1, '1968-09-19', 'CONMEBOL Pro', 11, TRUE),
('Jorge', 'Almirón', 2, '1971-06-19', 'CONMEBOL Pro', 9, TRUE),
-- Baloncesto
('Gregg', 'Popovich', 6, '1949-01-28', 'NBA Head Coach', 28, TRUE),
('Erik', 'Spoelstra', 6, '1970-11-01', 'NBA Head Coach', 16, TRUE),
('Steve', 'Kerr', 6, '1965-09-27', 'NBA Head Coach', 10, TRUE),
('Tyronn', 'Lue', 6, '1977-05-03', 'NBA Head Coach', 8, TRUE),
-- Béisbol
('Dave', 'Roberts', 6, '1972-05-31', 'MLB Manager', 9, TRUE),
('Aaron', 'Boone', 6, '1973-03-09', 'MLB Manager', 7, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. EQUIPOS
-- ============================================

INSERT INTO Equipo (id_liga, nombre, id_pais, id_ciudad, id_estadio, id_entrenador, fundacion, activo) VALUES
-- Liga BetPlay (Colombia)
(1, 'Atlético Nacional', 1, 1, 1, 12, 1947, TRUE),
(1, 'Millonarios FC', 1, 3, 2, 13, 1946, TRUE),
(1, 'América de Cali', 1, 5, 3, 14, 1927, TRUE),
(1, 'Junior de Barranquilla', 1, 7, 4, 15, 1924, TRUE),
(1, 'Deportivo Cali', 1, 5, 3, 16, 1912, TRUE),
-- Premier League (Inglaterra)
(2, 'Manchester United', 5, 20, 11, 7, 1878, TRUE),
(2, 'Liverpool FC', 5, 21, 12, 3, 1892, TRUE),
(2, 'Manchester City', 5, 20, 14, 1, 1880, TRUE),
(2, 'Arsenal FC', 5, 19, 13, 9, 1886, TRUE),
(2, 'Chelsea FC', 5, 19, 15, 6, 1905, TRUE),
-- La Liga (España)
(3, 'Real Madrid', 4, 14, 7, 2, 1902, TRUE),
(3, 'FC Barcelona', 4, 15, 8, 5, 1899, TRUE),
(3, 'Atlético Madrid', 4, 14, 9, 4, 1903, TRUE),
(3, 'Sevilla FC', 4, 16, 10, 8, 1905, TRUE),
-- Copa Libertadores
(7, 'Boca Juniors', 2, 10, 6, 11, 1905, TRUE),
(7, 'River Plate', 2, 10, 5, 10, 1901, TRUE),
-- NBA
(10, 'Los Angeles Lakers', 6, 22, NULL, 17, 1947, TRUE),
(10, 'Boston Celtics', 6, 27, 21, 19, 1946, TRUE),
(10, 'Golden State Warriors', 6, 23, NULL, 19, 1946, TRUE),
(10, 'Miami Heat', 6, 25, NULL, 18, 1988, TRUE),
-- NFL
(15, 'Los Angeles Rams', 6, 22, 16, NULL, 1936, TRUE),
(15, 'New York Giants', 6, 24, 17, NULL, 1925, TRUE),
(15, 'Dallas Cowboys', 6, 26, 18, NULL, 1960, TRUE),
-- MLB
(14, 'New York Yankees', 6, 24, 20, 22, 1901, TRUE),
(14, 'Los Angeles Dodgers', 6, 22, NULL, 21, 1883, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. TIPOS DE APUESTA
-- ============================================

INSERT INTO TipoApuesta (nombre, descripcion, categoria, activo) VALUES
('Ganador del Partido', 'Apuesta sobre qué equipo ganará el partido', 'resultado', TRUE),
('Empate', 'Apuesta a que el partido terminará empatado', 'resultado', TRUE),
('Marcador Exacto', 'Apuesta al marcador exacto del partido', 'marcador', TRUE),
('Más/Menos Goles', 'Apuesta sobre si habrá más o menos goles que la línea establecida', 'estadistica', TRUE),
('Ambos Equipos Anotan', 'Apuesta a que ambos equipos marquen gol', 'estadistica', TRUE),
('Goleador del Partido', 'Apuesta sobre qué jugador marcará gol', 'jugador', TRUE),
('Tarjetas Amarillas', 'Apuesta sobre el número de tarjetas amarillas', 'estadistica', TRUE),
('Corners', 'Apuesta sobre el número de tiros de esquina', 'estadistica', TRUE),
('Primer Tiempo/Final', 'Apuesta combinada del resultado al medio tiempo y final', 'resultado', TRUE),
('Handicap', 'Apuesta con ventaja/desventaja para un equipo', 'resultado', TRUE),
('Doble Oportunidad', 'Apuesta que cubre dos de tres resultados posibles', 'resultado', TRUE),
('Próximo Gol', 'Apuesta sobre qué equipo marcará el próximo gol', 'marcador', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 7. USUARIOS Y APOSTADORES
-- ============================================

-- Usuarios del sistema (contraseña: password123)
INSERT INTO Usuario (username, password_hash, nombre, apellido, email, id_rol, activo) VALUES
-- Administradores
('admin', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Carlos', 'Administrador', 'admin@sportwin.com', 1, TRUE),
-- Operadores
('operador_uno', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'María', 'Operadora', 'maria.operadora@sportwin.com', 2, TRUE),
('operador_dos', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Juan', 'Supervisor', 'juan.supervisor@sportwin.com', 2, TRUE),
-- Apostadores
('usuario_uno', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Pedro', 'García', 'pedro.garcia@email.com', 3, TRUE),
('usuario_dos', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Ana', 'Martínez', 'ana.martinez@email.com', 3, TRUE),
('jlopez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Jorge', 'López', 'jorge.lopez@email.com', 3, TRUE),
('mrodriguez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'María', 'Rodríguez', 'maria.rodriguez@email.com', 3, TRUE),
('cperez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Carlos', 'Pérez', 'carlos.perez@email.com', 3, TRUE),
('lgomez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Laura', 'Gómez', 'laura.gomez@email.com', 3, TRUE),
('dhernandez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'David', 'Hernández', 'david.hernandez@email.com', 3, TRUE),
('sramirez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Sandra', 'Ramírez', 'sandra.ramirez@email.com', 3, TRUE),
('rmoreno', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Roberto', 'Moreno', 'roberto.moreno@email.com', 3, TRUE),
('pcastro', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Patricia', 'Castro', 'patricia.castro@email.com', 3, TRUE),
('fjimenez', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Fernando', 'Jiménez', 'fernando.jimenez@email.com', 3, TRUE),
('atorre', '$2b$10$rqQZ9J6QZ9J6QZ9J6QZ9J.', 'Andrea', 'Torres', 'andrea.torres@email.com', 3, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Apostadores (información adicional)
INSERT INTO Apostador (id_usuario, documento, id_tipo_documento, telefono, direccion, id_ciudad, fecha_nacimiento, saldo_actual, verificado) VALUES
-- Apostador vinculado a usuario_uno
(4, '1234567890', 1, '3001234567', 'Calle 10 #20-30', 1, '1990-05-15', 500000.00, TRUE),
(5, '9876543210', 1, '3009876543', 'Carrera 7 #45-60', 3, '1985-08-22', 750000.00, TRUE),
(6, '1122334455', 1, '3101122334', 'Avenida 6 #12-34', 5, '1992-11-30', 250000.00, TRUE),
(7, '5566778899', 1, '3155566778', 'Calle 50 #23-45', 1, '1988-03-18', 1000000.00, TRUE),
(8, '9988776655', 1, '3209988776', 'Carrera 15 #78-90', 3, '1995-07-25', 150000.00, TRUE),
(9, '4433221100', 1, '3114433221', 'Diagonal 40 #56-78', 7, '1991-12-10', 600000.00, TRUE),
(10, '7788990011', 1, '3167788990', 'Transversal 25 #34-56', 5, '1987-09-05', 800000.00, TRUE),
(11, '6655443322', 1, '3216655443', 'Circular 3 #89-01', 1, '1993-04-20', 300000.00, TRUE),
(12, '3344556677', 1, '3013344556', 'Calle 72 #45-67', 3, '1989-06-14', 450000.00, TRUE),
(13, '2211009988', 1, '3152211009', 'Carrera 30 #12-23', 7, '1994-01-28', 900000.00, TRUE),
(14, '8877665544', 1, '3208877665', 'Avenida 19 #56-78', 5, '1986-10-08', 350000.00, TRUE),
(15, '5544332211', 1, '3115544332', 'Calle 100 #23-45', 1, '1996-02-15', 550000.00, TRUE)
ON CONFLICT (documento) DO NOTHING;

-- ============================================
-- 8. PARTIDOS Y CUOTAS
-- ============================================

-- Partidos Pasados (Finalizados - para testing de apuestas ganadas/perdidas)
INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, id_estadio, jornada, id_estado, id_arbitro, asistencia) VALUES
-- Liga BetPlay - Partidos pasados
(1, 1, 2, '2024-10-15 20:00:00', 1, 18, 3, 4, 38500),
(1, 3, 4, '2024-10-20 18:00:00', 3, 18, 3, 11, 25000),
(1, 5, 1, '2024-10-25 16:00:00', 3, 19, 3, 12, 28000),
-- Premier League - Partidos pasados
(2, 6, 7, '2024-10-27 15:00:00', 11, 10, 3, 2, 74000),
(2, 8, 9, '2024-11-02 17:30:00', 14, 11, 3, 8, 52000),
-- La Liga - Partidos pasados
(3, 11, 12, '2024-10-26 21:00:00', 7, 11, 3, 5, 78000),
(3, 13, 14, '2024-11-01 19:00:00', 9, 12, 3, 9, 62000);

-- Resultados de partidos pasados
INSERT INTO Resultado (id_partido, goles_local, goles_visitante, tarjetas_amarillas_local, tarjetas_amarillas_visitante, tarjetas_rojas_local, tarjetas_rojas_visitante, corners_local, corners_visitante) VALUES
(1, 2, 1, 3, 2, 0, 1, 6, 4),
(2, 1, 1, 2, 3, 0, 0, 5, 7),
(3, 3, 0, 1, 4, 0, 0, 8, 3),
(4, 2, 2, 2, 2, 0, 0, 7, 6),
(5, 1, 0, 3, 1, 1, 0, 4, 5),
(6, 3, 2, 4, 3, 0, 0, 9, 5),
(7, 0, 1, 2, 1, 0, 0, 6, 4)
ON CONFLICT (id_partido) DO NOTHING;

-- Partidos Próximos (Programados - para realizar nuevas apuestas)
INSERT INTO Partido (id_liga, id_equipo_local, id_equipo_visitante, fecha_hora, id_estadio, jornada, id_estado, id_arbitro) VALUES
-- Liga BetPlay - Próximos partidos
(1, 2, 3, '2024-11-15 20:00:00', 2, 20, 1, 4),
(1, 4, 5, '2024-11-16 18:00:00', 4, 20, 1, 11),
(1, 1, 3, '2024-11-17 16:00:00', 1, 20, 1, 12),
(1, 2, 4, '2024-11-22 19:00:00', 2, 21, 1, 13),
-- Premier League - Próximos partidos
(2, 7, 8, '2024-11-16 15:00:00', 12, 12, 1, 2),
(2, 9, 10, '2024-11-17 17:30:00', 13, 12, 1, 8),
(2, 6, 8, '2024-11-23 12:30:00', 11, 13, 1, 2),
(2, 10, 7, '2024-11-24 15:00:00', 15, 13, 1, 8),
-- La Liga - Próximos partidos
(3, 12, 13, '2024-11-16 21:00:00', 8, 13, 1, 5),
(3, 14, 11, '2024-11-17 19:00:00', 10, 13, 1, 9),
(3, 11, 13, '2024-11-24 16:00:00', 7, 14, 1, 5),
-- Copa Libertadores
(7, 15, 16, '2024-11-20 21:30:00', 6, 1, 1, 3),
-- NBA - Próximos partidos
(10, 17, 18, '2024-11-15 22:00:00', NULL, 15, 1, NULL),
(10, 19, 20, '2024-11-16 20:30:00', NULL, 15, 1, NULL),
-- NFL - Próximos partidos
(15, 21, 22, '2024-11-17 13:00:00', 16, 11, 1, NULL),
(15, 23, 21, '2024-11-24 16:25:00', 18, 12, 1, NULL)
ON CONFLICT DO NOTHING;

-- Cuotas para partidos pasados (Partido 1: Atlético Nacional 2-1 Millonarios)
INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo) VALUES
-- Partido 1 (ya finalizado)
(1, 1, 'Victoria Atlético Nacional', 2.10, 'LOCAL', FALSE),
(1, 2, 'Empate', 3.20, 'EMPATE', FALSE),
(1, 1, 'Victoria Millonarios', 3.50, 'VISITANTE', FALSE),

-- Partido 2 (ya finalizado: América 1-1 Junior)
(2, 1, 'Victoria América de Cali', 2.30, 'LOCAL', FALSE),
(2, 2, 'Empate', 3.10, 'EMPATE', FALSE),
(2, 1, 'Victoria Junior', 3.20, 'VISITANTE', FALSE),

-- Partido 3 (ya finalizado: Deportivo Cali 3-0 Atlético Nacional)
(3, 1, 'Victoria Deportivo Cali', 2.80, 'LOCAL', FALSE),
(3, 2, 'Empate', 3.00, 'EMPATE', FALSE),
(3, 1, 'Victoria Atlético Nacional', 2.60, 'VISITANTE', FALSE);

-- Cuotas para partidos próximos
-- Partido 8: Millonarios vs América (Nov 15)
INSERT INTO Cuota (id_partido, id_tipo_apuesta, descripcion, valor_cuota, resultado_esperado, activo) VALUES
(8, 1, 'Victoria Millonarios FC', 1.85, 'LOCAL', TRUE),
(8, 2, 'Empate', 3.40, 'EMPATE', TRUE),
(8, 1, 'Victoria América de Cali', 4.20, 'VISITANTE', TRUE),
(8, 4, 'Más de 2.5 goles', 2.00, 'MAS_2.5', TRUE),
(8, 4, 'Menos de 2.5 goles', 1.75, 'MENOS_2.5', TRUE),
(8, 5, 'Ambos equipos anotan - Sí', 1.90, 'SI', TRUE),
(8, 5, 'Ambos equipos anotan - No', 1.85, 'NO', TRUE),

-- Partido 9: Junior vs Deportivo Cali (Nov 16)
(9, 1, 'Victoria Junior', 2.20, 'LOCAL', TRUE),
(9, 2, 'Empate', 3.20, 'EMPATE', TRUE),
(9, 1, 'Victoria Deportivo Cali', 3.30, 'VISITANTE', TRUE),
(9, 4, 'Más de 2.5 goles', 2.10, 'MAS_2.5', TRUE),
(9, 4, 'Menos de 2.5 goles', 1.70, 'MENOS_2.5', TRUE),

-- Partido 10: Atlético Nacional vs América (Nov 17)
(10, 1, 'Victoria Atlético Nacional', 1.65, 'LOCAL', TRUE),
(10, 2, 'Empate', 3.60, 'EMPATE', TRUE),
(10, 1, 'Victoria América', 5.50, 'VISITANTE', TRUE),
(10, 4, 'Más de 2.5 goles', 1.95, 'MAS_2.5', TRUE),
(10, 4, 'Menos de 2.5 goles', 1.80, 'MENOS_2.5', TRUE),

-- Partido 12: Liverpool vs Manchester City (Nov 16)
(12, 1, 'Victoria Liverpool FC', 2.40, 'LOCAL', TRUE),
(12, 2, 'Empate', 3.50, 'EMPATE', TRUE),
(12, 1, 'Victoria Manchester City', 2.80, 'VISITANTE', TRUE),
(12, 4, 'Más de 3.5 goles', 2.50, 'MAS_3.5', TRUE),
(12, 4, 'Menos de 3.5 goles', 1.50, 'MENOS_3.5', TRUE),
(12, 5, 'Ambos equipos anotan - Sí', 1.60, 'SI', TRUE),

-- Partido 13: Arsenal vs Chelsea (Nov 17)
(13, 1, 'Victoria Arsenal FC', 2.10, 'LOCAL', TRUE),
(13, 2, 'Empate', 3.30, 'EMPATE', TRUE),
(13, 1, 'Victoria Chelsea FC', 3.40, 'VISITANTE', TRUE),
(13, 4, 'Más de 2.5 goles', 1.85, 'MAS_2.5', TRUE),
(13, 4, 'Menos de 2.5 goles', 1.90, 'MENOS_2.5', TRUE),

-- Partido 16: FC Barcelona vs Atlético Madrid (Nov 16)
(16, 1, 'Victoria FC Barcelona', 1.70, 'LOCAL', TRUE),
(16, 2, 'Empate', 3.80, 'EMPATE', TRUE),
(16, 1, 'Victoria Atlético Madrid', 4.50, 'VISITANTE', TRUE),
(16, 4, 'Más de 2.5 goles', 1.75, 'MAS_2.5', TRUE),
(16, 4, 'Menos de 2.5 goles', 2.00, 'MENOS_2.5', TRUE),

-- Partido 17: Sevilla vs Real Madrid (Nov 17)
(17, 1, 'Victoria Sevilla FC', 5.00, 'LOCAL', TRUE),
(17, 2, 'Empate', 3.90, 'EMPATE', TRUE),
(17, 1, 'Victoria Real Madrid', 1.60, 'VISITANTE', TRUE),
(17, 4, 'Más de 3.5 goles', 2.20, 'MAS_3.5', TRUE),
(17, 4, 'Menos de 3.5 goles', 1.65, 'MENOS_3.5', TRUE),

-- Partido 19: Boca Juniors vs River Plate (Nov 20)
(19, 1, 'Victoria Boca Juniors', 2.50, 'LOCAL', TRUE),
(19, 2, 'Empate', 3.00, 'EMPATE', TRUE),
(19, 1, 'Victoria River Plate', 2.90, 'VISITANTE', TRUE),
(19, 4, 'Más de 2.5 goles', 2.30, 'MAS_2.5', TRUE),
(19, 4, 'Menos de 2.5 goles', 1.60, 'MENOS_2.5', TRUE),
(19, 5, 'Ambos equipos anotan - Sí', 1.95, 'SI', TRUE),

-- Partido 20: Lakers vs Celtics (Nov 15 - NBA)
(20, 1, 'Victoria LA Lakers', 1.95, 'LOCAL', TRUE),
(20, 1, 'Victoria Boston Celtics', 1.85, 'VISITANTE', TRUE),
(20, 4, 'Más de 220.5 puntos', 1.90, 'MAS_220.5', TRUE),
(20, 4, 'Menos de 220.5 puntos', 1.90, 'MENOS_220.5', TRUE),

-- Partido 22: LA Rams vs NY Giants (Nov 17 - NFL)
(22, 1, 'Victoria LA Rams', 1.55, 'LOCAL', TRUE),
(22, 1, 'Victoria NY Giants', 2.45, 'VISITANTE', TRUE),
(22, 4, 'Más de 45.5 puntos', 1.85, 'MAS_45.5', TRUE),
(22, 4, 'Menos de 45.5 puntos', 1.95, 'MENOS_45.5', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. APUESTAS Y TRANSACCIONES (Historial)
-- ============================================

-- Apuestas sobre partidos pasados
INSERT INTO Apuesta (id_apostador, id_cuota, monto_apostado, cuota_aplicada, fecha_apuesta, id_estado, fecha_resolucion, ganancia_real) VALUES
-- Apuestas GANADAS
(1, 1, 50000, 2.10, '2024-10-14 18:00:00', 8, '2024-10-15 22:00:00', 105000),  -- Ganó: Atlético Nacional
(2, 5, 75000, 3.10, '2024-10-19 16:00:00', 8, '2024-10-20 20:00:00', 232500),  -- Ganó: Empate América-Junior
(3, 7, 30000, 2.80, '2024-10-24 14:00:00', 8, '2024-10-25 18:00:00', 84000),   -- Ganó: Deportivo Cali

-- Apuestas PERDIDAS
(4, 3, 100000, 3.50, '2024-10-14 19:00:00', 9, '2024-10-15 22:00:00', 0),      -- Perdió: Apostó Millonarios
(5, 4, 60000, 2.30, '2024-10-19 17:00:00', 9, '2024-10-20 20:00:00', 0),       -- Perdió: Apostó América
(6, 9, 40000, 2.60, '2024-10-24 15:00:00', 9, '2024-10-25 18:00:00', 0),       -- Perdió: Apostó Atlético Nacional

-- Apuestas PENDIENTES (sobre partidos próximos)
(1, 10, 80000, 1.85, '2024-11-12 10:00:00', 7, NULL, 0),    -- Millonarios vs América
(2, 16, 120000, 2.20, '2024-11-12 11:30:00', 7, NULL, 0),   -- Junior vs Deportivo Cali
(3, 22, 50000, 1.65, '2024-11-12 12:00:00', 7, NULL, 0),    -- Atlético Nacional vs América
(4, 28, 90000, 2.40, '2024-11-13 09:00:00', 7, NULL, 0),    -- Liverpool vs Man City
(5, 34, 70000, 2.10, '2024-11-13 10:00:00', 7, NULL, 0),    -- Arsenal vs Chelsea
(6, 40, 110000, 1.70, '2024-11-14 08:00:00', 7, NULL, 0),   -- Barcelona vs Atlético
(7, 52, 95000, 2.50, '2024-11-14 11:00:00', 7, NULL, 0),    -- Boca vs River
(8, 57, 85000, 1.95, '2024-11-14 13:00:00', 7, NULL, 0)     -- Lakers vs Celtics
ON CONFLICT DO NOTHING;

-- Transacciones - Depósitos
INSERT INTO Transaccion (id_apostador, id_metodo_pago, id_tipo_transaccion, monto, comision, monto_neto, fecha_transaccion, id_estado, referencia, descripcion) VALUES
-- Depósitos completados
(1, 1, 1, 500000, 12500, 487500, '2024-10-01 10:00:00', 13, 'DEP-001-2024', 'Depósito inicial con tarjeta de crédito'),
(2, 3, 1, 1000000, 0, 1000000, '2024-10-02 14:30:00', 13, 'DEP-002-2024', 'Depósito por transferencia bancaria'),
(3, 4, 1, 300000, 3000, 297000, '2024-10-03 09:15:00', 13, 'DEP-003-2024', 'Depósito PSE'),
(4, 6, 1, 750000, 3750, 746250, '2024-10-05 16:20:00', 13, 'DEP-004-2024', 'Depósito billetera digital'),
(5, 1, 1, 400000, 10000, 390000, '2024-10-07 11:00:00', 13, 'DEP-005-2024', 'Recarga con tarjeta de crédito'),
(6, 2, 1, 500000, 7500, 492500, '2024-10-08 13:45:00', 13, 'DEP-006-2024', 'Depósito con tarjeta de débito'),
(7, 3, 1, 1200000, 0, 1200000, '2024-10-10 10:30:00', 13, 'DEP-007-2024', 'Gran depósito transferencia'),
(8, 4, 1, 350000, 3500, 346500, '2024-10-12 15:00:00', 13, 'DEP-008-2024', 'Depósito PSE'),

-- Transacciones de apuestas (débito por hacer la apuesta)
(1, NULL, 3, 50000, 0, 50000, '2024-10-14 18:00:00', 13, 'APU-001-2024', 'Apuesta Partido 1'),
(2, NULL, 3, 75000, 0, 75000, '2024-10-19 16:00:00', 13, 'APU-002-2024', 'Apuesta Partido 2'),
(3, NULL, 3, 30000, 0, 30000, '2024-10-24 14:00:00', 13, 'APU-003-2024', 'Apuesta Partido 3'),
(4, NULL, 3, 100000, 0, 100000, '2024-10-14 19:00:00', 13, 'APU-004-2024', 'Apuesta Partido 1'),
(5, NULL, 3, 60000, 0, 60000, '2024-10-19 17:00:00', 13, 'APU-005-2024', 'Apuesta Partido 2'),
(6, NULL, 3, 40000, 0, 40000, '2024-10-24 15:00:00', 13, 'APU-006-2024', 'Apuesta Partido 3'),

-- Ganancias de apuestas (crédito por ganar)
(1, NULL, 4, 105000, 0, 105000, '2024-10-15 22:00:00', 13, 'GAN-001-2024', 'Ganancia apuesta Partido 1'),
(2, NULL, 4, 232500, 0, 232500, '2024-10-20 20:00:00', 13, 'GAN-002-2024', 'Ganancia apuesta Partido 2'),
(3, NULL, 4, 84000, 0, 84000, '2024-10-25 18:00:00', 13, 'GAN-003-2024', 'Ganancia apuesta Partido 3'),

-- Transacciones de apuestas pendientes (descuento del saldo)
(1, NULL, 3, 80000, 0, 80000, '2024-11-12 10:00:00', 13, 'APU-007-2024', 'Apuesta Partido 8'),
(2, NULL, 3, 120000, 0, 120000, '2024-11-12 11:30:00', 13, 'APU-008-2024', 'Apuesta Partido 9'),
(3, NULL, 3, 50000, 0, 50000, '2024-11-12 12:00:00', 13, 'APU-009-2024', 'Apuesta Partido 10'),
(4, NULL, 3, 90000, 0, 90000, '2024-11-13 09:00:00', 13, 'APU-010-2024', 'Apuesta Partido 12'),
(5, NULL, 3, 70000, 0, 70000, '2024-11-13 10:00:00', 13, 'APU-011-2024', 'Apuesta Partido 13'),
(6, NULL, 3, 110000, 0, 110000, '2024-11-14 08:00:00', 13, 'APU-012-2024', 'Apuesta Partido 16'),
(7, NULL, 3, 95000, 0, 95000, '2024-11-14 11:00:00', 13, 'APU-013-2024', 'Apuesta Partido 19'),
(8, NULL, 3, 85000, 0, 85000, '2024-11-14 13:00:00', 13, 'APU-014-2024', 'Apuesta Partido 20'),

-- Retiros
(1, 3, 2, 200000, 0, 200000, '2024-11-10 14:00:00', 13, 'RET-001-2024', 'Retiro a cuenta bancaria'),
(2, 1, 2, 500000, 12500, 487500, '2024-11-11 16:30:00', 13, 'RET-002-2024', 'Retiro a tarjeta'),

-- Bonos promocionales
(1, NULL, 7, 50000, 0, 50000, '2024-10-15 08:00:00', 13, 'BONO-001-2024', 'Bono de bienvenida'),
(5, NULL, 7, 30000, 0, 30000, '2024-10-20 09:00:00', 13, 'BONO-002-2024', 'Bono por primera apuesta')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Mostrar resumen de registros insertados
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== RESUMEN DE DATOS INSERTADOS ===';
    
    SELECT COUNT(*) INTO v_count FROM Pais;
    RAISE NOTICE 'Países: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Departamento;
    RAISE NOTICE 'Departamentos: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Ciudad;
    RAISE NOTICE 'Ciudades: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Estado;
    RAISE NOTICE 'Estados: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Deporte;
    RAISE NOTICE 'Deportes: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Liga;
    RAISE NOTICE 'Ligas: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Estadio;
    RAISE NOTICE 'Estadios: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Arbitro;
    RAISE NOTICE 'Árbitros: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Entrenador;
    RAISE NOTICE 'Entrenadores: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Equipo;
    RAISE NOTICE 'Equipos: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Usuario;
    RAISE NOTICE 'Usuarios: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Apostador;
    RAISE NOTICE 'Apostadores: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Partido;
    RAISE NOTICE 'Partidos: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Cuota;
    RAISE NOTICE 'Cuotas: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Apuesta;
    RAISE NOTICE 'Apuestas: %', v_count;
    
    SELECT COUNT(*) INTO v_count FROM Transaccion;
    RAISE NOTICE 'Transacciones: %', v_count;
    
    RAISE NOTICE '====================================';
END $$;
