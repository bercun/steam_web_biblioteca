# Especificación para el firmware Arduino (VS Code + PlatformIO)

El firmware recibe por USB/Serial los resultados que envía la página y los muestra en una pantalla OLED SSD1306 128x64 I2C, con LEDs indicadores y buzzer.

## Origen de los datos

El Arduino **no se conecta directamente a MySQL**. La búsqueda de la página consulta `search.php`; para enviar el resultado del navegador al Arduino, abre la página en Chrome o Edge y conecta el puerto desde el botón **Conectar Arduino**. El navegador escribe directamente por Serial:

```text
Base de datos -> search.php -> navegador -> Serial USB (COM5) -> Arduino
```

La búsqueda compara el código de barras completo; no busca títulos ni coincidencias parciales. La página envía el resultado en el formato `Título|Precio` (por ejemplo, `El principito|450.00`) y agrega un salto de línea (`\n`). Si el código no existe, envía `NOT_FOUND`. La conexión usa **9600 baudios**.

## Configuración PlatformIO

Configura `platformio.ini` para la placa Arduino que está conectada. El puerto solicitado para cargar y monitorear el firmware es **COM5**; la velocidad Serial es **9600**. Para una placa Uno, la configuración correspondiente de puerto y monitor es:

```ini
upload_port = COM5
monitor_port = COM5
monitor_speed = 9600
```

Selecciona en `platformio.ini` la plataforma, placa y framework que correspondan al hardware real. No supongas que la placa es Uno si no está confirmada.

## Protocolo Serial de entrada

Procesa un mensaje completo cada vez que recibas `\n`. Ignora `\r`, que puede venir como parte de un fin de línea Windows. La página envía estos mensajes por Serial:

```text
El principito|450.00
NOT_FOUND
```

- En el primer formato, `|` separa el título y el precio. Recorta espacios de ambos campos.
- En `NOT_FOUND` (también acepta `Book not found` y `Not found`), muestra el mensaje de no encontrado.
- Si llega una línea no vacía sin `|` y no es un mensaje de no encontrado, muéstrala como texto simple.
- Ignora líneas vacías.
- El buffer de recepción admite hasta 120 caracteres; descarta líneas más largas.
- La OLED puede ajustar títulos largos a varias líneas.

## Comportamiento de la pantalla, LEDs y buzzer

Usa una pantalla OLED **SSD1306 128x64** con interfaz I2C y las bibliotecas `Adafruit GFX Library` y `Adafruit SSD1306`. El sketch prueba las direcciones I2C `0x3C` y `0x3D` al iniciar.

- Al iniciar: muestra `Scan barcode` y `Waiting...`, y ejecuta una prueba inicial de pantalla, LEDs y buzzer.
- Resultado encontrado (`Título|Precio`): muestra título y precio, enciende el LED verde durante 2 segundos y emite un bip agudo.
- Sin resultado (`NOT_FOUND`): muestra `Libro no encontrado`, enciende el LED rojo durante 2 segundos y emite un bip grave de 300 Hz durante 600 ms.

Usa `Serial.begin(9600)` para que coincida con el navegador y con `monitor_speed`.

## Conexiones

Conecta los LEDs con resistencias de **220–330 ohmios** en serie y el buzzer pasivo entre su pin y GND:

| Componente | Pin Arduino |
| --- | --- |
| LED verde | D2 |
| LED rojo | D3 |
| Buzzer pasivo | D4 |
| OLED SDA/SCL | Pines I2C de la placa |

Para Arduino Uno, SDA/SCL suelen ser A4/A5. Verifica los pines I2C de la placa que estés usando.

## Uso del puerto Serial

COM5 solo puede estar abierto por un programa a la vez. Para enviar resultados desde la página, cierra el Monitor Serial de PlatformIO y detén `info arduino/bridge.py` antes de pulsar **Conectar Arduino**. En el selector del navegador elige **COM5**. Después de conectar, cada búsqueda envía automáticamente el primer resultado a la OLED. No ejecutes a la vez el puente Python y la conexión Serial del navegador.

Para volver a usar el puente Python o el Monitor Serial, primero pulsa **Desconectar Arduino** en la página. Al cargar firmware, cierra la conexión Serial del navegador.
