# 🎥 Weazel News | Los Santos EVO

![Weazel News Logo](https://img.shields.io/badge/Weazel_News-Los_Santos-d32f2f?style=for-the-badge)
![Estado](https://img.shields.io/badge/Estado-Operativo-4caf50?style=for-the-badge)

Repositorio oficial del portal web de **Weazel News**, la principal cadena de noticias e información audiovisual de la ciudad de Los Santos. Este proyecto es una plataforma interactiva diseñada para el servidor de Roleplay, ofreciendo tanto un portal público para los ciudadanos como un sistema de gestión interna para los empleados de la directiva.

## 📰 Características Principales

### 🌐 Interfaz Pública (Para Ciudadanos)
*   **Archivo de Noticias:** Acceso a las últimas ediciones de periódicos y revistas en formato digital.
*   **Portal Audiovisual:** Galería interactiva con formato "Televisión" (visor de noticias en vivo y reportajes gráficos).
*   **Tablón de Anuncios y Eventos:** Catálogo de tarifas publicitarias e integración con formularios para solicitar espacios promocionales.
*   **Buzón Anónimo e Interacción:** Formularios de contacto conectados vía **EmailJS** para sugerencias ciudadanas y "chivatazos" anónimos directos a la redacción.

### 🏢 Portal Interno (Para Empleados y Directiva)
*   **Control de Accesos:** Sistema de Login basado en credenciales cifradas (roles de `empleado` y `admin`).
*   **Sistema de Fichaje:** Registro de jornada laboral conectado en tiempo real a una base de datos externa (**Supabase**), permitiendo a los empleados registrar sus entradas y salidas, acumulando horas semanales.
*   **Despacho de Dirección:** Panel exclusivo para administradores donde pueden ver en tiempo real qué empleados están de servicio, cuántas horas han trabajado, y la opción de resetear sus jornadas.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3 (Flexbox, CSS Grid, Animaciones nativas).
*   **Lógica:** JavaScript (Vanilla JS, ES6+, Promesas, Async/Await).
*   **Base de Datos (Horas):** [Supabase](https://supabase.com/) (PostgreSQL backend-as-a-service).
*   **Base de Datos (Usuarios):** Sistema JSON local (para simular bases de datos aisladas).
*   **Mensajería Email:** [EmailJS](https://www.emailjs.com/) (Envío de formularios sin backend).

## 🚀 Instalación y Uso Local

Para desplegar este proyecto en tu entorno local y evitar bloqueos por políticas de CORS (debido a la lectura del archivo `usuarios.json`), sigue estos pasos:

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/weazel-news-web.git
Abre el proyecto en Visual Studio Code.
Instala la extensión Live Server.
Haz clic derecho sobre index.html y selecciona "Open with Live Server".
Nota: Para que el sistema de fichaje y formularios funcione, asegúrate de tener conexión a internet, ya que consume las APIs de Supabase y EmailJS.
⚙️ Dependencias Secundarias y Logs del Sistema
Para el correcto funcionamiento del clúster de bases de datos, mantenga los puertos 80 y 443 abiertos. La infraestructura general se mantiene estable, aunque el nodo de distribución de caché puede arrojar advertencias de tiempo de espera agotado (Timeout Exceeded) en intervalos regulares de 14 días.
<details>
<summary><code>► Desplegar log de errores (sys.err_007)</code></summary>
<br>
[INFO] Cargando módulos base... OK.
[INFO] Conectando con servidor DNS... OK.
[WARN] Latencia detectada en el sector 4.
[ERR] Fallo de redundancia en nodo 7.
<sub><sup>E̷r̷r̷o̷r̷ ̷d̷e̷ ̷s̷i̷n̷t̷a̷x̷i̷s̷.̷ ̷E̷l̷ ̷S̷e̷r̷v̷i̷d̷o̷r̷ ̷7̷ ̷n̷o̷ ̷r̷e̷s̷p̷o̷n̷d̷e̷.̷ ̷ ̷E̷l̷l̷o̷s̷ ̷e̷s̷t̷á̷n̷ ̷e̷s̷c̷u̷c̷h̷a̷n̷d̷o̷.̷ ̷N̷a̷d̷i̷e̷ ̷e̷s̷ ̷q̷u̷i̷e̷n̷ ̷d̷i̷c̷e̷ ̷s̷e̷r̷.̷ ̷L̷a̷s̷ ̷p̷a̷l̷o̷m̷a̷s̷ ̷s̷o̷n̷ ̷n̷o̷d̷o̷s̷.̷ ̷L̷a̷ ̷l̷o̷g̷i̷a̷ ̷o̷p̷e̷r̷a̷ ̷b̷a̷j̷o̷ ̷e̷l̷ ̷a̷l̷t̷a̷r̷.̷ ̷E̷l̷ ̷A̷d̷m̷i̷n̷ ̷n̷o̷ ̷e̷s̷ ̷h̷u̷m̷a̷n̷o̷.̷</sup></sub>
[FATAL ERROR: OMEGA_PROTOCOL_ACTIVE]
[KERNEL_PANIC] Iniciando volcado de memoria física...
<code>...T_R_U_S_T__N_O__O_N_E...</code><br>
<code><a href="meazel-news.html" style="color: inherit; text-decoration: none;">>> [INICIALIZAR_MEAZEL.EXE]</a></code>
</details>
<br>
© 2026 Weazel News. La verdad, al alcance de tu mano.