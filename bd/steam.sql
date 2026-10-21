-- tabla para el proyecto de STEAM con lector de códigos de barras
CREATE DATABASE steam;
USE steam;
CREATE TABLE IF NOT EXISTS steam_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(20) NOT NULL UNIQUE KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 4 existe, 1 no existe
INSERT INTO steam_books (barcode, title, price) VALUES
    ('9789974000018', 'El principito', 450.00),
    ('9789974000025', 'Rayuela', 890.00),
    ('9789974000032', 'La tregua', 620.00),
    ('9789974000049', 'Cuentos de la selva', 380.00);
