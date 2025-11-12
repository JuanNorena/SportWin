import { APIServer } from './api/server';

/**
 * Iniciar API REST de SportWin
 */
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = new APIServer(PORT);

server.start().catch((error) => {
    console.error('Error al iniciar servidor API:', error);
    process.exit(1);
});
