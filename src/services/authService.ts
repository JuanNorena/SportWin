import * as bcrypt from 'bcrypt';
import db from '../utils/database';

/**
 * Interface para el usuario autenticado
 */
export interface AuthUser {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'admin' | 'operador' | 'apostador';
}

/**
 * Servicio de Autenticación
 */
export class AuthService {
    private static SALT_ROUNDS = 10;
    private static currentUser: AuthUser | null = null;

    /**
     * Autenticar usuario
     */
    public static async login(username: string, password: string): Promise<AuthUser | null> {
        try {
            const result = await db.query(
                `SELECT id_usuario, username, password_hash, nombre, apellido, email, rol, activo 
                 FROM Usuario 
                 WHERE username = $1 AND activo = true`,
                [username]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const user = result.rows[0];

            // Verificar contraseña
            const isValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isValid) {
                return null;
            }

            // Actualizar último acceso
            await db.query(
                'UPDATE Usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1',
                [user.id_usuario]
            );

            // Guardar usuario actual
            this.currentUser = {
                id: user.id_usuario,
                username: user.username,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol
            };

            return this.currentUser;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    public static logout(): void {
        this.currentUser = null;
    }

    /**
     * Obtener usuario actual
     */
    public static getCurrentUser(): AuthUser | null {
        return this.currentUser;
    }

    /**
     * Verificar si hay sesión activa
     */
    public static isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    /**
     * Verificar si el usuario tiene un rol específico
     */
    public static hasRole(rol: string): boolean {
        return this.currentUser?.rol === rol;
    }

    /**
     * Hashear contraseña
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Crear nuevo usuario
     */
    public static async createUser(
        username: string,
        password: string,
        nombre: string,
        apellido: string,
        email: string,
        rol: 'admin' | 'operador' | 'apostador'
    ): Promise<number> {
        const passwordHash = await this.hashPassword(password);
        
        const result = await db.query(
            `INSERT INTO Usuario (username, password_hash, nombre, apellido, email, rol) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id_usuario`,
            [username, passwordHash, nombre, apellido, email, rol]
        );

        return result.rows[0].id_usuario;
    }
}
