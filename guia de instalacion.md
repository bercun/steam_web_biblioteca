# Guía de instalación: Biblioteca Steam con Arduino

## 1. Cómo funciona

La página web consulta la base de datos mediante PHP. Al encontrar un libro, envía el resultado directamente desde JavaScript al Arduino por USB/Serial. **No es necesario ejecutar Python** para usar la página con el Arduino.

```text
Página web -> search.php -> MySQL
                    |
                    +-> Serial USB (COM5) -> Arduino -> OLED, LEDs y buzzer
```

La búsqueda compara el código de barras completo. Si no existe, la página envía `NOT_FOUND`.

## 2. Componentes necesarios

- Placa Arduino compatible con PlatformIO y el framework Arduino.
- Pantalla OLED SSD1306 I2C de 128x64.
- LED verde y LED rojo.
- Dos resistencias de 220–330 ohmios, una para cada LED.
- Buzzer pasivo.
- Cable USB para conectar el Arduino a la computadora.
- Computadora con Visual Studio Code, PlatformIO, PHP y MySQL.

## 3. Conectar los componentes

Con el Arduino desconectado, conecta los componentes:

| Componente | Conexión |
| --- | --- |
| LED verde | Pin D2, con resistencia en serie; cátodo a GND |
| LED rojo | Pin D3, con resistencia en serie; cátodo a GND |
| Buzzer pasivo | Pin D4 y GND |
| OLED SDA | Pin SDA de la placa |
| OLED SCL | Pin SCL de la placa |
| OLED GND | GND |
| OLED VCC | Alimentación compatible con el módulo |

En Arduino Uno, SDA suele ser A4 y SCL A5. Verifica los pines I2C y el voltaje admitido en la documentación de tu placa y pantalla.

## 4. Configurar PlatformIO en Visual Studio Code

1. Instala Visual Studio Code y la extensión **PlatformIO IDE**.
2. Crea o abre un proyecto PlatformIO. Selecciona el modelo exacto de tu placa y el framework **Arduino**.
3. En las dependencias del proyecto, agrega estas bibliotecas:
   - `Adafruit GFX Library`
   - `Adafruit SSD1306`
4. Abre el firmware del proyecto: [`steam_display.ino`](<info arduino/arduino/steam_display/steam_display.ino>).
5. Si PlatformIO no lo compila desde su ubicación actual, copia su contenido a `src/main.cpp` dentro del proyecto PlatformIO.
6. Configura COM5 como puerto de carga. Si creas `platformio.ini`, establece también `monitor_speed = 9600`. El valor de `board` debe corresponder a tu placa real; no uses el valor de ejemplo de otra placa.
7. Conecta el Arduino, selecciona COM5 y compila/carga el firmware.

El firmware inicia Serial a **9600 baudios**, busca la OLED en las direcciones I2C `0x3C` y `0x3D` y ejecuta una prueba inicial de pantalla, LEDs y buzzer.

## 5. Iniciar la aplicación web y la base de datos

1. Inicia MySQL y el servidor web que ejecuta PHP.
2. Confirma que la base `steam` y la tabla `steam_books` estén creadas. [`bd/steam.sql`](<bd/steam.sql>) incluye la estructura y registros de prueba.
3. Revisa en [`search.php`](<search.php>) que las credenciales de conexión a MySQL sean las correctas para tu instalación.
4. Abre la página desde el servidor local, no desde un archivo `file:///`. La dirección usada por este proyecto es:

   ```text
   http://localhost:3000/front/index.php
   ```

5. Comprueba que la búsqueda en la web funciona. Por ejemplo, el código `9789974000018` corresponde a *El principito* en los registros de prueba.

La URL debe coincidir con el servidor PHP que tienes iniciado. Si tu servidor usa otro puerto o ruta, abre el proyecto con esa dirección.

## 6. Conectar la página con el Arduino

1. Cierra el Monitor Serial de PlatformIO y cualquier otro programa que pueda estar usando COM5.
2. Abre la página en Chrome o Edge.
3. Pulsa **Conectar Arduino**.
4. En el diálogo de permisos del navegador, selecciona **COM5** y autoriza el acceso.
5. Comprueba que la página indique que el Arduino está conectado.
6. Escribe un código de barras completo en el campo de búsqueda y pulsa **Search** o Enter.

No abras simultáneamente COM5 desde el Monitor Serial, el puente Python y el navegador. Solo un programa puede usar el puerto a la vez. Para cargar firmware o usar el Monitor Serial, desconecta primero el Arduino desde la página.

## 7. Qué debe ocurrir

### Código de libro encontrado

Prueba con:

```text
9789974000018
```

La página muestra el libro y envía una línea Serial como:

```text
El principito|450.00
```

El Arduino muestra el título y el precio en la OLED, enciende el LED verde durante dos segundos y reproduce un bip agudo.

### Código no encontrado

Prueba con un código que no exista, por ejemplo:

```text
0000000000000
```

La página muestra `Libro no encontrado` y envía:

```text
NOT_FOUND
```

El Arduino muestra `Libro no encontrado` en la OLED, enciende el LED rojo durante dos segundos y reproduce un bip grave de 300 Hz durante 600 ms.

## 8. Protocolo Serial

- Velocidad: **9600 baudios**.
- Cada mensaje termina con un salto de línea (`\n`).
- Coincidencia: `Título|Precio`.
- Sin coincidencia: `NOT_FOUND`.
- El código de barras debe coincidir exactamente con el almacenado en la base de datos.

El Arduino separa el título y el precio por el carácter `|`. El firmware recibe líneas de hasta 120 caracteres.

## 9. Solución de problemas

- **El navegador no ofrece COM5:** usa Chrome o Edge, abre la página desde `localhost` y vuelve a cargarla.
- **No se puede conectar a COM5:** cierra PlatformIO Monitor, Python y cualquier otra aplicación que use ese puerto.
- **La página muestra el resultado, pero el Arduino no reacciona:** confirma que la página indique conexión Serial y que el firmware esté cargado con `Serial.begin(9600)`.
- **La OLED no muestra nada:** revisa alimentación, GND, SDA y SCL. El sketch busca una SSD1306 en `0x3C` y `0x3D`.
- **Un LED no enciende:** revisa su polaridad, resistencia y conexión a D2 (verde) o D3 (rojo).
- **El buzzer no suena:** verifica que sea pasivo y esté conectado a D4 y GND.
- **La API no responde:** revisa que PHP y MySQL estén iniciados y que la URL de la página y la ruta de `search.php` correspondan a tu servidor local.
