# 📜 Referencia de script.js — WZN / Weazel News

Este documento es una referencia completa de todo el código JavaScript del proyecto, que reside íntegramente en `script.js`. El archivo se divide en 7 módulos lógicos bien diferenciados.

---

## Resumen de módulos

| Módulo | Líneas aprox. | Descripción |
|---|---|---|
| [1. Banner de cookies](#1-banner-de-cookies) | 1–178 | Consentimiento, carga condicional de SDKs externos |
| [2. Animaciones de página](#2-animaciones-de-página) | 180–215 | Transiciones de entrada y salida al navegar |
| [3. Login](#3-login-portalhtml) | 217–277 | Autenticación contra `usuarios.json` |
| [4. Panel de empleado](#4-panel-de-empleado-panel-empleadohtml) | 279–399 | Fichaje de jornada con Supabase |
| [5. Panel de directiva](#5-panel-de-directiva-panel-directivahtml) | 401–555 | Gestión del equipo y reset de horas |
| [6. Formularios EmailJS](#6-formularios-emailjs) | 557–675 | Buzón anónimo, anuncios y sugerencias |
| [7. Galería](#7-galería-galeriahtml) | 677–720 | Acordeón desplegable y carrusel TV |

---

## 1. Banner de cookies

**Patrón:** IIFE (Immediately Invoked Function Expression). Se ejecuta automáticamente cuando el navegador procesa el script, antes de que el DOM esté listo.

### Constantes internas

```javascript
var COOKIE_KEY = 'wzn_cookie_consent';          // Clave en localStorage
var CONSENT_ACCEPTED = 'accepted';               // Valor si acepta
var CONSENT_REJECTED = 'rejected';               // Valor si rechaza
var EMAILJS_SRC = 'https://cdn.jsdelivr.net/...'; // URL CDN de EmailJS
var SUPABASE_SRC = 'https://cdn.jsdelivr.net/...';// URL CDN de Supabase
var pendingAcceptCallbacks = [];                  // Cola de callbacks pendientes
var loadedScripts = {};                           // Caché de scripts cargados
```

### Funciones privadas

#### `getCookieConsent() → string | null`
Lee el consentimiento actual de `localStorage`. Devuelve `'accepted'`, `'rejected'` o `null` si el usuario no ha respondido aún. Envuelto en try/catch por si el localStorage está bloqueado.

#### `setCookieConsent(value)`
Guarda la preferencia de cookies en `localStorage`. Acepta `'accepted'` o `'rejected'`. Envuelto en try/catch.

#### `hideBanner()`
Elimina el banner de cookies del DOM con `banner.remove()`.

#### `clearFunctionalStorage()`
Limpia del `localStorage` todo lo relacionado con la sesión de empleado y Supabase:
- `weazel_session`
- `weazel_role`
- `weazel_nombre`
- Todas las claves que empiecen por `sb-` (claves de Supabase)

#### `loadScriptOnce(src) → Promise`
Carga un script externo de forma asíncrona. Utiliza un objeto `loadedScripts` como caché para evitar cargar el mismo script dos veces. Comprueba también si el elemento `<script>` ya está en el DOM (atributo `data-wzn-src`).

Devuelve una `Promise` que se resuelve cuando el script carga correctamente o se rechaza si hay un error de red.

#### `ensureEmailJsReady() → Promise<boolean>`
Carga EmailJS (usando `loadScriptOnce`) e inicializa el SDK con la Public Key si aún no se ha inicializado. Usa el flag `window.__wznEmailJsInitialized` para evitar llamadas múltiples a `emailjs.init()`. Devuelve `Promise<true>` si EmailJS está disponible, `Promise<false>` si hubo algún error.

#### `ensureSupabaseReady() → Promise<boolean>`
Carga el SDK de Supabase (usando `loadScriptOnce`). Devuelve `Promise<true>` si `window.supabase` está disponible, `Promise<false>` si hubo error.

#### `enableAcceptedServices()`
Llama a `ensureEmailJsReady()` y `ensureSupabaseReady()` en paralelo con `Promise.allSettled()`. Cuando ambas promesas se resuelven (con éxito o fallo), ejecuta todos los callbacks de `pendingAcceptCallbacks[]` en orden FIFO.

#### `showBanner()`
Inyecta el HTML del banner de cookies en el `document.body`. Registra los event listeners de los botones "Aceptar" y "Rechazar". Si el banner ya existe en el DOM, no hace nada (previene duplicados).

### API pública (`window.wznCookieManager`)

El objeto global `window.wznCookieManager` expone los siguientes métodos para que el resto del código de `script.js` interactúe con el sistema de cookies:

| Método | Descripción |
|---|---|
| `getConsent()` | Devuelve el valor actual: `'accepted'`, `'rejected'` o `null` |
| `hasAccepted()` | Devuelve `true` si el consentimiento es `'accepted'` |
| `hasRejected()` | Devuelve `true` si el consentimiento es `'rejected'` |
| `onAccept(callback)` | Si ya hay aceptación, ejecuta el callback inmediatamente; si no, lo encola en `pendingAcceptCallbacks` |
| `initEmailJs()` | Llama a `ensureEmailJsReady()` y devuelve la Promise |
| `getSupabaseClient()` | Async. Devuelve el cliente singleton de Supabase o `null` si no hay consentimiento o hay error |

#### `getSupabaseClient()` en detalle

```javascript
getSupabaseClient: async function () {
    if (getCookieConsent() !== 'accepted') return null;
    
    var isSupabaseReady = await ensureSupabaseReady();
    if (!isSupabaseReady || !window.supabase) return null;
    
    // Singleton: solo crea el cliente una vez
    if (!window.__wznSupabaseClient) {
        var supabaseUrl = 'https://zokaarirkqourkkfmkso.supabase.co';
        var supabaseKey = 'sb_publishable_...';
        window.__wznSupabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
    
    return window.__wznSupabaseClient;
}
```

### Función global `window.wzn_resetCookieConsent()`

Elimina la preferencia de cookies de `localStorage` y vuelve a mostrar el banner. Se usa desde el botón "Gestionar mis preferencias" en `politica-cookies.html`.

### Listener DOMContentLoaded

Al final de la IIFE, se registra un listener en `DOMContentLoaded` que:
- Si hay consentimiento `'accepted'` → llama a `enableAcceptedServices()`.
- Si hay consentimiento `'rejected'` → llama a `clearFunctionalStorage()`.
- Si no hay preferencia (`null`) → muestra el banner con `showBanner()`.

---

## 2. Animaciones de página

**Activo en:** todas las páginas.

### Listener DOMContentLoaded

Al cargar la página, añade la clase `page-enter` al `document.body` para aplicar la animación de entrada.

Luego recorre todos los `<a href>` del documento y para cada enlace interno (que no empieza por `http`, `javascript:`, `data:`, `vbscript:` o `#`):

1. Previene la navegación por defecto (`e.preventDefault()`).
2. Añade la clase `page-exit` al `document.body`.
3. Espera 600ms (duración de la animación CSS de salida).
4. Navega a la URL del enlace con `window.location.href`.

### Listener `pageshow`

Gestiona el botón "Atrás" del navegador. Si el evento tiene `persisted = true` (página restaurada desde el caché del navegador), elimina `page-exit` y añade `page-enter`.

---

## 3. Login (`portal.html`)

**Activo en:** páginas que contengan el elemento `#form-login`.

### Precondiciones

- Se obtiene el `cookieManager` de `window.wznCookieManager`.
- Se inicializa `supabase = null`.
- Si hay cookies aceptadas, se llama a `cookieManager.getSupabaseClient()` para obtener la instancia de Supabase (necesaria en los paneles, aunque el login en sí no la usa).

### Event listener: `submit` en `#form-login`

1. **Verifica cookies:** si no hay consentimiento aceptado, muestra `alert` y termina.
2. **Lee credenciales:** obtiene los valores de `#login-user` y `#login-pass`.
3. **Fetch de usuarios:** `fetch('usuarios.json?t=' + Date.now(), { cache: 'no-store' })`. El `?t=timestamp` evita que el navegador use una versión en caché del archivo.
4. **Compara credenciales:** `usuarios.find(emp => emp.user === user && emp.pass === pass)`.
5. **Si coincide:**
   - Guarda `weazel_session`, `weazel_role` y `weazel_nombre` en `localStorage`.
   - Redirige según rol: `admin` → `panel-directiva.html`, `empleado` → `panel-empleado.html`.
6. **Si no coincide:** `alert('❌ Credenciales incorrectas...')`.
7. **Si hay error de red:** `alert('⚠️ Error de conexión...')`.

---

## 4. Panel de empleado (`panel-empleado.html`)

**Activo en:** páginas que contengan el elemento `#panel-fichaje`.

### Precondiciones y protección de ruta

```javascript
// 1. Comprueba cookies
if (!cookieManager.hasAccepted()) {
    // Muestra mensaje + botón de gestión de cookies
    return;
}

// 2. Comprueba Supabase
if (!supabase) {
    // Muestra mensaje de error
    return;
}

// 3. Comprueba sesión
const sessionUser = localStorage.getItem('weazel_session');
const sessionRole = localStorage.getItem('weazel_role');
if (!sessionUser || sessionRole !== 'empleado') {
    window.location.href = 'portal.html';
    return;
}
```

### Carga inicial de datos

```javascript
// Estado local del empleado
let miData = { user_id: sessionUser, enServicio: false, clockInTime: null, totalSeconds: 0 };

// Consulta a Supabase
const { data: dbData, error: dbError } = await supabase
    .from('fichajes').select('*').eq('user_id', sessionUser).single();

if (dbData) {
    miData = dbData;  // Si existe, sobrescribe los valores locales
} else if (dbError && dbError.code === 'PGRST116') {
    // Código PGRST116 = "no rows found" → primer login
    await supabase.from('fichajes').insert([miData]);
}
```

### Función `updateUI()`

Actualiza todos los elementos visuales del panel según el estado actual de `miData`:

- **Si `enServicio = true`:**
  - Botón verde, texto "SALIR DE SERVICIO".
  - Texto de estado: "🟢 **Nombre** está en servicio".
  - Calcula `currentSessionSeconds = (Date.now() - clockInTime) / 1000`.

- **Si `enServicio = false`:**
  - Botón rojo, texto "ENTRAR DE SERVICIO".
  - Texto de estado: "⚫ Fuera de servicio".
  - `currentSessionSeconds = 0`.

- **Contador de horas:** `totalSeconds + currentSessionSeconds` → convierte a `"Xh Ym"`.

Se llama una vez al cargar y luego mediante `setInterval(updateUI, 60000)` cada minuto.

### Event listener: clic en `#btn-fichaje`

1. Deshabilita el botón y muestra "Actualizando...".
2. **Si entrando (enServicio = false):** `enServicio = true`, `clockInTime = Date.now()`.
3. **Si saliendo (enServicio = true):** calcula segundos trabajados, suma a `totalSeconds`, `enServicio = false`, `clockInTime = null`.
4. Llama a `supabase.from('fichajes').update({...}).eq('user_id', sessionUser)`.
5. Reactiva el botón y llama a `updateUI()`.

### Event listener: clic en `#btn-logout`

1. Si `enServicio = true`: calcula segundos finales, actualiza Supabase, muestra alert de desfichaje automático.
2. Llama a `localStorage.clear()`.
3. Redirige a `portal.html`.

---

## 5. Panel de directiva (`panel-directiva.html`)

**Activo en:** páginas que contengan el elemento `#panel-directiva`.

### Precondiciones y protección de ruta

Similar al panel de empleado, pero verifica `sessionRole !== 'admin'`.

### Función `cargarTablaEmpleados()`

Función asíncrona que hace dos peticiones, cruza los datos y renderiza la tabla.

**Paso 1 — Supabase:** `SELECT * FROM fichajes`. Construye un mapa `{ user_id → datos }`.

**Paso 2 — JSON:** `fetch('usuarios.json?t=timestamp')`. Obtiene el array de usuarios.

**Paso 3 — Renderizado:** para cada usuario con `rol === 'empleado'`:
- Obtiene sus datos de horas del mapa (o usa valores por defecto si no tiene fila).
- Calcula el tiempo activo si `enServicio = true`.
- Genera una fila `<tr>` con: nombre + username, contraseña (visible, ⚠️), estado, horas, botón reset.
- Añade la fila al `<tbody id="lista-empleados">`.

Actualiza el contador `#contador-empleados` con el total de empleados encontrados.

### Delegación de eventos: botones `.btn-reset`

Después de renderizar la tabla, se seleccionan todos los `.btn-reset` y se añade un listener de clic a cada uno:

1. Obtiene `data-user` (userId) y `data-enservicio` del botón.
2. Muestra `confirm()` pidiendo confirmación.
3. Si confirma:
   - Construye `updates = { totalSeconds: 0 }`.
   - Si `enServicio = true`, añade `clockInTime: Date.now()` a `updates`.
   - Llama a `supabase.from('fichajes').update(updates).eq('user_id', userId)`.
   - Si hay error: muestra alert y reactiva el botón.
   - Si éxito: vuelve a llamar a `cargarTablaEmpleados()` para refrescar la tabla.

### Event listener: `submit` en `#form-nuevo-empleado`

Muestra un `alert` explicando que no se puede crear empleados desde el navegador y hace `reset()` del formulario. **No realiza ninguna operación real.**

### Event listener: clic en `#btn-logout-dir`

Limpia `localStorage` y redirige a `portal.html`.

---

## 6. Formularios EmailJS

**Activo en:** páginas con `#form-buzon`, `#form-buzon1` o `#form-sugerencias`.

Los tres formularios comparten exactamente el mismo patrón. Solo cambian el `templateId` y los mensajes de confirmación.

### Patrón de envío

```javascript
formElement.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Verificar cookies
    if (!cookieManager.hasAccepted()) {
        alert('Debes aceptar las cookies funcionales para enviar formularios.');
        return;
    }

    // 2. Cargar EmailJS
    const emailReady = await cookieManager.initEmailJs();
    if (!emailReady || !window.emailjs) {
        alert('No se pudo cargar el servicio de envío de formularios.');
        return;
    }
    
    // 3. Bloquear botón para evitar doble envío
    const btnSubmit = this.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Enviando...';
    btnSubmit.disabled = true;

    // 4. Enviar con EmailJS
    emailjs.sendForm('service_a6y2ih9', 'template_XXXXX', this)
        .then(() => {
            alert('¡Mensaje enviado!');
            this.reset();
        })
        .catch((err) => {
            alert('Error al enviar. Revisa la consola.');
            console.error("Error de EmailJS:", err);
        })
        .finally(() => {
            // 5. Siempre restaurar el botón
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        });
});
```

### Detalles por formulario

| ID del formulario | Página | Service ID | Template ID | Mensaje de éxito |
|---|---|---|---|---|
| `#form-buzon` | `portal.html` | `service_a6y2ih9` | `template_9887dpi` | "¡El chivatazo ha sido enviado de forma anónima a la redacción!" |
| `#form-buzon1` | `anuncios.html` | `service_a6y2ih9` | `template_dh8tpdk` | "¡Tu solicitud de anuncio ha sido enviada con éxito!" |
| `#form-sugerencias` | `sugerencias.html` | `service_a6y2ih9` | `template_dh8tpdk` | "¡Gracias por tu aportación! Tu sugerencia ha sido enviada a la directiva..." |

---

## 7. Galería (`galeria.html`)

**Activo en:** páginas con elementos `.accordion-btn` y/o `.tv-carousel-wrapper`.

### A) Acordeón desplegable

Selecciona todos los `.accordion-btn` y añade un listener de clic a cada uno:

```javascript
accordionBtn.addEventListener('click', function() {
    this.classList.toggle('active');  // Alterna clase CSS para el estilo del botón
    const content = this.nextElementSibling;  // El div .accordion-content
    
    if (content.style.maxHeight) {
        content.style.maxHeight = null;   // Cierra: anima a 0
    } else {
        content.style.maxHeight = (content.scrollHeight + 50) + "px";  // Abre
    }
});
```

El CSS anima la propiedad `max-height` con una transición suave. El `+ 50` extra de píxeles es un margen de seguridad para que el contenido del carrusel interno no quede cortado.

### B) Carrusel TV

Selecciona todos los `.tv-carousel-wrapper` y para cada uno:

```javascript
prevBtn.addEventListener('click', () => {
    trackContainer.scrollBy({
        left: -trackContainer.clientWidth,  // Desplaza un "ancho de pantalla" a la izquierda
        behavior: 'smooth'
    });
});

nextBtn.addEventListener('click', () => {
    trackContainer.scrollBy({
        left: trackContainer.clientWidth,   // Desplaza un "ancho de pantalla" a la derecha
        behavior: 'smooth'
    });
});
```

El carrusel usa `overflow-x: auto` + `scrollBy` + `scroll-snap` (CSS) para la navegación fluida. No hay estado JavaScript del índice de slide actual: el scroll del CSS lo gestiona todo.

---

## 🔍 Notas importantes de implementación

### Por qué hay un `DOMContentLoaded` al inicio (IIFE de cookies) y otro después

La IIFE de cookies se ejecuta **inmediatamente** (es una IIFE), pero el listener `DOMContentLoaded` dentro de ella se dispara cuando el DOM está listo. Esto es correcto y necesario porque el banner de cookies necesita acceder al `document.body`.

El segundo `DOMContentLoaded` (línea 217 aprox.) es el que contiene toda la lógica de negocio (login, paneles, galería, formularios). Ambos listeners son independientes y se ejecutan en el mismo evento `DOMContentLoaded`.

### Por qué `script.js` en el `<head>` y no al final del `<body>`

La etiqueta `<script src="script.js">` está en el `<head>` de cada página. El script funciona correctamente porque toda su lógica está dentro de listeners `DOMContentLoaded`, que esperan a que el DOM esté completamente cargado antes de ejecutarse. La excepción es la IIFE de cookies, que se ejecuta antes, pero solo accede al DOM dentro de su propio `DOMContentLoaded`.

### Patrón de comprobación de elementos antes de actuar

Cada módulo comprueba primero si su elemento HTML principal existe:

```javascript
const panelFichaje = document.getElementById('panel-fichaje');
if (panelFichaje) {
    // Lógica del panel de empleado
}
```

Esto es lo que permite que un único `script.js` sirva para todas las páginas sin errores en las páginas que no tienen esos elementos.
