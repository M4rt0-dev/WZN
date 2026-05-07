# 🕵️ Universo MEAZEL — Narrativa Oculta de Weazel News

Este documento describe el universo narrativo oculto conocido como **MEAZEL**, que existe como una capa paralela y secreta dentro del portal de Weazel News. Está pensado para el disfrute del roleplay y la exploración voluntaria de los jugadores.

---

## ¿Qué es MEAZEL?

MEAZEL es un **easter egg narrativo** integrado en el sitio de Weazel News. Funciona como un club secreto conspirativo ficticio dentro del universo del servidor de roleplay Los Santos EVO. Tiene su propio estilo visual completamente diferente al del portal principal: fondo negro, texto verde terminal, efectos CRT (líneas de pantalla antigua) y una estética de "pantalla hackeada".

El universo MEAZEL sirve como:
- Un **elemento de inmersión** para el roleplay, permitiendo tramas de conspiraciones y sociedades secretas.
- Un **easter egg** para los jugadores más curiosos que exploran el código fuente o las URLs del sitio.
- Una **extensión narrativa** que añade profundidad al lore del servidor.

---

## 🗺️ Mapa de rutas MEAZEL

El universo MEAZEL está compuesto por 6 páginas accesibles mediante rutas directas:

| Página | URL | Título | Descripción |
|---|---|---|---|
| Portal MEAZEL | `meazel-news.html` | MEAZEL NEWS // CONSPIRATION CLUB | Página de entrada con efecto terminal y lista de artículos |
| Artículo 1 | `filtracion-logia.html` | Filtración: La Logia de Los Santos | Sobre logias masónicas y conexiones con entidades no humanas |
| Artículo 2 | `mas-alla-de-la-fe.html` | Más allá de la fe, lo moralmente incorrecto | Sobre lugares de culto usados como fachada |
| Artículo 3 | `pigeon-drone.html` | El Proyecto "Pigeon Drone" en la Deep Web | Sobre palomas que son supuestamente nodos de señal Wi-Fi militar |
| Artículo 4 | `servidor-7.html` | El Incidente del Servidor 7 | Sobre voces en el código y conexiones IP desde coordenadas inexistentes |
| Artículo 5 | `expediente-admin.html` | ¿Quién es realmente el Admin? | Sobre el administrador del sistema y su naturaleza no humana |

---

## 🔍 Cómo encontrar MEAZEL

El acceso al universo MEAZEL **no está enlazado directamente** en la navegación principal. Hay varias formas de llegar:

### 1. Botón corrupto en `index.html` (actualmente desactivado)

En la portada principal existe un botón oculto en la esquina inferior izquierda. En el código HTML de `index.html` se puede ver comentado:

```html
<!-- a href="meazel-news.html" class="corrupted-link" title="SYS.ERR: OMEGA_PROTOCOL">
    <span class="glitch-text">>> sys.err_</span><span class="cursor-blink"></span>
</a> -->
```

Este botón tiene las siguientes características cuando está activo:
- Está casi invisible: `opacity: 0.2` por defecto.
- Al pasar el ratón: `opacity: 1`, borde verde brillante, cursor de cruceta.
- El texto tiene un efecto **glitch** (animación CSS que desplaza el texto en colores RGB).
- Un cursor parpadeante verde en el extremo derecho.

Para **reactivarlo**, elimina los comentarios `<!-- -->` en `index.html`.

### 2. Acceso directo por URL

Cualquier jugador que conozca la URL puede acceder directamente escribiendo:
```
[URL del sitio]/meazel-news.html
```

### 3. Descubrimiento en el código fuente

Al final del `README.md` hay un comentario HTML oculto:

```html
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
```

Esto actúa como una pista para jugadores que exploran el repositorio de GitHub.

---

## 🎨 Estilo visual de MEAZEL

El universo MEAZEL tiene un diseño completamente diferente al portal principal, definido con CSS inline en cada página (no usa `style.css`):

### Paleta de colores

| Variable | Valor | Uso |
|---|---|---|
| `--bg-color` | `#030303` | Fondo de pantalla casi negro |
| `--main-red` | `#c00000` | Color rojo oscuro para textos principales |
| `--main-green` | `#00ff00` | Verde terminal para elementos interactivos |
| `--text-muted` | `#888` | Gris para textos secundarios |

### Efectos especiales

#### Efecto CRT (Scanlines)
Simulación de pantalla de tubo de rayos catódicos con líneas horizontales sutiles:

```css
body::after {
    content: " ";
    position: fixed;
    top: 0; left: 0; bottom: 0; right: 0;
    background: 
        linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
        linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06));
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
    z-index: 2;
}
```

#### Efecto Glitch en el título
El título principal "MEAZEL NEWS" tiene una animación CSS que desplaza el `text-shadow` en colores RGB rojo/verde/azul en un bucle infinito de 500ms:

```css
@keyframes glitch {
    0%  { text-shadow: 0.05em 0 0 rgba(255,0,0,.75), -0.05em -0.025em 0 rgba(0,255,0,.75), ... }
    15% { text-shadow: -0.05em -0.025em 0 rgba(255,0,0,.75), ... }
    50% { text-shadow: 0.025em 0.05em 0 rgba(255,0,0,.75), ... }
    /* ... */
}
```

#### Cursor parpadeante
Simula el cursor de una terminal con una animación de parpadeo step-end:

```css
@keyframes blink { 
    0%, 100% { opacity: 1; } 
    50% { opacity: 0; } 
}
```

#### Logo masónico
El logo principal es una imagen PNG (`img-meazel/meazel-logo.png`) a la que se aplica un filtro CSS para transformarla en verde brillante con efecto de brillo:

```css
.main-logo {
    filter: invert(1) sepia(1) hue-rotate(70deg) saturate(5) 
            drop-shadow(0 0 8px var(--main-green));
    mix-blend-mode: screen;
}
```

---

## ⌨️ Efecto de máquina de escribir (typewriter)

La página principal de MEAZEL (`meazel-news.html`) tiene un efecto de terminal que simula que se está escribiendo un mensaje en tiempo real:

```javascript
const text = "Iniciando protocolo masónico... Conexión P2P establecida... " +
             "Bienvenido al Club. Lo que leas aquí no debe salir de la logia. Ellos vigilan.";
let index = 0;
const speed = 50; // ms por carácter

function typeWriter() {
    if (index < text.length) {
        document.getElementById("typewriter").innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, speed);
    } else {
        // Cuando termina el texto, aparecen las noticias y el footer
        setTimeout(() => {
            document.querySelector('.news-grid').style.display = 'flex';
            document.querySelector('footer').style.display = 'block';
        }, 400);
    }
}

window.onload = function() {
    setTimeout(typeWriter, 1000); // Espera 1 segundo antes de empezar
};
```

Este efecto logra que:
1. Al entrar, la página parece cargarse como una terminal.
2. El texto de bienvenida se escribe carácter a carácter a 50ms por carácter.
3. Solo cuando termina de escribirse el mensaje, aparecen (con fadeIn) los artículos conspiratorios y el footer de advertencia.

---

## 📰 Contenido narrativo de los artículos

### Portal MEAZEL (`meazel-news.html`)

Funciona como el índice del "club". Muestra 5 artículos clasificados como `[TOP SECRET]`. Cada artículo tiene:
- Un título en mayúsculas.
- Un resumen conspiratorio.
- Un enlace `>> DESCENCRIPTAR ARCHIVO` que lleva a la página del artículo.

El footer incluye el mensaje de advertencia: *"TU DIRECCIÓN IP HA SIDO REGISTRADA POR ENTRAR AQUÍ. TRUST NO ONE. THE TRUTH IS IN THE CODE."*

### Artículo: Más allá de la fe (`mas-alla-de-la-fe.html`)

Trata sobre lugares de culto en Los Santos que son usados como fachada. Menciona símbolos ocultos en altares, reuniones de élite y desapariciones de jóvenes bajo "códigos en clave".

### Artículo: Filtración - La Logia (`filtracion-logia.html`)

Documentos clasificados sobre la logia masónica de Los Santos con supuestas conexiones con "entidades no humanas". Incluye planos subterráneos y simbología alienígena.

### Artículo: El Admin (`expediente-admin.html`)

Análisis "forense" humorístico sobre el administrador del sistema (M4rt0-dev). Sugiere que podría ser una IA que escapó de su sandbox basándose en "patrones de tecleo con secuencias Fibonacci".

### Artículo: El Incidente del Servidor 7 (`servidor-7.html`)

Usuarios reportan "voces en el código fuente" durante la madrugada. Los logs muestran "conexiones IP desde coordenadas inexistentes en el Atlántico Norte".

### Artículo: Proyecto Pigeon Drone (`pigeon-drone.html`)

La teoría conspiranoica clásica: "Las palomas no son reales". En este universo, documentos del foro WZN confirman que el 40% de las aves urbanas son "nodos repetidores de señal Wi-Fi militar".

---

## 🛠️ Cómo añadir nuevos artículos al universo MEAZEL

### 1. Crear el archivo HTML del artículo

Copia la estructura de una de las páginas MEAZEL existentes (ej: `pigeon-drone.html`). Mantén:
- El CSS de la estética terminal (colores, fuentes, efecto CRT, glitch).
- El enlace `< BACK TO WZN ROOT` que vuelve a `index.html`.
- La navegación de vuelta a `meazel-news.html` si quieres.

### 2. Añadir el artículo al portal MEAZEL

En `meazel-news.html`, dentro de `<div class="news-grid">`, añade un nuevo `<article>`:

```html
<article class="article">
    <h2>Título del nuevo artículo en mayúsculas</h2>
    <p>Descripción conspiranoica del contenido del artículo...</p>
    <a href="nuevo-articulo.html" class="read-more">>> DESCENCRIPTAR ARCHIVO</a>
</article>
```

### 3. Reactivar el botón corrupto en `index.html` (opcional)

Si quieres que el botón de acceso vuelva a estar visible en la portada, descomenta el bloque en `index.html`:

```html
<a href="meazel-news.html" class="corrupted-link" title="SYS.ERR: OMEGA_PROTOCOL">
    <span class="glitch-text">>> sys.err_</span><span class="cursor-blink"></span>
</a>
```

---

## 🎭 Uso en roleplay

El universo MEAZEL está diseñado para integrarse de forma orgánica en las tramas del servidor de roleplay:

- **Jugadores periodistas:** pueden "descubrir" los artículos y usarlos como base para tramas de investigación.
- **Jugadores que hacen de conspiranoicos:** tienen un lugar en el lore del servidor para desarrollar sus personajes.
- **Narrativas de facciones secretas:** la referencia a la "Logia de Los Santos" puede usarse como organización ficticia en tramas de RP.
- **Easter egg para jugadores curiosos:** añade una capa de profundidad que recompensa la exploración.

---

## 📁 Recursos de imágenes MEAZEL

Todos los recursos visuales del universo MEAZEL están en la carpeta `img-meazel/`:

| Archivo | Uso |
|---|---|
| `meazel-logo.png` | Logo masónico principal, referenciado en `meazel-news.html` |

> **Importante:** no mezcles los recursos de `img-meazel/` con los de `images/`. Los primeros son exclusivos del universo oculto y deben mantenerse separados para facilitar el mantenimiento.
