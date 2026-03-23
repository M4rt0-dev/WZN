# 📰 Weazel News | Web Faccional para GTA V Roleplay (Los Santos EVO)

Bienvenido al repositorio oficial de la plataforma web de **Weazel News**, diseñada específicamente para el servidor de Roleplay *Los Santos EVO*. Esta web funciona como el portal público de noticias de la ciudad y como una herramienta interna completa para la gestión de los empleados de la facción.

---

## ✨ Características Principales

### 🌍 Para los Ciudadanos (Portal Público)
* **Noticias y Publicaciones:** Acceso directo a ediciones de Periódicos y Revistas Semanales (integrado mediante enlaces a visores como FlipHTML5).
* **Galería Audiovisual Interactiva:** Sistema de acordeón con un carrusel estilo "televisión" (Lower Thirds) para visualizar fotorreportajes en directo.
* **Servicios Comerciales:** Catálogo completo de tarifas publicitarias para negocios locales y cobertura de eventos.
* **Interacción Directa:** 
  * Buzón anónimo para enviar exclusivas a la redacción.
  * Formulario de contratación de anuncios clasificados.
  * Buzón de sugerencias ciudadanas.
  *(Todos los formularios están conectados y 100% funcionales mediante EmailJS).*

### 💼 Para los Empleados (Portal Interno)
* **Sistema de Login:** Autenticación basada en roles (Directiva / Empleado).
* **Control de Fichaje:** Panel individual donde los reporteros pueden "Entrar de servicio" y "Salir de servicio". El sistema calcula automáticamente las horas y minutos trabajados.
* **Panel de Directiva:** Dashboard exclusivo para administradores donde pueden ver el estado en tiempo real de la plantilla (quién está trabajando y cuántas horas lleva en la semana), con opción a resetear contadores.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Almacenamiento Local:** `usuarios.json` para la base de datos de usuarios y `localStorage` para el manejo de sesiones.
* **Backend / Base de Datos:** [Supabase](https://supabase.com/) (Para almacenar de forma persistente y en tiempo real el fichaje y las horas de los empleados).
* **Envío de Correos:** [EmailJS](https://www.emailjs.com/) (Para el procesamiento de los formularios estáticos sin necesidad de un backend propio).

---

## 📂 Estructura del Proyecto

```text
📁 Weazel-News-Web/
├── 📄 index.html             # Página principal
├── 📄 periodicos.html        # Archivo de periódicos
├── 📄 revista.html           # Ediciones de la revista semanal
├── 📄 galeria.html           # Galería interactiva (TV UI)
├── 📄 portal.html            # Acceso al portal del empleado y buzón anónimo
├── 📄 panel-empleado.html    # Sistema de fichaje individual
├── 📄 panel-directiva.html   # Control de la empresa para administradores
├── 📄 anuncios.html          # Tablón de clasificados locales
├── 📄 tarifas.html           # Lista de precios de la empresa
├── 📄 style.css              # Hoja de estilos global
├── 📄 script.js              # Lógica principal (Supabase, EmailJS, UI, Auth)
└── 📄 usuarios.json          # Base de datos local de empleados y credenciales
