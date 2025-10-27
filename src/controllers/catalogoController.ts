import { ConsoleUtils } from '../utils/console';
import { 
    PaisService, 
    DepartamentoService, 
    CiudadService, 
    EstadoService, 
    RolService,
    TipoDocumentoService,
    TipoTransaccionService,
    EntrenadorService,
    ArbitroService,
    EstadioService
} from '../services/catalogoService';

/**
 * Controlador para gestionar tablas de catálogo
 */
export class CatalogoController {
    /**
     * Menú principal de catálogos
     */
    public static async menu(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Gestión de Países',
                'Gestión de Departamentos',
                'Gestión de Ciudades',
                'Gestión de Estados',
                'Gestión de Roles',
                'Gestión de Tipos de Documento',
                'Gestión de Tipos de Transacción',
                'Gestión de Entrenadores',
                'Gestión de Árbitros',
                'Gestión de Estadios',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Catálogos', options);

            try {
                switch (choice) {
                    case 1:
                        await this.menuPaises();
                        break;
                    case 2:
                        await this.menuDepartamentos();
                        break;
                    case 3:
                        await this.menuCiudades();
                        break;
                    case 4:
                        await this.menuEstados();
                        break;
                    case 5:
                        await this.menuRoles();
                        break;
                    case 6:
                        await this.menuTiposDocumento();
                        break;
                    case 7:
                        await this.menuTiposTransaccion();
                        break;
                    case 8:
                        await this.menuEntrenadores();
                        break;
                    case 9:
                        await this.menuArbitros();
                        break;
                    case 10:
                        await this.menuEstadios();
                        break;
                    case 11:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    // ============================================
    // PAÍSES
    // ============================================
    private static async menuPaises(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Países',
                'Buscar País por ID',
                'Buscar País por Código ISO',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Países', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarPaises();
                        break;
                    case 2:
                        await this.buscarPaisPorId();
                        break;
                    case 3:
                        await this.buscarPaisPorCodigo();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarPaises(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Países');
        const paises = await PaisService.getAll();

        if (paises.length === 0) {
            ConsoleUtils.warning('No hay países registrados');
        } else {
            const data = paises.map(p => ({
                id: p.id_pais,
                nombre: p.nombre,
                código_iso: p.codigo_iso,
                código_tel: p.codigo_telefono || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código ISO', 'Código Tel']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarPaisPorId(): Promise<void> {
        ConsoleUtils.showHeader('Buscar País por ID');
        const id = ConsoleUtils.inputNumber('ID del país');
        const pais = await PaisService.getById(id);

        if (!pais) {
            ConsoleUtils.error('País no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${pais.id_pais}`);
            ConsoleUtils.info(`Nombre: ${pais.nombre}`);
            ConsoleUtils.info(`Código ISO: ${pais.codigo_iso}`);
            ConsoleUtils.info(`Código Telefónico: ${pais.codigo_telefono || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    private static async buscarPaisPorCodigo(): Promise<void> {
        ConsoleUtils.showHeader('Buscar País por Código ISO');
        const codigo = ConsoleUtils.input('Código ISO (ej: COL, USA, ESP)');
        const pais = await PaisService.getByCodigoISO(codigo);

        if (!pais) {
            ConsoleUtils.error('País no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${pais.id_pais}`);
            ConsoleUtils.info(`Nombre: ${pais.nombre}`);
            ConsoleUtils.info(`Código ISO: ${pais.codigo_iso}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // DEPARTAMENTOS
    // ============================================
    private static async menuDepartamentos(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Todos los Departamentos',
                'Listar Departamentos por País',
                'Buscar Departamento por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Departamentos', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarDepartamentos();
                        break;
                    case 2:
                        await this.listarDepartamentosPorPais();
                        break;
                    case 3:
                        await this.buscarDepartamento();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarDepartamentos(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Departamentos');
        const departamentos = await DepartamentoService.getAll();

        if (departamentos.length === 0) {
            ConsoleUtils.warning('No hay departamentos registrados');
        } else {
            const data = departamentos.slice(0, 50).map(d => ({
                id: d.id_departamento,
                nombre: d.nombre,
                código: d.codigo || 'N/A',
                id_país: d.id_pais
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código', 'ID País']);
            
            if (departamentos.length > 50) {
                ConsoleUtils.info(`(Mostrando 50 de ${departamentos.length} departamentos)`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async listarDepartamentosPorPais(): Promise<void> {
        ConsoleUtils.showHeader('Departamentos por País');
        
        // Mostrar países disponibles
        const paises = await PaisService.getAll();
        ConsoleUtils.info('Países disponibles:');
        paises.slice(0, 10).forEach(p => console.log(`  - ID ${p.id_pais}: ${p.nombre}`));
        
        const idPais = ConsoleUtils.inputNumber('ID del país');
        const departamentos = await DepartamentoService.getByPais(idPais);

        if (departamentos.length === 0) {
            ConsoleUtils.warning('No hay departamentos para este país');
        } else {
            const data = departamentos.map(d => ({
                id: d.id_departamento,
                nombre: d.nombre,
                código: d.codigo || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarDepartamento(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Departamento');
        const id = ConsoleUtils.inputNumber('ID del departamento');
        const dept = await DepartamentoService.getById(id);

        if (!dept) {
            ConsoleUtils.error('Departamento no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${dept.id_departamento}`);
            ConsoleUtils.info(`Nombre: ${dept.nombre}`);
            ConsoleUtils.info(`Código: ${dept.codigo || 'N/A'}`);
            ConsoleUtils.info(`ID País: ${dept.id_pais}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // CIUDADES
    // ============================================
    private static async menuCiudades(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Ciudades de Colombia',
                'Listar Ciudades por Departamento',
                'Buscar Ciudad por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Ciudades', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarCiudadesColombia();
                        break;
                    case 2:
                        await this.listarCiudadesPorDepartamento();
                        break;
                    case 3:
                        await this.buscarCiudad();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarCiudadesColombia(): Promise<void> {
        ConsoleUtils.showHeader('Ciudades de Colombia');
        const ciudades = await CiudadService.getCiudadesCompletasColombias();

        if (ciudades.length === 0) {
            ConsoleUtils.warning('No hay ciudades registradas');
        } else {
            const data = ciudades.slice(0, 50).map(c => ({
                id: c.id_ciudad,
                ciudad: c.ciudad,
                departamento: c.departamento
            }));

            ConsoleUtils.showTable(data, ['ID', 'Ciudad', 'Departamento']);
            
            if (ciudades.length > 50) {
                ConsoleUtils.info(`(Mostrando 50 de ${ciudades.length} ciudades)`);
            }
        }

        ConsoleUtils.pause();
    }

    private static async listarCiudadesPorDepartamento(): Promise<void> {
        ConsoleUtils.showHeader('Ciudades por Departamento');
        
        const idDepartamento = ConsoleUtils.inputNumber('ID del departamento');
        const ciudades = await CiudadService.getByDepartamento(idDepartamento);

        if (ciudades.length === 0) {
            ConsoleUtils.warning('No hay ciudades para este departamento');
        } else {
            const data = ciudades.map(c => ({
                id: c.id_ciudad,
                nombre: c.nombre,
                codigo_postal: c.codigo_postal || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código Postal']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarCiudad(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Ciudad');
        const id = ConsoleUtils.inputNumber('ID de la ciudad');
        const ciudad = await CiudadService.getById(id);

        if (!ciudad) {
            ConsoleUtils.error('Ciudad no encontrada');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${ciudad.id_ciudad}`);
            ConsoleUtils.info(`Nombre: ${ciudad.nombre}`);
            ConsoleUtils.info(`Código Postal: ${ciudad.codigo_postal || 'N/A'}`);
            ConsoleUtils.info(`ID Departamento: ${ciudad.id_departamento}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // ESTADOS
    // ============================================
    private static async menuEstados(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Todos los Estados',
                'Listar Estados por Entidad',
                'Buscar Estado por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Estados', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarEstados();
                        break;
                    case 2:
                        await this.listarEstadosPorEntidad();
                        break;
                    case 3:
                        await this.buscarEstado();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarEstados(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Estados');
        const estados = await EstadoService.getAll();

        if (estados.length === 0) {
            ConsoleUtils.warning('No hay estados registrados');
        } else {
            const data = estados.map(e => ({
                id: e.id_estado,
                entidad: e.entidad,
                nombre: e.nombre,
                codigo: e.codigo,
                descripcion: e.descripcion || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Entidad', 'Nombre', 'Código', 'Descripción']);
        }

        ConsoleUtils.pause();
    }

    private static async listarEstadosPorEntidad(): Promise<void> {
        ConsoleUtils.showHeader('Estados por Entidad');
        ConsoleUtils.info('Entidades disponibles: PARTIDO, APUESTA, TRANSACCION');
        
        const entidad = ConsoleUtils.input('Entidad (PARTIDO/APUESTA/TRANSACCION)').toUpperCase();
        const estados = await EstadoService.getByEntidad(entidad);

        if (estados.length === 0) {
            ConsoleUtils.warning('No hay estados para esta entidad');
        } else {
            const data = estados.map(e => ({
                id: e.id_estado,
                nombre: e.nombre,
                codigo: e.codigo,
                descripcion: e.descripcion || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código', 'Descripción']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarEstado(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Estado');
        const id = ConsoleUtils.inputNumber('ID del estado');
        const estado = await EstadoService.getById(id);

        if (!estado) {
            ConsoleUtils.error('Estado no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${estado.id_estado}`);
            ConsoleUtils.info(`Entidad: ${estado.entidad}`);
            ConsoleUtils.info(`Nombre: ${estado.nombre}`);
            ConsoleUtils.info(`Código: ${estado.codigo}`);
            ConsoleUtils.info(`Descripción: ${estado.descripcion || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // ROLES
    // ============================================
    private static async menuRoles(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Roles',
                'Buscar Rol por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Roles', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarRoles();
                        break;
                    case 2:
                        await this.buscarRol();
                        break;
                    case 3:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarRoles(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Roles');
        const roles = await RolService.getAll();

        if (roles.length === 0) {
            ConsoleUtils.warning('No hay roles registrados');
        } else {
            const data = roles.map(r => ({
                id: r.id_rol,
                nombre: r.nombre,
                descripcion: r.descripcion || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Descripción']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarRol(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Rol');
        const id = ConsoleUtils.inputNumber('ID del rol');
        const rol = await RolService.getById(id);

        if (!rol) {
            ConsoleUtils.error('Rol no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${rol.id_rol}`);
            ConsoleUtils.info(`Nombre: ${rol.nombre}`);
            ConsoleUtils.info(`Descripción: ${rol.descripcion || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // TIPOS DE DOCUMENTO
    // ============================================
    private static async menuTiposDocumento(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Tipos de Documento',
                'Buscar Tipo de Documento por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Tipos de Documento', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarTiposDocumento();
                        break;
                    case 2:
                        await this.buscarTipoDocumento();
                        break;
                    case 3:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarTiposDocumento(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Tipos de Documento');
        const tipos = await TipoDocumentoService.getAll();

        if (tipos.length === 0) {
            ConsoleUtils.warning('No hay tipos de documento registrados');
        } else {
            const data = tipos.map(t => ({
                id: t.id_tipo_documento,
                nombre: t.nombre,
                codigo: t.codigo,
                descripcion: t.descripcion || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código', 'Descripción']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarTipoDocumento(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Tipo de Documento');
        const id = ConsoleUtils.inputNumber('ID del tipo de documento');
        const tipo = await TipoDocumentoService.getById(id);

        if (!tipo) {
            ConsoleUtils.error('Tipo de documento no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${tipo.id_tipo_documento}`);
            ConsoleUtils.info(`Nombre: ${tipo.nombre}`);
            ConsoleUtils.info(`Código: ${tipo.codigo}`);
            ConsoleUtils.info(`Descripción: ${tipo.descripcion || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // TIPOS DE TRANSACCIÓN
    // ============================================
    private static async menuTiposTransaccion(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Tipos de Transacción',
                'Buscar Tipo de Transacción por ID',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Tipos de Transacción', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarTiposTransaccion();
                        break;
                    case 2:
                        await this.buscarTipoTransaccion();
                        break;
                    case 3:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarTiposTransaccion(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Tipos de Transacción');
        const tipos = await TipoTransaccionService.getAll();

        if (tipos.length === 0) {
            ConsoleUtils.warning('No hay tipos de transacción registrados');
        } else {
            const data = tipos.map(t => ({
                id: t.id_tipo_transaccion,
                nombre: t.nombre,
                codigo: t.codigo,
                afecta_saldo: t.afecta_saldo,
                descripcion: t.descripcion || 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Código', 'Afecta Saldo', 'Descripción']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarTipoTransaccion(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Tipo de Transacción');
        const id = ConsoleUtils.inputNumber('ID del tipo de transacción');
        const tipo = await TipoTransaccionService.getById(id);

        if (!tipo) {
            ConsoleUtils.error('Tipo de transacción no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${tipo.id_tipo_transaccion}`);
            ConsoleUtils.info(`Nombre: ${tipo.nombre}`);
            ConsoleUtils.info(`Código: ${tipo.codigo}`);
            ConsoleUtils.info(`Afecta Saldo: ${tipo.afecta_saldo}`);
            ConsoleUtils.info(`Descripción: ${tipo.descripcion || 'N/A'}`);
        }

        ConsoleUtils.pause();
    }

    // ============================================
    // ENTRENADORES
    // ============================================
    private static async menuEntrenadores(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Entrenadores',
                'Buscar Entrenador por ID',
                'Crear Nuevo Entrenador',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Entrenadores', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarEntrenadores();
                        break;
                    case 2:
                        await this.buscarEntrenador();
                        break;
                    case 3:
                        await this.crearEntrenador();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarEntrenadores(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Entrenadores');
        const entrenadores = await EntrenadorService.getConPais();

        if (entrenadores.length === 0) {
            ConsoleUtils.warning('No hay entrenadores registrados');
        } else {
            const data = entrenadores.map(e => ({
                id: e.id_entrenador,
                nombre: `${e.nombre} ${e.apellido}`,
                país: e.pais || 'N/A',
                licencia: e.licencia || 'N/A',
                experiencia: e.experiencia_años ? `${e.experiencia_años} años` : 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'País', 'Licencia', 'Experiencia']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarEntrenador(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Entrenador');
        const id = ConsoleUtils.inputNumber('ID del entrenador');
        const entrenador = await EntrenadorService.getById(id);

        if (!entrenador) {
            ConsoleUtils.error('Entrenador no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${entrenador.id_entrenador}`);
            ConsoleUtils.info(`Nombre: ${entrenador.nombre} ${entrenador.apellido}`);
            ConsoleUtils.info(`Licencia: ${entrenador.licencia || 'N/A'}`);
            ConsoleUtils.info(`Experiencia: ${entrenador.experiencia_años || 'N/A'} años`);
        }

        ConsoleUtils.pause();
    }

    private static async crearEntrenador(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Entrenador');

        const nombre = ConsoleUtils.input('Nombre');
        const apellido = ConsoleUtils.input('Apellido');
        
        // Mostrar países
        const paises = await PaisService.getAll();
        ConsoleUtils.info('\nPaíses disponibles (primeros 10):');
        paises.slice(0, 10).forEach(p => console.log(`  - ID ${p.id_pais}: ${p.nombre}`));
        
        const idPaisStr = ConsoleUtils.input('ID del País (opcional)', false);
        const idPais = idPaisStr ? parseInt(idPaisStr) : undefined;
        
        const fechaNacimiento = ConsoleUtils.input('Fecha de Nacimiento (YYYY-MM-DD)', false);
        const licencia = ConsoleUtils.input('Licencia', false);
        const experienciaStr = ConsoleUtils.input('Años de Experiencia', false);
        const experiencia = experienciaStr ? parseInt(experienciaStr) : undefined;

        const id = await EntrenadorService.create({
            nombre,
            apellido,
            id_pais: idPais,
            fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            licencia: licencia || undefined,
            experiencia_años: experiencia,
            activo: true
        });

        ConsoleUtils.success(`Entrenador creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    // ============================================
    // ÁRBITROS
    // ============================================
    private static async menuArbitros(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Árbitros',
                'Buscar Árbitro por ID',
                'Crear Nuevo Árbitro',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Árbitros', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarArbitros();
                        break;
                    case 2:
                        await this.buscarArbitro();
                        break;
                    case 3:
                        await this.crearArbitro();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarArbitros(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Árbitros');
        const arbitros = await ArbitroService.getConPais();

        if (arbitros.length === 0) {
            ConsoleUtils.warning('No hay árbitros registrados');
        } else {
            const data = arbitros.map(a => ({
                id: a.id_arbitro,
                nombre: `${a.nombre} ${a.apellido}`,
                pais: a.pais || 'N/A',
                categoria: a.categoria || 'N/A',
                experiencia: a.años_experiencia ? `${a.años_experiencia} años` : 'N/A'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'País', 'Categoría', 'Experiencia']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarArbitro(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Árbitro');
        const id = ConsoleUtils.inputNumber('ID del árbitro');
        const arbitro = await ArbitroService.getById(id);

        if (!arbitro) {
            ConsoleUtils.error('Árbitro no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${arbitro.id_arbitro}`);
            ConsoleUtils.info(`Nombre: ${arbitro.nombre} ${arbitro.apellido}`);
            ConsoleUtils.info(`Categoría: ${arbitro.categoria || 'N/A'}`);
            ConsoleUtils.info(`Experiencia: ${arbitro.años_experiencia || 'N/A'} años`);
        }

        ConsoleUtils.pause();
    }

    private static async crearArbitro(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Árbitro');

        const nombre = ConsoleUtils.input('Nombre');
        const apellido = ConsoleUtils.input('Apellido');
        
        // Mostrar países
        const paises = await PaisService.getAll();
        ConsoleUtils.info('\nPaíses disponibles (primeros 10):');
        paises.slice(0, 10).forEach(p => console.log(`  - ID ${p.id_pais}: ${p.nombre}`));
        
        const idPaisStr = ConsoleUtils.input('ID del País (opcional)', false);
        const idPais = idPaisStr ? parseInt(idPaisStr) : undefined;
        
        const fechaNacimiento = ConsoleUtils.input('Fecha de Nacimiento (YYYY-MM-DD)', false);
        const categoria = ConsoleUtils.input('Categoría', false);
        const experienciaStr = ConsoleUtils.input('Años de Experiencia', false);
        const experiencia = experienciaStr ? parseInt(experienciaStr) : undefined;

        const id = await ArbitroService.create({
            nombre,
            apellido,
            id_pais: idPais,
            fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            categoria: categoria || undefined,
            años_experiencia: experiencia,
            activo: true
        });

        ConsoleUtils.success(`Árbitro creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }

    // ============================================
    // ESTADIOS
    // ============================================
    private static async menuEstadios(): Promise<void> {
        let back = false;

        while (!back) {
            const options = [
                'Listar Estadios',
                'Buscar Estadio por ID',
                'Crear Nuevo Estadio',
                'Volver'
            ];

            const choice = ConsoleUtils.showMenu('Gestión de Estadios', options);

            try {
                switch (choice) {
                    case 1:
                        await this.listarEstadios();
                        break;
                    case 2:
                        await this.buscarEstadio();
                        break;
                    case 3:
                        await this.crearEstadio();
                        break;
                    case 4:
                        back = true;
                        break;
                }
            } catch (error: any) {
                ConsoleUtils.error(`Error: ${error.message}`);
                ConsoleUtils.pause();
            }
        }
    }

    private static async listarEstadios(): Promise<void> {
        ConsoleUtils.showHeader('Listado de Estadios');
        const estadios = await EstadioService.getConCiudad();

        if (estadios.length === 0) {
            ConsoleUtils.warning('No hay estadios registrados');
        } else {
            const data = estadios.map(e => ({
                id: e.id_estadio,
                nombre: e.nombre,
                ciudad: e.ciudad || 'N/A',
                pais: e.pais || 'N/A',
                capacidad: e.capacidad || 'N/A',
                techado: e.techado ? 'Sí' : 'No'
            }));

            ConsoleUtils.showTable(data, ['ID', 'Nombre', 'Ciudad', 'País', 'Capacidad', 'Techado']);
        }

        ConsoleUtils.pause();
    }

    private static async buscarEstadio(): Promise<void> {
        ConsoleUtils.showHeader('Buscar Estadio');
        const id = ConsoleUtils.inputNumber('ID del estadio');
        const estadio = await EstadioService.getById(id);

        if (!estadio) {
            ConsoleUtils.error('Estadio no encontrado');
        } else {
            console.log();
            ConsoleUtils.info(`ID: ${estadio.id_estadio}`);
            ConsoleUtils.info(`Nombre: ${estadio.nombre}`);
            ConsoleUtils.info(`Dirección: ${estadio.direccion || 'N/A'}`);
            ConsoleUtils.info(`Capacidad: ${estadio.capacidad || 'N/A'}`);
            ConsoleUtils.info(`Año Construcción: ${estadio.año_construccion || 'N/A'}`);
            ConsoleUtils.info(`Techado: ${estadio.techado ? 'Sí' : 'No'}`);
        }

        ConsoleUtils.pause();
    }

    private static async crearEstadio(): Promise<void> {
        ConsoleUtils.showHeader('Crear Nuevo Estadio');

        const nombre = ConsoleUtils.input('Nombre del Estadio');
        
        // Mostrar ciudades
        const ciudades = await CiudadService.getCiudadesCompletasColombias();
        ConsoleUtils.info('\nCiudades disponibles (primeras 10):');
        ciudades.slice(0, 10).forEach(c => console.log(`  - ID ${c.id_ciudad}: ${c.ciudad}, ${c.departamento}`));
        
        const idCiudadStr = ConsoleUtils.input('ID de la Ciudad (opcional)', false);
        const idCiudad = idCiudadStr ? parseInt(idCiudadStr) : undefined;
        
        const direccion = ConsoleUtils.input('Dirección', false);
        const capacidadStr = ConsoleUtils.input('Capacidad', false);
        const capacidad = capacidadStr ? parseInt(capacidadStr) : undefined;
        
        const añoStr = ConsoleUtils.input('Año de Construcción', false);
        const año = añoStr ? parseInt(añoStr) : undefined;
        
        const tipoCesped = ConsoleUtils.input('Tipo de Césped', false);
        const techadoStr = ConsoleUtils.input('¿Techado? (s/n)', false);
        const techado = techadoStr?.toLowerCase() === 's';

        const id = await EstadioService.create({
            nombre,
            id_ciudad: idCiudad,
            direccion: direccion || undefined,
            capacidad,
            año_construccion: año,
            tipo_cesped: tipoCesped || undefined,
            techado,
            activo: true
        });

        ConsoleUtils.success(`Estadio creado exitosamente con ID: ${id}`);
        ConsoleUtils.pause();
    }
}
