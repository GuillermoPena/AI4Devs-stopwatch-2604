
# CHATBOT USADO: Claude Sonnet 4.6

# PROMPT INICIAL

Eres un experto desarrollador de software y apps web, especializado en javascript, HTML y CSS.
Observa cuidadosamente las tres imagenes que te ofrezco. 
Son 3 pantallas de una misma app web (https://www.online-stopwatch.com/):

- La pantalla central, que se muestra al inicio como enrutador hacia las otras dos pantallas
- La pantalla de la derecha: un cronometro
- La pantalla de la izquierda: una cuenta atras configurable.

Quiero que generes un detallado prompt para una IA que me permita desarrollar la funcionalidad sugerida por las imagenes.  Considera lo siguiente:

- Debes aplicar buenas practicas de prompting para desarrollo de software.
- Incluye en el prompt loa siguientes apartados obligatorios:
  · Contexto
  · Objetivo
  · Requisitos funcionales
  · Requisitos de UI/UX
  · Requisitos tecnicos
  · Comportamientos esperados
- Separa en varios vicheros el HTML, el CSS y el Javascript para un mejor mantenimiento.


# PROMPT 2

## CONTEXTO

Eres un experto desarrollador frontend especializado en JavaScript vanilla, HTML5 y CSS3. Debes construir una aplicación web de cronómetro y cuenta atrás, inspirada visualmente en `www.online-stopwatch.com`. La app constará de **tres pantallas** navegables sin recarga de página (SPA sin frameworks), separando el código en tres ficheros independientes: `index.html`, `styles.css` y `app.js`.

---

## OBJETIVO

Desarrollar una aplicación web funcional, responsiva y visualmente clara que permita al usuario:

1. Elegir entre un **cronómetro ascendente** (Stopwatch) y una **cuenta atrás configurable** (Countdown).
2. Operar cada herramienta de forma intuitiva desde cualquier dispositivo.

---

## REQUISITOS FUNCIONALES

### Pantalla 0 — Menú principal (enrutador)

- Se muestra al cargar la app.
- Contiene **dos opciones seleccionables**:
  - **Stopwatch** — representada con una flecha verde apuntando hacia arriba.
  - **Countdown** — representada con una flecha roja apuntando hacia abajo.
- Al pulsar cualquiera de las dos opciones, se navega a la pantalla correspondiente **sin recargar la página**.

### Pantalla 1 — Stopwatch (cronómetro)

- Muestra un display en formato `HH:MM:SS` con milisegundos (`000`) en subíndice a la derecha.
- Botón **Start**: inicia el cronómetro. Una vez iniciado, el botón cambia a **Stop** (o Pause).
- Botón **Clear**: detiene y resetea el display a `00:00:00` y milisegundos a `000`.
- Botón **Back**: regresa a la pantalla del menú principal y resetea el estado.
- El cronómetro continúa aunque el usuario cambie de pestaña (usa `Date.now()` para calcular el tiempo transcurrido, no `setInterval` simple).

### Pantalla 2 — Countdown (cuenta atrás)

**Fase de configuración:**

- Muestra un display en formato `HH:MM:SS` editable, inicialmente en `00:00:00`.
- Teclado numérico en pantalla con los dígitos del `0` al `9`.
- Los dígitos se introducen de derecha a izquierda, rellenando los campos de segundos, minutos y horas en ese orden (comportamiento idéntico al de la referencia visual).
- Botón **Set**: confirma el tiempo introducido y pasa a la fase de ejecución.
- Botón **Clear**: borra el tiempo introducido y resetea el display a `00:00:00`.

**Fase de ejecución:**

- Muestra el tiempo configurado y descuenta hacia `00:00:00`.
- Botón **Start**: inicia la cuenta atrás.
- Una vez iniciado, el botón cambia a **Stop** (Pause).
- Botón **Clear** (rojo): detiene y regresa a la fase de configuración reseteando el display.
- Botón **Back**: regresa al menú principal.
- Al llegar a `00:00:00`, la app emite una **alerta visual** (parpadeo del display en rojo) y un **sonido de aviso** (usa la Web Audio API para generar un pitido, sin depender de ficheros de audio externos).

---

## REQUISITOS DE UI/UX

### Estructura visual general

- **Header**: barra azul oscuro en la parte superior con el texto `www.online-stopwatch.com` centrado en blanco.
- **Footer**: barra azul oscuro en la parte inferior. En las pantallas 1 y 2, contiene el botón **Back** con una flecha apuntando a la izquierda.
- **Fondo de contenido**: blanco o gris muy claro.

### Display del tiempo

- Fuente grande, negra, sans-serif (tipo `Arial Black` o similar).
- Contenedor con borde redondeado, fondo azul muy claro (`#dde6f5` aprox.) y borde gris.
- Los milisegundos (`000`) aparecen en tamaño pequeño, alineados a la derecha inferior del display principal.

### Botones

- **Dígitos (Countdown)**: botones cuadrados de fondo verde brillante (`#00cc00`) con borde verde oscuro redondeado, texto negro en negrita.
- **Set**: mismo estilo que los dígitos numéricos pero más ancho.
- **Clear** (fase configuración): fondo gris claro.
- **Start**: botón grande, verde brillante, texto negro en negrita.
- **Clear / Stop** (fase ejecución): botón grande, rojo brillante (`#ee0000`), texto negro en negrita.
- **Back**: texto blanco sobre fondo azul oscuro, con icono de flecha `←`.

### Menú principal

- Dos mitades horizontales (o dos tarjetas centradas):
  - Izquierda: fondo verde muy claro, texto `Stopwatch`, flecha SVG verde hacia arriba.
  - Derecha: fondo blanco, texto `Countdown`, flecha SVG roja hacia abajo.
- Al hacer hover, cada opción eleva ligeramente su sombra para indicar interactividad.

### Responsividad

- La app debe verse correctamente en pantallas desde 320px (móvil) hasta 1280px (escritorio).
- Los botones deben tener un tamaño mínimo de toque de 44x44px.

---

## REQUISITOS TÉCNICOS

### Estructura de ficheros

```
/project
│
├── index.html     → Estructura HTML de las 3 pantallas (ocultas/visibles por clase CSS)
├── styles.css     → Todos los estilos, animaciones y media queries
└── app.js         → Toda la lógica: enrutado, cronómetro, cuenta atrás, audio
```

### `index.html`

- HTML5 semántico con `lang="es"`.
- Las tres pantallas son `<section>` con `id`: `screen-home`, `screen-stopwatch`, `screen-countdown`.
- Solo una pantalla es visible a la vez mediante la clase CSS `active`.
- Sin dependencias externas (sin jQuery, sin frameworks).

### `styles.css`

- Variables CSS (`--color-primary`, `--color-green`, `--color-red`, etc.) definidas en `:root`.
- Clase `.active` controla la visibilidad de cada pantalla (`display: flex` vs `display: none`).
- Animación `@keyframes blink` para el parpadeo rojo del display al finalizar la cuenta atrás.
- Uso de `flexbox` para todos los layouts.

### `app.js`

- **Módulo de enrutado**: función `showScreen(id)` que gestiona qué pantalla es visible.
- **Módulo Stopwatch**:
  - Usa `Date.now()` para calcular el tiempo transcurrido con precisión.
  - `requestAnimationFrame` para actualizar el display de forma eficiente.
  - Estado: `{ running, startTime, elapsed }`.
- **Módulo Countdown**:
  - Lógica de entrada de dígitos por teclado virtual (buffer de 6 dígitos, rellenado de derecha a izquierda).
  - Usa `Date.now()` + `requestAnimationFrame` igual que el cronómetro.
  - Estado: `{ phase: 'config'|'run', buffer, totalMs, running, startTime, remaining }`.
- **Módulo Audio** (Web Audio API):
  - Función `playBeep()` que genera un tono sinusoidal de ~880Hz durante ~1 segundo al llegar a cero.
  - Sin ficheros `.mp3` ni `.wav` externos.
- **Sin variables globales sueltas**: encapsula todo en un IIFE o módulo ES6.
- Código comentado en inglés, siguiendo convenciones `camelCase`.

---

## COMPORTAMIENTOS ESPERADOS

| Acción | Comportamiento esperado |
|---|---|
| Cargar la app | Se muestra el menú principal con Stopwatch y Countdown |
| Clic en Stopwatch | Navega a la pantalla del cronómetro en estado inicial `00:00:00.000` |
| Clic en Start (Stopwatch) | El cronómetro empieza a contar; el botón cambia a Stop |
| Clic en Stop (Stopwatch) | El cronómetro se pausa; el botón vuelve a Start |
| Clic en Clear (Stopwatch) | El cronómetro se detiene y se resetea a `00:00:00.000` |
| Clic en Back (Stopwatch) | Vuelve al menú; el cronómetro se resetea internamente |
| Clic en Countdown | Navega a la pantalla de configuración con display `00:00:00` |
| Pulsar dígitos en Countdown | El display se rellena de derecha a izquierda (como una calculadora) |
| Clic en Clear (config) | El buffer se vacía y el display vuelve a `00:00:00` |
| Clic en Set | Si el tiempo es > 0, pasa a la fase de ejecución mostrando Start y Clear rojo |
| Clic en Start (Countdown) | La cuenta atrás comienza; el botón cambia a Stop |
| Cuenta atrás llega a 0 | Display parpadea en rojo, suena pitido, los botones quedan desactivados hasta Clear |
| Clic en Clear (ejecución) | Detiene la cuenta atrás y vuelve a la fase de configuración reseteada |
| Clic en Back (cualquier pantalla) | Vuelve al menú principal; el estado interno de la pantalla se resetea |

---

> **Nota final al modelo:** Genera los tres ficheros completos y funcionales. No omitas ninguna sección del código bajo el pretexto de brevedad. Comenta las secciones clave del JavaScript. Verifica que la lógica de entrada de dígitos del Countdown es correcta antes de escribir el código final.


# PROMPT 3

Analiza los siguientes problemas observados en la web app y genera un prompt de corrección que actualice los ficheros que correspondan:

1. En la parte superior de la aplicacion, el texto '[www.online-stopwatch.com](https://www.online-stopwatch.com)' debería ser un link a esa misma url. No lo subrayes ni cambies su aspecto visual pero permite ir a la url si pinchas sobre él.

2. El contador de tiempo, tanto en el cronometro como en la cuenta atras, parece 'vibrar' horizontalmente debido a las diferentes anchuras de los dígitos. Esto reposiciona los digitos constantemente mientras el tiempo corre. Solventa esta molesta 'vibracion'.

3. El funcionamiento esperado del boton 'Clear' en la pantalla del contador de tiempo de cuenta atras es reiniciar el contador con el tiempo establecido, no ir a la pantalla de establecimiento de cuenta atras.

# PROMPT 4 (generación de prompt correctivo BUG001)

Genera un prompt detallado y completo que explique las ordenes correspondientes para realizar la siguiente modificación:

En la parte superior de la aplicacion, el texto '__[https://www.online-stopwatch.com](https://www.online-stopwatch.com/)__' debe ser un enlace. No modifiques su aspecto visual

# PROMPT 5 (aplicación de prompt correctivo BUG001)

Aplica el siguiente prompt:

### Contexto
Tengo una aplicación web SPA de cronómetro y cuenta atrás compuesta por tres ficheros: index.html, styles.css y app.js. La app tiene tres pantallas (screen-home, screen-stopwatch, screen-countdown), cada una con un header idéntico que muestra el texto www.online-stopwatch.com.

### Objetivo
Convertir el texto del header en un enlace funcional a https://www.online-stopwatch.com que se abra en una nueva pestaña, sin alterar en absoluto su aspecto visual (mismo color, mismo tamaño, sin subrayado, sin cursor diferente al hover sobre el header).

### Ficheros afectados
Solo deben modificarse index.html y styles.css. El fichero app.js no debe tocarse.

#### Cambios en index.html
Localiza las tres ocurrencias del siguiente patrón en los headers de cada pantalla:
html<span>www.online-stopwatch.com</span>
Sustitúyelas en los tres casos por:
html<a href="https://www.online-stopwatch.com"
   target="_blank"
   rel="noopener noreferrer"
   class="header-link">www.online-stopwatch.com</a>
Los tres headers afectados están dentro de:

<section id="screen-home">
<section id="screen-stopwatch">
<section id="screen-countdown">

#### Cambios en styles.css
Añade la siguiente regla CSS inmediatamente después del bloque .app-header { ... }, para anular los estilos por defecto que los navegadores aplican a los elementos <a>:
css/* Header link — visually identical to plain text */
.header-link {
  color: inherit;
  text-decoration: none;
  cursor: default;
}

Explicación de cada propiedad:

color: inherit — hereda el blanco (#fff) del .app-header padre, sin aplicar el azul por defecto de los enlaces.
text-decoration: none — elimina el subrayado que los navegadores añaden a los <a> por defecto.
cursor: default — mantiene el cursor de flecha estándar al pasar sobre el header, igual que si fuera texto plano.

### Comportamiento esperado tras el cambio
SituaciónComportamientoApariencia visual del headerIdéntica a antes del cambioClic sobre el textoAbre https://www.online-stopwatch.com en una pestaña nuevaHover sobre el textoEl cursor no cambia respecto al resto del headerInspección de accesibilidadEl elemento es un <a> semántico navegable con teclado

### Restricciones
No añadir ningún efecto hover (ni subrayado, ni cambio de color, ni opacity).
No modificar las propiedades existentes del bloque .app-header.
No tocar app.js bajo ningún concepto.
El atributo rel="noopener noreferrer" es obligatorio por seguridad al usar target="_blank".
La clase header-link debe aplicarse en las tres pantallas, no solo en una.



# PROMPT 6 (generación de prompt correctivo BUG002)

Genera un prompt detallado y completo que explique las ordenes correspondientes para realizar la siguiente modificación:

El funcionamiento esperado del boton 'Clear' en la pantalla del contador de tiempo de cuenta atras es reiniciar el contador con el tiempo establecido previamente, no ir a la pantalla de establecimiento de cuenta atras.

# PROMPT 7 (aplicación de prompt correctivo BUG002)

Aplica el siguiente Prompt:

## Prompt de modificación: comportamiento del botón Clear en la fase de ejecución del Countdown

### Contexto

Tengo una aplicación web SPA de cronómetro y cuenta atrás compuesta por tres ficheros: `index.html`, `styles.css` y `app.js`. La pantalla de Countdown tiene dos fases diferenciadas:

- **Fase de configuración** (`phase: 'config'`): se muestra un teclado numérico y los botones Set y Clear. El usuario introduce el tiempo deseado.
- **Fase de ejecución** (`phase: 'run'`): se oculta el teclado numérico y se muestran los botones Start/Stop y Clear. El contador descuenta hacia cero.

El estado del módulo Countdown se gestiona en el objeto `cd`, que entre otros campos contiene:
- `cd.totalMs` — el tiempo total configurado en milisegundos (establecido al pulsar Set).
- `cd.remaining` — el tiempo restante en milisegundos durante la ejecución.
- `cd.running` — booleano que indica si el contador está activo.
- `cd.rafId` — id del `requestAnimationFrame` en curso.

### Problema

El botón **Clear** de la fase de ejecución (`id="cd-btn-clear-run"`) está enlazado a la función `cdEnterConfigPhase()`, que redirige al usuario de vuelta al teclado numérico de configuración. Este comportamiento es incorrecto.

### Objetivo

Modificar exclusivamente `app.js` para que el botón Clear en la fase de ejecución **detenga el contador y lo reinicie al tiempo configurado originalmente** (`cd.totalMs`), permaneciendo en la fase de ejecución y dejando el contador listo para volver a iniciarse con Start. No debe navegar a la fase de configuración ni al menú principal.

### Ficheros afectados

Solo debe modificarse `app.js`. Los ficheros `index.html` y `styles.css` no deben tocarse.

---

### Cambios en `app.js`

#### Paso 1 — Crear la función `cdRestartRun()`

Añade la siguiente función nueva justo después del cierre de la función `cdEnterConfigPhase()`:

```javascript
/**
 * Fix: Clear in run phase — stop the countdown and reset it to the originally
 * configured time (cd.totalMs), staying in run phase ready to Start again.
 * Does NOT navigate back to the config numpad.
 */
function cdRestartRun() {
  // Stop any active animation frame
  cd.running = false;
  cancelAnimationFrame(cd.rafId);

  // Restore remaining time to the full originally configured duration
  cd.remaining = cd.totalMs;

  // Remove the blink animation if the countdown had reached zero
  cdDisplay.classList.remove('blinking');

  // Reset the Start button to its initial green state
  cdBtnStart.textContent = 'Start';
  cdBtnStart.classList.remove('btn-red');
  cdBtnStart.classList.add('btn-green');
  cdBtnStart.disabled = false;

  // Re-render the display showing the full configured time
  cdRenderRemaining();
}
```

#### Paso 2 — Actualizar el event listener de `cdBtnClearRun`

Localiza la línea que registra el evento click del botón Clear de la fase de ejecución. Tiene exactamente esta forma:

```javascript
cdBtnClearRun.addEventListener('click', cdEnterConfigPhase);
```

Sustitúyela por:

```javascript
cdBtnClearRun.addEventListener('click', cdRestartRun);
```

---

### Comportamiento esperado tras el cambio

| Situación | Comportamiento |
|---|---|
| Contador corriendo → pulsar Clear | Se detiene el contador. El display vuelve al tiempo configurado. El botón Start se reactiva en verde. |
| Contador pausado → pulsar Clear | Igual que el caso anterior. |
| Contador llegó a cero (blinking) → pulsar Clear | Se detiene el parpadeo. El display vuelve al tiempo configurado. El botón Start se reactiva. |
| Tras pulsar Clear → pulsar Start | El contador comienza de nuevo desde el tiempo configurado originalmente. |
| Botón Back | Sigue siendo el único camino de regreso a la fase de configuración (numpad). Su comportamiento no cambia. |

---

### Restricciones

- La función `cdEnterConfigPhase()` debe conservarse intacta, ya que sigue siendo utilizada por el botón Back.
- No modificar el estado `cd.phase` dentro de `cdRestartRun()` — debe permanecer en `'run'`.
- No reiniciar `cd.totalMs` — es el valor de referencia que debe preservarse durante toda la fase de ejecución.
- No tocar `index.html` ni `styles.css` bajo ningún concepto.
- No alterar ninguna otra función del módulo Countdown (`cdToggle`, `cdLoop`, `cdReset`, `cdEnterRunPhase`, etc.).

# PROMPT 8 (generación de prompt correctivo BUG002b)

Genera un prompt detallado y completo que explique las ordenes correspondientes para realizar la siguiente modificación:

Al pulsar 'Clear' en el contador de tiempo de cuenta atrás, debe resetearse el contador con el valor que se estableció en la pantalla de establecimiento de cuenta atrás y no con el ultimo valor que tenia el contador cuando paramos la cuenta atrás.

# PROMPT 9 (aplicación de prompt correctivo BUG002b)

Aplica el prompt siguiente prompt:

## Prompt de modificación: Clear en Countdown resetea al tiempo original, no al tiempo pausado

### Contexto
Tengo una aplicación web SPA de cronómetro y cuenta atrás compuesta por tres ficheros: index.html, styles.css y app.js. La pantalla de Countdown tiene dos fases:

Fase de configuración (phase: 'config'): el usuario introduce un tiempo mediante un teclado numérico y pulsa Set.
Fase de ejecución (phase: 'run'): el contador descuenta hacia cero. Los botones disponibles son Start/Stop y Clear.

El estado del módulo Countdown se gestiona en el objeto cd, que contiene entre otros:

cd.totalMs — tiempo total configurado al pulsar Set, en milisegundos. Este es el valor de referencia original.
cd.remaining — tiempo restante en el momento actual de la ejecución.
cd.running — booleano, true si el contador está activo.
cd.rafId — id del requestAnimationFrame en curso.

### Problema
La función cdToggle(), que gestiona los eventos Start/Stop, contiene la siguiente lógica al pausar:
javascript// Al pausar, sobreescribe cd.totalMs con el tiempo restante en ese momento
cd.totalMs  = cd.remaining;
cd.running  = false;
cancelAnimationFrame(cd.rafId);
Esta línea cd.totalMs = cd.remaining destruye el valor de referencia original. Como consecuencia, cuando el usuario pulsa Clear después de haber pausado, el contador se reinicia al tiempo en que se pausó en lugar de al tiempo configurado originalmente con Set.
Ejemplo del problema:

Usuario configura 5 minutos → pulsa Set.
El contador corre durante 2 minutos → pulsa Stop. Quedan 3 minutos.
El usuario pulsa Clear.
Resultado actual (incorrecto): el contador se resetea a 3 minutos.
Resultado esperado (correcto): el contador se resetea a 5 minutos.

### Objetivo
Modificar exclusivamente app.js para que cd.totalMs conserve siempre el tiempo configurado originalmente con Set, de modo que Clear en la fase de ejecución restaure siempre ese valor original, independientemente de cuántas veces se haya pausado y reanudado el contador.
Ficheros afectados
Solo debe modificarse app.js. Los ficheros index.html y styles.css no deben tocarse.

Cambios en app.js
Paso único — Corregir la función cdToggle()
Localiza la función cdToggle(). Dentro de su rama de pausa (bloque if (cd.running)), encontrarás esta secuencia:
javascript// Pause: save remaining
cd.totalMs  = cd.remaining;
cd.running  = false;
cancelAnimationFrame(cd.rafId);
Elimina únicamente la línea cd.totalMs = cd.remaining;. El resto del bloque debe quedar intacto. El resultado debe ser:
javascript// Pause: save remaining
cd.running  = false;
cancelAnimationFrame(cd.rafId);
La variable cd.remaining sigue siendo necesaria para que al reanudar el contador continúe desde donde se pausó. Lo que se elimina es la sobreescritura de cd.totalMs, que es el único campo que Clear debe usar como referencia para el reinicio.

### Por qué funciona este cambio
CampoResponsabilidadSe modifica al pausarcd.totalMsTiempo de referencia para Clear y para reiniciarNo (tras el fix)cd.remainingTiempo restante para continuar tras una pausaSí, en cdLoop()
Al reanudar tras una pausa, cdLoop() calcula el tiempo transcurrido desde cd.startTime y lo resta de cd.totalMs. Por tanto, para que la reanudación sea correcta, cd.totalMs debe reflejar el tiempo restante en el momento de pausar. Esto se consigue actualizando cd.totalMs en la rama de reanudación de cdToggle(), no en la de pausa.
El bloque de reanudación dentro de cdToggle() debe quedar así:
javascript// Resume: set totalMs to remaining so cdLoop counts from here
cd.totalMs   = cd.remaining;
cd.startTime = Date.now();
cd.running   = true;
Si este bloque de reanudación no existe con esta forma en el código actual, añádelo. Si ya existe pero sin la línea cd.totalMs = cd.remaining, agrégala.

### Comportamiento esperado tras el cambio
Acción del usuarioComportamiento esperadoConfigurar 5 min → Set → StartContador corre desde 5:00 hacia ceroContador en 3:00 → StopContador se pausa en 3:00Start (reanudar)Contador continúa desde 3:00Stop de nuevo → ClearContador se resetea a 5:00 (tiempo original)Clear con contador corriendoContador se detiene y resetea a 5:00Clear con contador en cero (blinking)Parpadeo desaparece, display muestra 5:00Back (desde cualquier estado)Regresa al numpad. Comportamiento sin cambios.

### Restricciones
Modificar únicamente la función cdToggle() dentro de app.js.
No alterar cd.totalMs en ningún otro punto del flujo de pausa.
No modificar las funciones cdLoop(), cdRestartRun(), cdEnterRunPhase(), cdEnterConfigPhase() ni cdReset().
No tocar index.html ni styles.css bajo ningún concepto.
La lógica de reanudación debe seguir funcionando correctamente: al reanudar tras una pausa, el contador debe continuar desde el punto donde se detuvo, no desde el principio.

# PROMPT 10 (aplicación de prompt correctivo BUG003)

Cambia la fuente de los numeros por una fuente de ancho fijo