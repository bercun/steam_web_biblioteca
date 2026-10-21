<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="author" content="Vortex: Zhanna Antipushina, 
                                    Walter Bercunchelli, Karla Medina, Rodrigo Nuñez">
        <meta name="description" content="TH2 Proyecto semestral: 
                                    eLibrary of Brooklyn Public Library">
  
        <title>Library</title>
        <link rel="stylesheet" href="style.css">
    </head>

    <body>
        <main>
            <section id="search">
                <h2>Book Search</h2>
                <hr class="line">

                <div class="search-form">
                    <input type="search" id="search-input" placeholder="Barcode or title" autocomplete="off" spellcheck="false">
                    <button type="button" id="search-button">Search</button>
                </div>

                <div class="arduino-controls">
                    <button type="button" id="arduino-connect-button">Conectar Arduino</button>
                    <p id="arduino-status" aria-live="polite">Arduino desconectado</p>
                </div>

                <div id="search-results">
                </div>
            </section>

        </main>
        <script src="js/search.js"></script>
        
    </body>
</html>