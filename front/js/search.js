const SEARCH_URL = "../search.php";

const results = document.getElementById("search-results");
const input = document.getElementById("search-input");
const button = document.getElementById("search-button");
const arduinoButton = document.getElementById("arduino-connect-button");
const arduinoStatus = document.getElementById("arduino-status");

let arduinoPort = null;
const encoder = new TextEncoder();

function showMessage(text) {
    results.replaceChildren();
    const message = document.createElement("p");
    message.className = "result-message";
    message.textContent = text;
    results.appendChild(message);
}

function renderBooks(books) {
    results.replaceChildren();

    books.forEach((book) => {
        const card = document.createElement("article");
        card.className = "result-card";

        const title = document.createElement("h3");
        title.textContent = book.title;

        const price = document.createElement("p");
        price.textContent = `$${book.price}`;

        card.append(title, price);
        results.appendChild(card);
    });
}

async function connectArduino() {
    if (!("serial" in navigator)) {
        arduinoStatus.textContent =
            "Este navegador no admite conexión Serial. Usa Chrome o Edge.";
        return;
    }

    try {
        arduinoPort = await navigator.serial.requestPort();
        await arduinoPort.open({ baudRate: 9600 });
        arduinoStatus.textContent = "Arduino conectado a 9600 baudios";
        arduinoButton.textContent = "Desconectar Arduino";
    } catch (error) {
        console.error(error);
        arduinoPort = null;
        arduinoStatus.textContent =
            "No se pudo conectar. Selecciona COM5 y verifica que ningún otro programa use el puerto.";
    }
}

async function disconnectArduino() {
    if (!arduinoPort) {
        return;
    }

    try {
        await arduinoPort.close();
        arduinoStatus.textContent = "Arduino desconectado";
        arduinoButton.textContent = "Conectar Arduino";
    } catch (error) {
        console.error(error);
        arduinoStatus.textContent =
            "No se pudo cerrar la conexión Serial. Cierra la pestaña o revisa el puerto.";
    } finally {
        arduinoPort = null;
    }
}

async function sendToArduino(message) {
    if (!arduinoPort || !arduinoPort.writable) {
        arduinoStatus.textContent =
            "Resultado solo en la página. Conecta COM5 para enviarlo al Arduino.";
        return;
    }

    const writer = arduinoPort.writable.getWriter();
    try {
        await writer.write(encoder.encode(`${message}\n`));
        arduinoStatus.textContent = "Resultado enviado al Arduino";
    } finally {
        writer.releaseLock();
    }
}

async function searchBooks() {
    const query = input.value.trim();
    if (query === "") {
        return;
    }

    showMessage("Searching...");

    try {
        const response = await fetch(
            `${SEARCH_URL}?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Search error");
            return;
        }

        if (!data.found) {
            showMessage(data.message || "Libro no encontrado");
            await sendToArduino("NOT_FOUND");
            return;
        }

        const books = data.books || [];
        renderBooks(books);
        if (books.length > 0) {
            await sendToArduino(`${books[0].title}|${books[0].price}`);
        }
    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to the server or Arduino");
    }
}

arduinoButton.addEventListener("click", () => {
    if (arduinoPort) {
        disconnectArduino();
    } else {
        connectArduino();
    }
});
button.addEventListener("click", searchBooks);
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBooks();
    }
});

input.focus();
