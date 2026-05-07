# 🏗️ Arquitectura Técnica — WZN / Weazel News

Este documento describe la arquitectura técnica del proyecto, el flujo de datos entre sus componentes y las decisiones de diseño adoptadas.

---

## 📐 Visión general

WZN es un **sitio web estático puro**: no existe ningún servidor de aplicaciones propio, ni framework de frontend, ni proceso de compilación. Todo el proyecto consiste en archivos `HTML`, `CSS` y `JS` que el navegador consume directamente.

```
Navegador del usuario
        │
        │ HTTP GET (servidor estático o Live Server)
        ▼
┌─────────────────────────────────────────────────────┐
│  Archivos estáticos (HTML + CSS + JS + imágenes)    │
│                                                      │
│  style.css ◄──── Todas las páginas HTML             │
│  script.js ◄──── Todas las páginas HTML             │
│  usuarios.json ◄── script.js (fetch en login)       │
└─────────────────────────────────────────────────────┘
        │                    │
        │ SDK CDN             │ SDK CDN
        ▼                    ▼
  ┌──────────┐         ┌──────────┐
  │ Supabase │         │ EmailJS  │
  │ (fichajes│         │(formularios│
  │  y horas)│         │ por correo)│
  └──────────┘         └──────────┘
```

---

## 🗂️ Capas del sistema

### Capa 1 — Presentación (HTML)

Cada página del sitio es un archivo `.html` independiente. Todas las páginas comparten:

- El mismo archivo `style.css` para estilos.
- El mismo archivo `script.js` para lógica.
- La misma barra de navegación (`<nav>`), replicada manualmente en cada página.
- El mismo pie de página (`<footer>`), replicado manualmente en cada página.

> **Por qué no hay componentes compartidos:** al ser un sitio estático sin ningún proceso de build, no hay sistema de plantillas. La repetición de `<nav>` y `<footer>` en cada HTML es la solución adoptada.

### Capa 2 — Estilos (CSS)

Todo el CSS del proyecto reside en un único archivo: `style.css`. Está organizado en secciones comentadas:

| Sección CSS | Qué estiliza |
|---|---|
| Variables CSS (`:root`) | Colores globales reutilizables |
| Reset global | `margin`, `padding`, `box-sizing` |
| Navegación (`nav`) | Barra superior sticky roja |
| Header / última hora | Cabecera con imagen de fondo |
| Secciones comunes (`main`, `section`) | Contenedor de contenido |
| Grid y tarjetas (`.grid`, `.card`) | Layout de contenido en rejilla |
| Botones (`.btn`) | Estilos de botones CTA |
| Formularios (`input`, `textarea`) | Estilo oscuro coherente |
| Footer | Pie de página negro |
| Banner de cookies | Panel inferior fijo de consentimiento |
| Panel de empleado (`.horas-box`) | Caja de contador de horas |
| Panel de directiva (`.tabla-empleados`) | Tabla de plantilla |
| Tarifas (`.precio-lista`, `.precio-tag`) | Componentes de precios |
| Menú desplegable (`.dropdown`) | Submenú "Contenido ▼" |
| Galería TV (`.accordion-btn`, `.tv-*`) | Visor acordeón + carrusel |
| Animaciones de página | Transiciones `page-enter` / `page-exit` |

Las variables globales de color son:

```css
--rojo-weazel: #d32f2f    /* Rojo principal de marca */
--rojo-oscuro: #9a0007    /* Rojo oscuro para hover */
--negro-fondo: #0a0a0a    /* Fondo general de la web */
--gris-oscuro: #1a1a1a    /* Fondo de tarjetas */
--texto-blanco: #ffffff   /* Texto principal */
--texto-gris:   #b0b0b0   /* Texto secundario / subtítulos */
```

### Capa 3 — Lógica (JavaScript)

Todo el JavaScript reside en un único archivo: `script.js`. Se ejecuta en cada página gracias a la etiqueta `<script src="script.js">` en el `<head>`. Internamente está dividido en **módulos lógicos**:

| Módulo (líneas aprox.) | Función |
|---|---|
| Banner de cookies (1–178) | Gestión de consentimiento, carga condicional de SDKs |
| Animaciones de página (180–215) | Transiciones `page-enter` / `page-exit` |
| Login (217–277) | Autenticación contra `usuarios.json` |
| Panel de empleado (279–399) | Fichaje entrada/salida, persistencia en Supabase |
| Panel de directiva (401–555) | Tabla de empleados, reset de horas |
| Formularios EmailJS (557–675) | Buzón anónimo, anuncios y sugerencias |
| Galería (677–720) | Acordeón y carrusel TV |

Cada módulo comprueba primero si su elemento HTML principal existe antes de ejecutarse, por lo que en páginas que no los necesitan simplemente no hace nada.

### Capa 4 — Datos (usuarios.json + Supabase)

El proyecto usa **dos fuentes de datos**:

#### `usuarios.json` — Lista de empleados
Archivo JSON local que contiene la lista de usuarios con sus credenciales y roles. Es leído mediante `fetch()` en el momento del login. **No se modifica desde el cliente.**

#### Supabase — Fichajes y horas
Base de datos PostgreSQL en la nube (gestionada por Supabase). Solo se usa para la tabla `fichajes`. El cliente se conecta directamente desde el navegador mediante la clave publicable (`publishable key`).

---

## 🔄 Flujos de datos principales

### Flujo de login

```
[portal.html]
     │
     │ Usuario envía formulario
     ▼
[script.js → formLogin listener]
     │
     ├─ fetch('usuarios.json?t=timestamp')
     │         │
     │    ┌────┴────────────────────────────┐
     │    │ ¿user y pass coinciden?         │
     │    │                                 │
     │    SÍ                               NO
     │    │                                 │
     │    ├─ localStorage.setItem(...)       └─ alert('Credenciales incorrectas')
     │    │
     │    ├─ rol === 'admin' → redirect panel-directiva.html
     │    └─ rol === 'empleado' → redirect panel-empleado.html
```

### Flujo de fichaje (empleado)

```
[panel-empleado.html]
     │
     ▼
[script.js → panelFichaje]
     │
     ├─ Comprueba cookies aceptadas
     ├─ Comprueba localStorage (sesión activa y rol === 'empleado')
     ├─ supabase.from('fichajes').select().eq('user_id', sessionUser)
     │         │
     │    ┌────┴──────────────────┐
     │    │ ¿Existe fila?         │
     │    SÍ                     NO (código PGRST116)
     │    │                       │
     │    └─── carga datos ────── supabase.insert([{user_id, ...}])
     │
     │ Usuario pulsa botón ENTRAR/SALIR
     ▼
     ├─ enServicio=false → clockInTime=Date.now(), enServicio=true
     │  (ENTRADA)
     │
     └─ enServicio=true → workedSecs=now-clockInTime, totalSeconds+=workedSecs, enServicio=false
        (SALIDA)
              │
              ▼
        supabase.from('fichajes').update({...}).eq('user_id', sessionUser)
```

### Flujo de formulario EmailJS

```
[portal.html / anuncios.html / sugerencias.html]
     │
     │ Usuario envía formulario
     ▼
[script.js → form listener]
     │
     ├─ ¿Cookies aceptadas? → NO → alert y abort
     │
     ├─ cookieManager.initEmailJs()
     │         │
     │    loadScriptOnce(CDN EmailJS)
     │    emailjs.init('ERhS_42VHBVxNpsCQ')
     │
     └─ emailjs.sendForm(serviceId, templateId, formElement)
              │
         ┌────┴────┐
         │ API EmailJS (nube) │
         └────┬────┘
              │
         Envío al buzón de correo configurado en EmailJS
```

---

## 🔒 Sistema de protección de rutas

Los paneles internos se protegen desde el cliente comparando el `localStorage`:

| Página | Condición de acceso | Redirección si falla |
|---|---|---|
| `panel-empleado.html` | `weazel_role === 'empleado'` | `portal.html` |
| `panel-directiva.html` | `weazel_role === 'admin'` | `portal.html` |

> **Limitación:** esta protección es solo visual/UX. Un usuario técnico podría saltarla manipulando `localStorage` directamente. Para datos sensibles, esta solución no es suficiente.

---

## 🍪 Arquitectura del sistema de cookies

El sistema de consentimiento de cookies está implementado como una **IIFE** (función auto-invocada) al inicio de `script.js`, que corre antes que cualquier otro código:

```
IIFE de cookies (ejecuta inmediatamente)
     │
     ├─ getCookieConsent() → lee localStorage['wzn_cookie_consent']
     │
     ├─ Si 'accepted' → enableAcceptedServices()
     │         │
     │    ├─ loadScriptOnce(EmailJS CDN)  → Promise
     │    └─ loadScriptOnce(Supabase CDN) → Promise
     │         │
     │    Promise.allSettled([...]) → ejecuta pendingAcceptCallbacks[]
     │
     ├─ Si 'rejected' → clearFunctionalStorage()
     │         │
     │    localStorage.removeItem('weazel_session')
     │    localStorage.removeItem('weazel_role')
     │    localStorage.removeItem('weazel_nombre')
     │    Elimina todas las claves 'sb-*' de localStorage
     │
     └─ Si null (sin preferencia) → showBanner()
               │
          Banner insertado en el DOM
          Botón Aceptar → setCookieConsent('accepted') → enableAcceptedServices()
          Botón Rechazar → setCookieConsent('rejected') → clearFunctionalStorage()
```

El objeto `window.wznCookieManager` expone una API pública para que el resto del código de `script.js` pueda:
- Consultar el estado del consentimiento (`getConsent`, `hasAccepted`, `hasRejected`).
- Registrar callbacks que se ejecutarán cuando el usuario acepte (`onAccept`).
- Inicializar EmailJS de forma segura (`initEmailJs`).
- Obtener el cliente de Supabase de forma segura (`getSupabaseClient`).

---

## 🎬 Arquitectura de la galería

La galería de `galeria.html` combina dos componentes:

### Acordeón
Cada reportaje está encapsulado en:
```html
<button class="accordion-btn">Título del reportaje</button>
<div class="accordion-content">
    <!-- TV Carousel aquí -->
</div>
```
Al hacer clic en el botón, `script.js` alterna la clase `active` y anima `maxHeight` del panel. Solo un botón necesita estar abierto a la vez (aunque la implementación actual permite varios abiertos simultáneamente).

### Carrusel TV
Dentro de cada panel del acordeón hay un carrusel con estructura:
```html
<div class="tv-carousel-wrapper">
    <button class="prev-btn">&#10094;</button>
    <div class="tv-track-container">   ← scrollable
        <div class="tv-track">
            <div class="tv-slide">
                <img ...>
                <div class="lower-third">  ← franja informativa tipo TV
                    <div class="lt-top">...</div>
                    <div class="lt-bottom">... ticker ...</div>
                </div>
            </div>
            <!-- más slides -->
        </div>
    </div>
    <button class="next-btn">&#10095;</button>
</div>
```
La navegación usa `scrollBy` con `behavior: 'smooth'` sobre el contenedor. No hay estado JS: el offset de scroll lo gestiona el CSS.

---

## 🌐 Animaciones de navegación

Todas las páginas tienen animaciones de entrada y salida al navegar:

1. Al cargar una página → `document.body.classList.add('page-enter')`.
2. Al hacer clic en un enlace interno → `document.body.classList.add('page-exit')` + `setTimeout(navigate, 600ms)`.
3. Al volver con el botón "atrás" del navegador → si `event.persisted`, elimina `page-exit` y añade `page-enter`.

Los estilos CSS de las clases `page-enter` y `page-exit` definen la transición visual (fade/slide).

---

## 📦 Dependencias externas (CDN)

| Librería | Versión | URL CDN | Cuándo se carga |
|---|---|---|---|
| `@supabase/supabase-js` | v2 | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Solo tras aceptar cookies |
| `@emailjs/browser` | v3 | `cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js` | Solo tras aceptar cookies |
| Google Fonts (Oswald + Roboto) | — | `fonts.googleapis.com` | Siempre (en `<link>` del CSS) |
| Google Fonts (VT323) | — | `fonts.googleapis.com` | Solo en `index.html` (botón MEAZEL) y páginas MEAZEL |

---

## 📝 Decisiones de diseño notables

| Decisión | Razón |
|---|---|
| Sin framework JS | El sitio no necesita reactividad compleja; vanilla JS es suficiente y elimina dependencias de build |
| Un único `script.js` | Simplifica el despliegue; el código de cada página se activa condicionalmente comprobando si existe su elemento HTML |
| Un único `style.css` | Consistencia visual global sin gestionar imports complejos |
| Usuarios en JSON local | No requiere backend; suficiente para un entorno RP controlado |
| Supabase para fichajes | Ofrece base de datos real-time gratuita sin necesitar servidor propio |
| EmailJS para formularios | Permite enviar emails desde el cliente sin backend SMTP |
| Carga condicional de SDKs | Cumple normativa de cookies: los SDKs de terceros no se descargan hasta que el usuario los autoriza |
