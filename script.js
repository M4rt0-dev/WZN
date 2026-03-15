// === script.js ===
document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. INICIALIZAR SUPABASE ---
    const supabaseUrl = 'TU_URL_DE_SUPABASE';
    const supabaseKey = 'TU_ANON_KEY_DE_SUPABASE';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- LÓGICA DE INICIO DE SESIÓN (portal.html) ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usuarioInput = document.getElementById('login-user').value.trim();
            const passInput = document.getElementById('login-pass').value.trim();
            
            try {
                const respuesta = await fetch('usuarios.json');
                if (!respuesta.ok) throw new Error('No se pudo acceder al archivo de usuarios.');
                
                const usuarios = await respuesta.json();
                const empleadoValido = usuarios.find(emp => emp.user === usuarioInput && emp.pass === passInput);

                if (empleadoValido) {
                    localStorage.setItem('weazel_session', empleadoValido.user);
                    localStorage.setItem('weazel_role', empleadoValido.rol);
                    localStorage.setItem('weazel_nombre', empleadoValido.nombre);
                    
                    if (empleadoValido.rol === 'admin') window.location.href = 'panel-directiva.html';
                    else if (empleadoValido.rol === 'empleado') window.location.href = 'panel-empleado.html';
                } else {
                    alert('❌ Credenciales incorrectas. Comprueba tu usuario y contraseña.');
                }
            } catch (error) {
                console.error("Error en el login:", error);
                alert('⚠️ Error de conexión con la base de datos de usuarios.');
            }
        });
    }

    // --- LÓGICA DEL PANEL DE EMPLEADO (panel-empleado.html) ---
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const sessionUser = localStorage.getItem('weazel_session');
        const sessionRole = localStorage.getItem('weazel_role');
        const sessionNombre = localStorage.getItem('weazel_nombre') || sessionUser;
        
        if (!sessionUser || sessionRole !== 'empleado') {
            window.location.href = 'portal.html';
            return;
        }

        document.getElementById('nombre-empleado-display').textContent = sessionNombre;

        // 1. Cargar datos del empleado desde Supabase
        let miData = { user_id: sessionUser, enServicio: false, clockInTime: null, totalSeconds: 0 };
        
        const { data: dbData, error: dbError } = await supabase
            .from('fichajes')
            .select('*')
            .eq('user_id', sessionUser)
            .single();

        if (dbData) {
            miData = dbData;
        } else if (dbError && dbError.code === 'PGRST116') {
            // No existe el registro, lo creamos en Supabase
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

        // Actualizar Supabase al hacer click
        btnFichaje.addEventListener('click', async function() {
            btnFichaje.disabled = true; // Evitar doble click rápido
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

            // Guardar en Supabase
            await supabase.from('fichajes').update({
                enServicio: miData.enServicio,
                clockInTime: miData.clockInTime,
                totalSeconds: miData.totalSeconds
            }).eq('user_id', sessionUser);

            btnFichaje.disabled = false;
            updateUI();
        });

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
                
                alert("Has sido desfichado al cerrar sesión para guardar tus horas en la nube.");
            }
            localStorage.clear(); // Limpia toda la sesión
            window.location.href = 'portal.html';
        });
    }

    // --- LÓGICA DEL DESPACHO DE DIRECTIVA (panel-directiva.html) ---
    const panelDirectiva = document.getElementById('panel-directiva');
    if (panelDirectiva) {
        const sessionUser = localStorage.getItem('weazel_session');
        const sessionRole = localStorage.getItem('weazel_role');

        if (sessionRole !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        const tbodyEmpleados = document.getElementById('lista-empleados');
        const contadorEmpleados = document.getElementById('contador-empleados');
        // NOTA: He eliminado el formNuevoEmpleado de aquí porque si usas usuarios.json para el login, 
        // crear cuentas en base de datos sin añadirlas al JSON rompería el inicio de sesión.

        async function cargarTablaEmpleados() {
            tbodyEmpleados.innerHTML = '<tr><td colspan="5">Cargando datos desde la nube y JSON...</td></tr>';
            
            // 1. Obtener horas de Supabase (Si hay algún error, continuamos igualmente)
            let mapaHoras = {};
            try {
                const { data: empleadosDB, error } = await supabase.from('fichajes').select('*');
                if (empleadosDB) {
                    empleadosDB.forEach(emp => { mapaHoras[emp.user_id] = emp; });
                }
            } catch (err) {
                console.error("No se pudo conectar con Supabase para las horas:", err);
            }

            // 2. Obtener plantilla de usuarios.json EVITANDO LA CACHÉ
            let usuariosBase = [];
            try {
                // Le añadimos "?t=numeros" a la URL para engañar al navegador y obligarle a leer el archivo nuevo
                const urlSinCache = 'usuarios.json?t=' + new Date().getTime();
                
                // Forzamos que no use caché
                const respuesta = await fetch(urlSinCache, { cache: 'no-store' });
                
                if (respuesta.ok) {
                    usuariosBase = await respuesta.json();
                } else {
                    console.error("No se pudo encontrar el archivo usuarios.json");
                }
            } catch (e) {
                console.error("Error fatal al leer el JSON (revisa que no falten comas):", e);
            }

            tbodyEmpleados.innerHTML = '';
            let total = 0;

            // 3. Cruzar datos y pintar tabla
            usuariosBase.forEach(u => {
                // Comprobamos que tenga rol, y lo pasamos a minúsculas por si alguien puso "Empleado"
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
                        <td><button class="btn btn-sm" disabled style="opacity:0.5;" title="Edita el JSON para borrar">Protegido</button></td>
                    `;
                    tbodyEmpleados.appendChild(tr);
                }
            });
            
            // Si después de todo, el total es 0, avisamos en pantalla
            if (total === 0) {
                tbodyEmpleados.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ffaa00;">No se encontraron empleados. Comprueba el formato de usuarios.json</td></tr>';
            }
            
            contadorEmpleados.textContent = total;
        }

        cargarTablaEmpleados();

        document.getElementById('btn-logout-dir').addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'portal.html';
        });
    }

        // Cargar tabla al iniciar
        cargarTablaEmpleados();

        // Crear un nuevo empleado (se guardará solo en el navegador)
        formNuevoEmpleado.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nuevo-nombre').value.trim();
            const pass = document.getElementById('nueva-pass').value.trim();

            let empleados = JSON.parse(localStorage.getItem('weazel_employees')) || {};
            
            if (empleados[nombre]) {
                alert('Ese reportero ya tiene una cuenta local creada.');
                return;
            }

            empleados[nombre] = {
                password: pass,
                enServicio: false,
                clockInTime: null,
                totalSeconds: 0
            };

            localStorage.setItem('weazel_employees', JSON.stringify(empleados));
            this.reset();
            cargarTablaEmpleados();
            alert(`Cuenta de empleado para ${nombre} creada exitosamente en la base local.`);
        });

        // Cerrar sesión directiva
        document.getElementById('btn-logout-dir').addEventListener('click', function() {
            localStorage.removeItem('weazel_session');
            localStorage.removeItem('weazel_role');
            localStorage.removeItem('weazel_nombre'); // Limpiamos rastro
            window.location.href = 'portal.html';
        });
    }

        // Cargar tabla al iniciar
        cargarTablaEmpleados();

        // Crear un nuevo empleado
        formNuevoEmpleado.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nuevo-nombre').value.trim();
            const pass = document.getElementById('nueva-pass').value.trim();

            let empleados = JSON.parse(localStorage.getItem('weazel_employees'));
            
            if (empleados[nombre]) {
                alert('Ese reportero ya tiene una cuenta creada.');
                return;
            }

            empleados[nombre] = {
                password: pass,
                enServicio: false,
                clockInTime: null,
                totalSeconds: 0
            };

            localStorage.setItem('weazel_employees', JSON.stringify(empleados));
            this.reset();
            cargarTablaEmpleados();
            alert(`Cuenta de empleado para ${nombre} creada exitosamente.`);
        });

        // Cerrar sesión directiva
        document.getElementById('btn-logout-dir').addEventListener('click', function() {
            localStorage.removeItem('weazel_session');
            localStorage.removeItem('weazel_role');
            window.location.href = 'portal.html';
        });
    }

    // --- LÓGICA DEL BUZÓN ANÓNIMO CON EMAILJS (portal.html) ---
    // (Mantenemos tu código de EmailJS intacto tal y como lo tenías)
    const formBuzon = document.getElementById('form-buzon');
    if (formBuzon) {
        formBuzon.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Enviando...'; 
            btnSubmit.disabled = true;

            const serviceID = 'service_a6y2ih9'; 
            const templateID = 'template_9887dpi';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    alert('¡El chivatazo ha sido enviado de forma anónima a la redacción!');
                    this.reset();
                    btnSubmit.textContent = 'Enviar Correo a Redacción';
                    btnSubmit.disabled = false;
                }, (err) => {
                    alert('Hubo un error al enviar el correo. Revisa la consola para más detalles.');
                    console.log(JSON.stringify(err));
                    btnSubmit.textContent = 'Enviar Correo a Redacción';
                    btnSubmit.disabled = false;
                });
        });
    }
    const formBuzon1 = document.getElementById('form-buzon1');
    if (formBuzon1) {
        formBuzon1.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Enviando...'; 
            btnSubmit.disabled = true;

            const serviceID = 'service_a6y2ih9'; 
            const templateID = 'template_dh8tpdk';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    alert('¡Tu correo ha sido enviado con éxito!');
                    this.reset();
                    btnSubmit.textContent = 'Enviar Correo a Redacción';
                    btnSubmit.disabled = false;
                }, (err) => {
                    alert('Hubo un error al enviar el correo. Revisa la consola para más detalles.');
                    console.log(JSON.stringify(err));
                    btnSubmit.textContent = 'Enviar Correo a Redacción';
                    btnSubmit.disabled = false;
                });
        });
    }
});
