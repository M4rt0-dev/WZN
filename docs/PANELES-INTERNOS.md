# 🖥️ Paneles Internos — Empleado y Directiva

Este documento describe en detalle cómo funcionan las dos páginas de acceso restringido del sistema: el **Panel de Empleado** y el **Panel de Directiva**.

---

## 🔐 Sistema de sesiones

Antes de entrar en los paneles, conviene entender cómo se gestiona la sesión de usuario, ya que ambos paneles dependen de ella.

### ¿Dónde se guarda la sesión?

La sesión se guarda en el `localStorage` del navegador con tres claves:

| Clave | Valor | Ejemplo |
|---|---|---|
| `weazel_session` | Nombre de usuario (campo `user` del JSON) | `"Asher_Stark"` |
| `weazel_role` | Rol del usuario | `"empleado"` o `"admin"` |
| `weazel_nombre` | Nombre completo para mostrar | `"Asher Stark"` |

### ¿Cuándo se crea la sesión?

La sesión se crea en `portal.html` cuando el login es exitoso:

```javascript
localStorage.setItem('weazel_session', empleadoValido.user);
localStorage.setItem('weazel_role', empleadoValido.rol);
localStorage.setItem('weazel_nombre', empleadoValido.nombre);
```

### ¿Cuándo se destruye la sesión?

- Cuando el empleado hace clic en **"Cerrar Sesión"** en cualquiera de los paneles.
- Cuando la directiva hace clic en **"Cerrar Sesión Directiva"**.
- Cuando el usuario rechaza las cookies (se llama a `localStorage.clear()` y se eliminan las claves `sb-*`).

Al cerrar sesión siempre se ejecuta `localStorage.clear()` y se redirige a `portal.html`.

---

## 👷 Panel de Empleado (`panel-empleado.html`)

### ¿Quién puede acceder?

Solo los usuarios con `weazel_role === 'empleado'` guardado en `localStorage`. Si alguien intenta acceder directamente a la URL sin sesión válida, es redirigido automáticamente a `portal.html`.

### ¿Qué muestra?

El panel de empleado es una interfaz minimalista centrada en la tarjeta de fichaje:

```
┌─────────────────────────────────────┐
│   Bienvenido/a, [Nombre Empleado]   │
│   Sistema de registro de jornada   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Horas Semanales:           │   │
│   │       Xh Ym                 │   │
│   └─────────────────────────────┘   │
│                                     │
│   [  ENTRAR DE SERVICIO  ]          │   ← botón rojo
│   ⚫ Fuera de servicio              │
│                                     │
│        [Cerrar Sesión]              │
└─────────────────────────────────────┘
```

### Flujo completo al cargar el panel

1. **Verificación de cookies:** si el usuario no ha aceptado cookies, se muestra un mensaje con un botón para gestionar preferencias. La lógica de fichaje no se carga.

2. **Verificación de Supabase:** si Supabase no está disponible (fallo de red o cookies rechazadas), se muestra un mensaje de error.

3. **Verificación de sesión:** si no hay `weazel_session` en localStorage o el rol no es `'empleado'`, se redirige a `portal.html`.

4. **Carga de datos desde Supabase:** se hace una consulta `SELECT * FROM fichajes WHERE user_id = [sessionUser]`.
   - Si existe el registro → se cargan los datos.
   - Si no existe (error `PGRST116`, que significa "no rows found") → se crea el registro con valores por defecto y se guarda en Supabase.

5. **Renderizado de la UI:** se llama a `updateUI()` para mostrar el estado actual:
   - Si `enServicio = true`: botón verde con texto "SALIR DE SERVICIO" + mensaje "🟢 Nombre está en servicio".
   - Si `enServicio = false`: botón rojo con texto "ENTRAR DE SERVICIO" + mensaje "⚫ Fuera de servicio".

6. **Timer de actualización:** `setInterval(updateUI, 60000)` actualiza el contador de horas cada minuto para que el empleado vea el tiempo acumulado en tiempo real.

### Cómo funciona el fichaje

#### ENTRADA (enServicio era false)

```javascript
miData.enServicio = true;
miData.clockInTime = Date.now();  // Timestamp actual en ms
// → guardar en Supabase
```

#### SALIDA (enServicio era true)

```javascript
const now = Date.now();
const workedSeconds = Math.floor((now - miData.clockInTime) / 1000);
miData.totalSeconds += workedSeconds;  // Acumula los segundos de esta sesión
miData.enServicio = false;
miData.clockInTime = null;
// → guardar en Supabase
```

#### Cálculo de horas mostradas

```javascript
const totalDisplaySeconds = miData.totalSeconds + currentSessionSeconds;
const hours = Math.floor(totalDisplaySeconds / 3600);
const minutes = Math.floor((totalDisplaySeconds % 3600) / 60);
// Resultado: "Xh Ym"
```

Si el empleado está en servicio, `currentSessionSeconds` se calcula en tiempo real como `(Date.now() - clockInTime) / 1000`, de modo que el contador sigue avanzando incluso si no pulsa "Salir" aún. Esto se actualiza cada 60 segundos gracias al `setInterval`.

### Cierre de sesión con fichaje activo

Si el empleado cierra sesión mientras está en servicio:

1. Se calcula el tiempo trabajado desde `clockInTime` hasta ahora.
2. Se suma al `totalSeconds`.
3. Se actualiza Supabase con `enServicio: false`.
4. Se muestra un `alert` informando de que ha sido "desfichado automáticamente".
5. Se limpia el `localStorage` y se redirige a `portal.html`.

Esto evita que los empleados acumulen horas "fantasma" si olvidan pulsar el botón de salida.

---

## 👔 Panel de Directiva (`panel-directiva.html`)

### ¿Quién puede acceder?

Solo los usuarios con `weazel_role === 'admin'` guardado en `localStorage`. Cualquier acceso sin sesión admin es redirigido a `portal.html`.

### ¿Qué muestra?

El panel de directiva tiene tres secciones principales:

```
┌─────────────────────────────────────────────────────────┐
│  Registrar Empleado        │  Resumen General            │
│  ─────────────────         │  ─────────────────────────  │
│  [Usuario]                 │  Bienvenido, Director.      │
│  [Contraseña]              │                             │
│  [CREAR CUENTA]            │  Total Empleados: X         │
│                            │                             │
│                            │  [Cerrar Sesión Directiva]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Plantilla y Fichajes                                   │
│  ─────────────────────────────────────────────────────  │
│  Nombre       │ Contraseña │ Estado    │ Horas │ Acc.   │
│  ─────────────────────────────────────────────────────  │
│  Asher Stark  │ ●●●●●●●●  │ 🟢 Trabaj.│ 3h 20m│ [0]   │
│  Monet Basenji│ ●●●●●●●●  │ ⚫ Libre  │ 1h 5m │ [0]   │
│  ...          │ ...        │ ...       │ ...   │ ...   │
└─────────────────────────────────────────────────────────┘
```

### Carga de la tabla de empleados

La función `cargarTablaEmpleados()` realiza dos peticiones en paralelo y cruza los datos:

**Paso 1 — Leer horas de Supabase:**
```javascript
const { data: empleadosDB } = await supabase.from('fichajes').select('*');
// Crea un mapa: { user_id: datosHoras }
```

**Paso 2 — Leer lista de usuarios de `usuarios.json`:**
```javascript
const respuesta = await fetch('usuarios.json?t=' + Date.now());
const usuariosBase = await respuesta.json();
```

**Paso 3 — Cruzar datos:**
Para cada usuario en `usuarios.json` con `rol === 'empleado'`:
- Busca su fila en el mapa de Supabase.
- Si no tiene fila, asume `{ enServicio: false, totalSeconds: 0 }`.
- Calcula horas y minutos: `totalSeconds + (si enServicio → segundos desde clockInTime)`.
- Renderiza una fila `<tr>` en la tabla HTML.

Esto significa que la tabla **siempre refleja el estado actual** porque fusiona el maestro de usuarios (JSON) con los datos de actividad (Supabase).

### Estados del empleado en la tabla

| Icono | Texto | Significado |
|---|---|---|
| 🟢 | Trabajando | `enServicio = true` en Supabase |
| ⚫ | Libre | `enServicio = false` en Supabase |

### Botón "Poner a 0" (reset de horas)

Cada fila tiene un botón para resetear las horas semanales del empleado:

```javascript
// Si el empleado NO está en servicio:
await supabase.from('fichajes').update({ totalSeconds: 0 }).eq('user_id', userId);

// Si el empleado SÍ está en servicio:
// Se resetean las horas PERO se mantiene en servicio, 
// y clockInTime se actualiza a AHORA para no acumular tiempo pasado.
await supabase.from('fichajes').update({
    totalSeconds: 0,
    clockInTime: Date.now()
}).eq('user_id', userId);
```

Tras el reset, la tabla se recarga automáticamente con `cargarTablaEmpleados()`.

### Registro de nuevo empleado (limitación importante)

El formulario "Registrar Empleado" en el panel de directiva tiene una limitación conocida:

> **JavaScript ejecutado en el navegador no puede escribir en archivos del servidor.**

Cuando la directiva rellena el formulario y pulsa "CREAR CUENTA", aparece el siguiente mensaje:

> *"Para crear un nuevo empleado de forma permanente y segura, debes añadirlo manualmente en el archivo `usuarios.json` usando tu editor de código."*

El formulario se resetea y **no hace ninguna petición**. Esto es intencionado: la forma correcta de añadir empleados es editar `usuarios.json` directamente (ver [Guía de Desarrollo](GUIA-DESARROLLO.md)).

---

## 🔄 Ciclo de vida completo de un empleado

A continuación se ilustra el ciclo completo desde que se crea una cuenta hasta que se termina la semana:

```
1. [Administrador] Edita usuarios.json
        │
        │ Añade: { user, pass, nombre, rol: "empleado" }
        ▼
2. [Empleado] Accede a portal.html e inicia sesión
        │
        │ fetch('usuarios.json') → compara credenciales → OK
        │ localStorage: { session, role, nombre }
        │ redirect → panel-empleado.html
        ▼
3. [Supabase] Primer acceso al panel
        │
        │ SELECT * FROM fichajes WHERE user_id = user → PGRST116 (no existe)
        │ INSERT INTO fichajes (user_id, enServicio, clockInTime, totalSeconds)
        │         VALUES ('nombre_usuario', false, null, 0)
        ▼
4. [Empleado] Pulsa "ENTRAR DE SERVICIO"
        │
        │ clockInTime = Date.now()
        │ enServicio = true
        │ UPDATE fichajes SET ... WHERE user_id = ...
        │ UI: botón verde, "🟢 Nombre está en servicio"
        ▼
5. [Directiva] Ve en su panel: 🟢 Trabajando | Xh Ym (actualizado en tiempo real)

6. [Empleado] Pulsa "SALIR DE SERVICIO"
        │
        │ workedSecs = Date.now() - clockInTime
        │ totalSeconds += workedSecs
        │ enServicio = false
        │ clockInTime = null
        │ UPDATE fichajes SET ... WHERE user_id = ...
        │ UI: botón rojo, "⚫ Fuera de servicio"
        ▼
7. [Fin de semana] Directiva pulsa "Poner a 0" en cada empleado
        │
        │ UPDATE fichajes SET totalSeconds = 0 WHERE user_id = ...
        │ (Si enServicio: también clockInTime = Date.now())
        ▼
8. Nuevo ciclo desde el paso 4
```

---

## 🧪 Probar los paneles en local

Para probar los paneles en local necesitas:

1. **Un servidor HTTP local** (Live Server en VS Code).
2. **Cookies aceptadas** en el navegador (el banner aparecerá la primera vez).
3. **Credenciales válidas** de `usuarios.json`.
4. **Conexión a internet** para que funcione Supabase.

### Cuenta de prueba rápida

Puedes usar cualquier cuenta del `usuarios.json` actual. Para acceder al panel de directiva, usa la cuenta con `"rol": "admin"`.

### Ver los logs de Supabase

Si algo falla con Supabase, abre la consola del navegador (F12 → Console). Los errores de Supabase se registran con `console.error("Error al conectar con Supabase:", error)`.

También puedes ver las peticiones en la pestaña **Network** del navegador (F12 → Network) filtrando por `supabase` para ver las peticiones a la API.
