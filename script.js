// === script.js (Versión Optimizada para GitHub Pages) ===
document.addEventListener('DOMContentLoaded', () => {

    // === 1. CONFIGURACIÓN DE SUPABASE ===
    const SUPABASE_URL = 'https://zokaarirkqourkkfmkso.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // === 2. LÓGICA DE INICIO DE SESIÓN ===
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            const uIn = document.getElementById('login-user').value.trim().toLowerCase();
            const pIn = document.getElementById('login-pass').value.trim();
            
            try {
                // El "?t=" evita el caché agresivo de GitHub Pages para que siempre lea los nuevos usuarios
                const res = await fetch('usuarios.json?t=' + new Date().getTime());
                const db = await res.json();
                
                // Búsqueda flexible (permite escribir "Adrian Blackwood" o "adrian_blackwood")
                const emp = db.find(u => 
                    (u.user.toLowerCase() === uIn || u.user.toLowerCase().replace('_', ' ') === uIn) 
                    && u.pass === pIn
                );

                if (emp) {
                    btnSubmit.textContent = 'CARGANDO...';
                    btnSubmit.disabled = true;

                    localStorage.setItem('weazel_session', emp.nombre);
                    localStorage.setItem('weazel_role', emp.rol);
                    
                    // Sincronizar con Supabase
                    try {
                        const { data: existe } = await supabaseClient.from('fichajes').select('nombre').eq('nombre', emp.nombre).single();
                        if (!existe) {
                            await supabaseClient.from('fichajes').insert([{ nombre: emp.nombre, segundos: 0 }]);
                        }
                    } catch(err) {
                        console.log("Creando nuevo registro en DB...");
                    }
                    
                    // Redirigir (Asegúrate de que los nombres de archivo en GitHub estén todo en minúsculas)
                    window.location.href = emp.rol === 'admin' ? 'panel-directiva.html' : 'panel-empleado.html';
                } else {
                    alert('❌ Usuario o contraseña incorrectos.');
                }
            } catch (error) {
                console.error("Error al leer usuarios.json en GitHub:", error);
                alert("Hubo un problema de conexión con el servidor. Recarga la página.");
            }
        };
    }

    // === 3. LÓGICA DEL PANEL DE EMPLEADO ===
    const panelFichaje = document.getElementById('panel-fichaje');
    if (panelFichaje) {
        const nombre = localStorage.getItem('weazel_session');
        const btn = document.getElementById('btn-fichaje');
        
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

        if(btn) {
            btn.onclick = async () => {
                btn.disabled = true;
                const { data } = await supabaseClient.from('fichajes').select('*').eq('nombre', nombre).single();
                if (data && data.en_servicio) {
                    const diff = Math.floor((Date.now() - new Date(data.entrada)) / 1000);
                    await supabaseClient.from('fichajes').update({ 
                        en_servicio: false, 
                        segundos: data.segundos + diff 
                    }).eq('nombre', nombre);
                } else if (data) {
                    await supabaseClient.from('fichajes').update({ 
                        en_servicio: true, 
                        entrada: new Date().toISOString() 
                    }).eq('nombre', nombre);
                }
                await refrescar();
                btn.disabled = false;
            };
        }
        refrescar();

        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                localStorage.removeItem('weazel_session');
                localStorage.removeItem('weazel_role');
                window.location.href = 'portal.html';
            };
        }
    }

    // === 4. LÓGICA DEL PANEL DE DIRECTIVA ===
    const panelDir = document.getElementById('panel-directiva');
    if (panelDir) {
        if (localStorage.getItem('weazel_role') !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        async function cargarGlobal() {
            const { data: fichajes } = await supabaseClient.from('fichajes').select('*');
            // Cargar usuarios con bypass de caché
            const res = await fetch('usuarios.json?t=' + new Date().getTime());
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
                    <td><button onclick="resetear('${u.nombre}')" class="btn btn-sm" style="border-color:var(--rojo-weazel); color:var(--rojo-weazel);">Reset</button></td>
                `;
                lista.appendChild(fila);
            });

            const contadorElem = document.getElementById('contador-empleados');
            if (contadorElem) contadorElem.innerText = contador;
        }

        window.resetear = async (n) => {
            if (confirm(`¿Estás seguro de resetear las horas de ${n} a cero?`)) {
                await supabaseClient.from('fichajes').update({ segundos: 0 }).eq('nombre', n);
                cargarGlobal();
            }
        };

        const btnLogoutDir = document.getElementById('btn-logout-dir');
        if (btnLogoutDir) {
            btnLogoutDir.onclick = () => {
                localStorage.removeItem('weazel_session');
                localStorage.removeItem('weazel_role');
                window.location.href = 'portal.html';
            };
        }

        cargarGlobal();
    }

    // === 5. BUZÓN ANÓNIMO ===
    const formBuzon = document.getElementById('form-buzon');
    if (formBuzon) {
        formBuzon.onsubmit = function(e) {
            e.preventDefault(); 
            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.textContent = 'Enviando...'; 
            btnSubmit.disabled = true;

            if(typeof emailjs !== 'undefined') {
                emailjs.sendForm('service_a6y2ih9', 'template_9887dpi', this)
                    .then(() => {
                        alert('¡El chivatazo ha sido enviado de forma anónima!');
                        this.reset();
                        btnSubmit.textContent = 'Enviar Correo a Redacción';
                        btnSubmit.disabled = false;
                    }, (err) => {
                        alert('Error al enviar el correo. Revisa la consola.');
                        btnSubmit.disabled = false;
                    });
            }
        };
    }
});