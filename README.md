# 📰 WZN — Weazel News Los Santos EVO

Portal web estático de **Weazel News** para entorno roleplay: incluye contenido público (noticias, revistas, podcasts, galería, anuncios, eventos), área interna para empleados y panel de directiva con control de jornada.

## ✨ Qué incluye el proyecto

- Sitio público completo con navegación principal y páginas de contenido.
- Portal de acceso para personal con login por `usuarios.json`.
- Panel de empleado para fichaje de jornada (entrada/salida) con persistencia en Supabase.
- Panel de directiva para visualizar estado del equipo y reset de horas.
- Formularios conectados con EmailJS (buzón anónimo, anuncios y sugerencias).
- Contenido oculto tipo easter egg “MEAZEL” (storyline RP accesible por rutas específicas).

## 🗺️ Mapa de páginas

### Públicas (Weazel News)
- `index.html` — portada y accesos rápidos.
- `periodicos.html` — hemeroteca de periódicos.
- `revista.html` — revista semanal.
- `podcasts.html` — episodios en Spotify.
- `eventos.html` — calendario de eventos.
- `galeria.html` — galería visual con formato TV/acordeón.
- `equipo.html` — equipo de redacción.
- `anuncios.html` — formulario comercial para anuncios.
- `tarifas.html` — servicios y precios.
- `sugerencias.html` — formulario de sugerencias ciudadanas.
- `portal.html` — login de empleados + buzón anónimo.

### Legales
- `aviso-legal.html` — aviso legal del sitio.
- `politica-privacidad.html` — política de privacidad.
- `politica-cookies.html` — política de cookies.

### Internas (operativa)
- `panel-empleado.html` — estado de servicio, fichaje y cierre de sesión.
- `panel-directiva.html` — vista global de empleados, horas acumuladas y reseteo.

### Trama / universo oculto
- `meazel-news.html`
- `filtracion-logia.html`
- `mas-alla-de-la-fe.html`
- `pigeon-drone.html`
- `servidor-7.html`
- `expediente-admin.html`

## ⚙️ Tecnologías

- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla).
- **Datos de acceso local:** `usuarios.json`.
- **Fichajes y horas:** Supabase (`@supabase/supabase-js` vía CDN).
- **Mensajería formularios:** EmailJS (`@emailjs/browser` vía CDN).
- **Embebidos externos:** Spotify y FlipHTML5.

## 📁 Estructura del repositorio

- `style.css` — estilos globales y componentes visuales.
- `script.js` — navegación con animaciones, auth, fichaje, panel directiva, formularios, galería.
- `usuarios.json` — usuarios/roles para login del portal interno.
- `images/` — recursos visuales generales.
- `img-meazel/` — recursos visuales de la narrativa MEAZEL.
- Carpetas (`anuncios/`, `autoshop/`, `bolera/`, `directiva/`, `policia/`) — material multimedia de contenido.

## 🚀 Ejecución en local

1. Clona el repositorio.
2. Ábrelo en VS Code.
3. Ejecuta el sitio con **Live Server** (o cualquier servidor estático local).
4. Entra por `index.html`.

> Abrir archivos directamente con `file://` puede romper funcionalidades (`fetch` de `usuarios.json` y llamadas externas).

## 🔐 Configuración externa necesaria

El proyecto depende de servicios externos ya referenciados en el HTML/JS:

- **Supabase:** usado en panel de empleado/directiva para fichajes.
- **EmailJS:** usado en formularios de portal, anuncios y sugerencias.
- **Consentimiento de cookies:** Supabase y EmailJS se cargan dinámicamente desde `script.js` solo después de que el usuario acepta las cookies. Las páginas legales (`politica-cookies.html`, `politica-privacidad.html`, `aviso-legal.html`) están enlazadas desde el banner de cookies.

Si migras entorno o cuentas, actualiza los identificadores en:
- `script.js`
- `portal.html`
- `anuncios.html`
- `sugerencias.html`
- `panel-empleado.html`
- `panel-directiva.html`

## 👥 Acceso y roles

El login se valida contra `usuarios.json`:
- `admin` → redirección a `panel-directiva.html`
- `empleado` → redirección a `panel-empleado.html`

## ⚠️ Security warning

La autenticación actual está basada en `usuarios.json` cargado desde cliente. Esto expone credenciales a cualquier persona con acceso al sitio o al repositorio.

Para producción real:
- mover autenticación y validación de credenciales a backend;
- usar hashes de contraseña y gestión de sesiones segura;
- reemplazar credenciales embebidas por variables de entorno/secret manager.

## 🧩 Notas de mantenimiento

- Para añadir o editar personal: modifica `usuarios.json`.
- Para nuevos bloques de contenido: replica estructura de tarjetas/secciones de las páginas existentes.
- Para mantener consistencia visual: reutiliza clases existentes de `style.css`.
- Para evitar errores de navegación: conserva nombres de archivo y rutas relativas.

## 📌 Estado del proyecto

Proyecto operativo y orientado a despliegue estático para servidor roleplay Los Santos EVO.

<!--
MEAZEL::SIGIL
Canal oculto activo -> meazel-news.html
rutas espejo:
- filtracion-logia.html
- mas-alla-de-la-fe.html
- pigeon-drone.html
- servidor-7.html
- expediente-admin.html
clave visual: img-meazel/meazel-logo.png
-->

---

<p align="center"><strong>Weazel News — La verdad, al alcance de tu mano.</strong></p>
