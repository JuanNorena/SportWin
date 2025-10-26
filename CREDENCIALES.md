# 🔐 CREDENCIALES DE ACCESO - SPORTWIN

## Usuarios Disponibles

### 👨‍💼 Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** Administrador
- **Permisos:** Acceso completo al sistema

### 👩‍💻 Operador
- **Usuario:** `operador1`
- **Contraseña:** `operador123`
- **Rol:** Operador
- **Permisos:** Gestión operativa

### 👥 Apostadores (Usuarios de Prueba)

| Usuario | Contraseña | Nombre Completo | Email |
|---------|------------|-----------------|-------|
| `jperez` | `jperez123` | Juan Perez | juan.perez@email.com |
| `amartinez` | `amartinez123` | Ana Martinez | ana.martinez@email.com |
| `lgomez` | `lgomez123` | Luis Gomez | luis.gomez@email.com |
| `mrodriguez` | `mrodriguez123` | Monica Rodriguez | monica.rodriguez@email.com |
| `pgarcia` | `pgarcia123` | Pedro Garcia | pedro.garcia@email.com |
| `lhernandez` | `lhernandez123` | Laura Hernandez | laura.hernandez@email.com |
| `cdiaz` | `cdiaz123` | Carlos Diaz | carlos.diaz@email.com |
| `scastro` | `scastro123` | Sofia Castro | sofia.castro@email.com |

## 🚀 Cómo Iniciar Sesión

1. Ejecuta la aplicación:
   ```bash
   npm run dev
   ```

2. Selecciona la opción **"1. Iniciar Sesión"**

3. Ingresa el usuario y contraseña de la tabla anterior

## ✅ Problema Resuelto

El problema de "Credenciales incorrectas" era porque las contraseñas en la base de datos tenían **hashes inválidos de bcrypt**. 

Ahora todas las contraseñas han sido actualizadas con hashes correctos y el inicio de sesión funcionará correctamente.

## 🔧 Archivo de Actualización

Las contraseñas se actualizaron ejecutando:
```bash
psql -U postgres -d SportWin -f database/03_fix_passwords.sql
```

Este archivo ya está en el repositorio por si necesitas volver a aplicarlo.
