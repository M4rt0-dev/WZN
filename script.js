// === script.js completo (Versión a prueba de balas) ===
document.addEventListener('DOMContentLoaded', () => {

    // 1. BASE DE DATOS LOCAL (Ya no necesitas el archivo usuarios.json, puedes borrarlo)
    const USUARIOS = [
        { "user": "Adrian_Blackwood", "pass": "WZN2026", "nombre": "Adrian Blackwood", "rol": "admin" },
        { "user": "Monet_Basenji", "pass": "WZN_monet", "nombre": "Monet Basenji", "rol": "admin" },
        { "user": "Elisa_Martinez", "pass": "WZN_elisa", "nombre": "Elisa Martinez", "rol": "admin" },
        { "user": "Nikki_Bouwer", "pass": "WZN_nikki", "nombre": "Nikki Bouwer", "rol": "admin" },
        { "user": "Apapurcio_Buenafuente", "pass": "WZN_apapurcio", "nombre": "Apapurcio Buenafuente", "rol": "admin" },
        { "user": "Mateo_Mancini", "pass": "WZN_mateo", "nombre": "Mateo Mancini", "rol": "admin" },
        { "user": "Benyto_Frailes", "pass": "WZN_benyto", "nombre": "Benyto Frailes", "rol": "admin" },
        { "user": "Lucy_Taylor", "pass": "WZN_lucy", "nombre": "Lucy Taylor", "rol": "empleado" }
    ];

    // 2. CONFIGURACIÓN DE SUPABASE
    const SUPABASE_URL = 'https://zokaarirkqourkkfmkso.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // 3. LÓGICA DE INICIO DE SESIÓN
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        // Usamos onsubmit para sobreescribir escuchas duplicadas
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            
            // Leemos el input y lo pasamos a minúsculas para una comprobación más flexible
            const uIn = document.getElementById('login-user').value.trim().toLowerCase();
            const pIn = document.getElementById('login-pass').value.trim();
            
            // Busca al usuario (permite escribir "Lucy Taylor" o "lucy_taylor")
            const emp = USUARIOS.find(u => 
                (u.user.toLowerCase() === uIn || u.user.toLowerCase().replace('_', ' ') === uIn) 
                && u.pass === pIn
            );

            if (emp) {
                btnSubmit.textContent = 'CARGANDO...';
                btnSubmit.disabled = true;

                localStorage.setItem('weazel_session', emp.nombre);
                localStorage.setItem('weazel_role', emp.rol);
                
                try {
                    const { data: existe } = await supabaseClient.from('fichajes').select('nombre').eq('nombre', emp.nombre).single();
                    if (!existe) {
                        await supabaseClient.from('fichajes').insert([{ nombre: emp.nombre, segundos: 0 }]);
                    }
                } catch(error) {
                    console.log("Aviso de conexión (se ignora):", error);
                }
                
                window.location.href = emp.rol === 'admin' ? 'panel-directiva.html' : 'panel-empleado.html';
            } else {
                alert('❌ Datos incorrectos. Revisa tu usuario y contraseña.');
            }
        };
    }

    // 4. LÓGICA DEL PANEL DE EMPLEADO
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
                btn.disabled = true; // Evitar clics dobles rápidos
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

    // 5. LÓGICA DEL PANEL DE DIRECTIVA
    const panelDir = document.getElementById('panel-directiva');
    if (panelDir) {
        if (localStorage.getItem('weazel_role') !== 'admin') {
            window.location.href = 'portal.html';
            return;
        }

        async function cargarGlobal() {
            const { data: fichajes } = await supabaseClient.from('fichajes').select('*');
            const lista = document.getElementById('lista-empleados');
            
            if (!lista) return;
            
            lista.innerHTML = '';
            let contador = 0;

            USUARIOS.forEach(u => {
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
            if (confirm(`¿Resetear horas de ${n}?`)) {
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

    // 6. BUZÓN ANÓNIMO
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
                        alert('Error al enviar el correo.');
                        btnSubmit.disabled = false;
                    });
            }
        };
    }
});