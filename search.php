<?php

$host = 'localhost';
$dbname = 'steam';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'found' => false,
        'message' => 'Database connection error',
    ]);
    exit;
}

$query = trim($_GET['q'] ?? $_GET['barcode'] ?? '');
$format = strtolower(trim($_GET['format'] ?? 'json'));

if ($query === '') {
    if ($format === 'text') {
        header('Content-Type: text/plain; charset=utf-8');
        echo 'NOT_FOUND';
        exit;
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'found' => false,
        'message' => 'Ingresa un código de barras',
    ]);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT title, price
     FROM steam_books
     WHERE barcode = ?
     LIMIT 1'
);
$stmt->execute([$query]);

$books = [];
foreach ($stmt->fetchAll() as $row) {
    $books[] = [
        'title' => $row['title'],
        'price' => number_format((float) $row['price'], 2, '.', ''),
    ];
}

if ($format === 'text') {
    header('Content-Type: text/plain; charset=utf-8');

    if ($books === []) {
        echo 'NOT_FOUND';
        exit;
    }

    echo $books[0]['title'] . '|' . $books[0]['price'];
    exit;
}

header('Content-Type: application/json; charset=utf-8');

if ($books === []) {
    echo json_encode([
        'found' => false,
        'message' => 'Libro no encontrado',
    ]);
    exit;
}

echo json_encode([
    'found' => true,
    'books' => $books,
]);
