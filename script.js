// === script.js completo ===
document.addEventListener('DOMContentLoaded', () => {

    // === CONFIGURACIÓN DE SUPABASE ===
const SUPABASE_URL = 'https://zokaarirkqourkkfmkso.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



    // --- LÓGICA DE INICIO DE SESIÓN ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const uIn = document.getElementById('login-user').value.trim();
            const pIn = document.getElementById('login-pass').value.trim();
            
            const res = await fetch('usuarios.json');
            const db = await res.json();
            const emp = db.find(u => u.user === uIn && u.pass === pIn);

            if (emp) {
                localStorage.setItem('weazel_session', emp.nombre);
                localStorage.setItem('weazel_role', emp.rol);
                // Crear registro en la nube si no existe
                await supabase.from('fichajes').insert([{ nombre: emp.nombre, segundos: 0 }]).select();
                window.location.href = emp.rol === 'admin' ? 'panel-directiva.html' : 'panel-empleado.html';
            } else {
                alert('❌ Datos incorrectos');
            }
        });
    }

    // --- LÓGICA DEL PANEL DE EMPLEADO (Sincronizado) ---
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const nombre = localStorage.getItem('weazel_session');
        const btn = document.getElementById('btn-fichaje');
        
        async function refrescar() {
            const { data } = await supabase.from('fichajes').select('*').eq('nombre', nombre).single();
            if (data) {
                const h = Math.floor(data.segundos / 3600);
                const m = Math.floor((data.segundos % 3600) / 60);
                document.getElementById('horas-semana').innerText = `${h}h ${m}m`;
                document.getElementById('estado-servicio').innerHTML = data.en_servicio ? 
                    '<span style="color: #4caf50;">● En Servicio</span>' : '⚫ Fuera de servicio';
                btn.textContent = data.en_servicio ? 'SALIR DE SERVICIO' : 'ENTRAR DE SERVICIO';
                btn.style.backgroundColor = data.en_servicio ? '#9a0007' : '';
            }
        }

        btn.addEventListener('click', async () => {
            const { data } = await supabase.from('fichajes').select('*').eq('nombre', nombre).single();
            if (data.en_servicio) {
                const diff = Math.floor((Date.now() - new Date(data.entrada)) / 1000);
                await supabase.from('fichajes').update({ 
                    en_servicio: false, 
                    segundos: data.segundos + diff 
                }).eq('nombre', nombre);
            } else {
                await supabase.from('fichajes').update({ 
                    en_servicio: true, 
                    entrada: new Date().toISOString() 
                }).eq('nombre', nombre);
            }
            refrescar();
        });
        refrescar();
    }

    // --- LÓGICA DEL PANEL DE DIRECTIVA (Vista Global) ---
    const panelDir = document.getElementById('panel-directiva');
    if (panelDir) {
        async function cargarGlobal() {
            const { data: fichajes } = await supabase.from('fichajes').select('*');
            const res = await fetch('usuarios.json');
            const usuarios = await res.json();
            const lista = document.getElementById('lista-empleados');
            lista.innerHTML = '';

            usuarios.forEach(u => {
                const f = fichajes.find(x => x.nombre === u.nombre) || { segundos: 0 };
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${u.nombre}</td>
                    <td>${u.pass}</td>
                    <td>${f.en_servicio ? '🟢 EN SERVICIO' : '🔴 OFF'}</td>
                    <td>${(f.segundos / 3600).toFixed(2)}h</td>
                    <td><button onclick="resetear('${u.nombre}')" class="btn">Reset</button></td>
                `;
                lista.appendChild(fila);
            });
        }
        window.resetear = async (n) => {
            await supabase.from('fichajes').update({ segundos: 0 }).eq('nombre', n);
            cargarGlobal();
        };
        cargarGlobal();
    }


    // --- INICIALIZAR BASE DE DATOS LOCAL ---
    if (!localStorage.getItem('weazel_employees')) {
        localStorage.setItem('weazel_employees', JSON.stringify({}));
    }

    // --- LÓGICA DEL PANEL DE DIRECTIVA (panel-directiva.html) ---
    const panelDirectiva = document.getElementById('panel-directiva');
    if (panelDirectiva) {
        if (localStorage.getItem('weazel_role') !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        // FUNCIÓN ASÍNCRONA PARA ACTUALIZAR LA LISTA DESDE EL JSON
        async function actualizarListaEmpleados() {
            const lista = document.getElementById('lista-empleados');
            if (!lista) return;

            try {
                const respuesta = await fetch('usuarios.json');
                const usuariosJSON = await respuesta.json();
                const empleadosFichaje = JSON.parse(localStorage.getItem('weazel_employees')) || {};

                lista.innerHTML = '';
                let contador = 0;

                usuariosJSON.forEach(emp => {
                    contador++;
                    const datosFichaje = empleadosFichaje[emp.nombre] || { enServicio: false, totalSeconds: 0 };
                    const estado = datosFichaje.enServicio ? 
                        '<span style="color: #4caf50;">● En Servicio</span>' : 
                        '<span style="color: #f44336;">○ Fuera de Servicio</span>';
                    const horas = (datosFichaje.totalSeconds / 3600).toFixed(2);

                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${emp.nombre} <br><small style="color:var(--texto-gris)">(${emp.rol})</small></td>
                        <td>${emp.pass}</td>
                        <td>${estado}</td>
                        <td>${horas}h</td>
                        <td>
                            <button class="btn" style="background:var(--rojo-oscuro); padding:5px 10px;" 
                                onclick="resetearHoras('${emp.nombre}')">Resetear</button>
                        </td>
                    `;
                    lista.appendChild(fila);
                });

                document.getElementById('contador-empleados').innerText = contador;
            } catch (error) {
                console.error("Error al listar empleados:", error);
            }
        }

        window.resetearHoras = function(nombre) {
            if (confirm(`¿Resetear horas de ${nombre}?`)) {
                let empleados = JSON.parse(localStorage.getItem('weazel_employees'));
                if (empleados[nombre]) {
                    empleados[nombre].totalSeconds = 0;
                    localStorage.setItem('weazel_employees', JSON.stringify(empleados));
                    actualizarListaEmpleados();
                }
            }
        };

        document.getElementById('btn-logout-dir').addEventListener('click', () => {
            localStorage.removeItem('weazel_session');
            localStorage.removeItem('weazel_role');
            window.location.href = 'portal.html';
        });

        actualizarListaEmpleados();
    }

    // --- LÓGICA DEL BUZÓN ANÓNIMO (EmailJS) ---
    const formBuzon = document.getElementById('form-buzon');
    if (formBuzon) {
        formBuzon.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Enviando...'; 
            btnSubmit.disabled = true;

            emailjs.sendForm('service_a6y2ih9', 'template_9887dpi', this)
                .then(() => {
                    alert('¡El chivatazo ha sido enviado de forma anónima!');
                    this.reset();
                    btnSubmit.textContent = 'Enviar Correo a Redacción';
                    btnSubmit.disabled = false;
                }, (err) => {
                    alert('Error al enviar el correo.');
                    btnSubmit.disabled = false;
                });
        });
    }
});