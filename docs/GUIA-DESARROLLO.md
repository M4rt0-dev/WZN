# 👨‍💻 Guía de Desarrollo — WZN / Weazel News

Esta guía está dirigida a cualquier persona que quiera mantener, ampliar o modificar el sitio. Se explica paso a paso cómo realizar las tareas de mantenimiento más comunes.

---

## 📋 Requisitos previos

No necesitas instalar ninguna herramienta de desarrollo avanzada. Solo necesitas:

- **Un editor de texto** — Se recomienda [Visual Studio Code](https://code.visualstudio.com/).
- **Un servidor HTTP local** — La extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) de VS Code es la opción más cómoda. Alternativamente: `python -m http.server 5500`.
- **Git** — Para clonar el repositorio y subir cambios.
- **Acceso al repositorio** en GitHub.

> ⚠️ **Nunca abras los archivos con doble clic (`file://`)**. El fetch de `usuarios.json` y las llamadas a las APIs externas (Supabase, EmailJS) no funcionan con ese protocolo.

---

## 🧭 Principios de consistencia visual

Antes de modificar cualquier cosa, ten en cuenta estas reglas para mantener la coherencia del sitio:

1. **Usa siempre las clases CSS existentes** en lugar de crear estilos en línea nuevos. Las clases principales son:
   - `.card` → tarjeta de contenido.
   - `.grid` → rejilla auto-adaptable de tarjetas.
   - `.btn` → botón de acción.
   - `.titulo-seccion` → título de sección con borde rojo.
   - `.alerta-roja` → etiqueta roja tipo "ÚLTIMA HORA".

2. **Usa las variables CSS de colores** en lugar de valores hexadecimales directos:
   - `var(--rojo-weazel)` para el rojo principal.
   - `var(--negro-fondo)` para el fondo.
   - `var(--texto-gris)` para texto secundario.

3. **Replica el patrón de `<nav>` y `<footer>`** exactamente igual en cada nueva página que crees. Copia y pega desde una página existente.

4. **Usa `small-header`** para páginas internas (altura del header reducida):
   ```html
   <header class="small-header">
       <span class="alerta-roja">ETIQUETA</span>
       <h1>Título de la página</h1>
   </header>
   ```

5. **Enlaza siempre `style.css` y `script.js`** en el `<head>` de cada nueva página.

---

## 👤 Gestión de empleados (`usuarios.json`)

### Añadir un nuevo empleado

1. Abre `usuarios.json` en el editor.
2. Añade un nuevo objeto JSON al array, respetando la estructura:

```json
{
  "user": "Nombre_Apellido",
  "pass": "contraseña_del_empleado",
  "nombre": "Nombre Apellido",
  "rol": "empleado"
}
```

> **Convención para `user`:** usa el formato `Nombre_Apellido` sin caracteres especiales ni espacios.

3. Guarda el archivo. La próxima vez que el empleado inicie sesión, Supabase creará automáticamente su registro en la tabla `fichajes`.

4. Si también quieres que aparezca en `equipo.html`, añade su tarjeta allí manualmente (ver sección siguiente).

### Eliminar un empleado

1. Elimina su objeto del array en `usuarios.json`.
2. En el panel de Supabase, accede a la tabla `fichajes` y borra la fila con su `user_id` si quieres eliminar también el historial de horas.
3. Elimina su tarjeta de `equipo.html` si aparece allí.

### Cambiar la contraseña de un empleado

1. Localiza al empleado en `usuarios.json`.
2. Cambia el valor del campo `"pass"`.
3. Guarda el archivo.

### Promover a un empleado a administrador

1. Localiza al empleado en `usuarios.json`.
2. Cambia `"rol": "empleado"` por `"rol": "admin"`.
3. Guarda el archivo.

> **Nota:** solo puede haber un tipo de cuenta admin. Todos los admins acceden al mismo panel de directiva.

---

## 🗞️ Actualizar el contenido de noticias

### Actualizar el titular de "Última Hora" (`index.html`)

1. Abre `index.html`.
2. Localiza el bloque `<header>`:

```html
<header>
    <div class="alerta-roja">ÚLTIMA HORA</div>
    <h1>Sede de Little Seoul clausurada</h1>
    <p>Descripción del titular...</p>
</header>
```

3. Modifica el `<h1>` y el `<p>` con el nuevo titular y descripción.

### Actualizar la página de equipo (`equipo.html`)

Cada miembro del equipo se representa con una tarjeta `.card`:

```html
<div class="card" style="text-align: center;">
    <img src="./images/foto_nueva.png" alt="Descripción" 
         style="border-radius: 50%; border: 3px solid var(--rojo-weazel); margin-bottom: 10px; height: 100px;">
    <h3>Nombre del Empleado</h3>
    <p><strong>Cargo</strong></p>
</div>
```

- Sube la foto del empleado a la carpeta `images/`.
- Replica el bloque anterior dentro de `<div class="grid">` en `equipo.html`.
- Para el *Owner* (jefe máximo), el borde de la foto es `var(--rojo-weazel)`. Para el resto, usa `#555`.

---

## 📢 Gestión de anuncios (`anuncios.html`)

### Publicar un nuevo anuncio

1. **Sube la imagen del anuncio** a la carpeta `anuncios/` (ej: `img4.png`).
2. **Abre `anuncios.html`** y localiza la sección `<div class="grid">` bajo `"Negocios y Servicios Locales"`.
3. **Sustituye uno de los "Espacio libre"** o añade una nueva `.card`:

```html
<div class="card">
    <img src="./anuncios/img4.png" alt="Nombre del Negocio" 
         style="width: 100%; height: auto; border-radius: 8px 8px 0 0;">
    <div class="card-content" style="padding: 20px;">
        <h3>NOMBRE DEL NEGOCIO</h3>
        <p>Descripción del anuncio publicitario del negocio...</p>
    </div>
</div>
```

4. **Elimina o vacía el "Espacio libre"** correspondiente del HTML si ya no hay más huecos.

### Retirar un anuncio

1. Localiza la `.card` del anuncio en `anuncios.html`.
2. Reemplaza su contenido con el texto de "Espacio libre" genérico, o elimina la tarjeta completamente.

---

## 🖼️ Galería fotográfica (`galeria.html`)

La galería usa un sistema de acordeón + carrusel tipo TV. Cada cobertura periodística es un bloque independiente.

### Añadir una nueva cobertura

1. **Crea una carpeta** para las imágenes de la cobertura (ej: `bolera/`) o usa una existente.
2. **Sube las imágenes** a esa carpeta.
3. **Abre `galeria.html`** y añade el siguiente bloque después del último acordeón:

```html
<button class="accordion-btn">📸 Título de la cobertura</button>
<div class="accordion-content">
    <div class="tv-gallery-section">
        <div class="tv-carousel-wrapper">
            <button class="tv-btn prev-btn">&#10094;</button>
            
            <div class="tv-track-container">
                <div class="tv-track">

                    <div class="tv-slide">
                        <img src="./carpeta/imagen1.png" alt="Descripción imagen 1">
                        <div class="lower-third">
                            <div class="lt-top">
                                <div class="lt-live">PRIMICIA</div>
                                <div class="lt-headline">TITULAR DEL REPORTAJE EN MAYÚSCULAS</div>
                            </div>
                            <div class="lt-bottom">
                                <div class="ticker-move">
                                    <span>/// TEXTO DEL TICKER ///</span>
                                    Texto informativo que aparece en la franja inferior como en TV.
                                    <span>/// MÁS EN NUESTRO PERIÓDICO ///</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Repite el bloque tv-slide para cada imagen adicional -->
                    <div class="tv-slide">
                        <img src="./carpeta/imagen2.png" alt="Descripción imagen 2">
                        <div class="lower-third">
                            <!-- ... -->
                        </div>
                    </div>

                </div>
            </div>
            
            <button class="tv-btn next-btn">&#10095;</button>
        </div>
    </div>
</div>
```

4. **El acordeón y el carrusel funcionan automáticamente** gracias al código existente en `script.js`. No necesitas tocar JavaScript.

### Tipos de etiqueta en `lt-live`
- `PRIMICIA` → para contenido exclusivo.
- `EN DIRECTO` → para coberturas en vivo.
- `EXCLUSIVA` → para entrevistas o reportajes especiales.
- `ESPECIAL` → para eventos o coberturas temáticas.

---

## 📅 Actualizar la página de eventos (`eventos.html`)

La página de eventos es contenido estático. Para actualizar los eventos:

1. Abre `eventos.html`.
2. Localiza las tarjetas `.card` de eventos existentes.
3. Modifica la fecha, título y descripción de cada evento.
4. Añade o elimina tarjetas según sea necesario.

---

## 🎙️ Actualizar podcasts (`podcasts.html`)

Los podcasts se muestran mediante iframes embebidos de Spotify. Para añadir o actualizar episodios:

1. En Spotify, abre el episodio que quieres embeber.
2. Haz clic en `...` → `Compartir` → `Copiar código de inserción`.
3. En `podcasts.html`, añade o sustituye el `<iframe>` correspondiente.

---

## 📰 Actualizar periódicos y revista (`periodicos.html` / `revista.html`)

Estos contenidos se muestran mediante iframes de FlipHTML5. Para actualizar:

1. Sube el nuevo número a tu cuenta de FlipHTML5.
2. Obtén el enlace de inserción.
3. Sustituye la URL del `<iframe>` correspondiente en el HTML.

---

## 💰 Actualizar tarifas (`tarifas.html`)

Las tarifas son contenido estático. Para modificar precios:

1. Abre `tarifas.html`.
2. Localiza el `<div class="precio-tag">` del servicio a actualizar.
3. Cambia el valor (ej: `$7,000` → `$8,000`).
4. Si necesitas añadir un nuevo servicio, replica la estructura de un `<li class="precio-item">` existente:

```html
<li class="precio-item">
    <div class="precio-texto">
        <strong>Nombre del servicio</strong>
        <br><span class="precio-desc">Descripción breve del servicio</span>
    </div>
    <div class="precio-tag">$X,XXX</div>
</li>
```

---

## 📄 Actualizar páginas legales

Las páginas legales (`aviso-legal.html`, `politica-privacidad.html`, `politica-cookies.html`) son contenido estático en HTML.

Para actualizarlas:

1. Abre el archivo correspondiente.
2. Edita directamente el texto dentro de los elementos HTML.
3. **Actualiza siempre la fecha** de "Última actualización" al inicio del documento:

```html
<div class="legal-update">
    Última actualización: [mes] de [año]
</div>
```

---

## ➕ Crear una página nueva

Si necesitas añadir una nueva sección al sitio:

1. **Copia una página existente** como base (ej: `equipo.html`).
2. **Actualiza el `<title>`** en el `<head>`.
3. **Modifica el atributo `class="activo"`** en el enlace de navegación correspondiente al que debe estar marcado.
4. **Reemplaza el contenido** del `<main>` con el nuevo contenido.
5. **Añade el enlace a la nueva página** en el `<nav>` de **todas las demás páginas** para mantener la consistencia.

### Plantilla mínima de página nueva

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título de la Página | Weazel News</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
    <style>
        header, .small-header {
            background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('./images/weazel-news.png') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
        }
    </style>
</head>
<body>
    <nav>
        <!-- Copia la navegación de cualquier otra página -->
    </nav>

    <header class="small-header">
        <span class="alerta-roja">CATEGORÍA</span>
        <h1>Título de la Página</h1>
    </header>

    <main>
        <section>
            <h2 class="titulo-seccion">Subtítulo de sección</h2>
            <div class="grid">
                <div class="card">
                    <h3>Tarjeta de contenido</h3>
                    <p>Descripción del contenido.</p>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <h2>WEAZEL NEWS</h2>
        <p>&copy; 2026 Weazel News Los Santos EVO. La verdad, al alcance de tu mano.</p>
        <p class="footer-legal">
            <a href="aviso-legal.html">Aviso Legal</a> ·
            <a href="politica-privacidad.html">Política de Privacidad</a> ·
            <a href="politica-cookies.html">Política de Cookies</a>
        </p>
    </footer>
</body>
</html>
```

---

## 🎨 Personalización de estilos

### Cambiar colores globales

Edita las variables en la sección `:root` de `style.css`:

```css
:root {
    --rojo-weazel: #d32f2f;  /* ← cambia aquí para otro color de marca */
    --rojo-oscuro: #9a0007;
    --negro-fondo: #0a0a0a;
    --gris-oscuro: #1a1a1a;
    --texto-blanco: #ffffff;
    --texto-gris:   #b0b0b0;
}
```

### Añadir estilos específicos de una página

Si una página necesita estilos que no aplican al resto del sitio, añádelos dentro de un `<style>` en el `<head>` de esa página (como ya hacen `anuncios.html`, `portal.html`, etc.). Esto evita contaminar el CSS global.

---

## 🖼️ Gestión de imágenes

### Dónde colocar cada tipo de imagen

| Carpeta | Contenido |
|---|---|
| `images/` | Fotos del equipo (`foto.png`, `foto1.png`...), logo Weazel News |
| `anuncios/` | Imágenes de los anuncios publicados (`img1.png`, `img2.png`...) |
| `policia/` | Imágenes de coberturas policiales |
| `directiva/` | Material de la directiva |
| `autoshop/` | Imágenes del Auto Shop |
| `bolera/` | Imágenes de la bolera |
| `img-meazel/` | Recursos visuales del universo MEAZEL (¡no mezclar con el resto!) |

### Formato y tamaño recomendados

- **Imágenes de galería (carrusel TV):** cualquier formato, pero se recomienda horizontal (16:9) para que se vea bien en el visor.
- **Fotos de equipo:** cuadradas o verticales, se muestran recortadas en círculo de 100px. Formato PNG o JPG.
- **Imágenes de anuncios:** recomendado horizontal, ancho mínimo 600px. Formato PNG o JPG.

---

## 🔧 Despliegue

El sitio es totalmente estático, por lo que puede desplegarse en:

- **GitHub Pages** — gratis, directamente desde el repositorio.
- **Netlify / Vercel** — drag & drop de la carpeta o conexión con GitHub.
- **Cualquier hosting de archivos estáticos** — sube todos los archivos por FTP/SFTP.
- **NGINX / Apache local** — para servidores propios del servidor RP.

No se necesita ningún proceso de compilación ni build. Simplemente sube todos los archivos tal cual están en el repositorio.
