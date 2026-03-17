// === script.js ===
document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. INICIALIZAR SUPABASE ---
    let supabase = null;
    
    // Solo inicializa Supabase si la librería existe en la página
    if (window.supabase) {
        const supabaseUrl = 'https://zokaarirkqourkkfmkso.supabase.co';
        const supabaseKey = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
    // --- 2. LÓGICA DE INICIO DE SESIÓN (portal.html) ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usuarioInput = document.getElementById('login-user').value.trim();
            const passInput = document.getElementById('login-pass').value.trim();
            
            try {
                // Leer el archivo JSON de usuarios (evitando caché)
                const urlSinCache = 'usuarios.json?t=' + new Date().getTime();
                const respuesta = await fetch(urlSinCache, { cache: 'no-store' });
                
                if (!respuesta.ok) {
                    throw new Error('No se pudo acceder al archivo de usuarios.');
                }
                
                const usuarios = await respuesta.json();
                const empleadoValido = usuarios.find(emp => emp.user === usuarioInput && emp.pass === passInput);

                if (empleadoValido) {
                    // Login correcto
                    localStorage.setItem('weazel_session', empleadoValido.user);
                    localStorage.setItem('weazel_role', empleadoValido.rol);
                    localStorage.setItem('weazel_nombre', empleadoValido.nombre);
                    
                    // Redirigir según el rol
                    if (empleadoValido.rol === 'admin') {
                        window.location.href = 'panel-directiva.html';
                    } else if (empleadoValido.rol === 'empleado') {
                        window.location.href = 'panel-empleado.html';
                    }
                } else {
                    alert('❌ Credenciales incorrectas. Comprueba tu usuario y contraseña.');
                }
            } catch (error) {
                console.error("Error en el login:", error);
                alert('⚠️ Error de conexión. Revisa que estés usando un servidor local (Live Server) para leer el JSON.');
            }
        });
    }

    // --- 3. LÓGICA DEL PANEL DE EMPLEADO (panel-empleado.html) ---
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const sessionUser = localStorage.getItem('weazel_session');
        const sessionRole = localStorage.getItem('weazel_role');
        const sessionNombre = localStorage.getItem('weazel_nombre') || sessionUser;
        
        // Protección de ruta
        if (!sessionUser || sessionRole !== 'empleado') {
            window.location.href = 'portal.html';
            return;
        }

        document.getElementById('nombre-empleado-display').textContent = sessionNombre;

        // Cargar datos del empleado desde Supabase (SOLO HORAS)
        let miData = { user_id: sessionUser, enServicio: false, clockInTime: null, totalSeconds: 0 };
        
        const { data: dbData, error: dbError } = await supabase
            .from('fichajes')
            .select('*')
            .eq('user_id', sessionUser)
            .single();

        if (dbData) {
            miData = dbData;
        } else if (dbError && dbError.code === 'PGRST116') {
            // No existe el registro en Supabase, lo creamos
            await supabase.from('fichajes').insert([miData]);
        } else {
            console.error("Error al conectar con Supabase:", dbError);
        }

        const btnFichaje = document.getElementById('btn-fichaje');
        const estadoTexto = document.getElementById('estado-servicio');
        const horasTexto = document.getElementById('horas-semana');
        const btnLogout = document.getElementById('btn-logout');

        function updateUI() {
            let currentSessionSeconds = 0;
            if (miData.enServicio) {
                btnFichaje.style.backgroundColor = '#4caf50';
                btnFichaje.textContent = 'SALIR DE SERVICIO';
                estadoTexto.innerHTML = '🟢 <b>' + sessionNombre + '</b> está en servicio.';
                if (miData.clockInTime) {
                    currentSessionSeconds = Math.floor((Date.now() - miData.clockInTime) / 1000);
                }
            } else {
                btnFichaje.style.backgroundColor = 'var(--rojo-weazel)';
                btnFichaje.textContent = 'ENTRAR DE SERVICIO';
                estadoTexto.innerHTML = '⚫ Fuera de servicio';
            }

            const totalDisplaySeconds = miData.totalSeconds + currentSessionSeconds;
            const hours = Math.floor(totalDisplaySeconds / 3600);
            const minutes = Math.floor((totalDisplaySeconds % 3600) / 60);
            horasTexto.textContent = `${hours}h ${minutes}m`;
        }

        updateUI();
        setInterval(updateUI, 60000); // Actualiza la vista cada minuto

        // Funcionalidad del botón Entrar/Salir de servicio
        btnFichaje.addEventListener('click', async function() {
            btnFichaje.disabled = true;
            btnFichaje.textContent = 'Actualizando...';

            if (!miData.enServicio) {
                miData.enServicio = true;
                miData.clockInTime = Date.now();
            } else {
                const now = Date.now();
                const workedSeconds = Math.floor((now - miData.clockInTime) / 1000);
                miData.totalSeconds += workedSeconds;
                miData.enServicio = false;
                miData.clockInTime = null;
            }

            // Guardar horas en Supabase
            await supabase.from('fichajes').update({
                enServicio: miData.enServicio,
                clockInTime: miData.clockInTime,
                totalSeconds: miData.totalSeconds
            }).eq('user_id', sessionUser);

            btnFichaje.disabled = false;
            updateUI();
        });

        // Funcionalidad de Cerrar Sesión
        btnLogout.addEventListener('click', async function() {
            if (miData.enServicio) {
                const workedSeconds = Math.floor((Date.now() - miData.clockInTime) / 1000);
                miData.totalSeconds += workedSeconds;
                miData.enServicio = false;
                miData.clockInTime = null;
                
                await supabase.from('fichajes').update({
                    enServicio: miData.enServicio,
                    clockInTime: miData.clockInTime,
                    totalSeconds: miData.totalSeconds
                }).eq('user_id', sessionUser);
                
                alert("Has sido desfichado automáticamente al cerrar sesión para guardar tus horas.");
            }
            localStorage.clear();
            window.location.href = 'portal.html';
        });
    }

    // --- 4. LÓGICA DEL DESPACHO DE DIRECTIVA (panel-directiva.html) ---
    const panelDirectiva = document.getElementById('panel-directiva');
    if (panelDirectiva) {
        const sessionRole = localStorage.getItem('weazel_role');

        // Protección de ruta
        if (sessionRole !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        const tbodyEmpleados = document.getElementById('lista-empleados');
        const contadorEmpleados = document.getElementById('contador-empleados');
        const formNuevoEmpleado = document.getElementById('form-nuevo-empleado');

        async function cargarTablaEmpleados() {
            tbodyEmpleados.innerHTML = '<tr><td colspan="5">Cargando datos desde usuarios.json y Supabase...</td></tr>';
            
            // 1. Obtener horas de Supabase
            let mapaHoras = {};
            try {
                const { data: empleadosDB, error } = await supabase.from('fichajes').select('*');
                if (empleadosDB) {
                    empleadosDB.forEach(emp => { mapaHoras[emp.user_id] = emp; });
                }
            } catch (err) {
                console.error("No se pudo conectar con Supabase para las horas:", err);
            }

            // 2. Obtener lista de empleados del JSON
            let usuariosBase = [];
            try {
                const urlSinCache = 'usuarios.json?t=' + new Date().getTime();
                const respuesta = await fetch(urlSinCache, { cache: 'no-store' });
                
                if (respuesta.ok) {
                    usuariosBase = await respuesta.json();
                } else {
                    console.error("No se pudo encontrar el archivo usuarios.json");
                }
            } catch (e) {
                console.error("Error al leer el JSON:", e);
            }

            tbodyEmpleados.innerHTML = '';
            let total = 0;

            // 3. Cruzar datos (Usuarios JSON + Horas Supabase)
            usuariosBase.forEach(u => {
                if (u.rol && u.rol.toLowerCase() === 'empleado') {
                    total++;
                    let dataHoras = mapaHoras[u.user] || { enServicio: false, clockInTime: null, totalSeconds: 0 };
                    
                    let activeSeconds = 0;
                    if (dataHoras.enServicio && dataHoras.clockInTime) {
                        activeSeconds = Math.floor((Date.now() - dataHoras.clockInTime) / 1000);
                    }
                    const totalSecs = (dataHoras.totalSeconds || 0) + activeSeconds;
                    const hours = Math.floor(totalSecs / 3600);
                    const minutes = Math.floor((totalSecs % 3600) / 60);

                    const estado = dataHoras.enServicio ? '🟢 Trabajando' : '⚫ Libre';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${u.nombre}</strong><br><small style="color:gray;">${u.user}</small></td>
                        <td style="color: gray;">${u.pass}</td>
                        <td>${estado}</td>
                        <td style="color: var(--rojo-weazel); font-weight: bold;">${hours}h ${minutes}m</td>
                        <td><button class="btn btn-sm" disabled style="opacity:0.5;" title="Edita el archivo JSON para modificar">Protegido</button></td>
                    `;
                    tbodyEmpleados.appendChild(tr);
                }
            });
            
            if (total === 0) {
                tbodyEmpleados.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ffaa00;">No se encontraron empleados en usuarios.json</td></tr>';
            }
            
            contadorEmpleados.textContent = total;
        }

        // Cargar tabla al entrar
        cargarTablaEmpleados();

        // Intentar registrar un nuevo empleado
        if (formNuevoEmpleado) {
            formNuevoEmpleado.addEventListener('submit', function(e) {
                e.preventDefault();
                // Explicación: JS Frontend no puede editar archivos físicos por seguridad.
                alert('⚠️ Para crear un nuevo empleado de forma permanente y segura, debes añadirlo manualmente en el archivo "usuarios.json" usando tu editor de código. El sistema usa ese archivo como única base de datos para los usuarios.');
                this.reset();
            });
        }

        // Cerrar sesión directiva
        document.getElementById('btn-logout-dir').addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'portal.html';
        });
    }

    // --- 5. LÓGICA DEL BUZÓN ANÓNIMO Y ANUNCIOS (EmailJS) ---

// Buzón Anónimo (portal.html)
const formBuzon = document.getElementById('form-buzon');
if (formBuzon) {
    formBuzon.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita que la página se recargue
        
        const btnSubmit = this.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Enviando...'; 
        btnSubmit.disabled = true; // Bloquea el botón para evitar doble envío

        // Asegúrate de que estos IDs son los correctos en tu cuenta de EmailJS
        emailjs.sendForm('service_a6y2ih9', 'template_9887dpi', this)
            .then(() => {
                alert('¡El chivatazo ha sido enviado de forma anónima a la redacción!');
                this.reset(); // Limpia el formulario
            })
            .catch((err) => {
                alert('Hubo un error al enviar el correo. Revisa la consola.');
                console.error("Error de EmailJS:", err);
            })
            .finally(() => {
                // Pase lo que pase (éxito o error), restaura el botón
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            });
    });
}

// Publicar Anuncio (anuncios.html)
const formBuzon1 = document.getElementById('form-buzon1');
if (formBuzon1) {
    formBuzon1.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const btnSubmit = this.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Enviando...'; 
        btnSubmit.disabled = true;

        // Asegúrate de que estos IDs son los correctos en tu cuenta de EmailJS
        emailjs.sendForm('service_a6y2ih9', 'template_dh8tpdk', this)
            .then(() => {
                alert('¡Tu solicitud de anuncio ha sido enviada con éxito!');
                this.reset();
            })
            .catch((err) => {
                alert('Hubo un error al enviar el correo. Revisa la consola.');
                console.error("Error de EmailJS:", err);
            })
            .finally(() => {
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            });
    });
}
// --- 6. LÓGICA DEL BUZÓN DE SUGERENCIAS (EmailJS) ---

const formSugerencias = document.getElementById('form-sugerencias');
if (formSugerencias) {
    formSugerencias.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const btnSubmit = this.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Enviando...'; 
        btnSubmit.disabled = true;

        // NOTA: Reemplaza 'template_sugerencias' con el ID real de la plantilla que crees en EmailJS
        // El Service ID ('service_a6y2ih9') es el mismo que ya usabas en los otros formularios.
        emailjs.sendForm('service_a6y2ih9', 'template_dh8tpdk', this)
            .then(() => {
                alert('¡Gracias por tu aportación! Tu sugerencia ha sido enviada a la directiva de Weazel News.');
                this.reset();
            })
            .catch((err) => {
                alert('Hubo un error al enviar tu sugerencia. Por favor, inténtalo más tarde.');
                console.error("Error de EmailJS:", err);
            })
            .finally(() => {
                btnSubmit.textContent = textoOriginal;
                btnSubmit.disabled = false;
            });
    });
}
});