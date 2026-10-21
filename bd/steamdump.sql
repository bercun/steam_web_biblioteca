-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Окт 20 2026 г., 01:05
-- Версия сервера: 10.4.28-MariaDB
-- Версия PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `steam`
--
CREATE DATABASE IF NOT EXISTS `steam` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `steam`;

-- --------------------------------------------------------

--
-- Структура таблицы `steam_books`
--

CREATE TABLE `steam_books` (
  `id` int(11) NOT NULL,
  `barcode` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `steam_books`
--

INSERT INTO `steam_books` (`id`, `barcode`, `title`, `price`) VALUES
(1, '9789974000018', 'El principito', 450.00),
(2, '9789974000025', 'Rayuela', 890.00),
(3, '9789974000032', 'La tregua', 620.00),
(4, '9789974000049', 'Cuentos de la selva', 380.00);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `steam_books`
--
ALTER TABLE `steam_books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `steam_books`
--
ALTER TABLE `steam_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
