// === script.js completo ===
document.addEventListener('DOMContentLoaded', () => {

    // === CONFIGURACIÓN DE SUPABASE ===
    const SUPABASE_URL = 'https://zokaarirkqourkkfmkso.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
    // Usamos supabaseClient para evitar colisiones con window.supabase
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- LÓGICA DE INICIO DE SESIÓN ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const uIn = document.getElementById('login-user').value.trim();
            const pIn = document.getElementById('login-pass').value.trim();
            
            try {
                const res = await fetch('usuarios.json');
                const db = await res.json();
                const emp = db.find(u => u.user === uIn && u.pass === pIn);

                if (emp) {
                    localStorage.setItem('weazel_session', emp.nombre);
                    localStorage.setItem('weazel_role', emp.rol);
                    
                    // Comprobar si el registro en la nube ya existe
                    const { data: existe } = await supabaseClient.from('fichajes').select('nombre').eq('nombre', emp.nombre).single();
                    
                    if (!existe) {
                        await supabaseClient.from('fichajes').insert([{ nombre: emp.nombre, segundos: 0 }]);
                    }
                    
                    // Redirigir según el rol
                    window.location.href = emp.rol === 'admin' ? 'panel-directiva.html' : 'panel-empleado.html';
                } else {
                    alert('❌ Datos incorrectos');
                }
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                alert("Hubo un problema. Revisa la consola o asegúrate de usar Live Server.");
            }
        });
    }

    // --- LÓGICA DEL PANEL DE EMPLEADO (Sincronizado) ---
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const nombre = localStorage.getItem('weazel_session');
        const btn = document.getElementById('btn-fichaje');
        
        // Mostrar el nombre del empleado en la interfaz
        const nombreDisplay = document.getElementById('nombre-empleado-display');
        if (nombreDisplay) nombreDisplay.innerText = nombre;
        
        async function refrescar() {
            const { data } = await supabaseClient.from('fichajes').select('*').eq('nombre', nombre).single();
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
            const { data } = await supabaseClient.from('fichajes').select('*').eq('nombre', nombre).single();
            if (data.en_servicio) {
                const diff = Math.floor((Date.now() - new Date(data.entrada)) / 1000);
                await supabaseClient.from('fichajes').update({ 
                    en_servicio: false, 
                    segundos: data.segundos + diff 
                }).eq('nombre', nombre);
            } else {
                await supabaseClient.from('fichajes').update({ 
                    en_servicio: true, 
                    entrada: new Date().toISOString() 
                }).eq('nombre', nombre);
            }
            refrescar();
        });
        refrescar();

        // Lógica para cerrar sesión del empleado
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                localStorage.removeItem('weazel_session');
                localStorage.removeItem('weazel_role');
                window.location.href = 'portal.html';
            });
        }
    }

    // --- LÓGICA DEL PANEL DE DIRECTIVA (Vista Global Sincronizada) ---
    const panelDir = document.getElementById('panel-directiva');
    if (panelDir) {
        // Protección de ruta: Solo admins
        if (localStorage.getItem('weazel_role') !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        async function cargarGlobal() {
            const { data: fichajes } = await supabaseClient.from('fichajes').select('*');
            const res = await fetch('usuarios.json');
            const usuarios = await res.json();
            const lista = document.getElementById('lista-empleados');
            
            if (!lista) return;
            
            lista.innerHTML = '';
            let contador = 0;

            usuarios.forEach(u => {
                contador++;
                const f = (fichajes && fichajes.find(x => x.nombre === u.nombre)) || { segundos: 0, en_servicio: false };
                const fila = document.createElement('tr');
                
                const estado = f.en_servicio ? 
                    '<span style="color: #4caf50;">● En Servicio</span>' : 
                    '<span style="color: #f44336;">○ Fuera de Servicio</span>';

                fila.innerHTML = `
                    <td>${u.nombre} <br><small style="color:var(--texto-gris)">(${u.rol})</small></td>
                    <td>${u.pass}</td>
                    <td>${estado}</td>
                    <td>${(f.segundos / 3600).toFixed(2)}h</td>
                    <td><button onclick="resetear('${u.nombre}')" class="btn" style="background:var(--rojo-oscuro); padding:5px 10px;">Reset</button></td>
                `;
                lista.appendChild(fila);
            });

            // Actualizar el contador de empleados
            const contadorElem = document.getElementById('contador-empleados');
            if (contadorElem) contadorElem.innerText = contador;
        }

        window.resetear = async (n) => {
            if (confirm(`¿Resetear horas de ${n}?`)) {
                await supabaseClient.from('fichajes').update({ segundos: 0 }).eq('nombre', n);
                cargarGlobal();
            }
        };

        // Lógica para cerrar sesión del director
        const btnLogoutDir = document.getElementById('btn-logout-dir');
        if (btnLogoutDir) {
            btnLogoutDir.addEventListener('click', () => {
                localStorage.removeItem('weazel_session');
                localStorage.removeItem('weazel_role');
                window.location.href = 'portal.html';
            });
        }

        cargarGlobal();
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