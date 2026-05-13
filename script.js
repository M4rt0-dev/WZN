// === script.js ===

// === BANNER DE COOKIES ===
(function () {
    var COOKIE_KEY = 'wzn_cookie_consent';
    var CONSENT_ACCEPTED = 'accepted';
    var CONSENT_REJECTED = 'rejected';
    var EMAILJS_SRC = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    var SUPABASE_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    var pendingAcceptCallbacks = [];
    var loadedScripts = {};

    function getCookieConsent() {
        try {
            return localStorage.getItem(COOKIE_KEY);
        } catch (_) {
            return null;
        }
    }

    function setCookieConsent(value) {
        try {
            localStorage.setItem(COOKIE_KEY, value);
        } catch (_) {}
    }

    function hideBanner() {
        var banner = document.getElementById('wzn-cookie-banner');
        if (banner) banner.remove();
    }

    function clearFunctionalStorage() {
        try {
            localStorage.removeItem('weazel_session');
            localStorage.removeItem('weazel_role');
            localStorage.removeItem('weazel_nombre');

            Object.keys(localStorage).forEach(function (key) {
                if (key.indexOf('sb-') === 0) {
                    localStorage.removeItem(key);
                }
            });
        } catch (_) {}
    }

    function loadScriptOnce(src) {
        if (loadedScripts[src]) return loadedScripts[src];

        loadedScripts[src] = new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-wzn-src="' + src + '"]');
            if (existing) {
                resolve();
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.wznSrc = src;
            script.onload = function () { resolve(); };
            script.onerror = function () { reject(new Error('No se pudo cargar ' + src)); };
            document.head.appendChild(script);
        });

        return loadedScripts[src];
    }

    function ensureEmailJsReady() {
        return loadScriptOnce(EMAILJS_SRC)
            .then(function () {
                if (window.emailjs && !window.__wznEmailJsInitialized) {
                    window.emailjs.init('ERhS_42VHBVxNpsCQ');
                    window.__wznEmailJsInitialized = true;
                }
                return !!window.emailjs;
            })
            .catch(function () {
                return false;
            });
    }

    function ensureSupabaseReady() {
        return loadScriptOnce(SUPABASE_SRC)
            .then(function () {
                return !!window.supabase;
            })
            .catch(function () {
                return false;
            });
    }

    function enableAcceptedServices() {
        Promise.allSettled([ensureEmailJsReady(), ensureSupabaseReady()]).finally(function () {
            while (pendingAcceptCallbacks.length) {
                var cb = pendingAcceptCallbacks.shift();
                try { cb(); } catch (_) {}
            }
        });
    }

    function showBanner() {
        if (document.getElementById('wzn-cookie-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'wzn-cookie-banner';
        banner.innerHTML =
            '<p>Utilizamos cookies propias y de terceros para garantizar el funcionamiento del sitio, ' +
            'gestionar el Portal de Empleado y mejorar tu experiencia. ' +
            'Puedes aceptarlas, rechazarlas o consultar nuestra ' +
            '<a href="politica-cookies.html">Política de Cookies</a> y ' +
            '<a href="politica-privacidad.html">Política de Privacidad</a>.</p>' +
            '<div class="wzn-cookie-btns">' +
            '<button id="wzn-cookie-reject">Rechazar</button>' +
            '<button id="wzn-cookie-accept">Aceptar</button>' +
            '</div>';
        document.body.appendChild(banner);

        document.getElementById('wzn-cookie-accept').addEventListener('click', function () {
            setCookieConsent(CONSENT_ACCEPTED);
            hideBanner();
            enableAcceptedServices();
        });

        document.getElementById('wzn-cookie-reject').addEventListener('click', function () {
            setCookieConsent(CONSENT_REJECTED);
            clearFunctionalStorage();
            hideBanner();
        });
    }

    // Función global para gestionar/resetear preferencias desde la página de cookies
    window.wzn_resetCookieConsent = function () {
        try {
            localStorage.removeItem(COOKIE_KEY);
        } catch (_) {}
        showBanner();
    };

    window.wznCookieManager = {
        getConsent: getCookieConsent,
        hasAccepted: function () { return getCookieConsent() === CONSENT_ACCEPTED; },
        hasRejected: function () { return getCookieConsent() === CONSENT_REJECTED; },
        onAccept: function (callback) {
            if (typeof callback !== 'function') return;
            if (getCookieConsent() === CONSENT_ACCEPTED) {
                callback();
                return;
            }
            pendingAcceptCallbacks.push(callback);
        },
        initEmailJs: ensureEmailJsReady,
        getSupabaseClient: async function () {
            if (getCookieConsent() !== CONSENT_ACCEPTED) return null;

            var isSupabaseReady = await ensureSupabaseReady();
            if (!isSupabaseReady || !window.supabase) return null;

            if (!window.__wznSupabaseClient) {
                var supabaseUrl = 'https://zokaarirkqourkkfmkso.supabase.co';
                var supabaseKey = 'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx';
                window.__wznSupabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
            }

            return window.__wznSupabaseClient;
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        var consent = getCookieConsent();
        if (consent === CONSENT_ACCEPTED) {
            enableAcceptedServices();
        } else if (consent === CONSENT_REJECTED) {
            clearFunctionalStorage();
        } else {
            showBanner();
        }
    });
})();

// === animations.js - Manejo de animaciones de entrada y salida ===

document.addEventListener('DOMContentLoaded', function() {
    // Agregar clase de entrada cuando la página carga
    document.body.classList.add('page-enter');
    
    // Manejar clics en enlaces internos
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Solo aplicar animación de salida si es un enlace interno
            if (href && !href.startsWith('http') && !href.startsWith('javascript:') && !href.startsWith('data:') && !href.startsWith('vbscript:') && !href.startsWith('#')) {
                e.preventDefault();
                
                // Agregar clase de salida
                document.body.classList.add('page-exit');
                
                // Esperar a que termine la animación antes de navegar
                setTimeout(() => {
                    window.location.href = href;
                }, 600); // Duración de la animación de salida
            }
        });
    });
    
    // Manejar botón atrás del navegador
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            document.body.classList.remove('page-exit');
            document.body.classList.add('page-enter');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. INICIALIZAR SUPABASE ---
    const cookieManager = window.wznCookieManager || {
        hasAccepted: function () { return false; },
        initEmailJs: function () { return Promise.resolve(false); },
        getSupabaseClient: function () { return Promise.resolve(null); }
    };
    let supabase = null;

    // Solo inicializa Supabase si hay consentimiento aceptado
    if (cookieManager && cookieManager.hasAccepted()) {
        supabase = await cookieManager.getSupabaseClient();
    }
    // --- 2. LÓGICA DE INICIO DE SESIÓN (portal.html) ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!cookieManager || !cookieManager.hasAccepted()) {
                alert('Debes aceptar las cookies funcionales para iniciar sesión en el Portal de Empleado.');
                return;
            }
            
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
        if (!cookieManager || !cookieManager.hasAccepted()) {
            panelFichaje.innerHTML = '<section><div class="card"><h2>Cookies funcionales requeridas</h2><p>Para usar el panel de fichajes debes aceptar las cookies funcionales.</p><button id="wzn-open-cookie-preferences" class="btn">Gestionar cookies</button></div></section>';
            const manageBtn = document.getElementById('wzn-open-cookie-preferences');
            if (manageBtn) manageBtn.addEventListener('click', window.wzn_resetCookieConsent);
            return;
        }

        if (!supabase) {
            panelFichaje.innerHTML = '<section><div class="card"><h2>Error de conexión</h2><p>No se pudo inicializar Supabase. Revisa tu conexión y vuelve a intentarlo.</p></div></section>';
            return;
        }

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
        if (!cookieManager || !cookieManager.hasAccepted()) {
            panelDirectiva.innerHTML = '<section><div class="card"><h2>Cookies funcionales requeridas</h2><p>Para usar el panel de directiva debes aceptar las cookies funcionales.</p><button id="wzn-open-cookie-preferences" class="btn">Gestionar cookies</button></div></section>';
            const manageBtn = document.getElementById('wzn-open-cookie-preferences');
            if (manageBtn) manageBtn.addEventListener('click', window.wzn_resetCookieConsent);
            return;
        }

        if (!supabase) {
            panelDirectiva.innerHTML = '<section><div class="card"><h2>Error de conexión</h2><p>No se pudo inicializar Supabase. Revisa tu conexión y vuelve a intentarlo.</p></div></section>';
            return;
        }

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
            let usuariosBase =[];
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
                    
                    // Calcular el tiempo en servicio actual extraído de la BD
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
                        <td>
                            <button class="btn btn-sm btn-reset" data-user="${u.user}" data-enservicio="${dataHoras.enServicio}" style="background-color: var(--rojo-weazel); color: white; cursor: pointer; border:none; padding: 5px 10px; border-radius: 4px;">
                                Poner a 0
                            </button>
                        </td>
                    `;
                    tbodyEmpleados.appendChild(tr);
                }
            });
            
            if (total === 0) {
                tbodyEmpleados.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ffaa00;">No se encontraron empleados en usuarios.json</td></tr>';
            }
            
            contadorEmpleados.textContent = total;

            // 4. Lógica para los botones de Poner a 0
            const botonesReset = document.querySelectorAll('.btn-reset');
            botonesReset.forEach(btn => {
                btn.addEventListener('click', async function() {
                    const userId = this.getAttribute('data-user');
                    const enServicio = this.getAttribute('data-enservicio') === 'true';

                    if (confirm(`¿Estás seguro de que deseas poner a 0 las horas de ${userId}?`)) {
                        this.textContent = 'Actualizando...';
                        this.disabled = true;

                        // Ponemos las horas a 0. Si el empleado está en servicio en este momento, 
                        // también reseteamos su inicio de turno a AHORA para que no sume minutos atrasados.
                        const updates = { totalSeconds: 0 };
                        if (enServicio) {
                            updates.clockInTime = Date.now();
                        }

                        // Actualizar la base de datos de Supabase
                        const { error } = await supabase
                            .from('fichajes')
                            .update(updates)
                            .eq('user_id', userId);

                        if (error) {
                            console.error("Error al resetear horas:", error);
                            alert("Hubo un error al actualizar la base de datos.");
                            this.textContent = 'Poner a 0';
                            this.disabled = false;
                        } else {
                            // Volvemos a renderizar la tabla para mostrar los cambios instantáneamente
                            cargarTablaEmpleados();
                        }
                    }
                });
            });
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
    formBuzon.addEventListener('submit', async function(e) {
        e.preventDefault(); // Evita que la página se recargue

        if (!cookieManager || !cookieManager.hasAccepted()) {
            alert('Debes aceptar las cookies funcionales para enviar formularios.');
            return;
        }

        const emailReady = await cookieManager.initEmailJs();
        if (!emailReady || !window.emailjs) {
            alert('No se pudo cargar el servicio de envío de formularios. Inténtalo de nuevo.');
            return;
        }
        
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
    formBuzon1.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        if (!cookieManager || !cookieManager.hasAccepted()) {
            alert('Debes aceptar las cookies funcionales para enviar formularios.');
            return;
        }

        const emailReady = await cookieManager.initEmailJs();
        if (!emailReady || !window.emailjs) {
            alert('No se pudo cargar el servicio de envío de formularios. Inténtalo de nuevo.');
            return;
        }
        
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
    formSugerencias.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        if (!cookieManager || !cookieManager.hasAccepted()) {
            alert('Debes aceptar las cookies funcionales para enviar formularios.');
            return;
        }

        const emailReady = await cookieManager.initEmailJs();
        if (!emailReady || !window.emailjs) {
            alert('No se pudo cargar el servicio de envío de formularios. Inténtalo de nuevo.');
            return;
        }
        
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
// --- 7. LÓGICA DE LA GALERÍA FUSIONADA (ACORDEÓN + TV) ---

    // A) Funcionalidad del Acordeón Desplegable
    const accordions = document.querySelectorAll('.accordion-btn');
    
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                // Si está abierto, lo cierra
                content.style.maxHeight = null;
            } else {
                // Si está cerrado, calcula el tamaño interior para abrirlo
                // Añadimos un pequeño margen extra de seguridad para el reproductor TV
                content.style.maxHeight = (content.scrollHeight + 50) + "px";
            }
        });
    });

    // B) Funcionalidad del Carrusel TV (Botones Izquierda / Derecha)
    const carousels = document.querySelectorAll('.tv-carousel-wrapper');
    
    carousels.forEach(carousel => {
        const trackContainer = carousel.querySelector('.tv-track-container');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');

        prevBtn.addEventListener('click', () => {
            trackContainer.scrollBy({
                left: -trackContainer.clientWidth, 
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            trackContainer.scrollBy({
                left: trackContainer.clientWidth, 
                behavior: 'smooth'
            });
        });
    })
});
