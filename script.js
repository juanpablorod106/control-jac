src="https://unpkg.com/html5-qrcode"
// Configuración de Supabase
        const supabaseUrl = 'https://rpvnrwldekdzlzwkerlx.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdm5yd2xkZWtkemx6d2tlcmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjA0ODcsImV4cCI6MjA3MjY5NjQ4N30.ByDuXBxKnCSeIn-1Bo4dap-sEjkdN61GQTVx9Vnl_yM';
        
        // Inicializar Supabase
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        // Variables globales
        let usuarioActual = null;

        // Función para alternar modo oscuro
        function alternarModoOscuro() {
            const body = document.body;
            const interruptor = document.getElementById('interruptor-modo');
            const interruptorSecundario = document.getElementById('interruptor-modo-secundario');
            const textoModo = document.getElementById('texto-modo');
            const textoModoSecundario = document.getElementById('texto-modo-secundario');
            
            body.classList.toggle('modo-oscuro');
            
            if (body.classList.contains('modo-oscuro')) {
                interruptor.classList.add('activo');
                interruptorSecundario.classList.add('activo');
                textoModo.textContent = 'Modo claro';
                textoModoSecundario.textContent = 'Modo claro';
                localStorage.setItem('modoOscuro', 'activado');
            } else {
                interruptor.classList.remove('activo');
                interruptorSecundario.classList.remove('activo');
                textoModo.textContent = 'Modo oscuro';
                textoModoSecundario.textContent = 'Modo oscuro';
                localStorage.setItem('modoOscuro', 'desactivado');
            }
        }

        // Verificar preferencia guardada al cargar la página
        function verificarPreferenciaModo() {
            const preferencia = localStorage.getItem('modoOscuro');
            if (preferencia === 'activado') {
                document.body.classList.add('modo-oscuro');
                document.getElementById('interruptor-modo').classList.add('activo');
                document.getElementById('interruptor-modo-secundario').classList.add('activo');
                document.getElementById('texto-modo').textContent = 'Modo claro';
                document.getElementById('texto-modo-secundario').textContent = 'Modo claro';
            }
        }

        // Funciones de navegación
        function cambiarVista(vista) {
            console.log("Cambiando a vista:", vista);
            
            // Ocultar todas las vistas
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Construir el ID correcto de la vista
            let vistaId = '';
            switch(vista) {
                case 'inicio':
                    vistaId = 'vista-inicio';
                    break;
                case 'inicio_de_sesion':
                    vistaId = 'vista-inicio_de_sesion';
                    break;
                case 'registrarse':
                    vistaId = 'vista-registrarse';
                    break;
                case 'qrpage':
                    vistaId = 'vista-qrpage';
                    break;
                default:
                    vistaId = 'vista-inicio';
            }
            
            // Mostrar la vista seleccionada
            const vistaElement = document.getElementById(vistaId);
            if (vistaElement) {
                vistaElement.classList.add('active');
                
                // Actualizar título de la barra de navegación
                const titulos = {
                    'inicio': 'Inicio',
                    'inicio_de_sesion': 'Inicio de sesión',
                    'registrarse': 'Registro de usuario',
                    'qrpage': 'Ingreso de equipo'
                };
                
                document.getElementById('titulo-vista').textContent = titulos[vista] || 'Control Jack';
            } else {
                console.error("No se encontró la vista con ID:", vistaId);
            }
        }
        
        // Funciones de la aplicación con conexión a Supabase
        async function verificarLogin() {
            const usuario = document.getElementById('usuario-login').value;
            const contrasena = document.getElementById('contrasena-login').value;
            const mensajeError = document.getElementById('mensaje-error-login');
            
            // Ocultar mensaje de error previo
            mensajeError.style.display = 'none';
            
            // Validar campos vacíos
            if (!usuario || !contrasena) {
                mensajeError.textContent = 'Por favor, complete todos los campos';
                mensajeError.style.display = 'block';
                return;
            }
            
            try {
                // Consultar usuario en Supabase
                const { data, error } = await supabase
                    .from('usuario')
                    .select('*')
                    .eq('username', usuario)
                    .eq('clave', contrasena);
                
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    const userData = data[0];
                    usuarioActual = userData.username;
                    localStorage.setItem('usuarioActual', usuarioActual);
                    
                    alert(`¡Bienvenido ${userData.nombre} ${userData.apellido}!`);
                    cambiarVista('qrpage');
                } else {
                    mensajeError.textContent = 'Usuario o contraseña incorrectos';
                    mensajeError.style.display = 'block';
                }
            } catch (error) {
                console.error('Error al verificar login:', error);
                mensajeError.textContent = `Error de conexión: ${error.message}`;
                mensajeError.style.display = 'block';
            }
        }
        
        async function registrarUsuario() {
            const usuario = document.getElementById('usuario-registro').value;
            const contrasena = document.getElementById('contrasena-registro').value;
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const cedula = document.getElementById('cedula').value;
            const mensajeError = document.getElementById('mensaje-error-registro');
            const mensajeExito = document.getElementById('mensaje-exito-registro');
            
            // Ocultar mensajes previos
            mensajeError.style.display = 'none';
            mensajeExito.style.display = 'none';
            
            // Validar campos vacíos
            if (!usuario || !contrasena || !nombre || !apellido || !cedula) {
                mensajeError.textContent = 'Por favor, complete todos los campos';
                mensajeError.style.display = 'block';
                return;
            }
            
            // Validar que la cédula sea un número
            if (isNaN(cedula) || !cedula.trim()) {
                mensajeError.textContent = 'La cédula debe ser un número válido';
                mensajeError.style.display = 'block';
                return;
            }
            
            try {
                // Insertar nuevo usuario en Supabase
                const { data, error } = await supabase
                    .from('usuario')
                    .insert([
                        {
                            username: usuario.trim(),
                            clave: contrasena.trim(),
                            nombre: nombre.trim(),
                            apellido: apellido.trim(),
                            cedula: parseInt(cedula.trim())
                        }
                    ])
                    .select();
                
                if (error) {
                    // Verificar si es error de duplicado
                    if (error.code === '23505') {
                        mensajeError.textContent = 'El nombre de usuario ya existe';
                    } else {
                        mensajeError.textContent = `Error al registrar: ${error.message}`;
                    }
                    mensajeError.style.display = 'block';
                    return;
                }
                
                mensajeExito.textContent = `Usuario ${usuario} registrado correctamente`;
                mensajeExito.style.display = 'block';
                
                // Limpiar campos después de registro exitoso
                document.getElementById('usuario-registro').value = '';
                document.getElementById('contrasena-registro').value = '';
                document.getElementById('nombre').value = '';
                document.getElementById('apellido').value = '';
                document.getElementById('cedula').value = '';
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    cambiarVista('inicio');
                }, 2000);
                
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                mensajeError.textContent = `Error al registrar: ${error.message}`;
                mensajeError.style.display = 'block';
            }
        }
        
        async function buscarEquipo() {
            const idEquipo = document.getElementById('equipo').value.trim();
            const modelo = document.getElementById('modelo');
            const placa = document.getElementById('placa');
            
            if (!idEquipo) {
                alert('Por favor ingrese un ID de equipo');
                return;
            }
            
            try {
                // Consultar equipo en Supabase
                const { data, error } = await supabase
                    .from('equipo')
                    .select('id_equipo, modelo, placa')
                    .eq('id_equipo', idEquipo);
                
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    const equipo = data[0];
                    document.getElementById('equipo').value = equipo.id_equipo || '';
                    modelo.value = equipo.modelo || '';
                    placa.value = equipo.placa || '';
                } else {
                    alert('No se encontró un equipo con este ID');
                    // Limpiar campos
                    document.getElementById('equipo').value = '';
                    modelo.value = '';
                    placa.value = '';
                }
            } catch (error) {
                console.error('Error al buscar equipo:', error);
                alert(`Error: ${error.message}`);
            }
        }
        
        async function escanearQR() {
            // En un entorno web real, necesitarías una biblioteca para escanear QR
            // Por ahora simulamos el escaneo
            alert('En un entorno real, aquí se abriría la cámara para escanear el QR');
            
            // Simulación de datos escaneados
            const equipoId = 'EQ-2023-001';
            document.getElementById('equipo').value = equipoId;
            
            // Buscar automáticamente el equipo después de escanear
            await buscarEquipo();
        }

        async function iniciarEscaneo() {
        const qrReader = new Html5Qrcode("qr-reader");

        const config = { fps: 10, qrbox: 250 };

        qrReader.start(
            { facingMode: "environment" }, // cámara trasera
            config,
            async (decodedText, decodedResult) => {
                // Detener escaneo al leer el QR
                await qrReader.stop();
                document.getElementById('equipo').value = decodedText;

                // Buscar equipo en Supabase
                await buscarEquipo();
            },
            errorMessage => {
                console.warn(`QR error: ${errorMessage}`);
            }
        ).catch(err => {
            console.error("Error al iniciar escaneo:", err);
        });
        } 
        async function obtenerIdUsuarioPorUsername(username) {
            try {
                const { data, error } = await supabase
                    .from('usuario')
                    .select('id_usuario')
                    .eq('username', username);
                
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    return data[0].id_usuario;
                } else {
                    console.error('Usuario no encontrado');
                    return null;
                }
            } catch (error) {
                console.error('Error al obtener ID de usuario:', error);
                return null;
            }
        }
        
        function convertirANumerico(valor) {
            try {
                if (typeof valor === 'string') {
                    valor = valor.trim().replace(',', '.');
                }
                const num = parseFloat(valor);
                return isNaN(num) ? 0.0 : num;
            } catch (error) {
                return 0.0;
            }
        }
        
        async function registrarKilometraje() {
            // Obtener valores de los campos
            const idEquipo = document.getElementById('equipo').value;
            const tasa = document.getElementById('tasa').value;
            const litros = document.getElementById('litros').value;
            const kmInicial = document.getElementById('km-inicial').value;
            const kmIntermedio = document.getElementById('km-intermedio').value;
            const kmFinal = document.getElementById('km-final').value;
            const ltInicial = document.getElementById('lt-inicial').value;
            const ltIntermedio = document.getElementById('lt-intermedio').value;
            const ltFinal = document.getElementById('lt-final').value;
            
            // Validar campos obligatorios
            if (!idEquipo || !tasa || !kmInicial) {
                alert('Por favor, complete los campos obligatorios: Identificación del equipo, Tasa y Kilometraje inicial');
                return;
            }
            
            // Obtener usuario actual
            const username = localStorage.getItem('usuarioActual');
            if (!username) {
                alert('No se ha identificado el usuario. Por favor, inicie sesión nuevamente.');
                cambiarVista('inicio_de_sesion');
                return;
            }
            
            // Obtener ID de usuario
            const idUsuario = await obtenerIdUsuarioPorUsername(username);
            if (!idUsuario) {
                alert('Error al identificar el usuario. Por favor, inicie sesión nuevamente.');
                cambiarVista('inicio_de_sesion');
                return;
            }
            
            // Convertir valores numéricos
            const idEquipoVal = idEquipo.trim();
            const idUsuarioVal = idUsuario;
            const kmInicialVal = convertirANumerico(kmInicial);
            const kmIntermedioVal = convertirANumerico(kmIntermedio);
            const kmFinalVal = convertirANumerico(kmFinal);
            const tasaVal = convertirANumerico(tasa);
            const totalUsdVal = convertirANumerico(litros);
            const ltsInicialVal = ltInicial;
            const ltsIntermedioVal = ltIntermedio;
            const ltsFinalVal = ltFinal;
            const totalBsdVal = totalUsdVal * tasaVal;
            
            // Obtener fecha y hora actual
            const ahora = new Date();
            const fecha = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const hora = ahora.toTimeString().split(' ')[0]; // Formato HH:MM:SS
            
            try {
                // Insertar registro en Supabase
                const { data, error } = await supabase
                    .from('registro_kilometraje')
                    .insert([
                        {
                            id_equipo: idEquipoVal,
                            id_usuario: idUsuarioVal,
                            fecha: fecha,
                            hora: hora,
                            km_inicial: kmInicialVal,
                            km_intermedio: kmIntermedioVal,
                            km_final: kmFinalVal,
                            tasa_cambio: tasaVal,
                            total_combustible_usd: totalUsdVal,
                            total_combustible_bsd: totalBsdVal,
                            litros_inicial: ltsInicialVal,
                            litros_intermedio: ltsIntermedioVal,
                            litros_final: ltsFinalVal
                        }
                    ])
                    .select();
                
                if (error) {
                    throw error;
                }
                
                alert('Registro de kilometraje completado con éxito');
                
                // Limpiar campos
                document.getElementById('equipo').value = '';
                document.getElementById('modelo').value = '';
                document.getElementById('placa').value = '';
                document.getElementById('tasa').value = '';
                document.getElementById('litros').value = '';
                document.getElementById('km-inicial').value = '';
                document.getElementById('km-intermedio').value = '';
                document.getElementById('km-final').value = '';
                document.getElementById('lt-inicial').value = '';
                document.getElementById('lt-intermedio').value = '';
                document.getElementById('lt-final').value = '';
                
                // Redirigir al inicio
                cambiarVista('inicio');
                
            } catch (error) {
                console.error('Error al registrar kilometraje:', error);
                alert(`Error al registrar: ${error.message}`);
            }
        }
        
        async function exportarKilometraje() {
            try {
                // Obtener datos de registros
                const { data: registros, error: errorRegistros } = await supabase
                    .from('registro_kilometraje')
                    .select('*');
                
                if (errorRegistros) {
                    throw errorRegistros;
                }
                
                // Obtener datos de usuarios
                const { data: usuarios, error: errorUsuarios } = await supabase
                    .from('usuario')
                    .select('id_usuario, nombre, apellido');
                
                if (errorUsuarios) {
                    throw errorUsuarios;
                }
                
                // Crear diccionario de usuarios para búsqueda rápida
                const usuariosDict = {};
                usuarios.forEach(u => {
                    usuariosDict[u.id_usuario] = u;
                });
                
                // Combinar datos
                const datosCombinados = registros.map(r => {
                    const usuario = usuariosDict[r.id_usuario] || {};
                    return {
                        'ID Equipo': r.id_equipo,
                        'Combustible USD': r.total_combustible_usd || 0,
                        'Combustible BSD': r.total_combustible_bsd || 0,
                        'KM Inicial': r.km_inicial || 0,
                        'KM Intermedio': r.km_intermedio || 0,
                        'KM Final': r.km_final || 0,
                        'Litros Inicial': r.litros_inicial || 0,
                        'Litros Intermedio': r.litros_intermedio || 0,
                        'Litros Final': r.litros_final || 0,
                        'Nombre': usuario.nombre || '',
                        'Apellido': usuario.apellido || '',
                        'Fecha': r.fecha || '',
                        'Hora': r.hora || ''
                    };
                });
                
                // Crear y descargar el archivo CSV (en un entorno real podrías generar Excel)
                const csvContent = "data:text/csv;charset=utf-8," 
                    + Object.keys(datosCombinados[0]).join(",") + "\n"
                    + datosCombinados.map(row => 
                        Object.values(row).map(value => 
                            typeof value === 'string' ? `"${value}"` : value
                        ).join(",")
                    ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "kilometraje_nabep.csv");
                document.body.appendChild(link);
                
                link.click();
                document.body.removeChild(link);
                
            } catch (error) {
                console.error('Error al exportar kilometraje:', error);
                alert(`Error al exportar: ${error.message}`);
            }
        }
        
        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            console.log("Aplicación inicializada correctamente");
            verificarPreferenciaModo();
            
            // Verificar si hay un usuario en localStorage
            const usuarioGuardado = localStorage.getItem('usuarioActual');
            if (usuarioGuardado) {
                usuarioActual = usuarioGuardado;
            }
        });