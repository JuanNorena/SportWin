import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/authService';
import { ApostadorService } from '../../services/apostadorService';

const router = Router();

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Usuario y contraseña son requeridos'
            });
        }

        const user = await AuthService.login(username, password);

        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Si es apostador, obtener datos adicionales
        let apostador = null;
        if (user.rol && user.rol.toLowerCase() === 'apostador') {
            apostador = await ApostadorService.getByUserId(user.id);
        }

        res.json({
            message: 'Login exitoso',
            user,
            apostador
        });
    } catch (error: any) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            nombre,
            apellido,
            email,
            rol,
            documento,
            id_tipo_documento,
            telefono,
            direccion,
            id_ciudad,
            fecha_nacimiento
        } = req.body;

        // Validar campos requeridos
        if (!username || !password || !nombre || !apellido || !email || !rol) {
            return res.status(400).json({
                error: 'Faltan campos requeridos'
            });
        }

        // Crear usuario
        const userId = await AuthService.createUser(
            username,
            password,
            nombre,
            apellido,
            email,
            rol
        );

        // Si es apostador, crear registro en tabla Apostador
        let apostadorId = null;
        if (rol && rol.toLowerCase() === 'apostador') {
            if (!documento || !id_tipo_documento || !fecha_nacimiento) {
                return res.status(400).json({
                    error: 'Documento, tipo de documento y fecha de nacimiento son requeridos para apostadores'
                });
            }

            apostadorId = await ApostadorService.create({
                id_usuario: userId,
                documento,
                id_tipo_documento,
                telefono,
                direccion,
                id_ciudad,
                fecha_nacimiento,
                verificado: false
            });
        }

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: userId,
                username,
                nombre,
                apellido,
                email,
                rol
            },
            apostador_id: apostadorId
        });
    } catch (error: any) {
        console.error('Error en register:', error);
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') {
            // Violación de constraint de unicidad
            if (error.constraint === 'usuario_username_key') {
                return res.status(400).json({
                    error: 'El nombre de usuario ya está en uso'
                });
            } else if (error.constraint === 'usuario_email_key') {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            } else if (error.constraint === 'apostador_documento_key') {
                return res.status(400).json({
                    error: 'El documento ya está registrado'
                });
            }
        }
        
        res.status(500).json({
            error: 'Error al registrar usuario',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', (req: Request, res: Response) => {
    try {
        AuthService.logout();
        res.json({
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error: any) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error al cerrar sesión',
            message: error.message
        });
    }
});

/**
 * GET /api/auth/me
 * Obtener usuario actual
 */
router.get('/me', (req: Request, res: Response) => {
    try {
        const user = AuthService.getCurrentUser();

        if (!user) {
            return res.status(401).json({
                error: 'No hay sesión activa'
            });
        }

        res.json({
            user
        });
    } catch (error: any) {
        console.error('Error en /me:', error);
        res.status(500).json({
            error: 'Error al obtener usuario',
            message: error.message
        });
    }
});

export default router;
