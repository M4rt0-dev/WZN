# 🔌 Integraciones Externas — Supabase y EmailJS

Este documento explica en detalle cómo están configurados y cómo funcionan los dos servicios externos que usa el proyecto: **Supabase** (base de datos) y **EmailJS** (envío de formularios).

---

## 🚫 Aviso de propiedad intelectual

> **Este proyecto es de uso privado y está protegido por derechos de autor.**
>
> **Queda estrictamente prohibida la copia, reproducción, distribución o reutilización total o parcial de este sitio web sin el permiso explícito y por escrito de su creador ([@M4rt0-dev](https://github.com/M4rt0-dev)).**
>
> Si deseas adaptar este proyecto para tu propio servidor o comunidad, debes solicitar autorización previa al autor.

---

## 🔁 Si tienes permiso para duplicar este sitio

Si has obtenido permiso explícito para usar este proyecto como base, **debes reemplazar todas las claves y enlaces de los servicios externos** antes de desplegar tu propia versión. Usar las claves originales haría que tus datos se mezclen con los del proyecto original y podría agotar los límites de uso de los servicios.

### Qué cambiar en Supabase

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com) con tu propia cuenta.
2. Crea la tabla `fichajes` con la estructura documentada en la sección [Tabla `fichajes`](#tabla-fichajes) de este mismo documento.
3. Configura las políticas RLS apropiadas (ver [Configurar Row Level Security](#configurar-row-level-security-rls-recomendada)).
4. Obtén tu **Project URL** y tu **Publishable Key** desde *Settings → API* en el panel de Supabase.
5. Sustituye en `script.js` (líneas 159 y 160):
   - La URL del proyecto: `https://zokaarirkqourkkfmkso.supabase.co` → tu nueva URL.
   - La clave publicable: `sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx` → tu nueva clave.

### Qué cambiar en EmailJS

1. Crea una cuenta en [emailjs.com](https://emailjs.com).
2. Crea un Email Service conectando tu proveedor de correo.
3. Crea las plantillas de correo necesarias (una para el buzón anónimo y otra para anuncios/sugerencias), replicando las variables de los formularios documentadas más abajo.
4. Obtén tu **Public Key**, tu **Service ID** y los **Template IDs** desde el panel de EmailJS.
5. Sustituye en `script.js`:
   - Línea 72: `ERhS_42VHBVxNpsCQ` → tu Public Key.
   - Líneas 582, 622, 662: `service_a6y2ih9` → tu Service ID.
   - Línea 582: `template_9887dpi` → tu Template ID del buzón anónimo.
   - Líneas 622 y 662: `template_dh8tpdk` → tu Template ID de anuncios/sugerencias.

### Otros enlaces y referencias a actualizar

Además de las claves de los servicios, si duplicas el sitio también debes revisar y actualizar:

- Las URLs hardcodeadas al repositorio original (ej: en el `README.md`).
- Los datos de empleados en `usuarios.json` (elimina los usuarios originales y añade los tuyos).
- Las imágenes, textos y contenidos editoriales del sitio (periódicos, galería, equipo, etc.), ya que forman parte de la identidad original de Weazel News Los Santos EVO.

---

## 🟢 Supabase

### ¿Qué es Supabase?

[Supabase](https://supabase.com) es una plataforma Backend-as-a-Service (BaaS) de código abierto que proporciona una base de datos PostgreSQL con API REST y en tiempo real, autenticación y almacenamiento de archivos. En este proyecto solo se usa la **base de datos**.

### ¿Para qué se usa en este proyecto?

Supabase almacena el sistema de fichaje de jornada laboral de los empleados. Cada vez que un empleado entra o sale de servicio, su estado y horas se actualizan en Supabase, lo que permite que la directiva vea la información en tiempo real desde cualquier dispositivo.

### Configuración actual

| Parámetro | Valor | Ubicación en el código |
|---|---|---|
| URL del proyecto | `https://zokaarirkqourkkfmkso.supabase.co` | `script.js`, línea 159 |
| Clave publicable | `sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx` | `script.js`, línea 160 |

> **Nota sobre la clave publicable:** la clave que se usa es una `publishable key`, diseñada específicamente para ser expuesta en el cliente. Sin embargo, en Supabase debes tener configuradas las **Políticas de Seguridad por Filas (RLS)** para evitar que un usuario pueda leer o escribir datos de otros.

### Cómo se inicializa el cliente

El cliente de Supabase **no se carga al iniciar la página**. Solo se carga si el usuario ha aceptado las cookies funcionales:

```javascript
// En script.js (dentro del wznCookieManager)
getSupabaseClient: async function () {
    if (getCookieConsent() !== 'accepted') return null;
    
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    
    if (!window.__wznSupabaseClient) {
        window.__wznSupabaseClient = window.supabase.createClient(
            'https://zokaarirkqourkkfmkso.supabase.co',
            'sb_publishable_Sjccw8zw3zWrCXXq_-2wIQ_nyeAr3Sx'
        );
    }
    
    return window.__wznSupabaseClient;
}
```

El cliente se guarda en `window.__wznSupabaseClient` como singleton para evitar crear múltiples conexiones.

### Tabla `fichajes`

Esta es la única tabla que usa el proyecto en Supabase.

#### Estructura de la tabla

| Columna | Tipo de dato | Descripción | Ejemplo |
|---|---|---|---|
| `user_id` | `text` (clave primaria) | Nombre de usuario, coincide con `user` en `usuarios.json` | `"Asher_Stark"` |
| `enServicio` | `boolean` | `true` si el empleado está actualmente trabajando | `false` |
| `clockInTime` | `bigint` o `null` | Timestamp en milisegundos del momento en que fichó entrada | `1714920000000` |
| `totalSeconds` | `integer` | Total de segundos acumulados en la semana | `7200` |

#### Operaciones que realiza el sistema

**Leer registro de un empleado** (al cargar el panel de empleado):
```javascript
const { data, error } = await supabase
    .from('fichajes')
    .select('*')
    .eq('user_id', sessionUser)
    .single();
```

**Crear registro si no existe** (primer login del empleado):
```javascript
await supabase.from('fichajes').insert([{
    user_id: sessionUser,
    enServicio: false,
    clockInTime: null,
    totalSeconds: 0
}]);
```

**Actualizar al fichar entrada o salida:**
```javascript
await supabase.from('fichajes').update({
    enServicio: miData.enServicio,
    clockInTime: miData.clockInTime,
    totalSeconds: miData.totalSeconds
}).eq('user_id', sessionUser);
```

**Leer todos los empleados** (panel de directiva):
```javascript
const { data: empleadosDB } = await supabase
    .from('fichajes')
    .select('*');
```

**Resetear horas de un empleado** (desde directiva):
```javascript
await supabase
    .from('fichajes')
    .update({ totalSeconds: 0 })
    .eq('user_id', userId);

// Si el empleado estaba en servicio, también se resetea clockInTime a ahora:
await supabase
    .from('fichajes')
    .update({ totalSeconds: 0, clockInTime: Date.now() })
    .eq('user_id', userId);
```

### Cómo migrar a un nuevo proyecto de Supabase

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com).
2. En el panel de Supabase, ve a **Table Editor** y crea la tabla `fichajes` con las columnas indicadas arriba.
3. Configura las **Row Level Security (RLS) policies** apropiadas.
4. Obtén la **Project URL** y la **Publishable Key** desde *Settings → API*.
5. Actualiza estos dos valores en `script.js` (líneas 159 y 160).

### Configurar Row Level Security (RLS) recomendada

Para que el sistema funcione correctamente con RLS activo, necesitas estas políticas en la tabla `fichajes`:

- **SELECT (lectura):** permitir a todos los usuarios autenticados leer todas las filas (para que la directiva vea a todos los empleados).
- **INSERT (insertar):** permitir insertar solo si el `user_id` coincide con el usuario que hace la petición.
- **UPDATE (actualizar):** permitir actualizar solo si el `user_id` coincide.

> En el contexto actual (clave publicable sin autenticación de Supabase), es conveniente al menos restringir con RLS básico para que solo se puedan modificar los propios datos.

---

## 📧 EmailJS

### ¿Qué es EmailJS?

[EmailJS](https://emailjs.com) es un servicio que permite enviar correos electrónicos directamente desde el navegador (JavaScript del cliente) sin necesitar un servidor backend. Usa plantillas de correo configuradas en el panel de EmailJS y las envía a través de un proveedor de correo configurado (Gmail, Outlook, etc.).

### ¿Para qué se usa en este proyecto?

EmailJS gestiona el envío de los tres formularios del sitio:

| Formulario | Página | Template de EmailJS |
|---|---|---|
| Buzón anónimo (chivatazos ciudadanos) | `portal.html` | `template_9887dpi` |
| Solicitud de publicación de anuncio | `anuncios.html` | `template_dh8tpdk` |
| Buzón de sugerencias | `sugerencias.html` | `template_dh8tpdk` |

### Configuración actual

| Parámetro | Valor | Ubicación en el código |
|---|---|---|
| Public Key (init) | `ERhS_42VHBVxNpsCQ` | `script.js`, línea 72 |
| Service ID | `service_a6y2ih9` | `script.js`, líneas 582, 622, 662 |
| Template ID - Buzón anónimo | `template_9887dpi` | `script.js`, línea 582 |
| Template ID - Anuncios | `template_dh8tpdk` | `script.js`, línea 622 |
| Template ID - Sugerencias | `template_dh8tpdk` | `script.js`, línea 662 |

### Cómo se inicializa EmailJS

Al igual que Supabase, EmailJS **no se carga al iniciar la página**. Solo se carga si el usuario ha aceptado cookies:

```javascript
function ensureEmailJsReady() {
    return loadScriptOnce('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js')
        .then(function () {
            if (window.emailjs && !window.__wznEmailJsInitialized) {
                window.emailjs.init('ERhS_42VHBVxNpsCQ');  // Public Key
                window.__wznEmailJsInitialized = true;
            }
            return !!window.emailjs;
        });
}
```

El flag `window.__wznEmailJsInitialized` evita inicializar EmailJS múltiples veces.

### Cómo funciona `emailjs.sendForm()`

El método `emailjs.sendForm()` toma el formulario HTML directamente y mapea los campos `name` del formulario a las variables de la plantilla de EmailJS:

```javascript
emailjs.sendForm('service_a6y2ih9', 'template_9887dpi', formularioHTMLElement)
```

Por eso es importante que los atributos `name` de los `<input>` y `<textarea>` del formulario coincidan exactamente con las variables definidas en la plantilla de EmailJS.

#### Campos del formulario de Buzón Anónimo (`portal.html`):
| Campo `name` | Descripción |
|---|---|
| `asunto` | Asunto del chivatazo |
| `mensaje` | Descripción detallada |
| `adjunto` | Enlace a pruebas (opcional) |

#### Campos del formulario de Anuncios (`anuncios.html`):
| Campo `name` | Descripción |
|---|---|
| `nombre` | Nombre del negocio o particular |
| `telefono` | Teléfono de contacto |
| `titulo` | Título corto del anuncio |
| `descripcion` | Descripción detallada del servicio |

#### Campos del formulario de Sugerencias (`sugerencias.html`):
| Campo `name` | Descripción |
|---|---|
| `nombre` | Nombre o alias del ciudadano |
| `telefono` | Teléfono (opcional) |
| `titulo` | Asunto de la sugerencia |
| `descripcion` | Texto completo de la sugerencia |

### Cómo migrar a una nueva cuenta de EmailJS

1. Crea una cuenta en [emailjs.com](https://emailjs.com).
2. **Crea un Email Service:** conecta tu proveedor de correo (Gmail, Outlook, etc.) en *Email Services*.
3. **Crea las plantillas de correo** en *Email Templates*. Crea al menos dos plantillas:
   - Una para el buzón anónimo (incluye variables `{{asunto}}`, `{{mensaje}}`, `{{adjunto}}`).
   - Una para anuncios y sugerencias (incluye variables `{{nombre}}`, `{{telefono}}`, `{{titulo}}`, `{{descripcion}}`).
4. **Obtén tus IDs** desde el panel de EmailJS:
   - Public Key: en *Account → API Keys*.
   - Service ID: en *Email Services* (aparece como `service_XXXXXXX`).
   - Template IDs: en *Email Templates* (aparece como `template_XXXXXXX`).
5. Actualiza los valores en `script.js`:
   - Línea 72: Public Key en `emailjs.init('...')`.
   - Líneas 582, 622, 662: Service ID y Template IDs en las llamadas a `emailjs.sendForm(...)`.

### Plan gratuito de EmailJS

El plan gratuito de EmailJS permite **200 emails al mes**. Para un servidor RP privado, esto suele ser más que suficiente. Si se superase ese límite, habría que actualizar al plan de pago.

---

## 🛠️ Solución de problemas comunes

### "No se pudo cargar el servicio de envío de formularios"
- Comprueba que el usuario ha aceptado las cookies (EmailJS no se carga sin aceptación).
- Verifica que tienes conexión a internet.
- Comprueba en la consola del navegador si hay errores al cargar el CDN de EmailJS.

### "Hubo un error al enviar el correo"
- Verifica que el Service ID y el Template ID en `script.js` son correctos.
- Comprueba en el panel de EmailJS que la plantilla está activa y el servicio de correo está verificado.
- Verifica que los nombres de los campos `name` del formulario coinciden con las variables de la plantilla.

### "Error de conexión. Revisa que estés usando un servidor local"
- Este error aparece en el login cuando `fetch('usuarios.json')` falla.
- La causa más común es abrir el archivo con `file://` en lugar de un servidor HTTP.
- Solución: usa Live Server en VS Code o cualquier servidor HTTP local.

### "No se pudo inicializar Supabase"
- El usuario no ha aceptado las cookies funcionales.
- Hay un problema de red al descargar el CDN de Supabase.
- La URL o la clave de Supabase son incorrectas.

### El empleado aparece en el panel pero sus horas son 0
- Es el primer login del empleado: Supabase crea su fila con `totalSeconds: 0`.
- O la directiva ha reseteado sus horas.
- Es normal; el contador empieza a acumular desde que el empleado ficha por primera vez.
