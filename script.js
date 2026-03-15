// === script.js ===
document.addEventListener('DOMContentLoaded', () => {

    // --- INICIALIZAR BASE DE DATOS LOCAL ---
    // Si no existe la lista de empleados, la creamos vacía desde cero.
    if (!localStorage.getItem('weazel_employees')) {
        localStorage.setItem('weazel_employees', JSON.stringify({}));
    }

    // --- LÓGICA DE INICIO DE SESIÓN (portal.html) ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            const usuario = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value.trim();
            
            // 1. COMPROBAR SI ES LA DIRECTIVA
            if (usuario === 'DirectivaWZN' && pass === 'WZN123COntraSEna') {
                localStorage.setItem('weazel_session', 'Directiva');
                localStorage.setItem('weazel_role', 'admin');
                window.location.href = 'panel-directiva.html';
                return;
            }

            // 2. COMPROBAR SI ES UN EMPLEADO CREADO POR LA DIRECTIVA
            const empleados = JSON.parse(localStorage.getItem('weazel_employees'));
            if (empleados[usuario]) {
                if (empleados[usuario].password === pass) {
                    // Contraseña correcta
                    localStorage.setItem('weazel_session', usuario);
                    localStorage.setItem('weazel_role', 'empleado');
                    window.location.href = 'panel-empleado.html';
                } else {
                    alert('❌ Contraseña incorrecta.');
                }
            } else {
                alert('❌ Este usuario no existe. La Directiva debe crear tu cuenta primero.');
            }
        });
    }

    // --- LÓGICA DEL PANEL DE EMPLEADO (panel-empleado.html) ---
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const sessionUser = localStorage.getItem('weazel_session');
        const sessionRole = localStorage.getItem('weazel_role');
        
        // Comprobar seguridad
        if (!sessionUser || sessionRole !== 'empleado') {
            window.location.href = 'portal.html';
            return;
        }

        document.getElementById('nombre-empleado-display').textContent = sessionUser;
        let empleados = JSON.parse(localStorage.getItem('weazel_employees'));
        let miData = empleados[sessionUser];

        const btnFichaje = document.getElementById('btn-fichaje');
        const estadoTexto = document.getElementById('estado-servicio');
        const horasTexto = document.getElementById('horas-semana');
        const btnLogout = document.getElementById('btn-logout');

        function updateUI() {
            let currentSessionSeconds = 0;
            if (miData.enServicio) {
                btnFichaje.style.backgroundColor = '#4caf50';
                btnFichaje.textContent = 'SALIR DE SERVICIO';
                estadoTexto.innerHTML = '🟢 <b>' + sessionUser + '</b> está en servicio.';
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
        setInterval(updateUI, 60000); 

        btnFichaje.addEventListener('click', function() {
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
            empleados[sessionUser] = miData;
            localStorage.setItem('weazel_employees', JSON.stringify(empleados));
            updateUI();
        });

        btnLogout.addEventListener('click', function() {
            if (miData.enServicio) {
                const workedSeconds = Math.floor((Date.now() - miData.clockInTime) / 1000);
                miData.totalSeconds += workedSeconds;
                miData.enServicio = false;
                miData.clockInTime = null;
                empleados[sessionUser] = miData;
                localStorage.setItem('weazel_employees', JSON.stringify(empleados));
                alert("Has sido desfichado al cerrar sesión para guardar tus horas.");
            }
            localStorage.removeItem('weazel_session');
            localStorage.removeItem('weazel_role');
            window.location.href = 'portal.html';
        });
    }

    // --- LÓGICA DEL DESPACHO DE DIRECTIVA (panel-directiva.html) ---
    const panelDirectiva = document.getElementById('panel-directiva');
    if (panelDirectiva) {
        const sessionUser = localStorage.getItem('weazel_session');
        const sessionRole = localStorage.getItem('weazel_role');

        // Expulsar si no es la directiva
        if (sessionRole !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        const tbodyEmpleados = document.getElementById('lista-empleados');
        const formNuevoEmpleado = document.getElementById('form-nuevo-empleado');
        const contadorEmpleados = document.getElementById('contador-empleados');

        function cargarTablaEmpleados() {
            tbodyEmpleados.innerHTML = '';
            let empleados = JSON.parse(localStorage.getItem('weazel_employees'));
            let total = 0;

            for (const [nombre, data] of Object.entries(empleados)) {
                total++;
                // Calcular horas trabajadas
                let activeSeconds = 0;
                if (data.enServicio && data.clockInTime) {
                    activeSeconds = Math.floor((Date.now() - data.clockInTime) / 1000);
                }
                const totalSecs = data.totalSeconds + activeSeconds;
                const hours = Math.floor(totalSecs / 3600);
                const minutes = Math.floor((totalSecs % 3600) / 60);

                const estado = data.enServicio ? '🟢 Trabajando' : '⚫ Libre';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${nombre}</strong></td>
                    <td style="color: gray;">${data.password}</td>
                    <td>${estado}</td>
                    <td style="color: var(--rojo-weazel); font-weight: bold;">${hours}h ${minutes}m</td>
                    <td><button class="btn btn-sm btn-borrar" data-user="${nombre}">Despedir / Borrar</button></td>
                `;
                tbodyEmpleados.appendChild(tr);
            }
            contadorEmpleados.textContent = total;

            // Funcionalidad de los botones de borrar
            document.querySelectorAll('.btn-borrar').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userToDel = this.getAttribute('data-user');
                    if(confirm(`¿Estás seguro de que quieres despedir y borrar la cuenta de ${userToDel}? Se perderán todas sus horas.`)) {
                        let empDB = JSON.parse(localStorage.getItem('weazel_employees'));
                        delete empDB[userToDel];
                        localStorage.setItem('weazel_employees', JSON.stringify(empDB));
                        cargarTablaEmpleados();
                    }
                });
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