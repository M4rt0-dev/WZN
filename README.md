# 📰 WZN — Weazel News Los Santos EVO

> Portal web estático de **Weazel News** para el servidor de roleplay **Los Santos EVO**. Incluye contenido público (noticias, revistas, podcasts, galería, anuncios, eventos), área interna para empleados con fichaje de jornada y panel de directiva con control de equipo.

---

## 📑 Índice

1. [¿Qué es este proyecto?](#-qué-es-este-proyecto)
2. [Características principales](#-características-principales)
3. [Mapa completo de páginas](#-mapa-completo-de-páginas)
4. [Tecnologías utilizadas](#️-tecnologías-utilizadas)
5. [Estructura del repositorio](#-estructura-del-repositorio)
6. [Cómo ejecutar el proyecto en local](#-cómo-ejecutar-el-proyecto-en-local)
7. [Sistema de autenticación y roles](#-sistema-de-autenticación-y-roles)
8. [Gestión de cookies y servicios externos](#-gestión-de-cookies-y-servicios-externos)
9. [Configuración de servicios externos](#-configuración-de-servicios-externos)
10. [Guía de mantenimiento rápido](#-guía-de-mantenimiento-rápido)
11. [Advertencia de seguridad](#️-advertencia-de-seguridad)
12. [Documentación detallada](#-documentación-detallada)

---

## �� ¿Qué es este proyecto?

**Weazel News** es el portal web oficial de la cadena de noticias ficticia del servidor de roleplay *Los Santos EVO*. Funciona como un **sitio estático** (HTML + CSS + JavaScript vanilla) sin frameworks ni servidor propio, pensado para ser desplegado en cualquier hosting de archivos estáticos.

El sitio sirve dos propósitos bien diferenciados:

- **Cara pública:** portal informativo para los ciudadanos del roleplay con noticias, revistas, podcasts, galería fotográfica, tablón de anuncios y formularios de contacto.
- **Área interna:** sistema de fichaje y gestión de jornada para los empleados y la directiva de Weazel News, conectado a una base de datos en tiempo real (Supabase).

Además incluye una **capa de narrativa oculta** conocida como el universo *MEAZEL*, accesible solo por rutas específicas del sitio.

---

## ✨ Características principales

| Función | Descripción |
|---|---|
| 🗞️ Contenido público | Periódicos, revistas, podcasts, eventos, galería y equipo |
| 🔐 Login de empleados | Autenticación por `usuarios.json` con redirección según rol |
| ⏱️ Fichaje de jornada | Botón entrada/salida con acumulación de horas en Supabase |
| 👔 Panel directiva | Vista global de empleados, estado en tiempo real y reset de horas |
| 📧 Formularios EmailJS | Buzón anónimo, solicitud de anuncios y sugerencias |
| 🍪 Gestión de cookies | Banner conforme a normativa; servicios externos solo tras aceptación |
| 🎬 Galería tipo TV | Visor de imágenes con efecto acordeón y carrusel de noticias |
| 🔳 Universo MEAZEL | Narrativa RP oculta con páginas secretas y estética de terminal |
| 🌐 Animaciones de página | Transiciones de entrada/salida al navegar entre páginas |

---

## 🗺️ Mapa completo de páginas

### Páginas públicas

| Archivo | Título | Descripción |
|---|---|---|
| `index.html` | Inicio | Portada principal con titular de última hora y accesos rápidos |
| `periodicos.html` | Periódicos | Hemeroteca con ejemplares embebidos vía FlipHTML5 |
| `revista.html` | Revista | Revista semanal embebida vía FlipHTML5 |
| `podcasts.html` | Podcasts | Episodios de audio embebidos vía Spotify |
| `eventos.html` | Eventos | Calendario de próximos eventos del servidor |
| `galeria.html` | Galería | Archivo audiovisual con visor TV tipo acordeón y carrusel |
| `equipo.html` | Equipo | Ficha de la plantilla de redacción con fotos y cargos |
| `anuncios.html` | Anuncios Locales | Tablón de anuncios de negocios + formulario de solicitud |
| `tarifas.html` | Tarifas | Catálogo de servicios publicitarios y precios |
| `sugerencias.html` | Sugerencias | Formulario de sugerencias ciudadanas |
| `portal.html` | Portal Empleado | Login de personal + buzón anónimo para ciudadanos |

### Páginas legales

| Archivo | Descripción |
|---|---|
| `aviso-legal.html` | Aviso legal del sitio |
| `politica-privacidad.html` | Política de privacidad completa |
| `politica-cookies.html` | Política de cookies con tabla de tipos y gestión de preferencias |

### Páginas internas (acceso restringido)

| Archivo | Rol requerido | Descripción |
|---|---|---|
| `panel-empleado.html` | `empleado` | Fichaje de entrada/salida, contador de horas y cierre de sesión |
| `panel-directiva.html` | `admin` | Tabla de empleados, estado en tiempo real, reset de horas y registro |

### Universo oculto MEAZEL

| Archivo | Descripción |
|---|---|
| `meazel-news.html` | Portal de entrada al club conspirativo MEAZEL |
| `filtracion-logia.html` | Artículo sobre la Logia de Los Santos |
| `mas-alla-de-la-fe.html` | Artículo sobre actividades en lugares de culto |
| `pigeon-drone.html` | Artículo sobre el "Proyecto Pigeon Drone" |
| `servidor-7.html` | Artículo sobre el incidente del Servidor 7 |
| `expediente-admin.html` | Expediente del administrador del sistema |

---

## ⚙️ Tecnologías utilizadas

| Capa | Tecnología | Uso |
|---|---|---|
| Estructura | HTML5 | Todas las páginas |
| Estilos | CSS3 (Vanilla) | `style.css` con variables CSS y responsive grid |
| Lógica | JavaScript ES2020 (Vanilla) | `script.js` — toda la interactividad |
| Base de datos | [Supabase](https://supabase.com) (CDN) | Almacenamiento de fichajes y horas |
| Formularios | [EmailJS](https://emailjs.com) (CDN) | Envío de correos desde el cliente |
| Fuentes | Google Fonts (Oswald + Roboto + VT323 + Courier Prime) | Tipografía |
| Contenido embebido | Spotify + FlipHTML5 | Podcasts y publicaciones |
| Autenticación local | `usuarios.json` | Lista de usuarios y roles |

> **Sin Node.js, sin npm, sin frameworks, sin backend propio.** Todo se sirve como archivos estáticos.

---

## 📁 Estructura del repositorio

```
WZN/
├── index.html                  # Portada principal
├── periodicos.html             # Hemeroteca
├── revista.html                # Revista
├── podcasts.html               # Podcasts
├── eventos.html                # Eventos
├── galeria.html                # Galería TV + acordeón
├── equipo.html                 # Plantilla de redacción
├── anuncios.html               # Anuncios + formulario
├── tarifas.html                # Catálogo de precios
├── sugerencias.html            # Buzón de sugerencias
├── portal.html                 # Login + buzón anónimo
│
├── panel-empleado.html         # Panel de fichaje (rol: empleado)
├── panel-directiva.html        # Panel de gestión (rol: admin)
│
├── aviso-legal.html            # Aviso legal
├── politica-privacidad.html    # Política de privacidad
├── politica-cookies.html       # Política de cookies + gestión
│
├── meazel-news.html            # Entrada al universo MEAZEL
├── filtracion-logia.html       # Artículo MEAZEL #1
├── mas-alla-de-la-fe.html      # Artículo MEAZEL #2
├── pigeon-drone.html           # Artículo MEAZEL #3
├── servidor-7.html             # Artículo MEAZEL #4
├── expediente-admin.html       # Artículo MEAZEL #5
│
├── style.css                   # Estilos globales y todos los componentes
├── script.js                   # Toda la lógica JavaScript
├── usuarios.json               # Base de datos local de usuarios y roles
│
├── images/                     # Imágenes generales (fotos equipo, logo, etc.)
├── img-meazel/                 # Imágenes exclusivas del universo MEAZEL
├── anuncios/                   # Imágenes de los anuncios publicados
├── autoshop/                   # Material multimedia del Auto Shop
├── bolera/                     # Material multimedia de la bolera
├── directiva/                  # Material de la directiva
├── policia/                    # Imágenes de la cobertura policial
│
└── docs/                       # 📚 Documentación técnica detallada
    ├── ARQUITECTURA.md
    ├── GUIA-DESARROLLO.md
    ├── INTEGRACIONES.md
    ├── PANELES-INTERNOS.md
    ├── SCRIPT-JS.md
    └── UNIVERSO-MEAZEL.md
```

---

## 🚀 Cómo ejecutar el proyecto en local

### Requisitos previos

- [Visual Studio Code](https://code.visualstudio.com/) (recomendado)
- Extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) de VS Code
- O cualquier otro servidor HTTP estático (Python `http.server`, NGINX, etc.)

### Pasos

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/M4rt0-dev/WZN.git
   cd WZN
   ```

2. **Abre la carpeta en VS Code:**
   ```bash
   code .
   ```

3. **Inicia el servidor local:**
   - Haz clic en **"Go Live"** en la barra inferior de VS Code (Live Server).
   - O con Python: `python -m http.server 5500`

4. **Navega a** `http://localhost:5500/index.html`

> ⚠️ **IMPORTANTE:** No abras los archivos directamente con el protocolo `file://`. El fetch de `usuarios.json` y las llamadas a APIs externas fallan en ese protocolo por restricciones CORS del navegador. Siempre usa un servidor HTTP local.

---

## 🔐 Sistema de autenticación y roles

El login de empleados funciona de la siguiente manera:

1. El usuario introduce sus credenciales en el formulario de `portal.html`.
2. `script.js` hace un `fetch` de `usuarios.json` (evitando caché con `?t=timestamp`).
3. Compara `user` y `pass` en texto plano contra la lista del JSON.
4. Si hay coincidencia, guarda en `localStorage`:
   - `weazel_session` → nombre de usuario
   - `weazel_role` → rol (`admin` o `empleado`)
   - `weazel_nombre` → nombre completo para mostrar
5. Redirige según el rol:
   - `admin` → `panel-directiva.html`
   - `empleado` → `panel-empleado.html`

### Estructura de `usuarios.json`

```json
[
  { "user": "DirectivaWZN", "pass": "...", "nombre": "Administrador", "rol": "admin" },
  { "user": "Asher_Stark",  "pass": "...", "nombre": "Asher Stark",   "rol": "empleado" }
]
```

### Cómo añadir un nuevo empleado

Edita `usuarios.json` y añade un objeto al array:

```json
{ "user": "Nombre_Apellido", "pass": "contraseña_segura", "nombre": "Nombre Apellido", "rol": "empleado" }
```

Los campos son:

| Campo | Tipo | Descripción |
|---|---|---|
| `user` | string | Identificador de login (sin espacios, usar `_`) |
| `pass` | string | Contraseña en texto plano |
| `nombre` | string | Nombre completo que se muestra en el panel |
| `rol` | string | `"empleado"` o `"admin"` |

---

## 🍪 Gestión de cookies y servicios externos

El sitio implementa un sistema de consentimiento de cookies. El flujo es:

```
Usuario visita el sitio
        │
        ▼
¿Tiene preferencia guardada en localStorage?
        │
    NO ──► Muestra banner de cookies
        │         │
        │    Acepta ──► Carga EmailJS + Supabase → activa formularios y paneles
        │    Rechaza ──► Limpia sesiones y datos de Supabase del localStorage
        │
    SÍ ──► Acepta: carga servicios automáticamente
           Rechaza: limpia storage, servicios inactivos
```

- La clave de preferencia se guarda en `localStorage` bajo `wzn_cookie_consent`.
- Los valores posibles son `"accepted"` y `"rejected"`.
- El usuario puede cambiar su preferencia en cualquier momento desde `politica-cookies.html`.
- EmailJS y Supabase **nunca se cargan** si el usuario no ha aceptado cookies.

---

## 🔧 Configuración de servicios externos

Si necesitas migrar a otras cuentas, estos son todos los identificadores que debes actualizar:

### EmailJS

| Identificador | Valor actual | Archivo |
|---|---|---|
| Public Key (init) | `ERhS_42VHBVxNpsCQ` | `script.js` línea 72 |
| Service ID | `service_a6y2ih9` | `script.js` líneas 582, 622, 662 |
| Template buzón anónimo | `template_9887dpi` | `script.js` línea 582 |
| Template anuncios | `template_dh8tpdk` | `script.js` línea 622 |
| Template sugerencias | `template_dh8tpdk` | `script.js` línea 662 |

### Supabase

| Identificador | Valor actual | Archivo |
|---|---|---|
| Project URL | `https://zokaarirkqourkkfmkso.supabase.co` | `script.js` línea 159 |
| Publishable Key | `sb_publishable_Sjccw8zw...` | `script.js` línea 160 |

La tabla en Supabase que usa el sistema se llama **`fichajes`** y tiene estas columnas:

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | string | Coincide con el campo `user` de `usuarios.json` |
| `enServicio` | boolean | Si el empleado está actualmente fichado |
| `clockInTime` | number (timestamp ms) | Momento en que entró de servicio |
| `totalSeconds` | number | Segundos acumulados en la semana |

---

## 🧩 Guía de mantenimiento rápido

### Añadir un empleado nuevo
1. Edita `usuarios.json` y añade el objeto con `user`, `pass`, `nombre` y `rol`.
2. La próxima vez que el empleado inicie sesión, Supabase creará automáticamente su fila en `fichajes`.

### Publicar un nuevo anuncio en `anuncios.html`
1. Añade la imagen del anuncio a la carpeta `anuncios/` (ej: `img4.png`).
2. En `anuncios.html`, localiza el bloque `.grid` de "Negocios y Servicios Locales".
3. Replica la estructura de un `<div class="card">` existente con la nueva imagen y texto.

### Añadir una cobertura en la Galería (`galeria.html`)
1. Sube las imágenes a una carpeta apropiada (ej: `directiva/`).
2. En `galeria.html`, añade un bloque `<button class="accordion-btn">` con el título.
3. Dentro de `<div class="accordion-content">`, crea los `<div class="tv-slide">` con tus imágenes.
4. El acordeón y el carrusel funcionan automáticamente gracias a `script.js`.

### Actualizar tarifas
1. Edita directamente `tarifas.html`.
2. Modifica los valores dentro de los elementos `<div class="precio-tag">`.

### Resetear las horas de un empleado
1. Inicia sesión con la cuenta `admin` en `portal.html`.
2. En el panel de directiva, haz clic en **"Poner a 0"** en la fila del empleado.

---

## ⚠️ Advertencia de seguridad

> **La autenticación actual NO es apta para producción real.**

El sistema de login carga `usuarios.json` directamente desde el cliente. Esto significa que **cualquier persona** con acceso al sitio puede ver las credenciales de todos los empleados desde las herramientas de desarrollo del navegador.

Para un entorno real, se debería:
- Implementar un backend (Node.js, PHP, etc.) que valide credenciales en el servidor.
- Almacenar contraseñas como hashes (bcrypt o similar), nunca en texto plano.
- Usar tokens de sesión seguros (JWT o sesiones de servidor).
- Mover las claves de Supabase y EmailJS a variables de entorno del servidor.

En el contexto de un servidor de roleplay privado con acceso controlado, el riesgo es asumible, pero conviene tenerlo presente.

---

## 📚 Documentación detallada

Para información técnica más profunda, consulta la carpeta `docs/`:

| Documento | Contenido |
|---|---|
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Arquitectura técnica, flujo de datos y decisiones de diseño |
| [`docs/GUIA-DESARROLLO.md`](docs/GUIA-DESARROLLO.md) | Guía paso a paso para añadir y modificar contenido |
| [`docs/INTEGRACIONES.md`](docs/INTEGRACIONES.md) | Configuración detallada de Supabase y EmailJS |
| [`docs/PANELES-INTERNOS.md`](docs/PANELES-INTERNOS.md) | Documentación de los paneles de empleado y directiva |
| [`docs/SCRIPT-JS.md`](docs/SCRIPT-JS.md) | Referencia completa de todas las funciones de `script.js` |
| [`docs/UNIVERSO-MEAZEL.md`](docs/UNIVERSO-MEAZEL.md) | Narrativa y rutas del universo oculto MEAZEL |

---

## 📌 Estado del proyecto

Proyecto **operativo** y orientado a despliegue estático para el servidor de roleplay Los Santos EVO.

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
