# codigo de la pagina web 

# Biblioteca Steam

Aplicación web para buscar libros por código de barras en una base MySQL. Opcionalmente, el navegador puede enviar el resultado a un Arduino conectado por USB para mostrarlo en una pantalla OLED y señalarlo con LEDs y un buzzer.

## Tecnologías utilizadas

- **HTML5** (`front/index.php`): estructura de la página, campo de búsqueda, botones y área de resultados.
- **CSS3** (`front/style.css`): estilos, distribución y presentación de los resultados.
- **JavaScript moderno** (`front/js/search.js`): búsqueda asíncrona, actualización de la página y conexión serial con Arduino.
- **PHP** (`search.php`): endpoint que recibe la consulta y accede a la base de datos.
- **MySQL** (`bd/steam.sql`): almacenamiento de códigos de barras, títulos y precios.
- **PDO**: conexión de PHP a MySQL y consulta preparada.
- **Web Serial API**: comunicación directa entre el navegador y el Arduino, a 9600 baudios. Se requiere un navegador compatible, como Chrome o Edge, y abrir la aplicación en `localhost` o en un origen seguro.
- **Arduino / C++**: firmware que recibe los mensajes seriales y controla una pantalla SSD1306, dos LEDs y un buzzer.
- **Python (opcional)**: `info arduino/bridge.py` ofrece un flujo alternativo para conectar un lector de códigos de barras tipo teclado, consultar la API y enviar el resultado al Arduino.

## Requisitos

Para usar la página:

- PHP con las extensiones PDO y PDO MySQL.
- MySQL o MariaDB.
- Un servidor web local, por ejemplo XAMPP con Apache y MySQL.
- Chrome o Edge si también se va a conectar el Arduino desde la página.

Para el circuito, además:

- Placa Arduino compatible con PlatformIO y el framework Arduino.
- Pantalla OLED SSD1306 I2C de 128x64.
- LED verde y LED rojo, cada uno con resistencia de 220–330 ohmios.
- Buzzer pasivo y cable USB.

## Instalación y ejecución

### 1. Colocar el proyecto en el servidor

Clona o copia el repositorio dentro de la carpeta pública de tu servidor. Con XAMPP en Windows suele ser:

```text
C:\xampp\htdocs\proyectoSteam
```

Inicia Apache y MySQL desde el panel de XAMPP. También puedes usar otro servidor PHP local; en ese caso, adapta la URL del paso 4 a la dirección que utilices.

### 2. Crear la base de datos

Importa [`bd/steam.sql`](bd/steam.sql) desde phpMyAdmin o desde el cliente MySQL. El script crea la base `steam`, la tabla `steam_books` y cuatro libros de ejemplo.

La tabla almacena:

| Columna | Uso |
| --- | --- |
| `id` | Identificador interno autoincremental |
| `barcode` | Código de barras único del libro |
| `title` | Título que se presenta en la página y en el Arduino |
| `price` | Precio decimal |

### 3. Revisar la conexión a MySQL

Abre [`search.php`](search.php) y ajusta `$host`, `$dbname`, `$username` y `$password` según tu instalación. Los valores iniciales están preparados para MySQL local con usuario `root` y contraseña vacía.

### 4. Abrir la aplicación

Con XAMPP y el proyecto en `C:\xampp\htdocs\proyectoSteam`, abre:

```text
http://localhost/proyectoSteam/front/index.php
```

Si tu servidor está configurado para servir el proyecto en el puerto 3000 desde su raíz, también puedes abrir:

```text
http://localhost:3000/front/index.php
```

La página hace las solicitudes a `../search.php` de forma relativa; por eso debe servirse desde el servidor PHP y no abrirse como archivo `file:///`.

Prueba con el código `9789974000018`, que corresponde a **El principito** en los datos de ejemplo. La búsqueda actual compara el código de barras completo; aunque el campo menciona título, el endpoint no busca por título ni por coincidencias parciales.

### 5. Conectar el Arduino (opcional)

Conecta los componentes según esta tabla:

| Componente | Conexión |
| --- | --- |
| LED verde | D2, con resistencia en serie |
| LED rojo | D3, con resistencia en serie |
| Buzzer pasivo | D4 y GND |
| OLED SDA / SCL | Pines I2C de la placa |
| OLED VCC / GND | Alimentación compatible / GND |

En Arduino Uno, SDA suele ser A4 y SCL A5. Comprueba los pines y el voltaje admitido por tu placa y por la pantalla.

Para cargar el firmware:

1. Instala Visual Studio Code y la extensión **PlatformIO IDE**.
2. Crea o abre un proyecto PlatformIO que coincida con tu placa y framework Arduino.
3. Agrega las bibliotecas `Adafruit GFX Library` y `Adafruit SSD1306`.
4. Usa el firmware de [`info arduino/arduino/steam_display/steam_display.ino`](<info arduino/arduino/steam_display/steam_display.ino>). Si PlatformIO no lo compila desde esa ubicación, copia su contenido en `src/main.cpp`.
5. Conecta la placa y carga el firmware. Si cambias de placa, selecciona la configuración correspondiente en PlatformIO.
6. En la aplicación, pulsa **Conectar Arduino**, selecciona el puerto serial correcto en el diálogo del navegador y autoriza el acceso.

El firmware y la página usan **9600 baudios**. Cierra el Monitor Serial de PlatformIO y cualquier otro programa que esté usando el puerto antes de conectar desde el navegador: un puerto serial solo puede estar abierto por una aplicación a la vez.

## Recorrido de una búsqueda

1. La persona escribe un código y pulsa **Search** o Enter.
2. JavaScript solicita `search.php?q=...` con `fetch`.
3. PHP busca el código exacto en MySQL y devuelve JSON.
4. JavaScript muestra el libro o un mensaje de no encontrado.
5. Si el Arduino está conectado, JavaScript envía el primer resultado como `Título|Precio`, o `NOT_FOUND` cuando no hay coincidencia.
6. El firmware recibe la línea y actualiza la OLED, el LED y el buzzer.

Ejemplos del protocolo que recibe el Arduino:

```text
El principito|450.00
NOT_FOUND
```

Cada mensaje termina en un salto de línea y se transmite a 9600 baudios.

## Cómo funciona el JavaScript

El archivo [`front/js/search.js`](front/js/search.js) contiene la lógica del navegador. No necesita paquetes adicionales ni un proceso de compilación.

### Elementos y estado

Al principio, el script obtiene del HTML los elementos de búsqueda, resultados, conexión y estado del Arduino. `arduinoPort` conserva el puerto serial actualmente abierto; si vale `null`, la página no tiene una conexión activa. `TextEncoder` convierte los mensajes de texto en bytes para enviarlos por Serial.

### Mostrar resultados

- `showMessage(text)` limpia el área de resultados y añade un párrafo de estado o error. Asigna el texto con `textContent`, no como HTML.
- `renderBooks(books)` limpia el área y construye una tarjeta por libro, con el título y el precio. También inserta los datos con `textContent`.

### Conectar y desconectar el Arduino

- `connectArduino()` primero comprueba si el navegador ofrece `navigator.serial`. Luego solicita al usuario que seleccione un puerto, lo abre a `9600` baudios y actualiza el texto del botón y el estado. Si el navegador no lo admite o la conexión falla, presenta un mensaje.
- `disconnectArduino()` cierra el puerto abierto y actualiza la interfaz. El bloque `finally` limpia la referencia local al puerto incluso si el cierre falla.
- `sendToArduino(message)` comprueba que haya un puerto abierto y escribible. Obtiene un `writer`, envía el mensaje más `\n` como bytes y libera el bloqueo del escritor al terminar. Si no hay conexión, el resultado permanece visible en la página y se informa que no se envió al Arduino.

### Buscar libros

`searchBooks()` realiza el flujo principal:

1. Lee el campo y elimina espacios al principio y al final. Si queda vacío, no envía una petición.
2. Muestra `Searching...` y llama a `fetch` con la consulta codificada mediante `encodeURIComponent`. Esto permite transportar correctamente los caracteres de la búsqueda en la URL.
3. Interpreta la respuesta como JSON. Si el servidor devuelve un error HTTP, muestra el mensaje recibido y detiene el flujo.
4. Si `found` es falso, muestra el mensaje de no encontrado y envía `NOT_FOUND` al Arduino.
5. Si se encontró un libro, dibuja las tarjetas y envía el primer libro como `Título|Precio`.
6. Si ocurre un error de red o durante el flujo, lo registra en la consola y muestra un mensaje en la página.

En la interfaz, un listener ejecuta la búsqueda al pulsar el botón. Otro la ejecuta al pulsar Enter y evita que la tecla provoque el envío de un formulario. El botón del Arduino alterna entre conectar y desconectar según exista `arduinoPort`, y al cargar el script el foco queda en el campo de búsqueda.

## API PHP

`search.php` acepta el código en el parámetro `q` (también admite `barcode`) y consulta la tabla `steam_books` por coincidencia exacta de `barcode`. Usa una consulta preparada de PDO y devuelve JSON para la página, con una estructura de este estilo:

```json
{
  "found": true,
  "books": [
    { "title": "El principito", "price": "450.00" }
  ]
}
```

También admite `format=text`, que devuelve `Título|Precio` o `NOT_FOUND`; ese formato lo utiliza el puente Python opcional.

## Puente Python opcional

Este modo no es necesario para utilizar la página web. Está pensado para un lector de códigos USB que escribe como teclado en la terminal:

```powershell
cd "C:\xampp\htdocs\proyectoSteam\info arduino"
python -m pip install -r requirements.txt
python bridge.py --list-ports
python bridge.py --port COM5 --api http://localhost/proyectoSteam/search.php
```

La URL de `--api` debe apuntar al endpoint PHP accesible desde tu servidor. Al usar este puente, no conectes el puerto simultáneamente desde el navegador ni desde el Monitor Serial.

## Solución de problemas

- **Error de conexión a la base:** comprueba que MySQL está iniciado, que importaste `bd/steam.sql` y que las credenciales de `search.php` son correctas.
- **La página no encuentra la API:** abre la página desde Apache/PHP, confirma la ruta del proyecto y verifica que `search.php` esté en la raíz.
- **El código de ejemplo no aparece:** la búsqueda es exacta; prueba `9789974000018` sin espacios.
- **El navegador no muestra el selector serial:** usa Chrome o Edge y accede desde `localhost` o un origen seguro.
- **No se puede abrir el puerto:** cierra PlatformIO Monitor, el puente Python y cualquier otra aplicación serial.
- **La OLED queda en blanco:** revisa alimentación, GND, SDA y SCL. El firmware prueba las direcciones I2C `0x3C` y `0x3D`.
